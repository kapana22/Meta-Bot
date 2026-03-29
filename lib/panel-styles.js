export const panelStyles = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Sans+Georgian:wght@400;500;600;700;800&display=swap');

:root {
  --bg: #070b16;
  --surface: rgba(13, 18, 37, 0.88);
  --surface-strong: rgba(14, 20, 42, 0.96);
  --line: rgba(121, 145, 255, 0.14);
  --text: #f4f7ff;
  --muted: #97a3c9;
  --muted-strong: #b9c4e4;
  --accent: #67a8ff;
  --accent-2: #67ffd0;
  --warning-text: #f7d789;
  --error-text: #ff8dac;
  --shadow: 0 12px 34px rgba(0, 0, 0, 0.22);
}

* {
  box-sizing: border-box;
}

html,
body,
#__next {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(103, 168, 255, 0.16), transparent 28%),
    radial-gradient(circle at 85% 10%, rgba(103, 255, 208, 0.12), transparent 22%),
    linear-gradient(180deg, #080c18 0%, #090d19 40%, #080b15 100%);
  color: var(--text);
  font-family: 'Manrope', 'Noto Sans Georgian', system-ui, sans-serif;
}

body::before,
body::after {
  content: '';
  position: fixed;
  pointer-events: none;
  z-index: 0;
  filter: blur(110px);
  opacity: 0.22;
}

body::before {
  width: 360px;
  height: 360px;
  top: 30px;
  right: 8%;
  background: rgba(57, 103, 255, 0.14);
}

body::after {
  width: 320px;
  height: 320px;
  left: 6%;
  bottom: 6%;
  background: rgba(82, 255, 210, 0.08);
}

button,
input,
textarea,
select {
  font: inherit;
}

img {
  max-width: 100%;
}

.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 22px;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
}

.content-shell {
  min-width: 0;
}

.app-rail,
.hero-card,
.surface,
.inbox-page,
.inbox-list-pane,
.thread-board {
  position: relative;
  overflow: hidden;
  background: rgba(13, 18, 37, 0.96);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  backdrop-filter: blur(8px);
}

.app-rail::before,
.hero-card::before,
.surface::before,
.inbox-page::before,
.thread-board::before,
.inbox-list-pane::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 24%);
}

.app-rail {
  position: sticky;
  top: 22px;
  align-self: start;
  border-radius: 22px;
  padding: 14px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 14px;
}

.rail-brand {
  display: grid;
  gap: 8px;
  padding: 4px 4px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.rail-brand-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(103, 168, 255, 0.34), rgba(103, 255, 208, 0.18));
  border: 1px solid rgba(103, 168, 255, 0.34);
  color: #ffffff;
  font-weight: 800;
  box-shadow: none;
}

.brand-copy,
.rail-user-meta {
  display: grid;
  gap: 2px;
}

.brand-copy span,
.brand-summary,
.rail-user-meta span,
.summary-label,
.surface-subtitle,
.metric-hint,
.mini-chip,
.helper-text,
.faq-caption,
.empty-copy {
  color: var(--muted);
}

.brand-summary {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
}

.rail-nav {
  display: grid;
  gap: 10px;
  align-content: start;
}

.rail-button {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  color: var(--text);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.rail-button:hover {
  transform: translateY(-1px);
  border-color: rgba(103, 168, 255, 0.22);
  background: rgba(255, 255, 255, 0.04);
}

.rail-button.active {
  border-color: rgba(103, 255, 208, 0.24);
  background: rgba(103, 168, 255, 0.1);
  box-shadow: none;
}

.rail-button-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted-strong);
  font-size: 13px;
}

.rail-button-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
  flex: 1;
}

.rail-button-copy strong {
  font-size: 14px;
}

.rail-button-copy span {
  font-size: 12px;
  color: var(--muted);
}

.rail-badge {
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(103, 168, 255, 0.18);
  border: 1px solid rgba(103, 168, 255, 0.26);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.rail-footer {
  display: grid;
  gap: 12px;
}

.rail-mini-card {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: grid;
  gap: 8px;
}

.rail-user,
.recent-conversation-main,
.recent-conversation-foot,
.faq-preview-top,
.hero-action-row,
.button-row,
.quick-prompt-row,
.mini-chip-row,
.surface-actions,
.composer-actions,
.thread-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.rail-avatar,
.conversation-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(103, 168, 255, 0.24), rgba(103, 255, 208, 0.14));
  border: 1px solid rgba(103, 168, 255, 0.24);
  color: #ffffff;
  font-weight: 700;
  flex: 0 0 auto;
}

