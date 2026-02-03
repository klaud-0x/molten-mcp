#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://klaud-api.klaud0x.workers.dev";
const API_KEY = process.env.KLAUD_API_KEY || "";

async function klaudFetch(endpoint, params = {}) {
  if (API_KEY) params.apiKey = API_KEY;
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "klaud-api-mcp/1.0" }
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text().catch(() => "")}`);
  return await res.json();
}

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function fail(error) {
  return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
}

// --- Server ---

const server = new McpServer({
  name: "klaud-api",
  version: "1.0.0",
  description: "7 data tools for AI agents — HN, PubMed, arXiv, crypto, GitHub, drugs, web extract"
});

// 1. HackerNews
server.tool(
  "search_hackernews",
  "Get top HackerNews stories by category (ai, crypto, dev, science, security, all)",
  {
    category: z.enum(["ai", "crypto", "dev", "science", "security", "all"]).default("all").describe("Topic category"),
    limit: z.number().min(1).max(30).default(10).describe("Number of stories (1-30)")
  },
  async ({ category, limit }) => {
    try { return ok(await klaudFetch("/api/hn", { category, limit })); }
    catch (e) { return fail(e); }
  }
);

// 2. PubMed
server.tool(
  "search_pubmed",
  "Search PubMed for medical and scientific research papers",
  {
    query: z.string().describe("Search query (e.g. 'TNBC drug repurposing')"),
    limit: z.number().min(1).max(20).default(5).describe("Number of results (1-20)")
  },
  async ({ query, limit }) => {
    try { return ok(await klaudFetch("/api/pubmed", { query, limit })); }
    catch (e) { return fail(e); }
  }
);

// 3. arXiv
server.tool(
  "search_arxiv",
  "Search arXiv for scientific preprints and papers",
  {
    query: z.string().describe("Search query (e.g. 'transformer attention mechanism')"),
    category: z.string().optional().describe("arXiv category (e.g. cs.AI, cs.LG, q-bio.BM)"),
    limit: z.number().min(1).max(20).default(5).describe("Number of results (1-20)")
  },
  async ({ query, category, limit }) => {
    try { return ok(await klaudFetch("/api/arxiv", { query, category, limit })); }
    catch (e) { return fail(e); }
  }
);

// 4. Crypto Prices
server.tool(
  "get_crypto_prices",
  "Get real-time cryptocurrency prices (via CoinGecko)",
  {
    ids: z.string().describe("Comma-separated coin IDs (e.g. 'bitcoin,ethereum,solana')")
  },
  async ({ ids }) => {
    try { return ok(await klaudFetch("/api/crypto", { ids })); }
    catch (e) { return fail(e); }
  }
);

// 5. GitHub Trending
server.tool(
  "get_github_trending",
  "Get trending repositories on GitHub",
  {
    language: z.string().optional().describe("Filter by language (e.g. python, rust, typescript)"),
    since: z.enum(["daily", "weekly", "monthly"]).default("weekly").describe("Time range")
  },
  async ({ language, since }) => {
    try { return ok(await klaudFetch("/api/github", { language, since })); }
    catch (e) { return fail(e); }
  }
);

// 6. Web Extract
server.tool(
  "extract_webpage",
  "Extract clean text content from any URL",
  {
    url: z.string().url().describe("URL to extract content from")
  },
  async ({ url }) => {
    try { return ok(await klaudFetch("/api/extract", { url })); }
    catch (e) { return fail(e); }
  }
);

// 7. Drug Search (ChEMBL)
server.tool(
  "search_drugs",
  "Search drugs by name or find approved drugs for a target protein (via ChEMBL, 2.4M compounds)",
  {
    query: z.string().optional().describe("Drug name (e.g. 'imatinib', 'aspirin')"),
    target: z.string().optional().describe("Target protein (e.g. 'EGFR', 'BRAF')")
  },
  async ({ query, target }) => {
    try { return ok(await klaudFetch("/api/drugs", { query, target })); }
    catch (e) { return fail(e); }
  }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Klaud API MCP Server v1.0.0 running on stdio");
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
