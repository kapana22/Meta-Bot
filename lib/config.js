import fs from 'fs/promises';
import path from 'path';
import {
  createDefaultBuilderConfig,
  normalizeBuilderConfig,
  prepareBotConfigForRuntime
} from './builder-config';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'bot-config.json');
const DEFAULT_BOT_CONFIG = createDefaultBuilderConfig();
const VERSION_LIMIT = 20;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function toRuntimeConfig(config = {}) {
  return prepareBotConfigForRuntime(normalizeBuilderConfig(config));
}

function createVersionEntry(snapshot, options = {}) {
  const createdAt = options.createdAt || nowIso();

  return {
    id: options.id || `version_${createdAt.replace(/[:.]/g, '-')}`,
    reason: options.reason || 'publish',
    createdAt,
    sourceVersionId: options.sourceVersionId || null,
    snapshot: toRuntimeConfig(snapshot)
  };
}

function summarizeVersion(entry, currentPublishedVersionId) {
  const snapshot = toRuntimeConfig(entry?.snapshot);

  return {
    id: entry.id,
    reason: entry.reason || 'publish',
    createdAt: entry.createdAt || nowIso(),
    sourceVersionId: entry.sourceVersionId || null,
    businessName: snapshot.workspaceProfile?.businessName || 'უცნობი სივრცე',
    industry: snapshot.workspaceProfile?.industry || 'უცნობი ინდუსტრია',
    faqCount: Array.isArray(snapshot.faqItems) ? snapshot.faqItems.length : 0,
    testCount: Array.isArray(snapshot.testScenarios) ? snapshot.testScenarios.length : 0,
    isCurrent: entry.id === currentPublishedVersionId
  };
}

function createDefaultConfigState() {
  const createdAt = nowIso();
  const initialSnapshot = toRuntimeConfig(DEFAULT_BOT_CONFIG);
  const initialVersion = createVersionEntry(initialSnapshot, {
    id: 'version_initial',
    reason: 'publish',
    createdAt
  });

  return {
    schemaVersion: 2,
    draft: clone(initialSnapshot),
    published: clone(initialSnapshot),
    draftUpdatedAt: createdAt,
    publishedUpdatedAt: createdAt,
    lastPublishedAt: createdAt,
    currentPublishedVersionId: initialVersion.id,
    versions: [initialVersion]
  };
}

function normalizeVersions(versions, published, currentPublishedVersionId) {
  const normalized = Array.isArray(versions)
    ? versions
        .map((entry, index) => {
          if (!entry || typeof entry !== 'object') {
            return null;
          }

          const createdAt = typeof entry.createdAt === 'string' ? entry.createdAt : nowIso();
          const rawSnapshot =
            entry.snapshot && typeof entry.snapshot === 'object' ? entry.snapshot : published;

          return createVersionEntry(rawSnapshot, {
            id: typeof entry.id === 'string' && entry.id.trim() ? entry.id : `version_${index + 1}`,
            reason: typeof entry.reason === 'string' && entry.reason.trim() ? entry.reason : 'publish',
            createdAt,
            sourceVersionId:
              typeof entry.sourceVersionId === 'string' && entry.sourceVersionId.trim()
                ? entry.sourceVersionId
                : null
          });
        })
        .filter(Boolean)
    : [];

  if (!normalized.some((item) => item.id === currentPublishedVersionId)) {
    normalized.unshift(
      createVersionEntry(published, {
        id: currentPublishedVersionId || `version_${nowIso().replace(/[:.]/g, '-')}`,
        reason: 'publish',
        createdAt: nowIso()
      })
    );
  }

  return normalized
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, VERSION_LIMIT);
}

