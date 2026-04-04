const COOLDOWN_MS = 10 * 60 * 1000;
const channelCooldowns = new Map();

function getCooldownRemainingMinutes(channelId) {
  const lastUsed = channelCooldowns.get(channelId);
  if (!lastUsed) return 0;

  const remainingMs = COOLDOWN_MS - (Date.now() - lastUsed);
  if (remainingMs <= 0) {
    channelCooldowns.delete(channelId);
    return 0;
  }

  return Math.ceil(remainingMs / 60000);
}

function setChannelCooldown(channelId) {
  channelCooldowns.set(channelId, Date.now());
}

module.exports = {
  getCooldownRemainingMinutes,
  setChannelCooldown,
};