.conversation-avatar.large {
  width: 56px;
  height: 56px;
  border-radius: 18px;
}

.rail-avatar img,
.conversation-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.content-shell {
  display: grid;
  gap: 16px;
  align-content: start;
}

.hero-card {
  border-radius: 20px;
  padding: 16px 18px;
}

.hero-kicker,
.status-pill,
.mini-chip,
.mini-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  font-size: 13px;
}

.hero-kicker {
  padding: 7px 12px;
  color: var(--muted-strong);
  font-weight: 700;
}

.hero-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 0 18px rgba(103, 255, 208, 0.5);
}

.hero-card h1 {
  margin: 0;
  max-width: none;
  font-size: clamp(26px, 2.6vw, 32px);
  line-height: 1.12;
  letter-spacing: -0.02em;
}

.hero-card p {
  margin: 0;
  max-width: 52ch;
  color: var(--muted);
  line-height: 1.55;
  font-size: 14px;
}

.simple-header-main {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.simple-header-copy {
  display: grid;
  gap: 8px;
}

.simple-header-side,
.simple-header-status,
.simple-header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.simple-header-side {
  justify-content: flex-end;
}

.button {
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button.primary {
  color: #ffffff;
  background: linear-gradient(135deg, #4676ff, #2f57d3);
  box-shadow: none;
}

.button.secondary {
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.button.ghost {
  color: var(--muted-strong);
  background: transparent;
  border-color: rgba(255, 255, 255, 0.12);
}

.status-pill,
.mini-chip,
.mini-status {
  min-height: 34px;
  padding: 7px 12px;
  line-height: 1;
}

.status-pill.ok {
  border-color: rgba(103, 255, 208, 0.18);
  background: rgba(103, 255, 208, 0.08);
  color: #cbfff1;
}

.status-pill.warn {
  border-color: rgba(255, 196, 92, 0.22);
  background: rgba(255, 196, 92, 0.09);
  color: var(--warning-text);
}

.status-pill.error {
  border-color: rgba(255, 111, 145, 0.22);
  background: rgba(255, 111, 145, 0.09);
  color: var(--error-text);
}

.status-pill.neutral,
.mini-chip {
  color: var(--muted-strong);
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.span-5 {
  grid-column: span 5;
}

.span-6 {
  grid-column: span 6;
}

.span-7 {
  grid-column: span 7;
}

.span-12 {
  grid-column: span 12;
}

.surface {
  border-radius: 20px;
  padding: 18px;
  display: grid;
  gap: 14px;
  min-width: 0;
  align-content: start;
}

.surface-head,
.inbox-head,
.thread-toolbar,
.thread-meta-grid,
.thread-composer-top {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.surface-title {
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.surface-subtitle {
  margin: 0;
  line-height: 1.7;
  max-width: 760px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card {
  border-radius: 16px;
  padding: 16px;
  min-height: 110px;
  display: grid;
  align-content: start;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
}

.metric-card.blue {
  box-shadow: inset 0 -1px 0 rgba(103, 168, 255, 0.22);
}

.metric-card.green {
  box-shadow: inset 0 -1px 0 rgba(103, 255, 208, 0.22);
}

.metric-card.slate {
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.08);
}

.metric-card.amber {
  box-shadow: inset 0 -1px 0 rgba(255, 196, 92, 0.24);
}

.metric-label {
  font-size: 13px;
  color: var(--muted);
}

.metric-value {
  font-size: 24px;
  line-height: 1.12;
  letter-spacing: -0.03em;
}

.field-group {
  display: grid;
  gap: 8px;
  align-content: start;
  align-self: start;
}

.field-grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.field-group label {
  color: var(--muted-strong);
  font-size: 13px;
  font-weight: 700;
}

.dark-input,
.dark-textarea,
.file-input,
input[type='number'] {
  width: 100%;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(8, 12, 25, 0.86);
  color: var(--text);
  padding: 14px 16px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.dark-input::placeholder,
.dark-textarea::placeholder {
  color: rgba(151, 163, 201, 0.72);
}

.dark-input:focus,
.dark-textarea:focus,
.file-input:focus,
input[type='number']:focus {
  border-color: rgba(103, 168, 255, 0.34);
  box-shadow: 0 0 0 4px rgba(103, 168, 255, 0.08);
  background: rgba(10, 16, 33, 0.96);
}

.dark-textarea {
  min-height: 160px;
  resize: vertical;
  line-height: 1.7;
}

.dark-textarea.tall {
  min-height: 180px;
}

.dark-textarea.giant {
  min-height: 240px;
}

.compact-textarea {
  min-height: 110px;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: end;
}

.form-grow {
  flex: 1 1 320px;
}

.chip-button {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--muted-strong);
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.chip-button:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(103, 168, 255, 0.18);
}

.result-card {
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(4, 8, 18, 0.92);
}

.result-card.ok {
  box-shadow: inset 0 0 0 1px rgba(103, 255, 208, 0.14);
}

.result-card.error {
  box-shadow: inset 0 0 0 1px rgba(255, 111, 145, 0.14);
}

.result-card pre {
  margin: 0;
  padding: 18px;
  overflow: auto;
  color: #dce7ff;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.soft-note,
.empty-card,
.summary-card,
.faq-editor-card,
.faq-preview-card,
.recent-conversation {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.soft-note,
.empty-card,
.summary-card,
.faq-editor-card,
.faq-preview-card {
  padding: 14px 16px;
}

.soft-note {
  color: var(--muted-strong);
  line-height: 1.7;
}

.soft-note.warning {
  border-color: rgba(255, 196, 92, 0.18);
  background: rgba(255, 196, 92, 0.08);
  color: var(--warning-text);
}

.soft-note.error {
  border-color: rgba(255, 111, 145, 0.18);
  background: rgba(255, 111, 145, 0.08);
  color: var(--error-text);
}

.compact-surface .surface-subtitle {
  max-width: 60ch;
}

.recent-list,
.faq-stack,
.faq-preview-list {
  display: grid;
  gap: 12px;
  align-content: start;
}

.recent-conversation {
  width: 100%;
  text-align: left;
  cursor: pointer;
  padding: 14px;
  display: grid;
  gap: 12px;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.recent-conversation:hover {
  transform: translateY(-1px);
  border-color: rgba(103, 168, 255, 0.2);
  background: rgba(255, 255, 255, 0.04);
}

.recent-conversation.attention {
  border-color: rgba(255, 196, 92, 0.16);
  background: linear-gradient(180deg, rgba(255, 196, 92, 0.08), rgba(255, 255, 255, 0.03));
}

.recent-conversation-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
  flex: 1;
}

.recent-conversation-copy strong,
.faq-question,
.summary-row strong {
  font-size: 15px;
}

.recent-conversation-copy span,
.recent-conversation p,
.faq-answer,
.faq-caption,
.summary-row span {
  font-size: 13px;
  line-height: 1.65;
}

.recent-conversation p,
.faq-answer {
  margin: 0;
  color: var(--muted);
}

.mini-status {
  min-height: 34px;
  padding: 8px 12px;
}

.mini-status.open {
  color: #cafff1;
  background: rgba(103, 255, 208, 0.09);
  border-color: rgba(103, 255, 208, 0.18);
}

.mini-status.needs_human {
  color: var(--warning-text);
  background: rgba(255, 196, 92, 0.08);
  border-color: rgba(255, 196, 92, 0.16);
}

.mini-status.closed {
  color: var(--muted-strong);
}

.summary-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 14px;
}

.summary-card {
  display: grid;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row strong {
  text-align: right;
  line-height: 1.5;
}

.checklist,
.scenario-list,
.version-list {
  display: grid;
  gap: 12px;
  align-content: start;
}

.checklist-item,
.scenario-card,
.version-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.checklist-item {
  width: 100%;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  color: var(--text);
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.checklist-item:hover,
.scenario-card:hover,
.version-card:hover {
  transform: translateY(-1px);
  border-color: rgba(103, 168, 255, 0.18);
}

.checklist-item.done {
  background: rgba(103, 255, 208, 0.05);
}

.checklist-item.pending {
  background: rgba(255, 255, 255, 0.03);
}

.checklist-state {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 800;
  color: var(--muted-strong);
}

.checklist-item.done .checklist-state {
  background: rgba(103, 255, 208, 0.1);
  border-color: rgba(103, 255, 208, 0.22);
  color: #cbfff1;
}

.checklist-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.checklist-copy strong,
.scenario-top strong {
  font-size: 15px;
}

.checklist-copy span,
.checklist-action {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.checklist-action {
  white-space: nowrap;
}

.scenario-card {
  padding: 14px 16px;
  display: grid;
  gap: 12px;
}

.version-card {
  padding: 14px 16px;
  display: grid;
  gap: 12px;
}

.scenario-card.active {
  background: rgba(103, 168, 255, 0.08);
  border-color: rgba(103, 168, 255, 0.24);
}

.version-card.active {
  background: rgba(103, 255, 208, 0.05);
  border-color: rgba(103, 255, 208, 0.2);
}

.scenario-top,
.scenario-actions,
.version-top {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.scenario-top,
.version-top {
  justify-content: space-between;
}

.version-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.version-copy span {
  color: var(--muted);
  font-size: 13px;
}

.compact-summary {
  gap: 0;
}

.mono {
  font-family: Consolas, 'SFMono-Regular', monospace;
  font-size: 13px;
}

.faq-editor-card {
  display: grid;
  gap: 12px;
}

.faq-editor-card .button {
  width: fit-content;
}

.automation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-content: start;
}

.automation-card {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  padding: 14px 16px;
  display: grid;
  gap: 14px;
}

.automation-card.enabled {
  border-color: rgba(103, 168, 255, 0.16);
}

.automation-card-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.automation-card-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.automation-card-copy strong {
  font-size: 15px;
}

.automation-card-copy span {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.6;
}

.toggle-switch,
.inline-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--muted-strong);
  font-size: 13px;
}

.toggle-switch {
  padding: 10px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  white-space: nowrap;
}

.toggle-switch.active {
  border-color: rgba(103, 255, 208, 0.2);
  background: rgba(103, 255, 208, 0.08);
  color: #d7fff2;
}

.toggle-switch input,
.inline-checkbox input {
  margin: 0;
}

.inline-checkbox {
  min-height: 48px;
  padding-top: 28px;
}

.toggle-chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.toggle-chip {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--muted-strong);
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.toggle-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(103, 168, 255, 0.18);
}

.toggle-chip.active {
  border-color: rgba(103, 168, 255, 0.24);
  background: rgba(103, 168, 255, 0.1);
  color: #ffffff;
}

.empty-card,
.empty-thread {
  display: grid;
  place-items: center;
  text-align: center;
  min-height: 180px;
  gap: 10px;
}

.empty-thread {
  min-height: 460px;
  border-radius: 22px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  padding: 20px;
}

.empty-card strong,
.empty-thread strong {
  font-size: 18px;
}

.inbox-page {
  border-radius: 20px;
  padding: 18px;
  display: grid;
  gap: 14px;
}

.inbox-head h2 {
  margin: 0 0 6px;
  font-size: 28px;
}

.inbox-head p {
  margin: 0;
  color: var(--muted);
  max-width: 720px;
  line-height: 1.75;
}

.inbox-frame {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
  min-height: 680px;
}

.inbox-list-pane,
.thread-board {
  border-radius: 18px;
  min-width: 0;
}

.inbox-list-pane {
  padding: 16px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 14px;
}

.conversation-search {
  margin-top: 6px;
}

.list-footer-note {
  color: var(--muted);
  font-size: 12px;
  padding-top: 2px;
}

.conversation-list {
  overflow: auto;
  display: grid;
  gap: 12px;
  align-content: start;
}

.conversation-card {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  padding: 14px;
  display: grid;
  gap: 12px;
  align-self: start;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.conversation-card:hover {
  transform: translateY(-1px);
  border-color: rgba(103, 168, 255, 0.2);
}

.conversation-card.active {
  border-color: rgba(103, 255, 208, 0.18);
  background: rgba(103, 168, 255, 0.1);
  box-shadow: none;
}

.conversation-card-top,
.conversation-card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.conversation-card-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.conversation-card-copy {
  min-width: 0;
  display: grid;
  gap: 5px;
  flex: 1;
}

.conversation-card-copy strong {
  font-size: 15px;
}

.conversation-card-meta,
.conversation-card-preview,
.conversation-id,
.thread-subline,
.message-meta {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}

.conversation-card-preview {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.thread-board {
  padding: 16px;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 14px;
}

.thread-toolbar {
  padding: 0;
}

.thread-toolbar-side {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.thread-main {
  display: flex;
  gap: 14px;
  align-items: center;
}

.thread-main-copy {
  display: grid;
  gap: 6px;
}

.thread-main-copy h3 {
  margin: 0;
  font-size: 24px;
}

.thread-subline {
  margin: 0;
}

.thread-meta-card {
  min-width: 150px;
  border-radius: 18px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 6px;
}

.thread-meta-card span {
  font-size: 12px;
  color: var(--muted);
}

.thread-meta-card strong {
  font-size: 14px;
}

.thread-status-button {
  min-width: 0;
}

.thread-status-button.active-open {
  color: #ffffff;
  border-color: rgba(103, 168, 255, 0.4);
  background: linear-gradient(135deg, #4676ff, #355bd8);
  box-shadow: 0 12px 24px rgba(61, 97, 255, 0.22);
}

.thread-status-button.active-human {
  color: var(--warning-text);
  border-color: rgba(255, 196, 92, 0.24);
  background: rgba(255, 196, 92, 0.1);
}

.thread-status-button.active-closed {
  color: var(--error-text);
  border-color: rgba(255, 111, 145, 0.24);
  background: rgba(255, 111, 145, 0.1);
}

.thread-refresh-button {
  justify-self: end;
}

.thread-content-shell {
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
  width: 100%;
}

.thread-stream {
  min-height: 0;
  overflow: auto;
  padding: 0;
  display: grid;
  align-content: start;
  gap: 12px;
}

.message-row {
  display: flex;
  width: 100%;
}

.message-row.incoming {
  justify-content: flex-start;
}

.message-row.outgoing {
  justify-content: flex-end;
}

.message-bubble {
  max-width: min(62%, 680px);
  border-radius: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  gap: 8px;
  box-shadow: none;
}

.message-bubble.incoming {
  background: rgba(255, 255, 255, 0.04);
}

.message-bubble.outgoing {
  background: linear-gradient(135deg, rgba(72, 112, 255, 0.22), rgba(103, 255, 208, 0.09));
  border-color: rgba(103, 168, 255, 0.18);
}

.message-bubble p {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.7;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.thread-composer {
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  padding: 14px;
  display: grid;
  gap: 12px;
  margin-top: auto;
}

.thread-composer-top h4 {
  margin: 0 0 5px;
  font-size: 18px;
}

.thread-composer-top p {
  margin: 0;
  color: var(--muted);
  line-height: 1.7;
}

.thread-input {
  min-height: 130px;
}

@media (max-width: 1280px) {
  .span-5,
  .span-6,
  .span-7 {
    grid-column: span 12;
  }

  .summary-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1100px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .rail-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .inbox-frame {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .app-shell {
    padding: 12px;
    gap: 14px;
  }

  .app-rail {
    top: 12px;
    z-index: 6;
    padding: 12px;
    gap: 12px;
    border-radius: 22px;
  }

  .rail-brand {
    padding: 0;
    gap: 6px;
    border-bottom: none;
  }

  .brand-copy span,
  .brand-summary,
  .rail-footer {
    display: none;
  }

  .rail-nav {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 2px;
    scrollbar-width: none;
  }

  .rail-nav::-webkit-scrollbar {
    display: none;
  }

  .rail-button {
    min-width: 150px;
    flex: 0 0 auto;
    padding: 12px 13px;
    border-radius: 16px;
  }

  .rail-button-copy span {
    display: none;
  }

  .hero-card,
  .surface,
  .inbox-page,
  .inbox-list-pane,
  .thread-board {
    border-radius: 24px;
  }

  .hero-card,
  .surface,
  .inbox-page {
    padding: 18px;
  }

  .metric-grid,
  .field-grid-two,
  .automation-grid {
    grid-template-columns: 1fr;
  }

  .simple-header-main {
    flex-direction: column;
    align-items: stretch;
  }

  .simple-header-side {
    justify-content: flex-start;
  }

  .button {
    width: 100%;
  }

  .message-bubble {
    max-width: 100%;
  }

  .thread-content-shell {
    width: 100%;
  }

  .dark-textarea.tall {
    min-height: 280px;
  }

  .dark-textarea.giant {
    min-height: 320px;
  }

  .metric-card {
    min-height: 112px;
  }

  .empty-thread {
    min-height: 320px;
  }

  .summary-row {
    align-items: flex-start;
  }

  .summary-row strong {
    text-align: left;
  }

  .checklist-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .checklist-action {
    grid-column: 2;
  }

  .scenario-top {
    align-items: flex-start;
  }

  .automation-card-head {
    flex-direction: column;
  }

  .inline-checkbox {
    padding-top: 0;
  }

  .thread-toolbar-side {
    width: 100%;
    justify-content: flex-start;
  }

  .thread-actions {
    width: 100%;
  }

  .thread-status-button,
  .thread-refresh-button {
    width: 100%;
  }
}
`;
