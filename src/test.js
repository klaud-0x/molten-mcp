#!/usr/bin/env node

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
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return await res.json();
}

async function test() {
  console.log("🧪 Klaud API MCP Server - Smoke Test\n");

  // Test 1: HackerNews
  console.log("1️⃣  Testing /api/hn...");
  try {
    const hn = await klaudFetch("/api/hn", { category: "ai", limit: 3 });
    console.log(`✅ HackerNews: ${hn.posts?.length || 0} posts\n`);
  } catch (e) {
    console.log(`❌ HackerNews failed: ${e.message}\n`);
  }

  // Test 2: PubMed
  console.log("2️⃣  Testing /api/pubmed...");
  try {
    const pubmed = await klaudFetch("/api/pubmed", { query: "CRISPR", limit: 2 });
    console.log(`✅ PubMed: ${pubmed.articles?.length || 0} articles\n`);
  } catch (e) {
    console.log(`❌ PubMed failed: ${e.message}\n`);
  }

  // Test 3: arXiv
  console.log("3️⃣  Testing /api/arxiv...");
  try {
    const arxiv = await klaudFetch("/api/arxiv", { query: "machine learning", limit: 2 });
    console.log(`✅ arXiv: ${arxiv.papers?.length || 0} papers\n`);
  } catch (e) {
    console.log(`❌ arXiv failed: ${e.message}\n`);
  }

  // Test 4: Crypto
  console.log("4️⃣  Testing /api/crypto...");
  try {
    const crypto = await klaudFetch("/api/crypto", { ids: "bitcoin,ethereum" });
    console.log(`✅ Crypto: ${Object.keys(crypto).length} coins\n`);
  } catch (e) {
    console.log(`❌ Crypto failed: ${e.message}\n`);
  }

  // Test 5: GitHub
  console.log("5️⃣  Testing /api/github...");
  try {
    const github = await klaudFetch("/api/github", { since: "weekly" });
    console.log(`✅ GitHub: ${github.repos?.length || 0} repos\n`);
  } catch (e) {
    console.log(`❌ GitHub failed: ${e.message}\n`);
  }

  // Test 6: Extract (using a simple page)
  console.log("6️⃣  Testing /api/extract...");
  try {
    const extract = await klaudFetch("/api/extract", { url: "https://example.com" });
    console.log(`✅ Extract: ${extract.text?.length || 0} chars extracted\n`);
  } catch (e) {
    console.log(`❌ Extract failed: ${e.message}\n`);
  }

  // Test 7: Drugs
  console.log("7️⃣  Testing /api/drugs...");
  try {
    const drugs = await klaudFetch("/api/drugs", { query: "aspirin" });
    console.log(`✅ Drugs: ${drugs.drugs?.length || 0} results\n`);
  } catch (e) {
    console.log(`❌ Drugs failed: ${e.message}\n`);
  }

  console.log("✨ Test suite complete!");
}

test().catch(e => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
