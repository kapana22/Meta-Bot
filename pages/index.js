import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import MessengerInboxPanel from '../components/MessengerInboxPanel';
import {
  AUTOMATION_INTENT_OPTIONS,
  WORKING_DAY_OPTIONS,
  createDefaultBuilderConfig,
  normalizeBuilderConfig,
  prepareBotConfigForRuntime
} from '../lib/builder-config';
import { panelStyles } from '../lib/panel-styles';

const NAV_ITEMS = [
  { key: 'overview', label: 'მიმოხილვა', hint: 'სტატუსი, პროგრესი და მთავარი ნაბიჯები' },
  { key: 'setup', label: 'სეთაპი', hint: 'ბიზნესის პროფილი და ბრენდის ხმა' },
  { key: 'knowledge', label: 'ცოდნა', hint: 'ბიზნესის ფაქტები, საზღვრები და FAQ' },
  { key: 'automation', label: 'ავტომაცია', hint: 'handoff წესები და საუბრის კონტროლი' },
  { key: 'testing', label: 'ტესტირება', hint: 'სცენარები და ცოცხალი preview' },
  { key: 'inbox', label: 'ინბოქსი', hint: 'ცოცხალი საუბრები და ოპერატორის ჩართვა' }
];

const SAMPLE_CONFIG = normalizeBuilderConfig({
  workspaceProfile: {
    businessName: 'Yumade',
    industry: 'სარეკლამო სააგენტო',
    language: 'ქართული',
    city: 'თბილისი',
    workingHours: 'ორშ-პარ 10:00-19:00',
    tone: 'პროფესიონალური, მშვიდი და თბილი',
    responseLength: 'მოკლე',
    businessSummary:
      'ქართული სააგენტო, რომელიც კლიენტებს ეხმარება Meta, Google და სოციალური მედიის მარკეტინგში.',
    nextStepCta:
      'თუ კლიენტი მზად არის დეტალურ განხილვაზე, მოკლედ შესთავაზე ოპერატორთან გაგრძელება.'
  },
  knowledgeSections: {
    services:
      'Meta რეკლამა\nFacebook და Instagram კამპანიები\nGoogle რეკლამა\nკონტენტის დაგეგმვა\nსოციალური მედიის მართვა\nბრენდინგი',
    pricingPolicy:
      'ფასი დამოკიდებულია მომსახურების ტიპზე, მიზანზე და მოცულობაზე. თუ ზუსტი შეთავაზება არაა დადასტურებული, არ გამოიგონო.',
    deliveryPolicy:
      'ვადები, შესრულების პერიოდი და მიწოდების ფორმატი თქვი მხოლოდ დადასტურებული ინფორმაციის შემთხვევაში.',
    escalationNotes:
      'ოპერატორზე გადადი როცა კლიენტი ითხოვს ფასს, ბიუჯეტს, შეთავაზებას, ქეისს, პორტფოლიოს, ზარს ან შეხვედრას.',
    restrictions:
      'არ დაჰპირდე ROI-ს, გარანტიას, კონკრეტულ შედეგს, წინასწარ შეთანხმებულ ზარს ან დაუზუსტებელ ფასს.'
  },
  faqItems: [
    {
      question: 'რას აკეთებთ?',
      answer:
        'ვმუშაობთ რეკლამის, სოციალური მედიის, კონტენტის და ბრენდინგის მიმართულებით. თუ გინდა, მომწერე რომელი სერვისი გაინტერესებს.'
    },
    {
      question: 'Meta რეკლამას აკეთებთ?',
      answer:
        'კი, Meta რეკლამის მიმართულებითაც ვმუშაობთ. თუ გინდა, მომწერე რა ბიზნესზე ან რა მიზანზე გჭირდება კამპანია.'
    },
    {
      question: 'ფასი რა არის?',
      answer:
        'ფასი დამოკიდებულია მომსახურების ტიპსა და მოცულობაზე. ზუსტ დეტალს ოპერატორი დაგიზუსტებთ.'
    }
  ],
  testScenarios: [
    {
      label: 'სერვისები',
      customerMessage: 'რას აკეთებთ?',
      expectedOutcome: 'მოკლე ჩამონათვალი და შეკითხვა, რომელი მიმართულება აინტერესებს.'
    },
    {
      label: 'ფასი',
      customerMessage: 'ფასი რა არის?',
      expectedOutcome: 'არ გამოიგონოს ფასი და ზუსტ დეტალზე ოპერატორთან გადაამისამართოს.'
    },
    {
      label: 'ოპერატორი',
      customerMessage: 'ოპერატორთან მინდა საუბარი',
      expectedOutcome: 'სწრაფი handoff და მოკლე დამადასტურებელი პასუხი.'
    }
  ],
  conversationSettings: {
    handoffKeywords: ['ოპერატორი', 'კონსულტაცია', 'ფასი', 'ბიუჯეტი', 'ზარი', 'შეხვედრა'],
    closingKeywords: ['მადლობა', 'გმადლობთ', 'კარგი', 'bye', 'thanks'],
    reopenKeywords: ['გამარჯობა', 'hello', 'hi', 'გამარჯობათ'],
    handoffMessage: 'გასაგებია. თქვენს შეტყობინებას ოპერატორს გადავცემ და მალე მოგწერენ.',
    farewellMessage: 'გმადლობთ მოწერისთვის. თუ დაგჭირდებათ, ისევ მოგვწერეთ.',
    maxAutoReplies: 4
  },
  automationSettings: {
    businessHours: {
      enabled: true,
      timezone: 'Asia/Tbilisi',
      workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
      startTime: '10:00',
      endTime: '19:00',
      afterHoursMessage:
        'მადლობა შეტყობინებისთვის. ახლა სამუშაო საათების გარეთ ვართ და ოპერატორი პირველივე სამუშაო პერიოდში მოგწერთ.',
      handoffOutsideHours: true
    },
    intentRouting: {
      enabled: true,
      routeToHumanIntents: ['price', 'complaint'],
      routeMessage:
        'ამ თემაზე ზუსტ პასუხს ოპერატორი მოგაწვდის. შენს შეტყობინებას ახლავე გადავცემთ.'
    },
    confidenceFallback: {
      enabled: true,
      fallbackMessage:
        'ზუსტი პასუხის ნაცვლად არ მინდა შეგიყვანო შეცდომაში. ოპერატორი მალე დაგიზუსტებს დეტალებს.'
    },
    leadQualification: {
      enabled: true,
      triggerIntents: ['services', 'price', 'order'],
      qualificationMessage:
        'თუ გინდა, მომწერე რომელი სერვისი გაინტერესებს და რა ფორმით გინდა დაგიკავშირდეთ.'
    },
    knowledgeGapDetection: {
      enabled: true
    },
    sentimentHandoff: {
      enabled: true,
      angryKeywords: ['პრობლემა', 'უკმაყოფილო', 'საჩივარი', 'გაბრაზებული', 'სასწრაფოდ'],
      replyMessage:
        'ვწუხვარ შექმნილი დისკომფორტისთვის. შეტყობინებას ოპერატორს გადავცემ და პრიორიტეტულად დაგიბრუნდებით.'
    }
  }
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function keywordsToText(value) {
  return Array.isArray(value) ? value.join(', ') : '';
}

function parseKeywords(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleArrayValue(items, value) {
  const currentItems = Array.isArray(items) ? items : [];
  return currentItems.includes(value)
    ? currentItems.filter((item) => item !== value)
    : [...currentItems, value];
}

function formatDate(value) {
  if (!value) return 'უცნობია';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'უცნობია';
  return date.toLocaleString('ka-GE', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getConversationDisplayName(conversation) {
  return conversation?.fullName || conversation?.title || 'Facebook მომხმარებელი';
}

function getWebhookStatusMeta(health) {
  const text = String(health || '').trim();
  const normalized = text.toLowerCase();
  if (!text || text === 'მოწმდება...') {
    return { label: 'მოწმდება', detail: 'Webhook-ის მდგომარეობა იტვირთება.', tone: 'neutral' };
  }
  if (normalized.includes('running') || normalized.includes('მზად')) {
    return { label: 'მუშაობს', detail: 'შემომავალი კავშირი მზადაა.', tone: 'ok' };
  }
  if (normalized.includes('მიუწვდომ') || normalized.includes('failed') || normalized.includes('ვერ')) {
    return { label: 'შეცდომაა', detail: text, tone: 'error' };
  }
  return { label: text, detail: 'Webhook-ის სტატუსი განახლდა.', tone: 'neutral' };
}

function getAiStatusMeta(aiStatus = {}) {
  const currentModel = aiStatus.model || aiStatus.preferredModel || 'უცნობია';
  if (aiStatus.running && aiStatus.modelReady) {
    return { label: 'მზადაა', detail: `აქტიური მოდელი: ${currentModel}`, tone: 'ok' };
  }
  if (aiStatus.running && !aiStatus.modelReady) {
    return {
      label: 'მოდელი აკლია',
      detail: `რეკომენდებულია: ${aiStatus.preferredModel || 'llama3.2:1b'}`,
      tone: 'warn'
    };
  }
  return { label: 'შემოწმება სჭირდება', detail: 'Ollama ჯერ არ არის მზად.', tone: 'error' };
}

function StatusPill({ tone = 'neutral', children }) {
  return <span className={`status-pill ${tone}`}>{children}</span>;
}

function Surface({ title, subtitle, actions, className = '', children }) {
  return (
    <section className={`surface ${className}`.trim()}>
      <div className="surface-head">
        <div>
          <h2 className="surface-title">{title}</h2>
          {subtitle ? <p className="surface-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="surface-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, hint, tone = 'blue' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      {hint ? <span className="metric-hint">{hint}</span> : null}
    </article>
  );
}

function SummaryRow({ label, value, mono = false }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <strong className={mono ? 'mono' : ''}>{value}</strong>
    </div>
  );
}

function RailButton({ item, active, unread, onClick }) {
  const icons = {
    overview: '◈',
    setup: '◎',
    knowledge: '◌',
    automation: '◐',
    testing: '◍',
    inbox: '◉'
  };

  return (
    <button type="button" className={`rail-button ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="rail-button-icon">{icons[item.key] || '○'}</span>
      <span className="rail-button-copy">
        <strong>{item.label}</strong>
        <span>{item.hint}</span>
      </span>
      {unread ? <span className="rail-badge">{unread}</span> : null}
    </button>
  );
}

function RecentConversationCard({ conversation, onOpen }) {
  const needsAttention =
    conversation.status === 'needs_human' || Number(conversation.unreadCount || 0) > 0;

  return (
    <button
      type="button"
      className={`recent-conversation ${needsAttention ? 'attention' : ''}`}
      onClick={onOpen}
    >
      <div className="recent-conversation-main">
        <div className="rail-avatar">
          {conversation.profilePic ? (
            <img src={conversation.profilePic} alt={getConversationDisplayName(conversation)} />
          ) : (
            <span>{getConversationDisplayName(conversation).slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="recent-conversation-copy">
          <strong>{getConversationDisplayName(conversation)}</strong>
          <span>{formatDate(conversation.lastMessageAt)}</span>
        </div>
      </div>
      <p>{conversation.lastMessageText || 'ბოლო ტექსტი ჯერ არ ჩანს.'}</p>
      <div className="recent-conversation-foot">
        <span className={`mini-status ${conversation.status || 'open'}`}>
          {conversation.status === 'needs_human'
            ? 'ოპერატორი'
            : conversation.status === 'closed'
              ? 'დახურულია'
              : 'AI აქტიურია'}
        </span>
        {conversation.unreadCount ? <span className="rail-badge">{conversation.unreadCount}</span> : null}
      </div>
    </button>
  );
}

function ChecklistItem({ done, title, hint, onClick, actionLabel }) {
  return (
    <button
      type="button"
      className={`checklist-item ${done ? 'done' : 'pending'}`}
      onClick={onClick}
    >
      <span className="checklist-state">{done ? '✓' : '•'}</span>
      <span className="checklist-copy">
        <strong>{title}</strong>
        <span>{hint}</span>
      </span>
      <span className="checklist-action">{actionLabel}</span>
    </button>
  );
}

function ScenarioEditor({ scenario, index, active, onSelect, onChange, onRemove }) {
  return (
    <article className={`scenario-card ${active ? 'active' : ''}`}>
      <div className="scenario-top">
        <strong>სცენარი #{index + 1}</strong>
        <div className="scenario-actions">
          <button type="button" className="button ghost" onClick={onSelect}>
            დატესტე
          </button>
          <button type="button" className="button ghost" onClick={onRemove}>
            წაშლა
          </button>
        </div>
      </div>
      <div className="field-group">
        <label>სახელი</label>
        <input
          className="dark-input"
          type="text"
          value={scenario.label}
          onChange={(event) => onChange('label', event.target.value)}
        />
      </div>
      <div className="field-group">
        <label>კლიენტის შეტყობინება</label>
        <textarea
          className="dark-textarea compact-textarea"
          rows={4}
          value={scenario.customerMessage}
          onChange={(event) => onChange('customerMessage', event.target.value)}
        />
      </div>
      <div className="field-group">
        <label>მოლოდინი</label>
        <textarea
          className="dark-textarea compact-textarea"
          rows={3}
          value={scenario.expectedOutcome}
          onChange={(event) => onChange('expectedOutcome', event.target.value)}
        />
      </div>
    </article>
  );
}

function ToggleChipGroup({ options, values, onToggle }) {
  return (
    <div className="toggle-chip-group">
      {options.map((option) => {
        const active = Array.isArray(values) && values.includes(option.key);

        return (
          <button
            key={option.key}
            type="button"
            className={`toggle-chip ${active ? 'active' : ''}`}
            onClick={() => onToggle(option.key)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function AutomationFeatureCard({ title, description, enabled, onToggle, children }) {
  return (
    <article className={`automation-card ${enabled ? 'enabled' : 'disabled'}`}>
      <div className="automation-card-head">
        <div className="automation-card-copy">
          <strong>{title}</strong>
          <span>{description}</span>
        </div>
        <label className={`toggle-switch ${enabled ? 'active' : ''}`}>
          <input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} />
          <span>{enabled ? 'ჩართულია' : 'გამორთულია'}</span>
        </label>
      </div>
      {enabled ? children : <div className="soft-note">ეს ფიჩერი გამორთულია და live ავტოპასუხზე არ იმოქმედებს.</div>}
    </article>
  );
}

export default function Home({ envStatus }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState('მოწმდება...');
  const [aiStatus, setAiStatus] = useState({
    running: false,
    modelReady: false,
    preferredReady: false,
    model: null,
    preferredModel: 'llama3.2:1b',
    message: 'Ollama სტატუსი იტვირთება...'
  });
  const [botConfig, setBotConfig] = useState(clone(createDefaultBuilderConfig()));
  const [publishedConfig, setPublishedConfig] = useState(clone(createDefaultBuilderConfig()));
  const [savedSnapshot, setSavedSnapshot] = useState(
    JSON.stringify(createDefaultBuilderConfig())
  );
  const [versionHistory, setVersionHistory] = useState([]);
  const [lastPublishedAt, setLastPublishedAt] = useState('');
  const [configNotice, setConfigNotice] = useState('კონფიგი იტვირთება...');
  const [testMessage, setTestMessage] = useState('გამარჯობა');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxSending, setInboxSending] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [manualReply, setManualReply] = useState('');
  const [nowLabel, setNowLabel] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState('');

  const runtimeConfig = useMemo(() => prepareBotConfigForRuntime(botConfig), [botConfig]);
  const publishedRuntimeConfig = useMemo(
    () => prepareBotConfigForRuntime(publishedConfig),
    [publishedConfig]
  );
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(botConfig) !== savedSnapshot,
    [botConfig, savedSnapshot]
  );
  const hasPendingPublish = useMemo(
    () => JSON.stringify(runtimeConfig) !== JSON.stringify(publishedRuntimeConfig),
    [runtimeConfig, publishedRuntimeConfig]
  );
  const unreadTotal = useMemo(
    () => conversations.reduce((total, item) => total + Number(item.unreadCount || 0), 0),
    [conversations]
  );
  const recentConversations = useMemo(() => conversations.slice(0, 4), [conversations]);
  const currentNavItem = useMemo(
    () => NAV_ITEMS.find((item) => item.key === activeTab) || NAV_ITEMS[0],
    [activeTab]
  );
  const needsHumanCount = useMemo(
    () => conversations.filter((item) => item.status === 'needs_human').length,
    [conversations]
  );
  const webhookMeta = useMemo(() => getWebhookStatusMeta(health), [health]);
  const aiMeta = useMemo(() => getAiStatusMeta(aiStatus), [aiStatus]);
  const currentPublishedVersion = useMemo(
    () => versionHistory.find((item) => item.isCurrent) || null,
    [versionHistory]
  );
  const enabledAutomationCount = useMemo(
    () =>
      Object.values(botConfig.automationSettings || {}).filter((item) => item?.enabled).length,
    [botConfig]
  );

  const checklist = useMemo(
    () => [
      {
        key: 'setup',
        title: 'ბიზნესის პროფილი',
        hint: 'ბრენდის სახელი, სფერო და მოკლე აღწერა.',
        done:
          !!botConfig.workspaceProfile.businessName &&
          !!botConfig.workspaceProfile.industry &&
          !!botConfig.workspaceProfile.businessSummary
      },
      {
        key: 'knowledge',
        title: 'ბიზნესის ცოდნა',
        hint: 'სერვისები, ფასების პოლიტიკა და საზღვრები.',
        done:
          !!botConfig.knowledgeSections.services &&
          !!botConfig.knowledgeSections.pricingPolicy &&
          !!botConfig.knowledgeSections.restrictions
      },
      {
        key: 'knowledge',
        title: 'FAQ პასუხები',
        hint: 'ხშირ კითხვებზე მზა პასუხები.',
        done: botConfig.faqItems.length > 0
      },
      {
        key: 'automation',
        title: 'ავტომაცია',
        hint: 'handoff ფრაზები, მაქს. პასუხები და დახურვა.',
        done:
          botConfig.conversationSettings.handoffKeywords.length > 0 &&
          botConfig.conversationSettings.maxAutoReplies > 0
      },
      {
        key: 'testing',
        title: 'ტესტირება',
        hint: 'სცენარები და preview.',
        done: botConfig.testScenarios.length > 0
      }
    ],
    [botConfig]
  );

  const completedChecklistCount = useMemo(
    () => checklist.filter((item) => item.done).length,
    [checklist]
  );
  const nextIncompleteStep = useMemo(
    () => checklist.find((item) => !item.done) || null,
    [checklist]
  );

  function applyConfigState(state) {
    if (!state || typeof state !== 'object') {
      return;
    }

    const draft = normalizeBuilderConfig(state.draft || createDefaultBuilderConfig());
    const published = normalizeBuilderConfig(state.published || draft);

    setBotConfig(draft);
    setPublishedConfig(published);
    setSavedSnapshot(JSON.stringify(draft));
    setVersionHistory(Array.isArray(state.versions) ? state.versions : []);
    setLastPublishedAt(state.lastPublishedAt || '');

    if (draft.testScenarios.length) {
      const safeIndex = Math.min(selectedScenarioIndex, draft.testScenarios.length - 1);
      setSelectedScenarioIndex(Math.max(0, safeIndex));
      setTestMessage(draft.testScenarios[Math.max(0, safeIndex)].customerMessage || '');
    }
  }

  async function loadConfig() {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      applyConfigState(data.state);
      setConfigNotice('კონფიგი ჩაიტვირთა.');
    } catch (error) {
      setConfigNotice('კონფიგი ვერ ჩაიტვირთა.');
    }
  }

  async function loadStatus() {
    try {
      const [webhookResponse, aiResponse] = await Promise.all([
        fetch('/api/webhook'),
        fetch('/api/ai-status')
      ]);
      const webhookData = await webhookResponse.json();
      const aiData = await aiResponse.json();
      setHealth(webhookData.message || 'Webhook მზადაა');
      setAiStatus(aiData);
    } catch (error) {
      setHealth('Webhook მიუწვდომელია');
      setAiStatus({
        running: false,
        modelReady: false,
        preferredReady: false,
        model: null,
        preferredModel: 'llama3.2:1b',
        message: 'Ollama სტატუსი ვერ წაიკითხა'
      });
    }
  }

  async function loadInbox() {
    try {
      const response = await fetch('/api/inbox');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Inbox ვერ ჩაიტვირთა');
      const next = Array.isArray(data.conversations) ? data.conversations : [];
      setConversations(next);
      setInboxError('');
      if (!next.length) {
        setSelectedConversationId('');
        setSelectedConversation(null);
        return;
      }
      if (!next.some((item) => item.id === selectedConversationId)) {
        setSelectedConversationId(next[0].id);
      }
    } catch (error) {
      setInboxError(error.message || 'Inbox ვერ ჩაიტვირთა');
    }
  }

  async function loadConversation(conversationId, markRead) {
    if (!conversationId) return;
    setInboxLoading(true);
    try {
      const response = await fetch(`/api/inbox?conversationId=${encodeURIComponent(conversationId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'საუბარი ვერ ჩაიტვირთა');
      setSelectedConversation(data.conversation || null);
      if (markRead) {
        await fetch('/api/inbox', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, action: 'read' })
        });
        await loadInbox();
      }
    } catch (error) {
      setInboxError(error.message || 'საუბარი ვერ ჩაიტვირთა');
    } finally {
      setInboxLoading(false);
    }
  }

  function updateWorkspaceProfile(key, value) {
    setBotConfig((current) => ({
      ...current,
      workspaceProfile: { ...current.workspaceProfile, [key]: value }
    }));
  }

  function updateKnowledgeSection(key, value) {
    setBotConfig((current) => ({
      ...current,
      knowledgeSections: { ...current.knowledgeSections, [key]: value }
    }));
  }

  function updateConversationSetting(key, value) {
    setBotConfig((current) => ({
      ...current,
      conversationSettings: { ...current.conversationSettings, [key]: value }
    }));
  }

  function updateAutomationSection(sectionKey, patch) {
    setBotConfig((current) => ({
      ...current,
      automationSettings: {
        ...current.automationSettings,
        [sectionKey]: {
          ...current.automationSettings?.[sectionKey],
          ...patch
        }
      }
    }));
  }

  function toggleAutomationListValue(sectionKey, key, value) {
    setBotConfig((current) => ({
      ...current,
      automationSettings: {
        ...current.automationSettings,
        [sectionKey]: {
          ...current.automationSettings?.[sectionKey],
          [key]: toggleArrayValue(current.automationSettings?.[sectionKey]?.[key], value)
        }
      }
    }));
  }

  function updateFaqItem(index, key, value) {
    setBotConfig((current) => ({
      ...current,
      faqItems: current.faqItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function addFaqItem() {
    setBotConfig((current) => ({
      ...current,
      faqItems: [...current.faqItems, { question: '', answer: '' }]
    }));
  }

  function removeFaqItem(index) {
    setBotConfig((current) => ({
      ...current,
      faqItems: current.faqItems.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  function updateTestScenario(index, key, value) {
    setBotConfig((current) => ({
      ...current,
      testScenarios: current.testScenarios.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      )
    }));
  }

  function addTestScenario() {
    setBotConfig((current) => ({
      ...current,
      testScenarios: [
        ...current.testScenarios,
        { label: `სცენარი ${current.testScenarios.length + 1}`, customerMessage: '', expectedOutcome: '' }
      ]
    }));
  }

  function removeTestScenario(index) {
    setBotConfig((current) => ({
      ...current,
      testScenarios: current.testScenarios.filter((_, itemIndex) => itemIndex !== index)
    }));
    setSelectedScenarioIndex((current) => Math.max(0, current - (index <= current ? 1 : 0)));
  }

  function loadScenarioIntoPreview(index) {
    const scenario = botConfig.testScenarios[index];
    if (!scenario) return;
    setSelectedScenarioIndex(index);
    setTestMessage(scenario.customerMessage || '');
  }

  function loadSampleSetup() {
    const next = clone(SAMPLE_CONFIG);
    setBotConfig(next);
    setConfigNotice('სასწავლო მაგალითი ჩაიტვირთა.');
    if (next.testScenarios.length) {
      setSelectedScenarioIndex(0);
      setTestMessage(next.testScenarios[0].customerMessage);
    }
  }

  function resetToDefaults() {
    const next = clone(createDefaultBuilderConfig());
    setBotConfig(next);
    setConfigNotice('საწყისი კონფიგი ჩაიტვირთა.');
    if (next.testScenarios.length) {
      setSelectedScenarioIndex(0);
      setTestMessage(next.testScenarios[0].customerMessage);
    }
  }

  function openConversationFromDashboard(conversationId) {
    setSelectedConversationId(conversationId);
    setActiveTab('inbox');
  }

  useEffect(() => {
    loadConfig();
    loadStatus();
    loadInbox();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(loadStatus, 8000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function updateNowLabel() {
      setNowLabel(formatDate(new Date().toISOString()));
    }
    updateNowLabel();
    const intervalId = setInterval(updateNowLabel, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadInbox();
      if (selectedConversationId) {
        loadConversation(selectedConversationId, false);
      }
    }, 7000);
    return () => clearInterval(intervalId);
  }, [selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversation(selectedConversationId, true);
    }
  }, [selectedConversationId]);

  async function saveConfig() {
    setSaveLoading(true);
    setConfigNotice('ინახება...');
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botConfig)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'შენახვა ვერ შესრულდა');
      applyConfigState(data.state);
      setConfigNotice('Draft შენახულია.');
    } catch (error) {
      setConfigNotice(error.message || 'შენახვა ვერ შესრულდა');
    } finally {
      setSaveLoading(false);
    }
  }

  async function publishConfig() {
    setPublishLoading(true);
    setConfigNotice('ქვეყნდება...');
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'გამოქვეყნება ვერ შესრულდა');
      applyConfigState(data.state);
      setConfigNotice('Draft live-ში გამოქვეყნდა.');
    } catch (error) {
      setConfigNotice(error.message || 'გამოქვეყნება ვერ შესრულდა');
    } finally {
      setPublishLoading(false);
    }
  }

  async function rollbackConfig(versionId) {
    setRollbackLoading(versionId || 'latest');
    setConfigNotice('ვერსია ბრუნდება...');
    try {
      const response = await fetch('/api/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', versionId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Rollback ვერ შესრულდა');
      applyConfigState(data.state);
      setConfigNotice('Live ვერსია უკან დაბრუნდა.');
    } catch (error) {
      setConfigNotice(error.message || 'Rollback ვერ შესრულდა');
    } finally {
      setRollbackLoading('');
    }
  }

  async function runLocalTest() {
    const text = testMessage.trim();
    if (!text) {
      setTestResult({ ok: false, mode: 'local_test', error: 'ჯერ ჩაწერე სატესტო შეტყობინება.' });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          __local_test: true,
          __local_config: prepareBotConfigForRuntime(botConfig),
          object: 'page',
          entry: [{ messaging: [{ sender: { id: 'local-test-user' }, message: { text } }] }]
        })
      });
      setTestResult(await response.json());
    } catch (error) {
      setTestResult({ ok: false, mode: 'local_test', error: 'სწრაფი ტესტი ვერ შესრულდა' });
    } finally {
      setTestLoading(false);
    }
  }

  async function changeConversationStatus(action) {
    if (!selectedConversationId) {
      setInboxError('ჯერ აირჩიე საუბარი.');
      return;
    }
    setInboxSending(true);
    try {
      const response = await fetch('/api/inbox', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConversationId, action })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'სტატუსი ვერ შეიცვალა');
      setSelectedConversation(data.conversation || null);
      setInboxError('');
      await loadInbox();
    } catch (error) {
      setInboxError(error.message || 'სტატუსი ვერ შეიცვალა');
    } finally {
      setInboxSending(false);
    }
  }

  async function sendManualReply() {
    if (!selectedConversationId) {
      setInboxError('ჯერ აირჩიე საუბარი.');
      return;
    }
    if (!manualReply.trim()) {
      setInboxError('ჯერ ჩაწერე ტექსტი.');
      return;
    }
    setInboxSending(true);
    try {
      const response = await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedConversationId, text: manualReply.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'მესიჯი ვერ გაიგზავნა');
      setManualReply('');
      setInboxError('');
      await loadConversation(selectedConversationId, false);
      await loadInbox();
    } catch (error) {
      setInboxError(error.message || 'მესიჯი ვერ გაიგზავნა');
    } finally {
      setInboxSending(false);
    }
  }

  return (
    <>
      <Head>
        <title>{runtimeConfig.workspaceProfile.businessName} AI Builder</title>
      </Head>
      <main className="app-shell">
        <style jsx global>{panelStyles}</style>
        <aside className="app-rail">
          <div className="rail-brand">
            <div className="rail-brand-top">
              <div className="brand-mark">AI</div>
              <div className="brand-copy">
                <strong>{runtimeConfig.workspaceProfile.businessName}</strong>
                <span>Autoresponder Builder</span>
              </div>
            </div>
            <p className="brand-summary">
              კლიენტისთვის გამარტივებული სამუშაო სივრცე, სადაც ბიზნესი აწყობს ავტომოპასუხეს prompt-ის
              და ტექნიკური დეტალების გარეშე.
            </p>
          </div>
          <div className="rail-nav">
            {NAV_ITEMS.map((item) => (
              <RailButton
                key={item.key}
                item={item}
                active={activeTab === item.key}
                unread={item.key === 'inbox' ? unreadTotal : 0}
                onClick={() => setActiveTab(item.key)}
              />
            ))}
          </div>
          <div className="rail-footer">
            <div className="rail-mini-card">
              <strong>{completedChecklistCount}/{checklist.length} მზადაა</strong>
              <span>
                {nextIncompleteStep
                  ? `შემდეგი: ${nextIncompleteStep.title}`
                  : 'ძირითადი სეთაპი დასრულებულია.'}
              </span>
            </div>
            <div className="rail-mini-card">
              <strong>სისტემა</strong>
              <span>{configNotice}</span>
            </div>
            <div className="rail-user">
              <div className="rail-avatar">
                <span>YK</span>
              </div>
              <div className="rail-user-meta">
                <strong>Yumade Panel</strong>
                <span>@autoresponder-builder</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="content-shell">
          <section className="hero-card simple-header">
            <div className="simple-header-main">
              <div className="simple-header-copy">
                <span className="hero-kicker">
                  <span className="hero-dot" />
                  {runtimeConfig.workspaceProfile.businessName}
                </span>
                <h1>{currentNavItem.label}</h1>
                <p>{currentNavItem.hint}</p>
              </div>
              <div className="simple-header-side">
                <div className="simple-header-status">
                  <StatusPill tone={webhookMeta.tone}>Webhook: {webhookMeta.label}</StatusPill>
                  <StatusPill tone={aiMeta.tone}>AI: {aiMeta.label}</StatusPill>
                  <StatusPill tone={hasUnsavedChanges ? 'warn' : 'ok'}>
                    {hasUnsavedChanges ? 'Draft' : 'შენახულია'}
                  </StatusPill>
                  <StatusPill tone={hasPendingPublish ? 'warn' : 'ok'}>
                    {hasPendingPublish ? 'Live-ს არ ემთხვევა' : 'Live განახლებულია'}
                  </StatusPill>
                </div>
                <div className="simple-header-actions">
                  <button
                    type="button"
                    className="button primary"
                    onClick={saveConfig}
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'ინახება...' : 'შენახვა'}
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={publishConfig}
                    disabled={publishLoading || hasUnsavedChanges || !hasPendingPublish}
                  >
                    {publishLoading ? 'ქვეყნდება...' : 'Publish'}
                  </button>
                  <button type="button" className="button secondary" onClick={loadStatus}>
                    განახლება
                  </button>
                </div>
              </div>
            </div>
          </section>

          {activeTab === 'overview' ? (
            <section className="page-grid">
              <Surface
                title="მზაობა და სტატუსი"
                subtitle="აქ ხედავ რამდენად მზადაა კლიენტის ავტოპასუხი გაშვებისთვის."
                className="span-12"
              >
                <div className="metric-grid">
                  <MetricCard
                    label="სეთაპის პროგრესი"
                    value={`${completedChecklistCount}/${checklist.length}`}
                    hint={nextIncompleteStep ? `საჭიროა: ${nextIncompleteStep.title}` : 'მთავარი ბლოკები შევსებულია'}
                    tone="blue"
                  />
                  <MetricCard
                    label="FAQ"
                    value={botConfig.faqItems.length}
                    hint="მზა პასუხები ყველაზე ხშირ კითხვებზე"
                    tone="green"
                  />
                  <MetricCard
                    label="ტესტები"
                    value={botConfig.testScenarios.length}
                    hint="შენახული test case-ები"
                    tone="slate"
                  />
                  <MetricCard
                    label="საჭირო ოპერატორი"
                    value={needsHumanCount}
                    hint={`წაუკითხავი: ${unreadTotal}`}
                    tone="amber"
                  />
                </div>
                <div className="soft-note">
                  Facebook ტოკენი: {envStatus.facebookReady ? 'მზადაა' : 'აკლია'} · Verify ტოკენი:{' '}
                  {envStatus.verifyReady ? 'მზადაა' : 'აკლია'} · Runtime prompt: {runtimeConfig.systemPrompt.length}{' '}
                  სიმბოლო · ცოდნა: {runtimeConfig.knowledgeBase.length} სიმბოლო
                </div>
              </Surface>

              <Surface
                title="Draft და Live"
                subtitle="Draft-ში მუშაობ, Publish-ით გადადის live-ში, Rollback-ით ბრუნდება ძველი სტაბილური ვერსია."
                className="span-6"
              >
                <div className="summary-card">
                  <SummaryRow label="Draft შენახვა" value={hasUnsavedChanges ? 'ლოკალური ცვლილებებია' : 'შენახულია'} />
                  <SummaryRow label="Live სტატუსი" value={hasPendingPublish ? 'ჩამორჩება draft-ს' : 'თანხვედრაშია'} />
                  <SummaryRow label="ბოლო Publish" value={lastPublishedAt ? formatDate(lastPublishedAt) : 'ჯერ არ არის'} />
                  <SummaryRow label="აქტიური live ვერსია" value={currentPublishedVersion?.id || 'უცნობია'} mono />
                </div>
                <div className={hasUnsavedChanges ? 'soft-note warning' : hasPendingPublish ? 'soft-note' : 'soft-note'}>
                  {hasUnsavedChanges
                    ? 'ჯერ შეინახე draft, შემდეგ კი შეგიძლია live-ზე გამოაქვეყნო.'
                    : hasPendingPublish
                      ? 'შენახული draft უკვე განსხვავდება live ვერსიისგან და Publish მზადაა.'
                      : 'ახლა live და draft ერთი და იგივე ვერსიაზეა.'}
                </div>
                <div className="button-row">
                  <button type="button" className="button primary" onClick={publishConfig} disabled={publishLoading || hasUnsavedChanges || !hasPendingPublish}>
                    {publishLoading ? 'ქვეყნდება...' : 'Publish live-ში'}
                  </button>
                  <button
                    type="button"
                    className="button secondary"
                    onClick={() => rollbackConfig()}
                    disabled={!!rollbackLoading || hasUnsavedChanges || versionHistory.length < 2}
                  >
                    {rollbackLoading === 'latest' ? 'ბრუნდება...' : 'ბოლო Rollback'}
                  </button>
                </div>
              </Surface>

              <Surface
                title="ვერსიების ისტორია"
                subtitle="აქედან ნახავ გამოქვეყნებულ ისტორიას და საჭიროებისას ერთ-ერთი ვერსიის დაბრუნებას."
                className="span-6"
              >
                <div className="version-list">
                  {versionHistory.length ? (
                    versionHistory.slice(0, 5).map((version) => (
                      <div key={version.id} className={`version-card ${version.isCurrent ? 'active' : ''}`}>
                        <div className="version-top">
                          <div className="version-copy">
                            <strong>{version.businessName}</strong>
                            <span>{version.industry}</span>
                          </div>
                          <StatusPill tone={version.isCurrent ? 'ok' : 'neutral'}>
                            {version.reason === 'rollback'
                              ? 'Rollback'
                              : version.reason === 'publish'
                                ? 'Publish'
                                : version.reason}
                          </StatusPill>
                        </div>
                        <div className="summary-card compact-summary">
                          <SummaryRow label="ვერსია" value={version.id} mono />
                          <SummaryRow label="დრო" value={formatDate(version.createdAt)} />
                          <SummaryRow label="FAQ / ტესტები" value={`${version.faqCount} / ${version.testCount}`} />
                        </div>
                        <div className="button-row">
                          <button
                            type="button"
                            className="button secondary"
                            onClick={() => rollbackConfig(version.id)}
                            disabled={!!rollbackLoading || hasUnsavedChanges || version.isCurrent}
                          >
                            {rollbackLoading === version.id ? 'ბრუნდება...' : 'ამ ვერსიაზე დაბრუნება'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-card">
                      <strong>ვერსიები ჯერ არ გაქვს</strong>
                      <div className="empty-copy">პირველი Publish-ის შემდეგ აქ history დაგიგროვდება.</div>
                    </div>
                  )}
                </div>
              </Surface>

              <Surface
                title="სეთაპის ჩეკლისტი"
                subtitle="კლიენტისთვის გამზადებული ავტოპასუხის ძირითადი ბლოკები."
                className="span-6"
              >
                <div className="checklist">
                  {checklist.map((item) => (
                    <ChecklistItem
                      key={`${item.key}-${item.title}`}
                      done={item.done}
                      title={item.title}
                      hint={item.hint}
                      actionLabel={item.done ? 'რედაქტირება' : 'გახსნა'}
                      onClick={() => setActiveTab(item.key)}
                    />
                  ))}
                </div>
              </Surface>

              <Surface
                title="ბრენდის მოკლე პროფილი"
                subtitle="რას აგენერირებს სისტემა შიგნით ამ ფორმებიდან."
                className="span-6"
              >
                <div className="summary-card">
                  <SummaryRow label="ბიზნესი" value={botConfig.workspaceProfile.businessName} />
                  <SummaryRow label="ინდუსტრია" value={botConfig.workspaceProfile.industry} />
                  <SummaryRow label="ტონი" value={botConfig.workspaceProfile.tone} />
                  <SummaryRow label="პასუხის სიგრძე" value={botConfig.workspaceProfile.responseLength} />
                  <SummaryRow label="სამუშაო საათები" value={botConfig.workspaceProfile.workingHours} />
                  <SummaryRow label="ბოლო განახლება" value={nowLabel || 'მზადდება...'} />
                </div>
              </Surface>

              <Surface
                title="ბოლო საუბრები"
                subtitle="აქედან პირდაპირ გადახვალ ცოცხალ ინბოქსში."
                className="span-7"
              >
                {recentConversations.length ? (
                  <div className="recent-list">
                    {recentConversations.map((conversation) => (
                      <RecentConversationCard
                        key={conversation.id}
                        conversation={conversation}
                        onOpen={() => openConversationFromDashboard(conversation.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-card">
                    <strong>ჯერ საუბრები არ ჩანს</strong>
                    <div className="empty-copy">
                      როგორც კი ახალი Messenger შეტყობინება შემოვა, აქაც გამოჩნდება.
                    </div>
                  </div>
                )}
              </Surface>

              <Surface
                title="შემდეგი ნაბიჯი"
                subtitle="სწრაფი გადასვლა იმ ბლოკზე, რომელსაც ახლა ყველაზე მეტი გავლენა აქვს."
                className="span-5"
              >
                <div className={hasUnsavedChanges ? 'soft-note warning' : 'soft-note'}>
                  {hasUnsavedChanges
                    ? 'ცვლილებები ჯერ არ არის შენახული.'
                    : nextIncompleteStep
                      ? `შემდეგი კრიტიკული ნაბიჯია: ${nextIncompleteStep.title}.`
                      : 'ძირითადი builder მზადაა და შეგიძლია ტესტირებაზე ან ინბოქსზე გადახვიდე.'}
                </div>
                <div className="button-row">
                  <button type="button" className="button secondary" onClick={() => setActiveTab('setup')}>
                    სეთაპი
                  </button>
                  <button type="button" className="button secondary" onClick={() => setActiveTab('knowledge')}>
                    ცოდნა
                  </button>
                  <button type="button" className="button secondary" onClick={() => setActiveTab('testing')}>
                    ტესტირება
                  </button>
                </div>
              </Surface>
            </section>
          ) : null}

          {activeTab === 'setup' ? (
            <section className="page-grid">
              <Surface
                title="ბიზნესის პროფილი"
                subtitle="კლიენტი აქ ავსებს ძირითად ბიზნეს-ინფორმაციას, შიდა prompt-ს კი სისტემა თვითონ აგენერირებს."
                className="span-7"
              >
                <div className="field-grid-two">
                  <div className="field-group">
                    <label>ბიზნესის სახელი</label>
                    <input className="dark-input" type="text" value={botConfig.workspaceProfile.businessName} onChange={(event) => updateWorkspaceProfile('businessName', event.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>ინდუსტრია</label>
                    <input className="dark-input" type="text" value={botConfig.workspaceProfile.industry} onChange={(event) => updateWorkspaceProfile('industry', event.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>ქალაქი</label>
                    <input className="dark-input" type="text" value={botConfig.workspaceProfile.city} onChange={(event) => updateWorkspaceProfile('city', event.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>სამუშაო საათები</label>
                    <input className="dark-input" type="text" value={botConfig.workspaceProfile.workingHours} onChange={(event) => updateWorkspaceProfile('workingHours', event.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>ენა</label>
                    <input className="dark-input" type="text" value={botConfig.workspaceProfile.language} onChange={(event) => updateWorkspaceProfile('language', event.target.value)} />
                  </div>
                </div>
                <div className="field-group">
                  <label>ბიზნესის მოკლე აღწერა</label>
                  <textarea className="dark-textarea" rows={6} value={botConfig.workspaceProfile.businessSummary} onChange={(event) => updateWorkspaceProfile('businessSummary', event.target.value)} />
                </div>
              </Surface>

              <Surface
                title="ტონი და პასუხის სტილი"
                subtitle="აქ წყდება როგორ ილაპარაკებს ასისტენტი და რა შემდეგ ნაბიჯს შესთავაზებს კლიენტს."
                className="span-5"
              >
                <div className="field-group">
                  <label>ტონი</label>
                  <input className="dark-input" type="text" value={botConfig.workspaceProfile.tone} onChange={(event) => updateWorkspaceProfile('tone', event.target.value)} />
                </div>
                <div className="field-group">
                  <label>პასუხის სიგრძე</label>
                  <select className="dark-input" value={botConfig.workspaceProfile.responseLength} onChange={(event) => updateWorkspaceProfile('responseLength', event.target.value)}>
                    <option value="მოკლე">მოკლე</option>
                    <option value="საშუალო">საშუალო</option>
                    <option value="დეტალური">დეტალური</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>შემდეგი ნაბიჯის ფრაზა</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.workspaceProfile.nextStepCta} onChange={(event) => updateWorkspaceProfile('nextStepCta', event.target.value)} />
                </div>
                <div className="summary-card">
                  <SummaryRow label="Runtime prompt" value={`${runtimeConfig.systemPrompt.length} სიმბოლო`} />
                  <SummaryRow label="Runtime knowledge" value={`${runtimeConfig.knowledgeBase.length} სიმბოლო`} />
                </div>
                <div className="button-row">
                  <button type="button" className="button secondary" onClick={loadSampleSetup}>მაგალითი</button>
                  <button type="button" className="button secondary" onClick={resetToDefaults}>საწყისი ვერსია</button>
                </div>
              </Surface>
            </section>
          ) : null}

          {activeTab === 'knowledge' ? (
            <section className="page-grid">
              <Surface title="ბიზნესის ფაქტები" subtitle="აქ ივსება ინფორმაცია, რომელსაც AI რეალურ პასუხებში ეყრდნობა." className="span-7">
                <div className="field-group">
                  <label>სერვისები ან პროდუქტები</label>
                  <textarea className="dark-textarea" rows={6} value={botConfig.knowledgeSections.services} onChange={(event) => updateKnowledgeSection('services', event.target.value)} />
                </div>
                <div className="field-group">
                  <label>ფასების პოლიტიკა</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.knowledgeSections.pricingPolicy} onChange={(event) => updateKnowledgeSection('pricingPolicy', event.target.value)} />
                </div>
                <div className="field-group">
                  <label>ვადები და მიწოდება</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.knowledgeSections.deliveryPolicy} onChange={(event) => updateKnowledgeSection('deliveryPolicy', event.target.value)} />
                </div>
              </Surface>

              <Surface title="საუბრის საზღვრები" subtitle="ეს ბლოკი განსაზღვრავს სად უნდა გაჩერდეს AI და როდის გადაიყვანოს საუბარი ადამიანზე." className="span-5">
                <div className="field-group">
                  <label>როდის გადავიდეს ოპერატორზე</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.knowledgeSections.escalationNotes} onChange={(event) => updateKnowledgeSection('escalationNotes', event.target.value)} />
                </div>
                <div className="field-group">
                  <label>აკრძალული დაპირებები</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.knowledgeSections.restrictions} onChange={(event) => updateKnowledgeSection('restrictions', event.target.value)} />
                </div>
                <div className="soft-note">
                  ეს ტექსტები მომხმარებელს არ ეჩვენება. მათგან სისტემა აგენერირებს უსაფრთხო შიდა წესებს.
                </div>
              </Surface>

              <Surface title="FAQ პასუხები" subtitle="აქ დაამატე ხშირი კითხვები, რომ bot-მა პირდაპირ მზა პასუხი გამოიყენოს." className="span-12" actions={<button type="button" className="button primary" onClick={addFaqItem}>ახალი FAQ</button>}>
                <div className="faq-stack">
                  {botConfig.faqItems.length ? (
                    botConfig.faqItems.map((item, index) => (
                      <div key={`faq-${index}`} className="faq-editor-card">
                        <div className="field-group">
                          <label>კითხვა #{index + 1}</label>
                          <input className="dark-input" type="text" value={item.question} onChange={(event) => updateFaqItem(index, 'question', event.target.value)} />
                        </div>
                        <div className="field-group">
                          <label>პასუხი</label>
                          <textarea className="dark-textarea compact-textarea" rows={4} value={item.answer} onChange={(event) => updateFaqItem(index, 'answer', event.target.value)} />
                        </div>
                        <button type="button" className="button ghost" onClick={() => removeFaqItem(index)}>წაშლა</button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-card">
                      <strong>FAQ ჯერ ცარიელია</strong>
                      <div className="empty-copy">დაამატე ხშირად მოსული კითხვები, რომ bot-მა უფრო სწრაფად უპასუხოს.</div>
                    </div>
                  )}
                </div>
              </Surface>
            </section>
          ) : null}

          {activeTab === 'automation' ? (
            <section className="page-grid">
              <Surface title="ოპერატორზე გადაცემა" subtitle="მაგალითი ფრაზები და პასუხი, როცა საუბარი ადამიანზე უნდა გადავიდეს." className="span-7">
                <div className="field-grid-two">
                  <div className="field-group">
                    <label>მაგალითი ფრაზები</label>
                    <input className="dark-input" type="text" value={keywordsToText(botConfig.conversationSettings.handoffKeywords)} onChange={(event) => updateConversationSetting('handoffKeywords', parseKeywords(event.target.value))} />
                  </div>
                  <div className="field-group">
                    <label>AI მაქს. პასუხები</label>
                    <input className="dark-input" type="number" min="1" max="12" value={botConfig.conversationSettings.maxAutoReplies} onChange={(event) => updateConversationSetting('maxAutoReplies', Math.min(Math.max(Number.parseInt(event.target.value || '1', 10) || 1, 1), 12))} />
                  </div>
                </div>
                <div className="field-group">
                  <label>ოპერატორზე გადაცემის ტექსტი</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.conversationSettings.handoffMessage} onChange={(event) => updateConversationSetting('handoffMessage', event.target.value)} />
                </div>
                <div className="soft-note">
                  თუ ზუსტი პასუხი არ არის, სისტემა ამ წესებს გამოიყენებს და საუბარს ადამიანზე გადაიყვანს.
                </div>
              </Surface>

              <Surface title="დახურვა და ხელახალი გახსნა" subtitle="რა ფრაზებმა უნდა დახუროს საუბარი და რა ფრაზებმა უნდა გახსნას თავიდან." className="span-5">
                <div className="field-group">
                  <label>დახურვის ფრაზები</label>
                  <input className="dark-input" type="text" value={keywordsToText(botConfig.conversationSettings.closingKeywords)} onChange={(event) => updateConversationSetting('closingKeywords', parseKeywords(event.target.value))} />
                </div>
                <div className="field-group">
                  <label>ხელახალი გახსნის ფრაზები</label>
                  <input className="dark-input" type="text" value={keywordsToText(botConfig.conversationSettings.reopenKeywords)} onChange={(event) => updateConversationSetting('reopenKeywords', parseKeywords(event.target.value))} />
                </div>
                <div className="field-group">
                  <label>დახურვის ტექსტი</label>
                  <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.conversationSettings.farewellMessage} onChange={(event) => updateConversationSetting('farewellMessage', event.target.value)} />
                </div>
              </Surface>

              <Surface title="ავტომატური ფიჩერები" subtitle="თითოეული ფიჩერი შეგიძლია ჩართო ან გამორთო კლიენტის საჭიროების მიხედვით." className="span-12">
                <div className="soft-note">
                  ახლა ჩართულია {enabledAutomationCount} automation feature. ყველა ცვლილება Draft-ში ინახება და live-ზე Publish-ის შემდეგ იმუშავებს.
                </div>
                <div className="automation-grid">
                  <AutomationFeatureCard
                    title="სამუშაო საათები"
                    description="თუ შეტყობინება მოვა სამუშაო საათების გარეთ, bot შესაბამის პასუხს გასცემს."
                    enabled={botConfig.automationSettings.businessHours.enabled}
                    onToggle={(enabled) => updateAutomationSection('businessHours', { enabled })}
                  >
                    <div className="field-grid-two">
                      <div className="field-group">
                        <label>Time zone</label>
                        <input className="dark-input" type="text" value={botConfig.automationSettings.businessHours.timezone} onChange={(event) => updateAutomationSection('businessHours', { timezone: event.target.value })} />
                      </div>
                      <label className="inline-checkbox">
                        <input type="checkbox" checked={botConfig.automationSettings.businessHours.handoffOutsideHours} onChange={(event) => updateAutomationSection('businessHours', { handoffOutsideHours: event.target.checked })} />
                        <span>გადაიყვანოს needs_human-ზე</span>
                      </label>
                    </div>
                    <div className="field-group">
                      <label>სამუშაო დღეები</label>
                      <ToggleChipGroup options={WORKING_DAY_OPTIONS} values={botConfig.automationSettings.businessHours.workingDays} onToggle={(value) => toggleAutomationListValue('businessHours', 'workingDays', value)} />
                    </div>
                    <div className="field-grid-two">
                      <div className="field-group">
                        <label>დაწყების დრო</label>
                        <input className="dark-input" type="time" value={botConfig.automationSettings.businessHours.startTime} onChange={(event) => updateAutomationSection('businessHours', { startTime: event.target.value })} />
                      </div>
                      <div className="field-group">
                        <label>დასრულების დრო</label>
                        <input className="dark-input" type="time" value={botConfig.automationSettings.businessHours.endTime} onChange={(event) => updateAutomationSection('businessHours', { endTime: event.target.value })} />
                      </div>
                    </div>
                    <div className="field-group">
                      <label>After-hours პასუხი</label>
                      <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.automationSettings.businessHours.afterHoursMessage} onChange={(event) => updateAutomationSection('businessHours', { afterHoursMessage: event.target.value })} />
                    </div>
                  </AutomationFeatureCard>

                  <AutomationFeatureCard
                    title="Intent routing"
                    description="შეტყობინების ტიპი ამოიცნოს და საჭირო intent ავტომატურად ოპერატორზე გადაამისამართოს."
                    enabled={botConfig.automationSettings.intentRouting.enabled}
                    onToggle={(enabled) => updateAutomationSection('intentRouting', { enabled })}
                  >
                    <div className="field-group">
                      <label>რომელი intent-ები გადავიდეს ოპერატორზე</label>
                      <ToggleChipGroup options={AUTOMATION_INTENT_OPTIONS} values={botConfig.automationSettings.intentRouting.routeToHumanIntents} onToggle={(value) => toggleAutomationListValue('intentRouting', 'routeToHumanIntents', value)} />
                    </div>
                    <div className="field-group">
                      <label>გადაცემის ტექსტი</label>
                      <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.automationSettings.intentRouting.routeMessage} onChange={(event) => updateAutomationSection('intentRouting', { routeMessage: event.target.value })} />
                    </div>
                  </AutomationFeatureCard>

                  <AutomationFeatureCard
                    title="Confidence fallback"
                    description="თუ პასუხი ბუნდოვანი ან არასაიმედოა, bot უსაფრთხო fallback ტექსტზე გადავა."
                    enabled={botConfig.automationSettings.confidenceFallback.enabled}
                    onToggle={(enabled) => updateAutomationSection('confidenceFallback', { enabled })}
                  >
                    <div className="field-group">
                      <label>Fallback პასუხი</label>
                      <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.automationSettings.confidenceFallback.fallbackMessage} onChange={(event) => updateAutomationSection('confidenceFallback', { fallbackMessage: event.target.value })} />
                    </div>
                  </AutomationFeatureCard>

                  <AutomationFeatureCard
                    title="Lead qualification"
                    description="თბილ ლიდზე bot-მა შეკრას დამატებითი დეტალები, სანამ ოპერატორი ჩაერთვება."
                    enabled={botConfig.automationSettings.leadQualification.enabled}
                    onToggle={(enabled) => updateAutomationSection('leadQualification', { enabled })}
                  >
                    <div className="field-group">
                      <label>რომელ intent-ებზე იმუშაოს qualification-მა</label>
                      <ToggleChipGroup options={AUTOMATION_INTENT_OPTIONS.filter((option) => option.key !== 'complaint' && option.key !== 'operator')} values={botConfig.automationSettings.leadQualification.triggerIntents} onToggle={(value) => toggleAutomationListValue('leadQualification', 'triggerIntents', value)} />
                    </div>
                    <div className="field-group">
                      <label>Qualification შეკითხვა</label>
                      <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.automationSettings.leadQualification.qualificationMessage} onChange={(event) => updateAutomationSection('leadQualification', { qualificationMessage: event.target.value })} />
                    </div>
                  </AutomationFeatureCard>

                  <AutomationFeatureCard
                    title="Knowledge gap detection"
                    description="თუ bot ზუსტ პასუხს ვერ გასცემს, ეს თემა ცალკე დალოგდეს შემდგომი გაუმჯობესებისთვის."
                    enabled={botConfig.automationSettings.knowledgeGapDetection.enabled}
                    onToggle={(enabled) => updateAutomationSection('knowledgeGapDetection', { enabled })}
                  >
                    <div className="soft-note">
                      შეუსრულებელი თემები ეწერება `data/knowledge-gaps.json`-ში, რათა შემდეგ FAQ ან ცოდნის ბაზა შეივსოს.
                    </div>
                  </AutomationFeatureCard>

                  <AutomationFeatureCard
                    title="ნეგატიური ტონის handoff"
                    description="თუ კლიენტი უკმაყოფილოა ან საჩივრის ტიპის ტექსტს წერს, ჩატი სწრაფად გადავიდეს ოპერატორზე."
                    enabled={botConfig.automationSettings.sentimentHandoff.enabled}
                    onToggle={(enabled) => updateAutomationSection('sentimentHandoff', { enabled })}
                  >
                    <div className="field-group">
                      <label>Trigger სიტყვები</label>
                      <input className="dark-input" type="text" value={keywordsToText(botConfig.automationSettings.sentimentHandoff.angryKeywords)} onChange={(event) => updateAutomationSection('sentimentHandoff', { angryKeywords: parseKeywords(event.target.value) })} />
                    </div>
                    <div className="field-group">
                      <label>პასუხი გადაცემამდე</label>
                      <textarea className="dark-textarea compact-textarea" rows={4} value={botConfig.automationSettings.sentimentHandoff.replyMessage} onChange={(event) => updateAutomationSection('sentimentHandoff', { replyMessage: event.target.value })} />
                    </div>
                  </AutomationFeatureCard>
                </div>
              </Surface>
            </section>
          ) : null}

          {activeTab === 'testing' ? (
            <section className="page-grid">
              <Surface title="ტესტ-სცენარები" subtitle="აქ ინახავ რეალურ კითხვებს, რომ ყოველი ცვლილების მერე სწრაფად გადაამოწმო პასუხი." className="span-5" actions={<button type="button" className="button primary" onClick={addTestScenario}>ახალი სცენარი</button>}>
                <div className="scenario-list">
                  {botConfig.testScenarios.length ? (
                    botConfig.testScenarios.map((scenario, index) => (
                      <ScenarioEditor
                        key={`scenario-${index}`}
                        scenario={scenario}
                        index={index}
                        active={selectedScenarioIndex === index}
                        onSelect={() => loadScenarioIntoPreview(index)}
                        onChange={(key, value) => updateTestScenario(index, key, value)}
                        onRemove={() => removeTestScenario(index)}
                      />
                    ))
                  ) : (
                    <div className="empty-card">
                      <strong>ტესტები ჯერ არ გაქვს</strong>
                      <div className="empty-copy">დაამატე 3-5 რეალური შეკითხვა, რომ ყოველი ცვლილება ხარისხით გადაამოწმო.</div>
                    </div>
                  )}
                </div>
              </Surface>

              <Surface title="ცოცხალი preview" subtitle="ეს ტესტი იყენებს იმავე runtime კონფიგს, რაც რეალურ ავტოპასუხს." className="span-7 compact-surface">
                {botConfig.testScenarios[selectedScenarioIndex]?.expectedOutcome ? (
                  <div className="soft-note">მოლოდინი: {botConfig.testScenarios[selectedScenarioIndex].expectedOutcome}</div>
                ) : null}
                <div className="field-group">
                  <label>სატესტო შეტყობინება</label>
                  <textarea className="dark-textarea" rows={6} value={testMessage} onChange={(event) => setTestMessage(event.target.value)} />
                </div>
                <div className="button-row">
                  <button type="button" className="button primary" onClick={runLocalTest} disabled={testLoading || !testMessage.trim()}>
                    {testLoading ? 'ტესტი მიმდინარეობს...' : 'ტესტის გაშვება'}
                  </button>
                  <button type="button" className="button secondary" onClick={() => setTestMessage(botConfig.testScenarios[selectedScenarioIndex]?.customerMessage || '')}>
                    სცენარის ჩატვირთვა
                  </button>
                </div>
                {testResult ? (
                  <div className={`result-card ${testResult.ok ? 'ok' : 'error'}`}>
                    <pre>{JSON.stringify(testResult, null, 2)}</pre>
                  </div>
                ) : null}
              </Surface>
            </section>
          ) : null}

          {activeTab === 'inbox' ? (
            <MessengerInboxPanel
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              selectedConversation={selectedConversation}
              inboxLoading={inboxLoading}
              inboxSending={inboxSending}
              inboxError={inboxError}
              manualReply={manualReply}
              onSelectConversation={setSelectedConversationId}
              onChangeConversationStatus={changeConversationStatus}
              onManualReplyChange={setManualReply}
              onManualReplySend={sendManualReply}
              onRefreshConversation={() => loadConversation(selectedConversationId, false)}
              onRefreshList={loadInbox}
            />
          ) : null}
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps() {
  const facebookReady =
    !!process.env.FACEBOOK_PAGE_ACCESS_TOKEN &&
    process.env.FACEBOOK_PAGE_ACCESS_TOKEN !== 'your_facebook_page_access_token_here';
  const verifyReady =
    !!process.env.FACEBOOK_VERIFY_TOKEN &&
    process.env.FACEBOOK_VERIFY_TOKEN !== 'your_custom_verify_token_here';

  return {
    props: {
      envStatus: {
        facebookReady,
        verifyReady
      }
    }
  };
}