function normalizeConfigState(rawState = {}) {
  const createdAt = nowIso();

  if (
    rawState &&
    typeof rawState === 'object' &&
    rawState.schemaVersion === 2 &&
    rawState.draft &&
    rawState.published
  ) {
    const draft = toRuntimeConfig(rawState.draft);
    const published = toRuntimeConfig(rawState.published);
    const currentPublishedVersionId =
      typeof rawState.currentPublishedVersionId === 'string' && rawState.currentPublishedVersionId.trim()
        ? rawState.currentPublishedVersionId
        : 'version_initial';
    const versions = normalizeVersions(rawState.versions, published, currentPublishedVersionId);
    const currentVersion = versions.find((item) => item.id === currentPublishedVersionId) || versions[0];

    return {
      schemaVersion: 2,
      draft,
      published,
      draftUpdatedAt:
        typeof rawState.draftUpdatedAt === 'string' ? rawState.draftUpdatedAt : createdAt,
      publishedUpdatedAt:
        typeof rawState.publishedUpdatedAt === 'string'
          ? rawState.publishedUpdatedAt
          : currentVersion?.createdAt || createdAt,
      lastPublishedAt:
        typeof rawState.lastPublishedAt === 'string'
          ? rawState.lastPublishedAt
          : currentVersion?.createdAt || createdAt,
      currentPublishedVersionId: currentVersion?.id || currentPublishedVersionId,
      versions
    };
  }

  const legacyConfig = toRuntimeConfig(rawState);
  const migratedVersion = createVersionEntry(legacyConfig, {
    id: 'version_migrated',
    reason: 'publish',
    createdAt
  });

  return {
    schemaVersion: 2,
    draft: clone(legacyConfig),
    published: clone(legacyConfig),
    draftUpdatedAt: createdAt,
    publishedUpdatedAt: createdAt,
    lastPublishedAt: createdAt,
    currentPublishedVersionId: migratedVersion.id,
    versions: [migratedVersion]
  };
}

async function readConfigState() {
  try {
    const fileContent = await fs.readFile(CONFIG_PATH, 'utf8');
    return normalizeConfigState(JSON.parse(fileContent));
  } catch (error) {
    return createDefaultConfigState();
  }
}

async function writeConfigState(state) {
  const nextState = normalizeConfigState(state);
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(nextState, null, 2), 'utf8');
  return nextState;
}

export async function getBotConfig() {
  const state = await readConfigState();
  return state.published;
}

export async function getConfigState() {
  const state = await readConfigState();

  return {
    draft: state.draft,
    published: state.published,
    draftUpdatedAt: state.draftUpdatedAt,
    publishedUpdatedAt: state.publishedUpdatedAt,
    lastPublishedAt: state.lastPublishedAt,
    currentPublishedVersionId: state.currentPublishedVersionId,
    versions: state.versions.map((item) =>
      summarizeVersion(item, state.currentPublishedVersionId)
    )
  };
}

export async function saveDraftConfig(config) {
  const state = await readConfigState();
  const nextDraft = toRuntimeConfig(config);

  state.draft = nextDraft;
  state.draftUpdatedAt = nowIso();

  return writeConfigState(state);
}

export async function publishDraftConfig() {
  const state = await readConfigState();
  const publishedSnapshot = toRuntimeConfig(state.draft);
  const createdAt = nowIso();
  const version = createVersionEntry(publishedSnapshot, {
    reason: 'publish',
    createdAt
  });

  state.published = publishedSnapshot;
  state.publishedUpdatedAt = createdAt;
  state.lastPublishedAt = createdAt;
  state.currentPublishedVersionId = version.id;
  state.versions = [version, ...state.versions.filter((item) => item.id !== version.id)].slice(
    0,
    VERSION_LIMIT
  );

  return writeConfigState(state);
}

export async function rollbackPublishedConfig(versionId) {
  const state = await readConfigState();
  const targetVersion = versionId
    ? state.versions.find((item) => item.id === versionId)
    : state.versions.find((item) => item.id !== state.currentPublishedVersionId);

  if (!targetVersion) {
    throw new Error('დასაბრუნებელი ვერსია ვერ მოიძებნა.');
  }

  const createdAt = nowIso();
  const rollbackSnapshot = toRuntimeConfig(targetVersion.snapshot);
  const rollbackVersion = createVersionEntry(rollbackSnapshot, {
    reason: 'rollback',
    createdAt,
    sourceVersionId: targetVersion.id
  });

  state.published = rollbackSnapshot;
  state.publishedUpdatedAt = createdAt;
  state.lastPublishedAt = createdAt;
  state.currentPublishedVersionId = rollbackVersion.id;
  state.versions = [
    rollbackVersion,
    ...state.versions.filter((item) => item.id !== rollbackVersion.id)
  ].slice(0, VERSION_LIMIT);

  return writeConfigState(state);
}
