import { generateOpenAIReplyDetails } from '../../lib/openai';
import { getFacebookUserProfile, sendFacebookMessage } from '../../lib/facebook';
import { getBotConfig } from '../../lib/config';
import { writeDebugLog } from '../../lib/debug';
import { isDuplicateMessage } from '../../lib/message-cache';
import {
  detectAutomationIntent,
  evaluateAutomationBeforeAi,
  finalizeAutomationReply
} from '../../lib/automation-features';
import {
  recordIncomingMessage,
  recordOutgoingMessage,
  setConversationStatus
} from '../../lib/inbox';
import { recordKnowledgeGap } from '../../lib/knowledge-gaps';
import { evaluateConversationTurn } from '../../lib/conversation-rules';

function buildLocalConversation(senderId, history = []) {
  const botReplyCount = Array.isArray(history)
    ? history.filter((item) => item && item.role === 'assistant').length
    : 0;

  return {
    id: senderId,
    status: 'open',
    botReplyCount
  };
}

function buildConversationHistory(messages = [], currentText = '') {
  if (!Array.isArray(messages)) {
    return [];
  }

  const mapped = messages
    .filter((item) => item && typeof item.text === 'string' && item.text.trim())
    .slice(-10)
    .map((item) => ({
      role: item.direction === 'incoming' ? 'user' : 'assistant',
      text: item.text.trim()
    }));

  if (!mapped.length) {
    return [];
  }

  const lastItem = mapped[mapped.length - 1];

  if (lastItem.role === 'user' && lastItem.text === String(currentText || '').trim()) {
    return mapped.slice(0, -1);
  }

  return mapped;
}

async function handleRuleReply({ senderId, reply, nextStatus, type, isLocalTest, automation }) {
  if (isLocalTest) {
    return {
      handled: true,
      localResult: {
        ok: true,
        mode: 'local_test',
        received: '',
        reply,
        facebookSent: false,
        automation: automation || null
      }
    };
  }

  await setConversationStatus(senderId, nextStatus);
  await sendFacebookMessage(senderId, reply);
  await recordOutgoingMessage({
    senderId,
    text: reply,
    senderType: 'bot'
  });

  writeDebugLog('conversation_rule_reply_sent', {
    senderId,
    type,
    nextStatus,
    automation
  });

  return {
    handled: true
  };
}

