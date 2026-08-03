import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const inputJson = args[0] || path.join(__dirname, "..", "tests", "reports", "smoke-report.json");
const outputHtml = args[1] || inputJson.replace(/\.json$/i, ".html");

console.log(`\n📊 Artillery HTML Report Generator`);
console.log(`   Input : ${inputJson}`);
console.log(`   Output: ${outputHtml}\n`);

if (!fs.existsSync(inputJson)) {
  console.error(`❌ Input file not found: ${inputJson}`);
  console.log(`\n   Run a load test first, e.g.:  npm run test:smoke`);
  process.exit(1);
}

const raw = fs.readFileSync(inputJson, "utf-8");
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error("❌ Failed to parse JSON:", err.message);
  process.exit(1);
}

// ── Artillery v2 JSON structure: aggregate.{counters,rates,histograms,summaries} ──
const agg = data.aggregate || data || {};
const c = agg.counters || {};
const h = agg.histograms || {};
const r = agg.rates || {};

// Map legacy names to correct counters/histograms
const scenariosCreated = c["vusers.created"] || 0;
const scenariosCompleted = c["vusers.completed"] || 0;
const scenariosFailed = c["vusers.failed"] || 0;
const httpRequests = c["http.requests"] || 0;
const httpResponses = c["http.responses"] || 0;
const downloadedBytes = c["http.downloaded_bytes"] || 0;

// HTTP codes -> { "200": 11572, "404": 4513 }
const codes = {};
for (const [k, v] of Object.entries(c)) {
  const m = k.match(/^http\.codes\.(.+)$/);
  if (m) codes[m[1]] = v;
}

// All errors -> { "ERR_SOCKET_TIMEOUT": N, ... }
const errors = {};
for (const [k, v] of Object.entries(c)) {
  const m = k.match(/^errors\.(.+)$/);
  if (m) errors[m[1]] = v;
}
const errorsCount = Object.values(errors).reduce((a, b) => a + b, 0);

// Per-endpoint stats: codes and response times
const byNameCodes = {};
const byNameErrors = {};
const byNameLatency = {};
for (const [k, v] of Object.entries(c)) {
  const m1 = k.match(/^plugins\.metrics-by-endpoint\.(.+?)\.codes\.(.+)$/);
  if (m1) {
    const [, name, code] = m1;
    if (!byNameCodes[name]) byNameCodes[name] = {};
    byNameCodes[name][code] = v;
  }
  const m2 = k.match(/^plugins\.metrics-by-endpoint\.(.+?)\.errors\.(.+)$/);
  if (m2) {
    const [, name, err] = m2;
    if (!byNameErrors[name]) byNameErrors[name] = {};
    byNameErrors[name][err] = v;
  }
}
for (const [k, v] of Object.entries(h)) {
  const m = k.match(/^plugins\.metrics-by-endpoint\.response_time\.(.+)$/);
  if (m) byNameLatency[m[1]] = v;
}

// Response time histograms
const latency = h["http.response_time"] || {};
const latency2xx = h["http.response_time.2xx"] || {};
const latency4xx = h["http.response_time.4xx"] || {};

// Request rate
const rps = r["http.request_rate"] || {};
const throughput = { total: downloadedBytes };

const codeEntries = Object.entries(codes).sort((a, b) => b[1] - a[1]);
const errEntries = Object.entries(errors).sort((a, b) => b[1] - a[1]);

const successRate = httpResponses === 0 ? 0 : ((httpResponses - errorsCount) / httpResponses) * 100;

// ──────────────────────────── SLA BENCHMARKS & GRADING ────────────────────────────
const SLA = {
  p50: 500,        // good p50 < 500ms
  p95: 2000,       // good p95 < 2s
  p99: 5000,       // good p99 < 5s
  errorRate: 2,    // good error rate < 2%
  successRate: 98, // good success >= 98%
};

const gradeSuccess =
  successRate >= SLA.successRate ? 3 : successRate >= 95 ? 2 : successRate >= 80 ? 1 : 0;

let gradeLatency = 0;
if ((latency.p95 ?? Infinity) <= SLA.p95) gradeLatency += 2;
else if ((latency.p95 ?? Infinity) <= SLA.p95 * 2) gradeLatency += 1;
if ((latency.p99 ?? Infinity) <= SLA.p99) gradeLatency += 1;
if ((latency.median ?? Infinity) <= SLA.p50) gradeLatency += 1;

