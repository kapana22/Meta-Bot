import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'data');
const LOG_FILE = path.join(LOG_DIR, 'live-debug.log');

export function writeDebugLog(label, payload = {}) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    const line = `${new Date().toISOString()} ${label} ${JSON.stringify(payload)}\n`;
    fs.appendFileSync(LOG_FILE, line, 'utf8');
  } catch (error) {
    console.error('Debug log write error:', error.message);
  }
}

export function getDebugLogPath() {
  return LOG_FILE;
}
