import { writeDebugLog } from './debug';

const FACEBOOK_API_URL = 'https://graph.facebook.com/v24.0/me/messages';
const FACEBOOK_GRAPH_BASE_URL = 'https://graph.facebook.com/v24.0';

function getFacebookPageAccessToken() {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageAccessToken || pageAccessToken === 'your_facebook_page_access_token_here') {
    throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is missing in .env.local');
  }

  return pageAccessToken;
}

export async function sendFacebookMessage(recipientId, text) {
  const pageAccessToken = getFacebookPageAccessToken();

  const response = await fetch(`${FACEBOOK_API_URL}?access_token=${pageAccessToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient: {
        id: recipientId
      },
      messaging_type: 'RESPONSE',
      message: {
        text
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Facebook Send API error:', data);
    writeDebugLog('facebook_send_error', {
      recipientId,
      message: data.error?.message || 'Facebook message send failed',
      code: data.error?.code || null,
      subcode: data.error?.error_subcode || null
    });
    throw new Error(data.error?.message || 'Facebook message send failed');
  }

  writeDebugLog('facebook_send_success', {
    recipientId,
    messageId: data.message_id || null,
    recipientIdReturned: data.recipient_id || null
  });
  return data;
}

export async function getFacebookUserProfile(senderId) {
  if (!senderId) {
    return null;
  }

  try {
    const pageAccessToken = getFacebookPageAccessToken();
    const response = await fetch(
      `${FACEBOOK_GRAPH_BASE_URL}/${encodeURIComponent(
        String(senderId)
      )}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken}`
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      writeDebugLog('facebook_profile_lookup_error', {
        senderId: String(senderId),
        message: data.error?.message || 'Facebook profile lookup failed',
        code: data.error?.code || null,
        subcode: data.error?.error_subcode || null
      });
      return null;
    }

    const firstName = String(data.first_name || '').trim();
    const lastName = String(data.last_name || '').trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    return {
      firstName,
      lastName,
      fullName: fullName || null,
      profilePic: typeof data.profile_pic === 'string' ? data.profile_pic : null
    };
  } catch (error) {
    writeDebugLog('facebook_profile_lookup_exception', {
      senderId: String(senderId),
      error: error.message || 'Facebook profile lookup failed'
    });
    return null;
  }
}