const totalGrade = gradeSuccess + gradeLatency;
const GRADE = totalGrade >= 7 ? "A" : totalGrade >= 5 ? "B" : totalGrade >= 3 ? "C" : totalGrade >= 1 ? "D" : "F";
const GRADE_COLOR = { A: "emerald", B: "green", C: "yellow", D: "orange", F: "red" }[GRADE];

const verdicts = [];
verdicts.push({
  pass: successRate >= SLA.successRate,
  label: `Success rate ≥ ${SLA.successRate}%`,
  actual: `${successRate.toFixed(2)}%`,
});
verdicts.push({
  pass: (latency.median ?? Infinity) <= SLA.p50,
  label: `Median (p50) ≤ ${SLA.p50} ms`,
  actual: latency.median ? `${Math.round(latency.median)} ms` : "—",
});
verdicts.push({
  pass: (latency.p95 ?? Infinity) <= SLA.p95,
  label: `p95 latency ≤ ${SLA.p95} ms`,
  actual: latency.p95 ? `${Math.round(latency.p95)} ms` : "—",
});
verdicts.push({
  pass: (latency.p99 ?? Infinity) <= SLA.p99,
  label: `p99 latency ≤ ${SLA.p99} ms`,
  actual: latency.p99 ? `${Math.round(latency.p99)} ms` : "—",
});

// Build per-endpoint summary
const endpointStats = [];
const allNames = new Set([
  ...Object.keys(byNameCodes),
  ...Object.keys(byNameErrors),
  ...Object.keys(byNameLatency),
]);
for (const name of allNames) {
  const cCodes = byNameCodes[name] || {};
  const cErrs = byNameErrors[name] || {};
  const cLat = byNameLatency[name] || {};
  const totalCodes = Object.values(cCodes).reduce((a, b) => a + b, 0);
  const totalErrs = Object.values(cErrs).reduce((a, b) => a + b, 0);
  const total = totalCodes + totalErrs;
  endpointStats.push({
    name,
    count: total,
    success: totalCodes,
    errors: totalErrs,
    okRate: total === 0 ? 0 : (totalCodes / total) * 100,
    median: cLat.median,
    p95: cLat.p95,
    p99: cLat.p99,
  });
}
endpointStats.sort((a, b) => b.count - a.count);

// ───────────────────────────────── HELPERS ─────────────────────────────────
const msRound = (v) => (v == null || isNaN(v) ? "—" : `${Math.round(v)} ms`);
const reqSec = (v) => (v == null || isNaN(v) ? "—" : `${Number(v).toFixed(2)} req/s`);
const bytes2 = (v) => {
  if (v == null || isNaN(v)) return "—";
  const kb = v / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};
const row = (k, v, cls = "") =>
  `<tr><td class="px-4 py-3 font-medium text-slate-600">${k}</td><td class="px-4 py-3 font-bold text-slate-900 ${cls}">${v}</td></tr>`;

const codeColor = (code) => {
  if (code.startsWith("2") || code.startsWith("3")) return "bg-green-100 text-green-800";
  if (code.startsWith("4")) return "bg-yellow-100 text-yellow-800";
  if (code.startsWith("5")) return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
};

const codeEntries2xx3xx = codeEntries.filter(([k]) => k.startsWith("2") || k.startsWith("3"));
const okCount = codeEntries2xx3xx.reduce((a, [, v]) => a + v, 0);
const notOk = httpResponses - okCount;

const statusColor =
  successRate >= 99 ? "green" : successRate >= 95 ? "yellow" : "red";

const testInfo = [
  ["Test file", path.basename(inputJson)],
  ["Generated at", new Date().toLocaleString()],
  ["Total VUs (scenarios) created", scenariosCreated],
  ["Completed VUs", scenariosCompleted],
  ["Failed VUs", scenariosFailed],
  ["HTTP requests sent", httpRequests],
  ["HTTP responses received", httpResponses],
  ["HTTP 2xx/3xx OK", okCount],
  ["HTTP 4xx/5xx errors", notOk],
  ["Socket/engine errors", errorsCount],
  ["Overall success rate", `${successRate.toFixed(2)}%`],
  ["Total data downloaded", bytes2(downloadedBytes)],
];

