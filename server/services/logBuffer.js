const MAX_LINES = 200;
const lines = [];

function add(level, message, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...data,
  };
  lines.push(entry);
  if (lines.length > MAX_LINES) lines.shift();
  const logLine = `[${entry.ts}] [${level}] ${message}` + (Object.keys(data).length ? ' ' + JSON.stringify(data) : '');
  console.log(logLine);
  return entry;
}

function getRecent(limit = 100) {
  return lines.slice(-Math.min(limit, lines.length));
}

module.exports = { add, getRecent };
