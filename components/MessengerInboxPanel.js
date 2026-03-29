import { useMemo, useState } from 'react';

function formatDateTime(value) {
  if (!value) {
    return 'უცნობია';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'უცნობია';
  }

  return date.toLocaleString('ka-GE', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusLabel(status) {
  const labels = {
    open: 'AI აქტიურია',
    needs_human: 'ოპერატორი',
    closed: 'დახურულია'
  };

  return labels[status] || 'უცნობია';
}

function getAuthorLabel(senderType) {
  const labels = {
    customer: 'კლიენტი',
    bot: 'AI',
    agent: 'ოპერატორი'
  };

  return labels[senderType] || 'სისტემა';
}

function getDisplayName(conversation) {
  return conversation?.fullName || conversation?.title || 'Facebook მომხმარებელი';
}

function getAvatarInitials(conversation) {
  const source = getDisplayName(conversation);
  const words = String(source)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) {
    return 'FB';
  }

  return words
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

export default function MessengerInboxPanel({
  conversations,
  selectedConversationId,
  selectedConversation,
  inboxLoading,
  inboxSending,
  inboxError,
  manualReply,
  onSelectConversation,
  onChangeConversationStatus,
  onManualReplyChange,
  onManualReplySend,
  onRefreshConversation,
  onRefreshList
}) {
  const [query, setQuery] = useState('');

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const haystack = [
        conversation.title,
        conversation.fullName,
        conversation.senderId,
        conversation.lastMessageText
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [conversations, query]);

  const unreadTotal = conversations.reduce(
    (total, item) => total + Number(item.unreadCount || 0),
    0
  );

  const selectedMessages = selectedConversation?.messages || [];
  const selectedStatus = selectedConversation?.status || '';
  const manualReplyLength = manualReply.trim().length;

  return (
    <section className="inbox-page">
      <div className="inbox-head">
        <div>
          <h2>ინბოქსი</h2>
          <p>აქ ხედავ ახალ ჩათებს, წყვეტ ვინ პასუხობს და საჭიროებისას მომხმარებელს ხელითაც წერ.</p>
        </div>

        <div className="hero-action-row">
          <button type="button" className="button secondary" onClick={onRefreshList}>
            სიის განახლება
          </button>
        </div>
      </div>

      {inboxError ? <div className="soft-note error">{inboxError}</div> : null}

      <div className="inbox-frame">
        <aside className="inbox-list-pane">
          <div className="field-group">
            <label>ძიება</label>
            <input
              className="dark-input conversation-search"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="მოძებნე სახელი, ID ან ტექსტი"
            />
          </div>

          <div className="conversation-list">
            {filteredConversations.length ? (
              filteredConversations.map((conversation) => {
                const isActive = selectedConversationId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`conversation-card ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <div className="conversation-card-main">
                      <div className="conversation-avatar">
                        {conversation.profilePic ? (
                          <img src={conversation.profilePic} alt={getDisplayName(conversation)} />
                        ) : (
                          <span>{getAvatarInitials(conversation)}</span>
                        )}
                      </div>

                      <div className="conversation-card-copy">
                        <div className="conversation-card-top">
                          <strong>{getDisplayName(conversation)}</strong>
                          <span className="conversation-card-meta">
                            {formatDateTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <div className="conversation-id">{conversation.senderId}</div>
                      </div>
                    </div>

                    <p className="conversation-card-preview">
                      {conversation.lastMessageText || 'ბოლო ტექსტი ჯერ არ ჩანს.'}
                    </p>

                    <div className="conversation-card-foot">
                      <span className={`mini-status ${conversation.status}`}>
                        {getStatusLabel(conversation.status)}
                      </span>
                      {conversation.unreadCount ? (
                        <span className="rail-badge">{conversation.unreadCount}</span>
                      ) : (
                        <span className="conversation-card-meta">Meta ჩათი</span>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="empty-card">
                <strong>საუბრები არ ჩანს</strong>
                <div className="empty-copy">როგორც კი ახალი შეტყობინება მოვა, აქ გამოჩნდება.</div>
              </div>
            )}
          </div>

          <div className="list-footer-note">სულ {conversations.length} ჩათი · ახალი {unreadTotal}</div>
        </aside>

        <section className="thread-board">
          {selectedConversation ? (
            <>
              <div className="thread-toolbar">
                <div className="thread-main">
                  <div className="conversation-avatar large">
                    {selectedConversation.profilePic ? (
                      <img
                        src={selectedConversation.profilePic}
                        alt={getDisplayName(selectedConversation)}
                      />
                    ) : (
                      <span>{getAvatarInitials(selectedConversation)}</span>
                    )}
                  </div>

                  <div className="thread-main-copy">
                    <h3>{getDisplayName(selectedConversation)}</h3>
                    <p className="thread-subline">
                      ID: {selectedConversation.senderId} · ბოლო აქტივობა:{' '}
                      {formatDateTime(selectedConversation.lastMessageAt)}
                    </p>
                  </div>
                </div>

                <div className="thread-toolbar-side">
                  <div className="thread-actions">
                    <button
                      type="button"
                      className={`button secondary thread-status-button ${
                        selectedStatus === 'open' ? 'active-open' : ''
                      }`}
                      onClick={() => onChangeConversationStatus('open')}
                      disabled={inboxSending}
                    >
                      AI პასუხობს
                    </button>
                    <button
                      type="button"
                      className={`button secondary thread-status-button ${
                        selectedStatus === 'needs_human' ? 'active-human' : ''
                      }`}
                      onClick={() => onChangeConversationStatus('human')}
                      disabled={inboxSending}
                    >
                      ოპერატორი
                    </button>
                    <button
                      type="button"
                      className={`button ghost thread-status-button danger ${
                        selectedStatus === 'closed' ? 'active-closed' : ''
                      }`}
                      onClick={() => onChangeConversationStatus('close')}
                      disabled={inboxSending}
                    >
                      დახურვა
                    </button>
                  </div>
                  <button
                    type="button"
                    className="button ghost thread-refresh-button"
                    onClick={onRefreshConversation}
                    disabled={inboxLoading}
                  >
                    {inboxLoading ? 'იტვირთება...' : 'ჩათის განახლება'}
                  </button>
                </div>
              </div>

              <div className="thread-content-shell">
                <div className="thread-stream">
                  {selectedMessages.length ? (
                    selectedMessages.map((item) => (
                      <div
                        key={item.id}
                        className={`message-row ${
                          item.direction === 'incoming' ? 'incoming' : 'outgoing'
                        }`}
                      >
                        <div
                          className={`message-bubble ${
                            item.direction === 'incoming' ? 'incoming' : 'outgoing'
                          }`}
                        >
                          <div className="message-meta">
                            <span>{getAuthorLabel(item.senderType)}</span>
                            <span>{formatDateTime(item.createdAt)}</span>
                          </div>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-thread">
                      <strong>ეს ჩათი ჯერ ცარიელია</strong>
                      <div className="empty-copy">როგორც კი საუბარი დაიწყება, ყველა შეტყობინება აქ გამოჩნდება.</div>
                    </div>
                  )}
                </div>

                <div className="thread-composer">
                  <div className="thread-composer-top">
                    <div>
                      <h4>ხელით პასუხი</h4>
                      <p>როცა საჭიროა, აქედან პირდაპირ მისწერ მომხმარებელს და საუბარს ოპერატორზე გადაიყვან.</p>
                    </div>
                  </div>

                  <textarea
                    className="dark-textarea thread-input"
                    value={manualReply}
                    onChange={(event) => onManualReplyChange(event.target.value)}
                    placeholder="აქ დაწერე პასუხი მომხმარებლისთვის"
                    rows={4}
                  />

                  <div className="composer-actions">
                    <span className="helper-text">{manualReplyLength}/1500 სიმბოლო</span>
                    <button
                      type="button"
                      className="button primary"
                      onClick={onManualReplySend}
                      disabled={inboxSending || !manualReply.trim()}
                    >
                      {inboxSending ? 'იგზავნება...' : 'პასუხის გაგზავნა'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-thread">
              <strong>აირჩიე ჩათი მარცხნიდან</strong>
              <div className="empty-copy">
                აქ გამოჩნდება სრული საუბარი, სტატუსი და ხელით პასუხის დაწერის ზონა.
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
