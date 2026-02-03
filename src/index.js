#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://klaud-api.klaud0x.workers.dev";

// --- helpers ---

async function apiCall(path, params = {}) {
  const url = new URL(path, API_BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  // inject API key from env if available
  const key = process.env.KLAUD_API_KEY;
  if (key) url.searchParams.set("key", key);

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "klaud-api-mcp/1.0" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function json(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

// --- server ---

const server = new McpServer({
  name: "klaud-api",
  version: "1.0.0",
});

// 1. Hacker News
server.tool(
  "hn_top_stories",
  "Get top Hacker News stories filtered by category (ai, crypto, dev, science, security, all)",
  {
    category: z.enum(["ai", "crypto", "dev", "science", "security", "all"]).default("all")
      .describe("Topic category to filter stories"),
    limit: z.number().min(1).max(30).default(10)
      .describe("Number of stories to return"),
  },
  async ({ category, limit }) => json(await apiCall("/api/hn", { category, limit }))
);

// 2. PubMed
server.tool(
  "pubmed_search",
  "Search PubMed for biomedical and life science articles",
  {
    q: z.string().describe("Search query (e.g. 'CRISPR cancer therapy')"),
    limit: z.number().min(1).max(20).default(5)
      .describe("Number of articles to return"),
  },
  async ({ q, limit }) => json(await apiCall("/api/pubmed", { q, limit }))
);

// 3. arXiv
server.tool(
  "arxiv_search",
  "Search arXiv preprints with optional category filter",
  {
    q: z.string().describe("Search query (e.g. 'LLM agents reasoning')"),
    category: z.string().optional()
      .describe("arXiv category filter (e.g. cs.AI, q-bio.BM, stat.ML)"),
    limit: z.number().min(1).max(20).default(5)
      .describe("Number of papers to return"),
  },
  async ({ q, category, limit }) => json(await apiCall("/api/arxiv", { q, category, limit }))
);

// 4. Crypto
server.tool(
  "crypto_prices",
  "Get real-time cryptocurrency prices (CoinGecko with CoinCap fallback)",
  {
    ids: z.string().default("bitcoin,ethereum")
      .describe("Comma-separated CoinGecko IDs (e.g. bitcoin,ethereum,solana)"),
  },
  async ({ ids }) => json(await apiCall("/api/crypto", { ids }))
);

// 5. GitHub Trending
server.tool(
  "github_trending",
  "Get trending GitHub repositories",
  {
    language: z.string().optional()
      .describe("Filter by programming language (e.g. python, rust, typescript)"),
    since: z.enum(["daily", "weekly", "monthly"]).default("daily")
      .describe("Time range for trending"),
  },
  async ({ language, since }) => json(await apiCall("/api/github", { language, since }))
);

// 6. Web Extract
server.tool(
  "extract_url",
  "Extract readable text content from any URL (HTML → clean text)",
  {
    url: z.string().url().describe("URL to extract text from"),
  },
  async ({ url }) => json(await apiCall("/api/extract", { url }))
);

// 7. Drug/Molecule Lookup
server.tool(
  "drug_lookup",
  "Search drugs and molecules via ChEMBL (2.4M compounds). Search by name or by protein target.",
  {
    q: z.string().optional()
      .describe("Drug/molecule name (e.g. imatinib, aspirin)"),
    target: z.string().optional()
      .describe("Protein target name (e.g. EGFR, BRCA1, JAK2)"),
  },
  async ({ q, target }) => {
    if (!q && !target) {
      return { content: [{ type: "text", text: "Provide either q (drug name) or target (protein name)" }] };
    }
    return json(await apiCall("/api/drugs", { q, target }));
  }
);

// --- run ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("klaud-api-mcp server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
