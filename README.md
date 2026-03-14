# Nemu 🤖

> *Named after the calm yet powerful character from the anime Bleach.*

A Discord bot that fetches messages from a thread and generates a smart, engaging summary using the **Deepseek LLM** via the **OpenRouter API** — so you never have to scroll through hundreds of messages to catch up again.

---

## ✨ Features

- **`/summarize` slash command** — works directly inside any Discord thread
- **Flexible fetch options** — choose between **50 / 100 / 250 messages** and **1 / 2 / 3 hours**
- **Context-aware summaries** — explains what happened, key decisions, drama, lore — all in a friendly tone
- **Ignores bot messages** — only real human conversations are summarized
- **Attribution** — every summary includes *Requested by: @username*
- **Graceful error handling** — user-friendly messages for API errors and permission issues

---

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/alikazmidev/Nemu.git
cd Nemu
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your bot token from the [Discord Developer Portal](https://discord.com/developers/applications) |
| `CLIENT_ID` | Your Discord application's Client ID |
| `OPENROUTER_API_KEY` | Your API key from [OpenRouter](https://openrouter.ai/) |

### 4. Invite the bot to your server

Go to the Discord Developer Portal → OAuth2 → URL Generator.  
Select the following scopes and permissions:

- **Scopes:** `bot`, `applications.commands`
- **Bot Permissions:** `Read Messages/View Channels`, `Send Messages`, `Read Message History`

### 5. Start the bot

```bash
npm start
```

The bot will register slash commands globally on startup (this can take up to 1 hour to propagate on Discord).

---

## 🎮 Usage

1. Open any thread in your Discord server.
2. Type `/summarize` and choose:
   - **Limit** — how many messages to read (50 / 100 / 250)
   - **Hours** — how far back to look (1 / 2 / 3 hours)
3. Nemu will fetch messages (whichever limit is hit first) and post a summary in the thread.

---

## 🛠️ Project Structure

```
Nemu/
├── bot.js                   # Main entry point — Discord client & slash command dispatcher
├── commands/
│   └── summarize.js         # /summarize command definition and handler
├── utils/
│   ├── messageHandler.js    # Message fetching, pagination, and filtering logic
│   └── llmIntegration.js    # Deepseek LLM integration via OpenRouter API
├── .env.example             # Environment variables template
├── package.json             # Project metadata and dependencies
└── README.md                # This file
```

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `discord.js` | Discord API client (v14+) |
| `dotenv` | Load environment variables from `.env` |
| `node-fetch` | HTTP client for OpenRouter API calls |

---

## ⚙️ Requirements

- **Node.js** v18 or higher
- A Discord bot application with the **Message Content Intent** enabled in the Developer Portal
