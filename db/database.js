const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'nemu.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS servers (
    guild_id TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

const getServerConfigStmt = db.prepare('SELECT guild_id, provider, api_key, created_at FROM servers WHERE guild_id = ?');
const upsertServerConfigStmt = db.prepare(`
  INSERT INTO servers (guild_id, provider, api_key)
  VALUES (?, ?, ?)
  ON CONFLICT(guild_id) DO UPDATE SET
    provider = excluded.provider,
    api_key = excluded.api_key
`);
const removeServerConfigStmt = db.prepare('DELETE FROM servers WHERE guild_id = ?');

function getServerConfig(guildId) {
  return getServerConfigStmt.get(guildId) || null;
}

function upsertServerConfig(guildId, provider, apiKey) {
  upsertServerConfigStmt.run(guildId, provider, apiKey);
}

function removeServerConfig(guildId) {
  return removeServerConfigStmt.run(guildId).changes > 0;
}

module.exports = {
  getServerConfig,
  upsertServerConfig,
  removeServerConfig,
};
