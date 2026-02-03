# Klaud API MCP Server

> **7 powerful data tools for AI agents** — HackerNews, PubMed, arXiv, crypto prices, GitHub trending, webpage extraction, and drug information.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-1.0-blue)](https://modelcontextprotocol.io)

## What is this?

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that wraps the [Klaud API](https://klaud-api.klaud0x.workers.dev) into 7 easy-to-use tools for Claude Desktop, Cursor, and any other MCP-compatible AI client.

## Features

- 🔥 **HackerNews**: Search AI, crypto, dev, science, security topics
- 📚 **PubMed**: Find medical/scientific research papers
- 📝 **arXiv**: Search scientific preprints
- 💰 **Crypto Prices**: Real-time cryptocurrency data (CoinGecko)
- 🚀 **GitHub Trending**: Discover trending repos by language
- 🌐 **Web Extract**: Clean text extraction from any URL
- 💊 **Drug Info**: Search drugs by name or target protein

## Quick Start

### Install via npx (recommended)

```bash
npx @klaud-0x/klaud-api-mcp
```

### Or install globally

```bash
npm install -g @klaud-0x/klaud-api-mcp
klaud-api-mcp
```

## Configuration

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "klaud-api": {
      "command": "npx",
      "args": ["-y", "@klaud-0x/klaud-api-mcp"],
      "env": {
        "KLAUD_API_KEY": "your-key-here"
      }
    }
  }
}
```

**Config file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "klaud-api": {
      "command": "npx",
      "args": ["-y", "@klaud-0x/klaud-api-mcp"],
      "env": {
        "KLAUD_API_KEY": "your-key-here"
      }
    }
  }
}
```

### API Key (Optional)

Get your API key at [klaud-api.klaud0x.workers.dev](https://klaud-api.klaud0x.workers.dev) for higher rate limits.

- **Free tier**: 20 requests/day
- **Pro tier ($9/mo)**: 1,000 requests/day

Without an API key, you'll use the free tier with IP-based rate limiting.

## Tools

### 1. `search_hackernews`
Search HackerNews by category.
- **category**: `ai`, `crypto`, `dev`, `science`, `security`, `all` (default: `all`)
- **limit**: 1-30 (default: 10)

### 2. `search_pubmed`
Search PubMed for medical/scientific papers.
- **query**: Search terms (required)
- **limit**: 1-20 (default: 5)

### 3. `search_arxiv`
Search arXiv preprints.
- **query**: Search terms (required)
- **category**: arXiv category like `cs.AI`, `cs.LG`, `q-bio.BM` (optional)
- **limit**: 1-20 (default: 5)

### 4. `get_crypto_prices`
Get real-time crypto prices from CoinGecko.
- **ids**: Comma-separated coin IDs like `bitcoin,ethereum,solana` (required)

### 5. `get_github_trending`
Get trending GitHub repositories.
- **language**: Filter by programming language (optional)
- **since**: `daily`, `weekly`, `monthly` (default: `weekly`)

### 6. `extract_webpage`
Extract clean text from any webpage.
- **url**: URL to extract (required)

### 7. `search_drugs`
Search drug information by name or target protein.
- **query**: Drug name like `imatinib` (optional)
- **target**: Target protein like `EGFR` (optional)

At least one parameter required.

## Examples

```javascript
// In Claude Desktop or Cursor:

"Search HackerNews for AI news"
→ Uses search_hackernews with category="ai"

"Find recent papers about CRISPR"
→ Uses search_pubmed with query="CRISPR"

"What's the price of Bitcoin and Ethereum?"
→ Uses get_crypto_prices with ids="bitcoin,ethereum"

"Show me trending Python repos this week"
→ Uses get_github_trending with language="python"

"Extract text from https://example.com"
→ Uses extract_webpage

"Find drugs targeting EGFR"
→ Uses search_drugs with target="EGFR"
```

## Development

### Clone & Install

```bash
git clone https://github.com/klaud-0x/klaud-api-mcp.git
cd klaud-api-mcp
npm install
```

### Run Tests

```bash
npm test
```

### Run Locally

```bash
npm start
```

## API Documentation

Full API docs available at: [https://klaud-api.klaud0x.workers.dev](https://klaud-api.klaud0x.workers.dev)

## License

MIT © [klaud-0x](https://github.com/klaud-0x)

## Links

- [Klaud API](https://klaud-api.klaud0x.workers.dev)
- [MCP Documentation](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/klaud-0x/klaud-api-mcp)

---

Made with ❤️ by [klaud-0x](https://github.com/klaud-0x)
