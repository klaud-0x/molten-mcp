# 🔧 Klaud API MCP Server

MCP server that gives AI agents access to real-time data: Hacker News, PubMed, arXiv, crypto prices, GitHub trending, drug/molecule lookup (ChEMBL), and web page extraction.

**No API key required** for free tier (20 requests/day).

## Tools

| Tool | Description |
|------|-------------|
| `hn_top_stories` | Hacker News by category (ai, crypto, dev, science, security) |
| `pubmed_search` | PubMed biomedical article search |
| `arxiv_search` | arXiv preprint search with category filter |
| `crypto_prices` | Real-time cryptocurrency prices |
| `github_trending` | Trending GitHub repositories |
| `extract_url` | Extract readable text from any URL |
| `drug_lookup` | Drug & molecule search via ChEMBL (2.4M compounds) |

## Quick Start

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "klaud-api": {
      "command": "npx",
      "args": ["-y", "klaud-api-mcp"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "klaud-api": {
      "command": "npx",
      "args": ["-y", "klaud-api-mcp"]
    }
  }
}
```

### With API Key (Pro tier, 1000 req/day)

```json
{
  "mcpServers": {
    "klaud-api": {
      "command": "npx",
      "args": ["-y", "klaud-api-mcp"],
      "env": {
        "KLAUD_API_KEY": "ka_YOUR_KEY"
      }
    }
  }
}
```

## Example Usage

Once connected, ask your AI assistant:

- "What's trending on Hacker News in AI?"
- "Find recent PubMed papers about CRISPR cancer therapy"
- "What's the current Bitcoin price?"
- "Show me trending Python repos on GitHub"
- "Look up the drug imatinib in ChEMBL"
- "Find approved drugs targeting EGFR"
- "Extract text from this URL: https://..."

## Pricing

| Plan | Price | Requests/day |
|------|-------|-------------|
| Free | $0 | 20 |
| Pro | $9/month | 1,000 |

**Payment:** USDT (TRC20) to `TXdtWvw3QknYfGimkGVTu4sNyzWNe4eoUm`

Get API key: open a [GitHub issue](https://github.com/klaud-0x/klaud-api-mcp/issues) with your tx hash.

## Links

- **API**: [klaud-api.klaud0x.workers.dev](https://klaud-api.klaud0x.workers.dev)
- **API Source**: [github.com/klaud-0x/klaud-api](https://github.com/klaud-0x/klaud-api)
- **OpenClaw Skill**: `clawhub install klaud-api`

## License

MIT
