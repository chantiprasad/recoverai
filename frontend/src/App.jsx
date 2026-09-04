import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8000";

function formatINR(value = 0) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatNumber(value = 0) {
  return Number(value || 0).toLocaleString("en-IN");
}

function formatPercent(value = 0) {
  return `${Number(value || 0).toFixed(2)}%`;
}

/*
  Normalize backend metric names so the UI stays stable even if
  the backend returns an older field name.
*/
function normalizeMetrics(data = {}) {
  return {
    ...data,

    revenue_at_risk: Number(data.revenue_at_risk || 0),

    recovered_revenue: Number(
      data.recovered_revenue ?? data.revenue_recovered ?? 0
    ),

    recovery_rate_percent: Number(
      data.recovery_rate_percent ?? data.recovery_rate ?? 0
    ),

    automation_rate_percent: Number(
      data.automation_rate_percent ?? data.automation_rate ?? 0
    ),

    transactions_processed: Number(data.transactions_processed || 0),

    human_reviews: Number(data.human_reviews || 0),

    blocked_actions: Number(data.blocked_actions || 0),

    failed_recoveries: Number(data.failed_recoveries || 0),

    duplicate_actions_prevented: Number(
      data.duplicate_actions_prevented || 0
    ),
  };
}

function StatusBadge({ status }) {
  const normalized = String(status || "NOT_EXECUTED").toUpperCase();

  const styles = {
    RECOVERED:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",

    ACTION_EXECUTED:
      "bg-blue-50 text-blue-700 border border-blue-200",

    APPROVE:
      "bg-blue-50 text-blue-700 border border-blue-200",

    HUMAN_REVIEW:
      "bg-amber-50 text-amber-700 border border-amber-200",

    FAILED:
      "bg-red-50 text-red-700 border border-red-200",

    RECOVERY_FAILED:
      "bg-red-50 text-red-700 border border-red-200",

    DUPLICATE:
      "bg-purple-50 text-purple-700 border border-purple-200",

    DUPLICATE_BLOCKED:
      "bg-purple-50 text-purple-700 border border-purple-200",

    BLOCKED:
      "bg-red-50 text-red-700 border border-red-200",

    NOT_EXECUTED:
      "bg-slate-100 text-slate-600 border border-slate-200",
  };

  const labels = {
    RECOVERED: "✓ Recovered",
    ACTION_EXECUTED: "→ Executed",
    APPROVE: "✓ Approved",
    HUMAN_REVIEW: "Human Review",
    FAILED: "Failed",
    RECOVERY_FAILED: "Recovery Failed",
    DUPLICATE: "Duplicate",
    DUPLICATE_BLOCKED: "Duplicate Blocked",
    BLOCKED: "Blocked",
    NOT_EXECUTED: "Not Executed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[normalized] || styles.NOT_EXECUTED
      }`}
    >
      {labels[normalized] || normalized.replaceAll("_", " ")}
    </span>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        highlight
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function FlowStep({ number, title, description, icon }) {
  return (
    <div className="relative flex flex-1 items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [filter, setFilter] = useState("ALL");
  const [selectedDecision, setSelectedDecision] = useState(null);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const [recoveryStage, setRecoveryStage] = useState("");
  const [error, setError] = useState("");
  const [runMessage, setRunMessage] = useState("");

  async function fetchMetrics() {
    const response = await fetch(`${API}/metrics/summary`);

    if (!response.ok) {
      throw new Error("Failed to fetch metrics");
    }

    const data = await response.json();

    setMetrics(normalizeMetrics(data));
  }

  async function fetchDecisions() {
    const response = await fetch(`${API}/recovery/decisions`);

    if (!response.ok) {
      throw new Error("Failed to fetch recovery decisions");
    }

    const data = await response.json();

    setDecisions(data.decisions || []);
  }

  async function fetchAuditLogs() {
    const response = await fetch(`${API}/audit/logs`);

    if (!response.ok) {
      throw new Error("Failed to fetch audit logs");
    }

    const data = await response.json();

    setAuditLogs(data.logs || []);
  }

  async function refreshDashboard() {
    try {
      setError("");

      await Promise.all([
        fetchMetrics(),
        fetchDecisions(),
        fetchAuditLogs(),
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to connect to RecoverAI backend. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDashboard();
  }, []);

  async function runRecovery() {
    if (running) return;

    try {
      setRunning(true);
      setError("");
      setRunMessage("");

      setRecoveryStage("Detecting revenue risk...");
      await new Promise((resolve) => setTimeout(resolve, 700));

      setRecoveryStage("Gemini diagnosing payment failures...");
      await new Promise((resolve) => setTimeout(resolve, 700));

      setRecoveryStage("Policy engine validating recovery actions...");
      await new Promise((resolve) => setTimeout(resolve, 700));

      setRecoveryStage("Executing approved recovery actions...");

      const response = await fetch(`${API}/workflow/run`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Recovery workflow failed");
      }

      const data = await response.json();

      const normalized = normalizeMetrics(data.metrics);

      setMetrics(normalized);

      await Promise.all([
        fetchDecisions(),
        fetchAuditLogs(),
      ]);

      const recovered = Number(
        normalized.recovered_revenue || 0
      );

      const duplicates = Number(
        normalized.duplicate_actions_prevented || 0
      );

      if (recovered > 0) {
        setRunMessage(
          `Recovery completed — ${formatINR(
            recovered
          )} recovered.`
        );
      } else if (duplicates > 0) {
        setRunMessage(
          `Recovery completed — ${duplicates} duplicate action${
            duplicates === 1 ? "" : "s"
          } prevented.`
        );
      } else {
        setRunMessage(
          "Recovery completed — no revenue was recovered in this run."
        );
      }

      setRecoveryStage("");
    } catch (err) {
      console.error(err);

      setRecoveryStage("");

      setError(
        err.message ||
          "Something went wrong while running the recovery workflow."
      );
    } finally {
      setRunning(false);
    }
  }

  const filteredDecisions = useMemo(() => {
    if (filter === "ALL") {
      return decisions;
    }

    return decisions.filter((item) => {
      const executionStatus =
        item.execution?.status ||
        item.execution_status ||
        "NOT_EXECUTED";

      const policyDecision =
        item.policy?.decision ||
        item.policy_decision ||
        "";

      if (filter === "RECOVERED") {
        return executionStatus === "RECOVERED";
      }

      if (filter === "EXECUTED") {
        return executionStatus === "ACTION_EXECUTED";
      }

      if (filter === "HUMAN_REVIEW") {
        return policyDecision === "HUMAN_REVIEW";
      }

      if (filter === "FAILED") {
        return (
          executionStatus === "FAILED" ||
          executionStatus === "RECOVERY_FAILED"
        );
      }

      if (filter === "DUPLICATE") {
        return executionStatus === "DUPLICATE_BLOCKED";
      }

      return true;
    });
  }, [decisions, filter]);

  const decisionCounts = useMemo(() => {
    const counts = {
      ALL: decisions.length,
      RECOVERED: 0,
      EXECUTED: 0,
      HUMAN_REVIEW: 0,
      FAILED: 0,
      DUPLICATE: 0,
    };

    decisions.forEach((item) => {
      const executionStatus =
        item.execution?.status ||
        item.execution_status ||
        "NOT_EXECUTED";

      const policyDecision =
        item.policy?.decision ||
        item.policy_decision ||
        "";

      if (executionStatus === "RECOVERED") {
        counts.RECOVERED++;
      }

      if (executionStatus === "ACTION_EXECUTED") {
        counts.EXECUTED++;
      }

      if (policyDecision === "HUMAN_REVIEW") {
        counts.HUMAN_REVIEW++;
      }

      if (
        executionStatus === "FAILED" ||
        executionStatus === "RECOVERY_FAILED"
      ) {
        counts.FAILED++;
      }

      if (executionStatus === "DUPLICATE_BLOCKED") {
        counts.DUPLICATE++;
      }
    });

    return counts;
  }, [decisions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading RecoverAI...
          </p>
        </div>
      </div>
    );
  }

  /*
    IMPORTANT:
    recovered_revenue is the actual backend metric.
  */
  const revenueAtRisk = Number(
    metrics?.revenue_at_risk || 0
  );

  const recoveredRevenue = Number(
    metrics?.recovered_revenue || 0
  );

  const remainingRisk = Math.max(
    revenueAtRisk - recoveredRevenue,
    0
  );

  const recoveryRate = Number(
    metrics?.recovery_rate_percent || 0
  );

  const automationRate = Number(
    metrics?.automation_rate_percent || 0
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                ₹
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  RecoverAI
                </h1>

                <p className="text-xs text-slate-500">
                  AI Revenue Recovery Agent
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:block">
              ● System Ready
            </div>

            <button
              onClick={runRecovery}
              disabled={running}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                running
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {running ? "Running Recovery..." : "Run Recovery"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* RUN STATUS */}
        {(running || recoveryStage || runMessage) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              {running && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
              )}

              <div>
                {recoveryStage && (
                  <p className="text-sm font-semibold text-slate-900">
                    {recoveryStage}
                  </p>
                )}

                {runMessage && !running && (
                  <p className="text-sm font-semibold text-emerald-700">
                    {runMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TOP SUMMARY */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Latest Recovery Run
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Revenue recovery workflow completed
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                RecoverAI detected revenue at risk, diagnosed payment
                failures, validated actions against policy, and executed
                only approved recovery actions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-slate-500">
                  Recovered
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-600">
                  {formatINR(recoveredRevenue)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Recovery Rate
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatPercent(recoveryRate)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Automation
                </p>

                <p className="mt-1 text-lg font-bold">
                  {formatPercent(automationRate)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* METRIC CARDS */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Payments Analyzed"
            value={formatNumber(metrics?.transactions_processed)}
            subtitle="Recovery candidates processed"
            icon="◎"
          />

          <MetricCard
            title="Revenue at Risk"
            value={formatINR(revenueAtRisk)}
            subtitle="Potentially recoverable revenue"
            icon="⚠"
          />

          <MetricCard
            title="Revenue Recovered"
            value={formatINR(recoveredRevenue)}
            subtitle={`${formatPercent(
              recoveryRate
            )} recovery rate`}
            icon="✓"
            highlight
          />

          <MetricCard
            title="Automation Rate"
            value={formatPercent(automationRate)}
            subtitle={`${formatNumber(
              metrics?.human_reviews
            )} human reviews`}
            icon="⚙"
          />
        </section>

        {/* SECONDARY METRICS */}
        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Human Escalations"
            value={formatNumber(metrics?.human_reviews)}
            subtitle="Actions requiring human judgment"
            icon="👤"
          />

          <MetricCard
            title="Blocked Actions"
            value={formatNumber(metrics?.blocked_actions)}
            subtitle="Prevented by safety policy"
            icon="🛡"
          />

          <MetricCard
            title="Failed Recoveries"
            value={formatNumber(metrics?.failed_recoveries)}
            subtitle="Recovery attempts that failed"
            icon="!"
          />
        </section>

        {/* RECOVERY IMPACT */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Recovery Impact
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                How much at-risk revenue RecoverAI successfully recovered.
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              {formatPercent(recoveryRate)}
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">
                Revenue at Risk
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatINR(revenueAtRisk)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Revenue Recovered
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {formatINR(recoveredRevenue)}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Remaining Risk
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {formatINR(remainingRisk)}
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">
                Recovery Progress
              </span>

              <span className="text-slate-700">
                {formatPercent(recoveryRate)}
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                style={{
                  width: `${Math.min(
                    Math.max(recoveryRate, 0),
                    100
                  )}%`,
                }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-slate-500">
              <span>
                Recovered:{" "}
                <span className="font-semibold text-emerald-600">
                  {formatINR(recoveredRevenue)}
                </span>
              </span>

              <span>
                Remaining:{" "}
                <span className="font-semibold text-amber-600">
                  {formatINR(remainingRisk)}
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* AI INSIGHTS */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                ✨
              </div>

              <div>
                <h2 className="font-bold">AI Insights</h2>

                <p className="text-xs text-slate-500">
                  Gemini-powered diagnosis and recommendations
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Diagnosis
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  RecoverAI evaluates payment status, failure reason,
                  retry history, and transaction value before recommending
                  a recovery action.
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Decision principle
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  AI recommends the safest recovery action while the
                  policy engine independently validates whether that
                  action is allowed.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold">Business Impact</h2>

            <p className="mt-1 text-xs text-slate-500">
              Measured financial outcome
            </p>

            <div className="mt-6">
              <p className="text-sm text-slate-500">
                Revenue recovered
              </p>

              <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-600">
                {formatINR(recoveredRevenue)}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                from {formatINR(revenueAtRisk)} of identified
                revenue at risk.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Recovery Rate
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatPercent(recoveryRate)}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs text-slate-500">
                  Automation Rate
                </p>

                <p className="mt-1 text-xl font-bold">
                  {formatPercent(automationRate)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SAFETY */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold">
              Safety & Policy Controls
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Automated recovery is bounded by explicit deterministic
              controls.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                Max Automated Retries
              </p>

              <p className="mt-2 text-xl font-bold">
                2
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                Max Automated Amount
              </p>

              <p className="mt-2 text-xl font-bold">
                ₹50,000
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                Duplicate Actions Prevented
              </p>

              <p className="mt-2 text-xl font-bold">
                {formatNumber(
                  metrics?.duplicate_actions_prevented
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500">
                Human Reviews
              </p>

              <p className="mt-2 text-xl font-bold">
                {formatNumber(metrics?.human_reviews)}
              </p>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold">
              Recovery Workflow
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI recommendation → deterministic policy → controlled
              execution → audit trail.
            </p>
          </div>

          <div className="mt-8 grid gap-8 md:grid-cols-4">
            <FlowStep
              number="1"
              icon="🔍"
              title="Detect"
              description="Identify failed, pending, abandoned, or otherwise at-risk revenue."
            />

            <FlowStep
              number="2"
              icon="🧠"
              title="Diagnose"
              description="Gemini analyzes transaction context and recommends the safest action."
            />

            <FlowStep
              number="3"
              icon="🛡"
              title="Validate"
              description="Policy engine checks retry, amount, duplicate, and escalation rules."
            />

            <FlowStep
              number="4"
              icon="⚡"
              title="Execute"
              description="Only approved actions are executed and recorded in the audit trail."
            />
          </div>
        </section>

        {/* DECISIONS */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-lg font-bold">
                  Recovery Decisions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI decisions, policy validation, and execution results.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  ["ALL", "All"],
                  ["RECOVERED", "Recovered"],
                  ["EXECUTED", "Executed"],
                  ["HUMAN_REVIEW", "Human Review"],
                  ["FAILED", "Failed"],
                  ["DUPLICATE", "Duplicate"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      filter === key
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {label}

                    <span className="ml-1 opacity-70">
                      {decisionCounts[key]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Failure
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    AI Recommendation
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Policy
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Result
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDecisions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No recovery decisions found.
                    </td>
                  </tr>
                ) : (
                  filteredDecisions.map((item, index) => {
                    const executionStatus =
                      item.execution?.status ||
                      item.execution_status ||
                      "NOT_EXECUTED";

                    const policyDecision =
                      item.policy?.decision ||
                      item.policy_decision ||
                      "—";

                    const recoveredAmount = Number(
                      item.execution?.recovered_amount || 0
                    );

                    const confidenceRaw = Number(
                      item.ai?.confidence ?? 0
                    );

                    const confidence =
                      confidenceRaw <= 1
                        ? confidenceRaw * 100
                        : confidenceRaw;

                    return (
                      <tr
                        key={
                          item.payment_id ||
                          item.id ||
                          index
                        }
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setSelectedDecision(item)
                            }
                            className="font-mono text-sm font-semibold text-slate-900 hover:underline"
                          >
                            {item.payment_id || "—"}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold">
                          {formatINR(item.amount)}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.failure_reason || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {item.ai?.recommended_action ||
                              "—"}
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            {Math.round(confidence)}% confidence
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={policyDecision}
                          />
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <StatusBadge
                              status={executionStatus}
                            />

                            {recoveredAmount > 0 && (
                              <span className="text-xs font-semibold text-emerald-600">
                                +{formatINR(recoveredAmount)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setSelectedDecision(item)
                            }
                            className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
                          >
                            View details →
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* AUDIT LOG */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-lg font-bold">
              Audit Trail
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Every AI recommendation and recovery action is recorded.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    AI Diagnosis
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recommendation
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Policy
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Execution
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recovered
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      No audit logs available.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, index) => (
                    <tr
                      key={log.payment_id || index}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-mono text-sm font-semibold">
                        {log.payment_id || "—"}
                      </td>

                      <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                        <div className="line-clamp-2">
                          {log.ai_diagnosis || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-medium">
                        {log.recommended_action || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            log.policy_decision ||
                            "HUMAN_REVIEW"
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={
                            log.execution_status ||
                            "NOT_EXECUTED"
                          }
                        />
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-emerald-600">
                        {formatINR(log.recovered_amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* DETAIL MODAL */}
      {selectedDecision && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={() => setSelectedDecision(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recovery Decision
                </p>

                <h2 className="mt-1 font-mono text-lg font-bold">
                  {selectedDecision.payment_id ||
                    "Payment Details"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDecision(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* PAYMENT OVERVIEW */}
              <div>
                <h3 className="text-sm font-bold">
                  Payment Overview
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Amount
                    </p>

                    <p className="mt-1 font-bold">
                      {formatINR(
                        selectedDecision.amount
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Status
                    </p>

                    <p className="mt-1 font-bold">
                      {selectedDecision.status ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Payment Method
                    </p>

                    <p className="mt-1 font-bold">
                      {selectedDecision.payment_method ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Retry Count
                    </p>

                    <p className="mt-1 font-bold">
                      {selectedDecision.retry_count ??
                        0}
                    </p>
                  </div>
                </div>
              </div>

              {/* FAILURE */}
              <div>
                <h3 className="text-sm font-bold">
                  Failure Diagnosis
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedDecision.failure_reason ||
                      "Unknown"}
                  </p>
                </div>
              </div>

              {/* AI */}
              <div>
                <h3 className="text-sm font-bold">
                  AI Decision
                </h3>

                <div className="mt-3 rounded-xl bg-purple-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-bold text-purple-900">
                      {selectedDecision.ai
                        ?.recommended_action ||
                        selectedDecision.recommended_action ||
                        "HUMAN_REVIEW"}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-purple-700">
                      {(() => {
                        const raw = Number(
                          selectedDecision.ai
                            ?.confidence ??
                            selectedDecision.confidence ??
                            0
                        );

                        const percent =
                          raw <= 1 ? raw * 100 : raw;

                        return `${Math.round(
                          percent
                        )}% confidence`;
                      })()}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-purple-900/80">
                    {selectedDecision.ai
                      ?.diagnosis ||
                      selectedDecision.diagnosis ||
                      "No diagnosis available."}
                  </p>
                </div>
              </div>

              {/* POLICY */}
              <div>
                <h3 className="text-sm font-bold">
                  Policy Validation
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <StatusBadge
                      status={
                        selectedDecision.policy
                          ?.decision ||
                        selectedDecision.policy_decision ||
                        "HUMAN_REVIEW"
                      }
                    />

                    <span className="text-xs text-slate-500">
                      Deterministic policy engine
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selectedDecision.policy
                      ?.reason ||
                      selectedDecision.policy_reason ||
                      "No policy reason available."}
                  </p>
                </div>
              </div>

              {/* EXECUTION */}
              <div>
                <h3 className="text-sm font-bold">
                  Execution Result
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <StatusBadge
                      status={
                        selectedDecision.execution
                          ?.status ||
                        "NOT_EXECUTED"
                      }
                    />

                    <span className="text-sm font-bold text-emerald-600">
                      {formatINR(
                        selectedDecision.execution
                          ?.recovered_amount || 0
                      )}{" "}
                      recovered
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selectedDecision.execution
                      ?.message ||
                      "No execution details available."}
                  </p>
                </div>
              </div>

              {/* SAFETY */}
              <div>
                <h3 className="text-sm font-bold">
                  Safety Controls
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Max Retries
                    </p>

                    <p className="mt-1 font-bold">
                      2
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Max Automated Amount
                    </p>

                    <p className="mt-1 font-bold">
                      ₹50,000
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Idempotency
                    </p>

                    <p className="mt-1 font-bold">
                      Enabled
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-center text-xs font-medium text-slate-500">
                AI recommends. Policy validates. Code executes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}