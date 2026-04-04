# Nemu TLDR Bot

A multi-tenant Discord TLDR bot built with `discord.js` v14.

Each Discord server stores its own LLM provider and API key in SQLite.

## Features

- `/tldr [count]` (default 50, max 100)
- `/setup api_key:[key] provider:[name]` (admin only)
- `/config` (admin only)
- `/remove` (admin only)
- Channel-wide 10-minute cooldown for `/tldr`
- Per-server provider/API key storage
- Provider router with DeepSeek adapter and Phase 2 stubs for OpenAI/Anthropic

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` with:

```env
DISCORD_TOKEN=
CLIENT_ID=
```

3. Register slash commands once:

```bash
node deploy-commands.js
```

4. Start the bot:

```bash
node index.js
```

## Project Structure

```
tldr-bot/
├── .env
├── index.js
├── deploy-commands.js
├── db/
│   └── database.js
├── commands/
│   ├── tldr.js
│   ├── setup.js
│   ├── config.js
│   └── remove.js
└── utils/
    ├── cooldown.js
    ├── messageParser.js
    └── providers/
        ├── index.js
        ├── deepseek.js
        ├── openai.js
        └── anthropic.js
```