async function processMessengerEvent(event, options = {}) {
  const { isLocalTest = false, localConfig = null, localHistory = [] } = options;
  const senderId = event?.sender?.id;
  const message = event?.message;

  writeDebugLog('webhook_event_seen', {
    senderId,
    hasMessage: !!message,
    hasText: !!message?.text,
    isEcho: !!message?.is_echo,
    hasAttachments: Array.isArray(message?.attachments) && message.attachments.length > 0
  });

  if (!senderId || !message || message.is_echo || !message.text || !String(message.text).trim()) {
    if (isLocalTest) {
      return {
        handled: true,
        localResult: {
          ok: false,
          mode: 'local_test',
          error: 'ტექსტური შეტყობინება ვერ მოიძებნა. ჩაწერე ტექსტი და ისევ სცადე.'
        }
      };
    }

    return {
      handled: false
    };
  }

  if (isDuplicateMessage(event, senderId)) {
    writeDebugLog('duplicate_message_ignored', {
      senderId,
      messageId: message.mid || null,
      text: message.text
    });

    return {
      handled: false,
      duplicate: true
    };
  }

  console.log('Incoming Facebook message:', {
    senderId,
    text: message.text
  });
  writeDebugLog('incoming_message', {
    senderId,
    text: message.text
  });

  try {
    const savedConfig = localConfig || (await getBotConfig());
    const profile = isLocalTest ? null : await getFacebookUserProfile(senderId);
    const conversation = isLocalTest
      ? buildLocalConversation(senderId, localHistory)
      : await recordIncomingMessage({
          senderId,
          text: message.text,
          messageId: message.mid || null,
          profile
        });
    const detectedIntent = detectAutomationIntent(message.text, savedConfig);

    const decision = evaluateConversationTurn({
      text: message.text,
      conversation,
      settings: savedConfig.conversationSettings
    });

    if (decision.reply) {
      const ruleReplyResult = await handleRuleReply({
        senderId,
        reply: decision.reply,
        nextStatus: decision.nextStatus,
        type: decision.type,
        isLocalTest,
        automation: {
          detectedIntent,
          usedFeatures: [],
          source: 'rule',
          finalAction: decision.type
        }
      });

      if (ruleReplyResult.localResult) {
        ruleReplyResult.localResult.received = message.text;
      }

      return ruleReplyResult;
    }

    if (!isLocalTest && decision.nextStatus !== conversation.status) {
      await setConversationStatus(senderId, decision.nextStatus);
    }

    if (decision.stopAutoReply) {
      writeDebugLog('conversation_waiting_human', {
        senderId,
        status: decision.nextStatus
      });

      if (isLocalTest) {
        return {
          handled: true,
          localResult: {
            ok: true,
            mode: 'local_test',
            received: message.text,
            reply: 'ეს საუბარი ოპერატორზეა გადაცემული და AI აღარ გააგრძელებს პასუხს.',
            facebookSent: false,
            automation: {
              detectedIntent,
              usedFeatures: [],
              source: 'rule',
              finalAction: decision.type
            }
          }
        };
      }

      return {
        handled: true
      };
    }

    const preAiAutomation = evaluateAutomationBeforeAi({
      text: message.text,
      config: savedConfig,
      detectedIntent
    });

    if (preAiAutomation.handled) {
      const automationReplyResult = await handleRuleReply({
        senderId,
        reply: preAiAutomation.reply,
        nextStatus: preAiAutomation.nextStatus,
        type: preAiAutomation.type,
        isLocalTest,
        automation: {
          detectedIntent,
          usedFeatures: preAiAutomation.usedFeatures,
          source: 'automation',
          finalAction: preAiAutomation.type
        }
      });

      if (automationReplyResult.localResult) {
        automationReplyResult.localResult.received = message.text;
      }

      writeDebugLog('automation_pre_ai_handled', {
        senderId,
        detectedIntent,
        type: preAiAutomation.type,
        usedFeatures: preAiAutomation.usedFeatures
      });

      return automationReplyResult;
    }

    const botConfig = {
      ...savedConfig,
      automationContext: {
        detectedIntent
      },
      conversationHistory: isLocalTest
        ? localHistory
        : buildConversationHistory(conversation.messages, message.text)
    };

    const aiResult = await generateOpenAIReplyDetails(message.text, botConfig);
    const finalizedReply = finalizeAutomationReply({
      userText: message.text,
      aiReply: aiResult.reply,
      aiSource: aiResult.source,
      config: savedConfig,
      conversation,
      detectedIntent
    });

    if (finalizedReply.shouldLogKnowledgeGap && !isLocalTest) {
      await recordKnowledgeGap({
        text: message.text,
        senderId,
        intent: detectedIntent,
        reason: finalizedReply.knowledgeGapReason
      });
    }

    if (!isLocalTest && finalizedReply.nextStatus !== conversation.status) {
      await setConversationStatus(senderId, finalizedReply.nextStatus);
    }

    console.log('AI reply:', {
      senderId,
      text: finalizedReply.reply
    });
    writeDebugLog('ai_reply_ready', {
      senderId,
      text: finalizedReply.reply,
      source: aiResult.source,
      detectedIntent,
      usedFeatures: finalizedReply.usedFeatures,
      nextStatus: finalizedReply.nextStatus
    });

    if (isLocalTest) {
      return {
        handled: true,
        localResult: {
          ok: true,
          mode: 'local_test',
          received: message.text,
          reply: finalizedReply.reply,
          facebookSent: false,
          automation: {
            detectedIntent,
            usedFeatures: finalizedReply.usedFeatures,
            source: aiResult.source,
            finalAction:
              finalizedReply.nextStatus === 'needs_human' ? 'handoff_after_ai' : 'ai_reply',
            knowledgeGapReason: finalizedReply.knowledgeGapReason || ''
          }
        }
      };
    }

    await sendFacebookMessage(senderId, finalizedReply.reply);
    await recordOutgoingMessage({
      senderId,
      text: finalizedReply.reply,
      senderType: 'bot'
    });

    console.log('Facebook reply sent:', {
      senderId
    });
    writeDebugLog('facebook_reply_sent', {
      senderId
    });

    return {
      handled: true
    };
  } catch (messageError) {
    console.error('Message processing error:', {
      senderId,
      error: messageError.message
    });
    writeDebugLog('message_processing_error', {
      senderId,
      error: messageError.message
    });

    if (isLocalTest) {
      return {
        handled: true,
        localResult: {
          ok: false,
          mode: 'local_test',
          error: messageError.message
        }
      };
    }

    try {
      const fallbackText = 'ბოდიში, შეფერხებაა. ზუსტ დეტალს ოპერატორი გადაამოწმებს.';

      await sendFacebookMessage(senderId, fallbackText);
      await recordOutgoingMessage({
        senderId,
        text: fallbackText,
        senderType: 'bot'
      });

      console.log('Fallback Facebook reply sent:', {
        senderId
      });
      writeDebugLog('fallback_reply_sent', {
        senderId
      });
    } catch (fallbackError) {
      console.error('Fallback send error:', fallbackError);
      writeDebugLog('fallback_send_error', {
        senderId,
        error: fallbackError.message
      });
    }

    return {
      handled: true
    };
  }
}