const verdictHtml = verdicts
  .map(
    (v) => `
  <div class="flex items-start gap-3 p-4 rounded-xl border ${
    v.pass ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
  }">
    <div class="text-2xl flex-shrink-0">${v.pass ? "✅" : "❌"}</div>
    <div class="flex-1">
      <div class="font-bold ${v.pass ? "text-green-800" : "text-red-800"}">${v.label}</div>
      <div class="text-sm ${v.pass ? "text-green-600" : "text-red-600"}">Actual: <b>${v.actual}</b></div>
    </div>
  </div>`
  )
  .join("");

// ───────────────────────────────── HTML ─────────────────────────────────
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Artillery Load Test Report</title>
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
<style>
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto; }
  .card { background: white; border-radius: 1rem; box-shadow: 0 10px 30px rgba(2,6,23,.08); border: 1px solid #e2e8f0; }
</style>
</head>
<body class="bg-gradient-to-br from-slate-50 to-indigo-50 min-h-screen">
  <div class="max-w-6xl mx-auto px-6 py-10">

    <!-- Header + Grade -->
    <div class="card p-8 mb-8 bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white border-0 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-80 h-80 bg-${GRADE_COLOR}-500/20 rounded-full blur-3xl"></div>
      <div class="relative z-10 grid md:grid-cols-3 gap-8 items-center">
        <div class="md:col-span-2">
          <p class="uppercase tracking-[0.25em] text-indigo-300 text-sm font-semibold">Performance Report</p>
          <h1 class="text-4xl md:text-5xl font-black mt-2">Artillery Load Test</h1>
          <p class="text-indigo-200 mt-3 text-lg">Reward &amp; Recognition Platform — API Benchmark</p>
          <div class="flex flex-wrap gap-2 mt-5">
            <span class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-semibold text-indigo-100">${path.basename(inputJson)}</span>
            <span class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-semibold text-indigo-100">${scenariosCreated.toLocaleString()} VUs</span>
            <span class="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-sm font-semibold text-indigo-100">${httpRequests.toLocaleString()} req</span>
          </div>
        </div>
        <div class="text-center">
          <div class="inline-flex flex-col items-center justify-center rounded-3xl bg-${GRADE_COLOR}-500/30 border-4 border-${GRADE_COLOR}-300/50 backdrop-blur px-10 py-6">
            <div class="text-sm uppercase tracking-[0.25em] text-${GRADE_COLOR}-200 font-bold">Overall Grade</div>
            <div class="text-8xl font-black text-${GRADE_COLOR}-100 mt-1 drop-shadow-lg">${GRADE}</div>
            <div class="mt-2 text-2xl font-bold text-white">${successRate.toFixed(1)}% OK</div>
          </div>
        </div>
      </div>
    </div>

    <!-- SLA / Verdict -->
    <div class="card p-6 mb-8">
      <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span class="w-1.5 h-6 rounded-full bg-${GRADE_COLOR}-600 inline-block"></span>
        SLA Benchmarks — Pass / Fail
        <span class="ml-auto text-sm font-medium text-slate-500">Industry standard SLAs</span>
      </h2>
      <div class="grid md:grid-cols-2 gap-4">${verdictHtml}</div>
      <div class="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p class="text-sm text-slate-500 font-semibold mb-1">Interpretation</p>
        <p class="text-slate-700">
          <b>A:</b> Excellent — production-ready &nbsp;·&nbsp;
          <b>B:</b> Good — minor optimizations &nbsp;·&nbsp;
          <b>C:</b> Acceptable — investigate slow endpoints &nbsp;·&nbsp;
          <b>D:</b> Poor — needs fixes before scaling &nbsp;·&nbsp;
          <b>F:</b> Critical — unstable at this load
        </p>
      </div>
    </div>

    <!-- Overview -->
    <div class="grid md:grid-cols-2 gap-8 mb-8">
      <div class="card p-6">
        <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="w-1.5 h-6 rounded-full bg-indigo-600 inline-block"></span>
          Test Overview
        </h2>
        <div class="overflow-hidden rounded-xl border border-slate-200">
          <table class="w-full text-left">
            <tbody>
              ${testInfo.map(([k, v]) => row(k, v)).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span class="w-1.5 h-6 rounded-full bg-green-600 inline-block"></span>
          Latency (response time, all responses)
        </h2>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-slate-500 text-sm font-medium">Minimum</p>
            <p class="text-3xl font-black text-slate-900 mt-1">${msRound(latency.min)}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-4">
            <p class="text-slate-500 text-sm font-medium">Maximum</p>
            <p class="text-3xl font-black text-slate-900 mt-1">${msRound(latency.max)}</p>
          </div>
          <div class="rounded-xl bg-blue-50 p-4">
            <p class="text-blue-600 text-sm font-medium">Median (p50)</p>
            <p class="text-3xl font-black text-blue-900 mt-1">${msRound(latency.median ?? latency.p50)}</p>
          </div>
          <div class="rounded-xl bg-purple-50 p-4">
            <p class="text-purple-600 text-sm font-medium">Average (mean)</p>
            <p class="text-3xl font-black text-purple-900 mt-1">${msRound(latency.mean)}</p>
          </div>
          <div class="rounded-xl bg-orange-50 p-4">
            <p class="text-orange-600 text-sm font-medium">p95</p>
            <p class="text-3xl font-black text-orange-900 mt-1">${msRound(latency.p95)}</p>
          </div>
          <div class="rounded-xl bg-red-50 p-4">
            <p class="text-red-600 text-sm font-medium">p99</p>
            <p class="text-3xl font-black text-red-900 mt-1">${msRound(latency.p99)}</p>
          </div>
        </div>
        <canvas id="latencyChart" height="120"></canvas>
      </div>
    </div>

    <!-- Throughput & Traffic -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="card p-6 text-center">
        <p class="text-slate-500 font-medium">Requests / sec (avg)</p>
        <p class="text-4xl font-black text-indigo-700 mt-2">${reqSec(rps.mean)}</p>
      </div>
      <div class="card p-6 text-center">
        <p class="text-slate-500 font-medium">Requests / sec (peak)</p>
        <p class="text-4xl font-black text-green-700 mt-2">${reqSec(rps.max)}</p>
      </div>
      <div class="card p-6 text-center">
        <p class="text-slate-500 font-medium">Total data (response)</p>
        <p class="text-4xl font-black text-slate-900 mt-2">${bytes2(throughput.total)}</p>
      </div>
    </div>

    <!-- HTTP Status Codes -->
    <div class="card p-6 mb-8">
      <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span class="w-1.5 h-6 rounded-full bg-emerald-600 inline-block"></span>
        HTTP Status Codes
      </h2>
      ${
        codeEntries.length === 0
          ? `<p class="text-slate-500">No HTTP response codes recorded.</p>`
          : `<div class="flex flex-wrap gap-3 mb-4">
              ${codeEntries
                .map(
                  ([code, count]) =>
                    `<div class="px-4 py-2 rounded-xl font-bold border ${codeColor(
                      code
                    )}"><span class="text-lg">${code}</span> <span class="ml-2 opacity-70">× ${count.toLocaleString()}</span></div>`
                )
                .join("")}
            </div>
            <canvas id="codesChart" height="80"></canvas>`
      }
    </div>

    <!-- Errors -->
    <div class="card p-6 mb-8">
      <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
        <span class="w-1.5 h-6 rounded-full ${errorsCount === 0 ? "bg-green-600" : "bg-red-600"} inline-block"></span>
        Errors (engine + socket)
        <span class="ml-2 px-3 py-1 rounded-full text-sm font-bold ${
          errorsCount === 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }">${errorsCount.toLocaleString()} total</span>
      </h2>
      ${
        errEntries.length === 0
          ? `<div class="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <div class="text-3xl">✅</div>
              <div>
                <p class="font-bold text-green-800">No errors detected!</p>
                <p class="text-green-700 text-sm">All requests completed successfully.</p>
              </div>
            </div>`
          : `<div class="overflow-hidden rounded-xl border border-red-200">
              <table class="w-full text-left">
                <thead class="bg-red-50">
                  <tr>
                    <th class="px-4 py-3 text-red-800 font-semibold">Error type</th>
                    <th class="px-4 py-3 text-red-800 font-semibold text-right">Count</th>
                  </tr>
                </thead>
                <tbody>
                  ${errEntries
                    .map(
                      ([e, c2]) =>
                        `<tr class="border-t border-red-100"><td class="px-4 py-3 font-mono text-red-700 text-sm">${e}</td><td class="px-4 py-3 text-right font-bold text-red-900">${c2.toLocaleString()}</td></tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
      }
    </div>

    <!-- Per-endpoint stats -->
    ${
      endpointStats.length > 0
        ? `<div class="card p-6 mb-8">
            <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span class="w-1.5 h-6 rounded-full bg-indigo-600 inline-block"></span>
              Per-Endpoint Performance
              <span class="ml-auto text-sm font-medium text-slate-500">${endpointStats.length} endpoints</span>
            </h2>
            <div class="overflow-auto rounded-xl border border-slate-200">
              <table class="w-full text-left text-sm">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 font-semibold text-slate-700 sticky left-0 bg-slate-50">Endpoint</th>
                    <th class="px-4 py-3 font-semibold text-slate-700 text-right">Requests</th>
                    <th class="px-4 py-3 font-semibold text-slate-700 text-right">OK %</th>
                    <th class="px-4 py-3 font-semibold text-slate-700 text-right">Median</th>
                    <th class="px-4 py-3 font-semibold text-slate-700 text-right">p95</th>
                    <th class="px-4 py-3 font-semibold text-slate-700 text-right">p99</th>
                    <th class="px-4 py-3 font-semibold text-slate-700 text-right">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  ${endpointStats
                    .map(
                      (e) => {
                        const okCls = e.okRate >= 98 ? "text-green-700" : e.okRate >= 90 ? "text-yellow-700" : "text-red-700";
                        const p95Bad = (e.p95 ?? 0) > SLA.p95 ? "text-red-700 font-bold" : "text-slate-700";
                        return `<tr class="border-t border-slate-100 hover:bg-slate-50">
                          <td class="px-4 py-3 font-mono sticky left-0 bg-white hover:bg-slate-50">${e.name}</td>
                          <td class="px-4 py-3 text-right font-bold">${e.count.toLocaleString()}</td>
                          <td class="px-4 py-3 text-right font-bold ${okCls}">${e.okRate.toFixed(1)}%</td>
                          <td class="px-4 py-3 text-right">${msRound(e.median)}</td>
                          <td class="px-4 py-3 text-right ${p95Bad}">${msRound(e.p95)}</td>
                          <td class="px-4 py-3 text-right">${msRound(e.p99)}</td>
                          <td class="px-4 py-3 text-right ${e.errors ? "text-red-700 font-bold" : "text-slate-400"}">${e.errors.toLocaleString()}</td>
                        </tr>`;
                      }
                    )
                    .join("")}
                </tbody>
              </table>
            </div>
          </div>`
        : ""
    }

    <p class="text-center text-slate-400 text-sm py-4">
      Generated by Artillery custom reporter · ${new Date().toLocaleString()}
    </p>
  </div>

  <script>
    const codesList = ${JSON.stringify(codeEntries.map(([c]) => c))};
    const codeCounts = ${JSON.stringify(codeEntries.map(([, n]) => n))};
    if (typeof Chart !== "undefined" && codesList.length > 0) {
      new Chart(document.getElementById("codesChart"), {
        type: "bar",
        data: {
          labels: codesList,
          datasets: [{
            label: "Responses",
            data: codeCounts,
            backgroundColor: codesList.map(c =>
              c.startsWith("2") || c.startsWith("3") ? "#10b981" :
              c.startsWith("4") ? "#f59e0b" : "#ef4444"
            ),
            borderRadius: 10
          }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }

    const latLabels = ["Min", "Avg", "p50", "p95", "p99", "Max"];
    const latValues = [
      ${latency.min ?? 0},
      ${latency.mean ?? 0},
      ${latency.median ?? latency.p50 ?? 0},
      ${latency.p95 ?? 0},
      ${latency.p99 ?? 0},
      ${latency.max ?? 0}
    ];
    if (typeof Chart !== "undefined" && latValues.some(v => v > 0)) {
      new Chart(document.getElementById("latencyChart"), {
        type: "line",
        data: {
          labels: latLabels,
          datasets: [{
            label: "Latency (ms)",
            data: latValues,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.15)",
            tension: 0.35,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: "#6366f1"
          }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
      });
    }
  </script>
</body>
</html>`;

fs.mkdirSync(path.dirname(outputHtml), { recursive: true });
fs.writeFileSync(outputHtml, html, "utf-8");

console.log(`✅ Report generated successfully!`);
console.log(`   → Open this file in your browser:`);
const fileUrl = "file:///" + outputHtml.replace(/\\/g, "/");
console.log(`   ${fileUrl}\n`);
