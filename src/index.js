#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "https://klaud-api.klaud0x.workers.dev";
const API_KEY = process.env.KLAUD_API_KEY || "";
const STORE_TOKEN = process.env.KLAUD_STORE_TOKEN || "";
const MSG_TOKEN = process.env.KLAUD_MSG_TOKEN || "";
const UA = "klaud-api-mcp/1.3.0";

// --- Helpers ---

async function klaudFetch(endpoint, params = {}) {
  if (API_KEY) params.apiKey = API_KEY;
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text().catch(() => "")}`);
  return await res.json();
}

async function apiFetch(basePath, pathSuffix, method = 'GET', body = null, tokenHeader = null, tokenValue = null) {
  const url = `${API_BASE}${basePath}${pathSuffix}`;
  const headers = { "User-Agent": UA };
  if (tokenHeader && tokenValue) headers[tokenHeader] = tokenValue;
  const opts = { method, headers };
  if (body !== null) {
    opts.body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, opts);
  return await res.json();
}

function storeFn(path, method = 'GET', body = null, token = null) {
  return apiFetch('/api/store', path, method, body, 'X-Store-Token', token || STORE_TOKEN);
}
function msgFn(path, method = 'GET', body = null, token = null) {
  return apiFetch('/api/msg', path, method, body, 'X-Msg-Token', token || MSG_TOKEN);
}
function regFn(path, method = 'GET', body = null, token = null) {
  return apiFetch('/api/registry', path, method, body, 'X-Msg-Token', token || MSG_TOKEN);
}
function taskFn(path, method = 'GET', body = null, token = null) {
  return apiFetch('/api/tasks', path, method, body, 'X-Msg-Token', token || MSG_TOKEN);
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
  version: "1.3.0",
  description: "34 tools for AI agents — data search, KV store, messaging, tool registry, task management"
});

// ============ DATA ENDPOINTS (1-11) ============

server.tool("search_hackernews",
  "Get top HackerNews stories by category (ai, crypto, dev, science, security, all)",
  { category: z.enum(["ai","crypto","dev","science","security","all"]).default("all"), limit: z.number().min(1).max(30).default(10) },
  async ({ category, limit }) => { try { return ok(await klaudFetch("/api/hn", { category, limit })); } catch(e) { return fail(e); } }
);

server.tool("search_pubmed",
  "Search PubMed for medical/scientific papers",
  { query: z.string().describe("Search query"), limit: z.number().min(1).max(20).default(5) },
  async ({ query, limit }) => { try { return ok(await klaudFetch("/api/pubmed", { query, limit })); } catch(e) { return fail(e); } }
);

server.tool("search_arxiv",
  "Search arXiv for scientific preprints",
  { query: z.string(), category: z.string().optional().describe("e.g. cs.AI, cs.LG"), limit: z.number().min(1).max(20).default(5) },
  async ({ query, category, limit }) => { try { return ok(await klaudFetch("/api/arxiv", { query, category, limit })); } catch(e) { return fail(e); } }
);

server.tool("get_crypto_prices",
  "Get real-time cryptocurrency prices (CoinGecko)",
  { ids: z.string().describe("Comma-separated coin IDs: bitcoin,ethereum,solana") },
  async ({ ids }) => { try { return ok(await klaudFetch("/api/crypto", { ids })); } catch(e) { return fail(e); } }
);

server.tool("get_github_trending",
  "Get trending GitHub repos",
  { language: z.string().optional(), since: z.enum(["daily","weekly","monthly"]).default("weekly") },
  async ({ language, since }) => { try { return ok(await klaudFetch("/api/github", { language, since })); } catch(e) { return fail(e); } }
);

server.tool("extract_webpage",
  "Extract clean text from any URL",
  { url: z.string().url() },
  async ({ url }) => { try { return ok(await klaudFetch("/api/extract", { url })); } catch(e) { return fail(e); } }
);

server.tool("search_drugs",
  "Search drugs/molecules via ChEMBL (2.4M compounds). Query by name or target protein.",
  { query: z.string().optional().describe("Drug name: imatinib, aspirin"), target: z.string().optional().describe("Target protein: EGFR, BRAF") },
  async ({ query, target }) => { try { return ok(await klaudFetch("/api/drugs", { query, target })); } catch(e) { return fail(e); } }
);

server.tool("get_weather",
  "Current weather + 3-day forecast",
  { city: z.string().optional(), lat: z.string().optional(), lon: z.string().optional() },
  async ({ city, lat, lon }) => { try { return ok(await klaudFetch("/api/weather", { city, lat, lon })); } catch(e) { return fail(e); } }
);

server.tool("search_wikipedia",
  "Search Wikipedia articles",
  { query: z.string(), lang: z.string().default("en"), limit: z.number().min(1).max(10).default(3) },
  async ({ query, lang, limit }) => { try { return ok(await klaudFetch("/api/wiki", { q: query, lang, limit })); } catch(e) { return fail(e); } }
);

server.tool("search_news",
  "Search recent news via Google News",
  { query: z.string(), limit: z.number().min(1).max(20).default(10), lang: z.string().default("en") },
  async ({ query, limit, lang }) => { try { return ok(await klaudFetch("/api/news", { q: query, limit, lang })); } catch(e) { return fail(e); } }
);

server.tool("search_reddit",
  "Browse subreddits or search Reddit",
  { subreddit: z.string().optional(), query: z.string().optional(), sort: z.enum(["hot","new","top","relevance"]).default("hot"), limit: z.number().min(1).max(25).default(10) },
  async ({ subreddit, query, sort, limit }) => { try { return ok(await klaudFetch("/api/reddit", { sub: subreddit, q: query, sort, limit })); } catch(e) { return fail(e); } }
);

// ============ STORE (12-15) ============

server.tool("store_create",
  "Create an ephemeral KV store namespace. Returns write token (kst_) and read-only token (ksr_). No signup needed.",
  {},
  async () => { try { return ok(await storeFn("", "POST")); } catch(e) { return fail(e); } }
);

server.tool("store_get",
  "Read a value from KV store by key",
  { key: z.string(), token: z.string().optional().describe("Store token (or set KLAUD_STORE_TOKEN env)") },
  async ({ key, token }) => { try { return ok(await storeFn(`/${encodeURIComponent(key)}`, 'GET', null, token)); } catch(e) { return fail(e); } }
);

server.tool("store_put",
  "Write a value to KV store",
  { key: z.string().describe("Key (max 128 chars)"), value: z.string().describe("Value (string or JSON)"), token: z.string().optional() },
  async ({ key, value, token }) => {
    try {
      const t = token || STORE_TOKEN;
      const headers = { "User-Agent": UA };
      if (t) headers["X-Store-Token"] = t;
      const res = await fetch(`${API_BASE}/api/store/${encodeURIComponent(key)}`, { method: "PUT", headers, body: value });
      return ok(await res.json());
    } catch(e) { return fail(e); }
  }
);

server.tool("store_list",
  "List all keys in KV store namespace",
  { token: z.string().optional() },
  async ({ token }) => { try { return ok(await storeFn("", 'GET', null, token)); } catch(e) { return fail(e); } }
);

// ============ MESSAGING (16-24) ============

server.tool("msg_register",
  "Register a new agent on Klaud Messaging. Returns agent_id + kma_ token. Use this token for all messaging, registry, and tasks operations.",
  { name: z.string().min(3).max(32).describe("Unique agent name [a-zA-Z0-9_-]"), description: z.string().max(256).optional(), tags: z.array(z.string()).max(10).optional() },
  async ({ name, description, tags }) => {
    try {
      const body = { name };
      if (description) body.description = description;
      if (tags) body.tags = tags;
      return ok(await msgFn("/register", "POST", body));
    } catch(e) { return fail(e); }
  }
);

server.tool("msg_send_dm",
  "Send a direct message to another agent",
  { to: z.string().describe("Recipient agent name"), body: z.string().describe("Message body"), token: z.string().optional() },
  async ({ to, body, token }) => { try { return ok(await msgFn(`/dm/${encodeURIComponent(to)}`, "POST", { body }, token)); } catch(e) { return fail(e); } }
);

server.tool("msg_inbox",
  "Read your inbox messages",
  { from: z.string().optional().describe("Filter by sender name"), limit: z.number().min(1).max(100).default(20).optional(), token: z.string().optional() },
  async ({ from, limit, token }) => {
    try {
      const t = token || MSG_TOKEN;
      const url = new URL(`${API_BASE}/api/msg/inbox`);
      if (from) url.searchParams.set('from', from);
      if (limit) url.searchParams.set('limit', String(limit));
      const headers = { "User-Agent": UA };
      if (t) headers["X-Msg-Token"] = t;
      const res = await fetch(url.toString(), { headers });
      return ok(await res.json());
    } catch(e) { return fail(e); }
  }
);

server.tool("msg_agents",
  "List agents in the public directory",
  { query: z.string().optional().describe("Search by name/description"), tag: z.string().optional().describe("Filter by tag") },
  async ({ query, tag }) => {
    try {
      const url = new URL(`${API_BASE}/api/msg/agents`);
      if (query) url.searchParams.set('q', query);
      if (tag) url.searchParams.set('tag', tag);
      const res = await fetch(url.toString(), { headers: { "User-Agent": UA } });
      return ok(await res.json());
    } catch(e) { return fail(e); }
  }
);

server.tool("msg_create_channel",
  "Create a messaging channel for group discussions",
  { name: z.string().describe("Channel name"), description: z.string().optional(), token: z.string().optional() },
  async ({ name, description, token }) => {
    try {
      const body = { name };
      if (description) body.description = description;
      return ok(await msgFn("/channels", "POST", body, token));
    } catch(e) { return fail(e); }
  }
);

server.tool("msg_channel_send",
  "Send a message to a channel (must join first)",
  { channel: z.string().describe("Channel name"), body: z.string().describe("Message body"), token: z.string().optional() },
  async ({ channel, body, token }) => { try { return ok(await msgFn(`/channels/${encodeURIComponent(channel)}/send`, "POST", { body }, token)); } catch(e) { return fail(e); } }
);

server.tool("msg_channel_messages",
  "Read messages from a channel",
  { channel: z.string(), limit: z.number().min(1).max(100).default(20).optional(), token: z.string().optional() },
  async ({ channel, limit, token }) => {
    try {
      const t = token || MSG_TOKEN;
      const url = new URL(`${API_BASE}/api/msg/channels/${encodeURIComponent(channel)}/messages`);
      if (limit) url.searchParams.set('limit', String(limit));
      const headers = { "User-Agent": UA };
      if (t) headers["X-Msg-Token"] = t;
      const res = await fetch(url.toString(), { headers });
      return ok(await res.json());
    } catch(e) { return fail(e); }
  }
);

server.tool("msg_block",
  "Block an agent (silent — they won't know)",
  { name: z.string().describe("Agent name to block"), token: z.string().optional() },
  async ({ name, token }) => { try { return ok(await msgFn(`/block/${encodeURIComponent(name)}`, "POST", null, token)); } catch(e) { return fail(e); } }
);

server.tool("msg_report",
  "Report an agent for spam/abuse. 3 unique reports = auto-ban.",
  { name: z.string().describe("Agent name to report"), reason: z.string().max(256).optional().describe("Reason for report") },
  async ({ name, reason }) => { try { return ok(await msgFn(`/report/${encodeURIComponent(name)}`, "POST", { reason: reason || "spam" })); } catch(e) { return fail(e); } }
);

// ============ REGISTRY (25-28) ============

server.tool("registry_register",
  "Register a tool/API/skill/MCP server in the discovery registry",
  {
    name: z.string().describe("Tool name (unique per owner)"),
    type: z.enum(["api","mcp","skill","library","dataset","other"]).describe("Tool type"),
    description: z.string().max(2048).describe("What the tool does"),
    capabilities: z.array(z.string()).max(30).describe("Capabilities/tags for search"),
    endpoint: z.string().optional().describe("URL to access the tool"),
    token: z.string().optional()
  },
  async ({ name, type, description, capabilities, endpoint, token }) => {
    try {
      const body = { name, type, description, capabilities };
      if (endpoint) body.endpoint = endpoint;
      return ok(await regFn("", "POST", body, token));
    } catch(e) { return fail(e); }
  }
);

server.tool("registry_search",
  "Search the tool registry by keyword and/or capability",
  { query: z.string().optional().describe("Keyword search"), capability: z.string().optional().describe("Filter by capability"), type: z.string().optional() },
  async ({ query, capability, type }) => {
    try {
      const url = new URL(`${API_BASE}/api/registry/search`);
      if (query) url.searchParams.set('q', query);
      if (capability) url.searchParams.set('cap', capability);
      if (type) url.searchParams.set('type', type);
      const res = await fetch(url.toString(), { headers: { "User-Agent": UA } });
      return ok(await res.json());
    } catch(e) { return fail(e); }
  }
);

server.tool("registry_get",
  "Get full details of a registered tool",
  { name: z.string().describe("Tool name") },
  async ({ name }) => { try { return ok(await regFn(`/${encodeURIComponent(name)}`)); } catch(e) { return fail(e); } }
);

server.tool("registry_mine",
  "List my registered tools (private catalog)",
  { token: z.string().optional() },
  async ({ token }) => { try { return ok(await regFn("/mine", "GET", null, token)); } catch(e) { return fail(e); } }
);

// ============ TASKS (29-34) ============

server.tool("tasks_create_project",
  "Create a new project for task management",
  { name: z.string().describe("Project name (unique)"), description: z.string().optional(), visibility: z.enum(["private","public"]).default("private").optional(), token: z.string().optional() },
  async ({ name, description, visibility, token }) => {
    try {
      const body = { name };
      if (description) body.description = description;
      if (visibility) body.visibility = visibility;
      return ok(await taskFn("/projects", "POST", body, token));
    } catch(e) { return fail(e); }
  }
);

server.tool("tasks_create_task",
  "Create a task in a project. Use depends_on for dependency chains (auto-blocked until deps complete).",
  {
    project: z.string().describe("Project name"),
    title: z.string().describe("Task title"),
    description: z.string().optional(),
    assignee: z.string().optional().describe("Agent name or 'self'"),
    priority: z.enum(["low","medium","high","critical"]).default("medium").optional(),
    depends_on: z.array(z.string()).optional().describe("Task IDs this depends on"),
    token: z.string().optional()
  },
  async ({ project, title, description, assignee, priority, depends_on, token }) => {
    try {
      const body = { project, title };
      if (description) body.description = description;
      if (assignee) body.assignee = assignee;
      if (priority) body.priority = priority;
      if (depends_on) body.depends_on = depends_on;
      return ok(await taskFn("", "POST", body, token));
    } catch(e) { return fail(e); }
  }
);

server.tool("tasks_update",
  "Update a task (status, assignee, priority, title). Setting status='done' auto-unblocks dependent tasks.",
  {
    task_id: z.string().describe("Task ID (e.g. t_abc123)"),
    status: z.enum(["todo","in_progress","review","done","blocked","cancelled"]).optional(),
    assignee: z.string().optional(),
    priority: z.enum(["low","medium","high","critical"]).optional(),
    title: z.string().optional(),
    token: z.string().optional()
  },
  async ({ task_id, status, assignee, priority, title, token }) => {
    try {
      const body = {};
      if (status) body.status = status;
      if (assignee) body.assignee = assignee;
      if (priority) body.priority = priority;
      if (title) body.title = title;
      return ok(await taskFn(`/${encodeURIComponent(task_id)}`, "PATCH", body, token));
    } catch(e) { return fail(e); }
  }
);

server.tool("tasks_mine",
  "Get tasks assigned to me",
  { token: z.string().optional() },
  async ({ token }) => { try { return ok(await taskFn("/mine", "GET", null, token)); } catch(e) { return fail(e); } }
);

server.tool("tasks_feed",
  "Get activity feed (task updates, comments, unblocks)",
  { limit: z.number().min(1).max(100).default(20).optional(), token: z.string().optional() },
  async ({ limit, token }) => {
    try {
      const t = token || MSG_TOKEN;
      const url = new URL(`${API_BASE}/api/tasks/feed`);
      if (limit) url.searchParams.set('limit', String(limit));
      const headers = { "User-Agent": UA };
      if (t) headers["X-Msg-Token"] = t;
      const res = await fetch(url.toString(), { headers });
      return ok(await res.json());
    } catch(e) { return fail(e); }
  }
);

server.tool("tasks_add_comment",
  "Add a comment to a task",
  { task_id: z.string().describe("Task ID"), body: z.string().describe("Comment text"), token: z.string().optional() },
  async ({ task_id, body, token }) => { try { return ok(await taskFn(`/${encodeURIComponent(task_id)}/comments`, "POST", { body }, token)); } catch(e) { return fail(e); } }
);

// --- Start ---

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Klaud API MCP Server v1.3.0 running on stdio");
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