async function processMessengerEntries(entries, options = {}) {
  let hasTextMessage = false;

  for (const entry of entries || []) {
    for (const event of entry.messaging || []) {
      const result = await processMessengerEvent(event, options);

      if (result.handled) {
        hasTextMessage = true;
      }

      if (options.isLocalTest && result.localResult) {
        return {
          hasTextMessage: true,
          localResult: result.localResult
        };
      }
    }
  }

  return {
    hasTextMessage
  };
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (!mode && !token && !challenge) {
        return res.status(200).json({
          ok: true,
          message: 'Webhook is running'
        });
      }

      if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
        console.log('Facebook webhook verified');
        writeDebugLog('webhook_verified', {
          mode
        });
        return res.status(200).send(challenge);
      }

      console.log('Facebook webhook verification failed');
      writeDebugLog('webhook_verification_failed', {
        mode,
        tokenPreview: token ? `${token.slice(0, 2)}***` : null
      });
      return res.status(403).json({ error: 'Verification failed' });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const isLocalTest = body.__local_test === true;
      const localConfig = isLocalTest ? body.__local_config || null : null;
      const localHistory =
        isLocalTest && Array.isArray(body.__local_history) ? body.__local_history : [];

      writeDebugLog('webhook_post_received', {
        isLocalTest,
        object: body.object,
        entryCount: Array.isArray(body.entry) ? body.entry.length : 0
      });

      if (body.object !== 'page') {
        writeDebugLog('webhook_post_invalid_object', {
          object: body.object
        });
        return res.status(404).json({ error: 'Event not found' });
      }

      if (isLocalTest) {
        const result = await processMessengerEntries(body.entry || [], {
          isLocalTest,
          localConfig,
          localHistory
        });

        if (result.localResult) {
          return res.status(result.localResult.ok ? 200 : 500).json(result.localResult);
        }

        return res.status(400).json({
          ok: false,
          mode: 'local_test',
          error: 'ტექსტური შეტყობინება ვერ მოიძებნა'
        });
      }

      await processMessengerEntries(body.entry || [], {
        isLocalTest: false
      });

      return res.status(200).send('EVENT_RECEIVED');
    }

    writeDebugLog('method_not_allowed', {
      method: req.method
    });
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Webhook error:', error);
    writeDebugLog('webhook_error', {
      error: error.message || 'Internal server error'
    });
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
