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

function formatDate(value) {
  if (!value) return "Unknown time";

  try {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value;
  }
}

function normalizeMetrics(data = {}) {
  return {
    ...data,

    revenue_at_risk: Number(
      data.revenue_at_risk || 0
    ),

    recovered_revenue: Number(
      data.recovered_revenue ??
      data.revenue_recovered ??
      0
    ),

    recovery_rate_percent: Number(
      data.recovery_rate_percent ??
      data.recovery_rate ??
      0
    ),

    automation_rate_percent: Number(
      data.automation_rate_percent ??
      data.automation_rate ??
      0
    ),

    transactions_processed: Number(
      data.transactions_processed || 0
    ),

    human_reviews: Number(
      data.human_reviews || 0
    ),

    blocked_actions: Number(
      data.blocked_actions || 0
    ),

    failed_recoveries: Number(
      data.failed_recoveries || 0
    ),

    duplicate_actions_prevented: Number(
      data.duplicate_actions_prevented || 0
    ),

    approved_actions: Number(
      data.approved_actions || 0
    ),

    executed_actions: Number(
      data.executed_actions || 0
    ),

    best_recovery: Number(
      data.best_recovery || 0
    ),
  };
}

function StatusBadge({ status }) {
  const normalized = String(
    status || "NOT_EXECUTED"
  ).toUpperCase();

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

    BLOCK:
      "bg-red-50 text-red-700 border border-red-200",

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
    BLOCK: "Blocked",
    BLOCKED: "Blocked",
    NOT_EXECUTED: "Not Executed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[normalized] || styles.NOT_EXECUTED
        }`}
    >
      {labels[normalized] ||
        normalized.replaceAll("_", " ")}
    </span>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
  danger = false,
}) {
  return (
    <div
      className={`group rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${highlight
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
          : danger
            ? "border-amber-200 bg-gradient-to-br from-amber-50/70 to-white"
            : "border-slate-200 bg-white"
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>

          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${highlight
                ? "text-emerald-700"
                : danger
                  ? "text-amber-700"
                  : "text-slate-900"
              }`}
          >
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${highlight
                ? "bg-emerald-100 text-emerald-700"
                : danger
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
              }`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
  icon,
  active,
}) {
  return (
    <div className="relative flex flex-1 items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${active
            ? "bg-slate-900 text-white shadow-sm"
            : "bg-slate-100 text-slate-600"
          }`}
      >
        {icon || number}
      </div>

      <div>
        <p className="text-sm font-bold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}

function HistoryStat({
  label,
  value,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [runHistory, setRunHistory] = useState([]);

  const [activeSection, setActiveSection] =
    useState("overview");

  const [filter, setFilter] = useState("ALL");

  const [selectedDecision, setSelectedDecision] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const [recoveryStage, setRecoveryStage] =
    useState("");

  const [error, setError] = useState("");
  const [runMessage, setRunMessage] = useState("");

  async function fetchMetrics() {
    const response = await fetch(
      `${API}/metrics/summary`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch metrics");
    }

    const data = await response.json();

    setMetrics(normalizeMetrics(data));
  }

  async function fetchDecisions() {
    const response = await fetch(
      `${API}/recovery/decisions`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch recovery decisions"
      );
    }

    const data = await response.json();

    setDecisions(data.decisions || []);
  }

  async function fetchAuditLogs() {
    const response = await fetch(
      `${API}/audit/logs`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch audit logs");
    }

    const data = await response.json();

    setAuditLogs(data.logs || []);
  }

  async function fetchRunHistory() {
    const response = await fetch(
      `${API}/workflow/history`
    );

    if (!response.ok) {
      throw new Error(
        "Failed to fetch workflow history"
      );
    }

    const data = await response.json();

    setRunHistory(data.runs || []);
  }

  async function refreshDashboard() {
    try {
      setError("");

      await Promise.all([
        fetchMetrics(),
        fetchDecisions(),
        fetchAuditLogs(),
        fetchRunHistory(),
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
    const timeoutId = setTimeout(() => {
      void refreshDashboard();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []); // Run once on mount; refreshDashboard is intentionally not a dependency.

  async function runRecovery() {
    if (running) return;

    try {
      setRunning(true);
      setError("");
      setRunMessage("");

      setRecoveryStage(
        "Detecting revenue risk..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      setRecoveryStage(
        "Gemini diagnosing payment failures..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      setRecoveryStage(
        "Policy engine validating recovery actions..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 600)
      );

      setRecoveryStage(
        "Executing approved recovery actions..."
      );

      const response = await fetch(
        `${API}/workflow/run`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Recovery workflow failed"
        );
      }

      const data = await response.json();

      const normalized = normalizeMetrics(
        data.metrics
      );

      setMetrics(normalized);

      await Promise.all([
        fetchDecisions(),
        fetchAuditLogs(),
        fetchRunHistory(),
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
          `Recovery completed — ${duplicates} duplicate action${duplicates === 1 ? "" : "s"
          } prevented.`
        );
      } else {
        setRunMessage(
          "Recovery completed — no revenue was recovered in this run."
        );
      }

      setRecoveryStage("");
      setActiveSection("overview");
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
    if (filter === "ALL") return decisions;

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
        return (
          executionStatus === "ACTION_EXECUTED"
        );
      }

      if (filter === "HUMAN_REVIEW") {
        return (
          policyDecision === "HUMAN_REVIEW"
        );
      }

      if (filter === "FAILED") {
        return (
          executionStatus === "FAILED" ||
          executionStatus === "RECOVERY_FAILED"
        );
      }

      if (filter === "DUPLICATE") {
        return (
          executionStatus ===
          "DUPLICATE_BLOCKED"
        );
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

      if (
        executionStatus ===
        "ACTION_EXECUTED"
      ) {
        counts.EXECUTED++;
      }

      if (
        policyDecision === "HUMAN_REVIEW"
      ) {
        counts.HUMAN_REVIEW++;
      }

      if (
        executionStatus === "FAILED" ||
        executionStatus === "RECOVERY_FAILED"
      ) {
        counts.FAILED++;
      }

      if (
        executionStatus ===
        "DUPLICATE_BLOCKED"
      ) {
        counts.DUPLICATE++;
      }
    });

    return counts;
  }, [decisions]);

  const insightData = useMemo(() => {
    const failureReasons = {};
    const actions = {};

    decisions.forEach((item) => {
      const reason =
        item.failure_reason || "unknown";

      const action =
        item.ai?.recommended_action ||
        item.recommended_action ||
        "HUMAN_REVIEW";

      failureReasons[reason] =
        (failureReasons[reason] || 0) + 1;

      actions[action] =
        (actions[action] || 0) + 1;
    });

    const topFailureReasons = Object.entries(
      failureReasons
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topActions = Object.entries(actions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      topFailureReasons,
      topActions,
    };
  }, [decisions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading RecoverAI...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Connecting to recovery engine
          </p>
        </div>
      </div>
    );
  }

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

  const navItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "⌂",
      description: "Financial recovery summary",
    },
    {
      id: "insights",
      label: "Recovery Insights",
      icon: "◒",
      description: "Risk and opportunity analysis",
    },
    {
      id: "decisions",
      label: "Decisions",
      icon: "✦",
      description: "AI recommendations",
    },
    {
      id: "audit",
      label: "Audit Trail",
      icon: "▤",
      description: "Complete action history",
    },
    {
      id: "runs",
      label: "Run History",
      icon: "◷",
      description: "Workflow execution history",
    },
    {
      id: "controls",
      label: "Safety & Controls",
      icon: "◇",
      description: "Policy guardrails",
    },
  ];

  function goTo(section) {
    setActiveSection(section);

    window.setTimeout(() => {
      document
        .getElementById(`section-${section}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            onClick={() => goTo("overview")}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white shadow-sm">
              ₹
            </div>

            <div>
              <p className="text-base font-bold tracking-tight text-slate-950">
                RecoverAI
              </p>

              <p className="hidden text-[11px] font-medium text-slate-400 sm:block">
                AI Revenue Recovery Agent
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-4">

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              System Operational
            </div>

            <button
              onClick={runRecovery}
              disabled={running}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition sm:px-4 sm:text-sm ${running
                  ? "cursor-not-allowed bg-slate-400"
                  : "bg-slate-950 hover:bg-slate-800"
                }`}
            >
              {running
                ? "Running..."
                : "Run Recovery"}
            </button>

          </div>
        </div>
      </header>

      {/* BODY */}

      <div className="mx-auto flex max-w-[1500px]">

        {/* SIDEBAR */}

        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">

          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="mt-3 space-y-1.5">

            {navItems.map((item) => {
              const active =
                activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                >

                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${active
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white"
                      }`}
                  >
                    {item.icon}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-bold">
                      {item.label}
                    </span>

                    <span
                      className={`mt-0.5 block truncate text-[10px] ${active
                          ? "text-slate-300"
                          : "text-slate-400"
                        }`}
                    >
                      {item.description}
                    </span>
                  </span>

                </button>
              );
            })}

          </nav>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-center gap-2">

              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs text-emerald-700">
                ✓
              </span>

              <p className="text-xs font-bold text-slate-800">
                Guardrails Active
              </p>

            </div>

            <p className="mt-2 text-[11px] leading-5 text-slate-500">
              AI recommendations are independently validated before any
              recovery action is executed.
            </p>

          </div>

        </aside>

        {/* MAIN */}

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* MOBILE NAV */}

          <div className="mb-5 overflow-x-auto lg:hidden">

            <div className="flex min-w-max gap-2">

              {navItems.map((item) => {

                const active =
                  activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      goTo(item.id)
                    }
                    className={`rounded-xl px-3 py-2 text-xs font-bold ${active
                        ? "bg-slate-950 text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200"
                      }`}
                  >
                    {item.icon} {item.label}
                  </button>
                );
              })}

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* RUN STATUS */}

          {(running ||
            recoveryStage ||
            runMessage) && (
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="flex items-center gap-3">

                  {running ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                      ✓
                    </div>
                  )}

                  <div>

                    {recoveryStage && (
                      <p className="text-sm font-bold text-slate-900">
                        {recoveryStage}
                      </p>
                    )}

                    {runMessage && !running && (
                      <p className="text-sm font-bold text-emerald-700">
                        {runMessage}
                      </p>
                    )}

                  </div>

                </div>
              </div>
            )}

          {/* OVERVIEW */}

          <section
            id="section-overview"
            className="scroll-mt-24 space-y-6"
          >

            {/* HERO */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">

              <div className="relative p-6 sm:p-8">

                <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-white/[0.04] blur-3xl" />

                <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">

                  <div className="max-w-2xl">

                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Latest recovery workflow
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Turn payment failures into recovered revenue.
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                      RecoverAI detects revenue at risk, diagnoses payment
                      failures, validates recovery actions against policy,
                      executes approved actions, and records every decision.
                    </p>

                  </div>

                  <div className="grid grid-cols-3 gap-5 border-t border-white/10 pt-5 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Recovered
                      </p>

                      <p className="mt-1 text-lg font-bold text-emerald-400">
                        {formatINR(
                          recoveredRevenue
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Recovery
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {formatPercent(
                          recoveryRate
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Automated
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        {formatPercent(
                          automationRate
                        )}
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* KPI */}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              <MetricCard
                title="Payments Analyzed"
                value={formatNumber(
                  metrics?.transactions_processed
                )}
                subtitle="Recovery candidates processed"
                icon="◎"
              />

              <MetricCard
                title="Revenue at Risk"
                value={formatINR(
                  revenueAtRisk
                )}
                subtitle="Potentially recoverable revenue"
                icon="!"
                danger
              />

              <MetricCard
                title="Revenue Recovered"
                value={formatINR(
                  recoveredRevenue
                )}
                subtitle={`${formatPercent(
                  recoveryRate
                )} recovery rate`}
                icon="✓"
                highlight
              />

              <MetricCard
                title="Automation Rate"
                value={formatPercent(
                  automationRate
                )}
                subtitle={`${formatNumber(
                  metrics?.human_reviews
                )} human escalations`}
                icon="⚙"
              />

            </div>

            {/* IMPACT */}

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <SectionHeader
                  eyebrow="Financial outcome"
                  title="Recovery Impact"
                  description="A simple view of the revenue opportunity and what RecoverAI recovered."
                  action={
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                      {formatPercent(
                        recoveryRate
                      )}
                    </div>
                  }
                />

                <div className="grid gap-5 sm:grid-cols-3">

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Revenue at Risk
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {formatINR(
                        revenueAtRisk
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Revenue Recovered
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                      {formatINR(
                        recoveredRevenue
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      Remaining Risk
                    </p>

                    <p className="mt-1 text-2xl font-bold text-amber-600">
                      {formatINR(
                        remainingRisk
                      )}
                    </p>
                  </div>

                </div>

                <div className="mt-7">

                  <div className="mb-2 flex items-center justify-between text-xs font-semibold">

                    <span className="text-slate-400">
                      Revenue recovery progress
                    </span>

                    <span className="text-slate-700">
                      {formatPercent(
                        recoveryRate
                      )}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          Math.max(
                            recoveryRate,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>
                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <SectionHeader
                  eyebrow="Operations"
                  title="Workflow Status"
                  description="Current recovery execution state."
                />

                <div className="space-y-3">

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-500">
                      Human escalations
                    </span>

                    <span className="font-bold text-amber-600">
                      {formatNumber(
                        metrics?.human_reviews
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-500">
                      Failed recoveries
                    </span>

                    <span className="font-bold text-red-600">
                      {formatNumber(
                        metrics?.failed_recoveries
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-500">
                      Duplicate actions prevented
                    </span>

                    <span className="font-bold text-purple-600">
                      {formatNumber(
                        metrics?.duplicate_actions_prevented
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-xs font-medium text-slate-500">
                      Blocked by policy
                    </span>

                    <span className="font-bold text-slate-700">
                      {formatNumber(
                        metrics?.blocked_actions
                      )}
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* FLOW */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <SectionHeader
                eyebrow="How RecoverAI works"
                title="AI recommends. Policy validates. Code executes."
                description="Financial actions are never controlled by the AI model alone."
              />

              <div className="grid gap-7 md:grid-cols-4">

                <FlowStep
                  number="1"
                  icon="⌕"
                  title="Detect"
                  description="Identify failed, pending, or otherwise at-risk transactions."
                  active
                />

                <FlowStep
                  number="2"
                  icon="✦"
                  title="Diagnose"
                  description="Gemini evaluates transaction context and recommends recovery."
                  active
                />

                <FlowStep
                  number="3"
                  icon="◇"
                  title="Validate"
                  description="Deterministic policy checks retries, amount, and safety."
                  active
                />

                <FlowStep
                  number="4"
                  icon="→"
                  title="Execute"
                  description="Only approved actions execute and enter the audit trail."
                  active
                />

              </div>
            </div>

          </section>

          {/* INSIGHTS */}

          <section
            id="section-insights"
            className="mt-12 scroll-mt-24"
          >

            <SectionHeader
              eyebrow="Recovery intelligence"
              title="Recovery Insights"
              description="Understand where revenue is at risk and what actions the AI recommends."
            />

            <div className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-sm font-bold text-slate-900">
                  Failure Reasons
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Most frequent reasons behind recovery candidates.
                </p>

                <div className="mt-6 space-y-4">

                  {insightData
                    .topFailureReasons
                    .length === 0 ? (
                    <EmptyState message="No failure reason data available." />
                  ) : (
                    insightData.topFailureReasons.map(
                      ([reason, count]) => {

                        const max =
                          insightData
                            .topFailureReasons[0][1];

                        const width =
                          max > 0
                            ? (count / max) *
                            100
                            : 0;

                        return (
                          <div key={reason}>

                            <div className="mb-1.5 flex items-center justify-between gap-3">

                              <span className="truncate text-xs font-semibold text-slate-700">
                                {reason.replaceAll(
                                  "_",
                                  " "
                                )}
                              </span>

                              <span className="text-xs font-bold text-slate-500">
                                {count}
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-slate-800"
                                style={{
                                  width: `${width}%`,
                                }}
                              />

                            </div>

                          </div>
                        );
                      }
                    )
                  )}

                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-sm font-bold text-slate-900">
                  AI Recommended Actions
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Distribution of recovery strategies selected by the AI.
                </p>

                <div className="mt-6 space-y-3">

                  {insightData.topActions.length ===
                    0 ? (
                    <EmptyState message="No recovery action data available." />
                  ) : (
                    insightData.topActions.map(
                      ([action, count]) => (
                        <div
                          key={action}
                          className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div>

                            <p className="text-xs font-bold text-slate-800">
                              {action.replaceAll(
                                "_",
                                " "
                              )}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              AI recommendation
                            </p>

                          </div>

                          <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-100">
                            {count}
                          </span>

                        </div>
                      )
                    )
                  )}

                </div>
              </div>

            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">

              <MetricCard
                title="High Attention"
                value={formatNumber(
                  decisions.filter(
                    (item) =>
                      String(
                        item.ai?.risk_level ||
                        item.risk_level ||
                        ""
                      ).toUpperCase() ===
                      "HIGH"
                  ).length
                )}
                subtitle="High-risk recovery candidates"
                icon="!"
                danger
              />

              <MetricCard
                title="Recovered Payments"
                value={formatNumber(
                  decisionCounts.RECOVERED
                )}
                subtitle="Transactions that generated recovered revenue"
                icon="✓"
                highlight
              />

              <MetricCard
                title="Human Review"
                value={formatNumber(
                  decisionCounts.HUMAN_REVIEW
                )}
                subtitle="Cases requiring human judgment"
                icon="◉"
              />

            </div>

          </section>

          {/* DECISIONS */}

          <section
            id="section-decisions"
            className="mt-12 scroll-mt-24"
          >

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <SectionHeader
                  eyebrow="AI operations"
                  title="Recovery Decisions"
                  description="Inspect how RecoverAI diagnosed each transaction, what it recommended, and what policy allowed."
                />

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
                      onClick={() =>
                        setFilter(key)
                      }
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${filter === key
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >

                      {label}

                      <span className="ml-1 opacity-60">
                        {decisionCounts[key]}
                      </span>

                    </button>

                  ))}

                </div>
              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      {[
                        "Payment",
                        "Amount",
                        "Failure",
                        "AI Recommendation",
                        "Policy",
                        "Outcome",
                        "",
                      ].map((heading) => (

                        <th
                          key={heading}
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                        >
                          {heading}
                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredDecisions.length ===
                      0 ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No recovery decisions found.
                        </td>

                      </tr>

                    ) : (

                      filteredDecisions.map(
                        (item, index) => {

                          const executionStatus =
                            item.execution?.status ||
                            item.execution_status ||
                            "NOT_EXECUTED";

                          const policyDecision =
                            item.policy?.decision ||
                            item.policy_decision ||
                            "—";

                          const recoveredAmount =
                            Number(
                              item.execution
                                ?.recovered_amount ||
                              0
                            );

                          const confidenceRaw =
                            Number(
                              item.ai?.confidence ??
                              0
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
                              className="transition hover:bg-slate-50"
                            >

                              <td className="px-6 py-4">

                                <button
                                  onClick={() =>
                                    setSelectedDecision(
                                      item
                                    )
                                  }
                                  className="font-mono text-xs font-bold text-slate-900 hover:text-blue-600"
                                >
                                  {item.payment_id ||
                                    "—"}
                                </button>

                              </td>

                              <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                {formatINR(
                                  item.amount
                                )}
                              </td>

                              <td className="px-6 py-4">

                                <span className="text-xs font-medium text-slate-600">
                                  {String(
                                    item.failure_reason ||
                                    "—"
                                  ).replaceAll(
                                    "_",
                                    " "
                                  )}
                                </span>

                              </td>

                              <td className="px-6 py-4">

                                <p className="max-w-[220px] text-xs font-bold text-slate-800">
                                  {String(
                                    item.ai
                                      ?.recommended_action ||
                                    "—"
                                  ).replaceAll(
                                    "_",
                                    " "
                                  )}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {Math.round(
                                    confidence
                                  )}
                                  % confidence
                                </p>

                              </td>

                              <td className="px-6 py-4">
                                <StatusBadge
                                  status={
                                    policyDecision
                                  }
                                />
                              </td>

                              <td className="px-6 py-4">

                                <div className="flex flex-col items-start gap-1">

                                  <StatusBadge
                                    status={
                                      executionStatus
                                    }
                                  />

                                  {recoveredAmount >
                                    0 && (
                                      <span className="text-[10px] font-bold text-emerald-600">
                                        +
                                        {formatINR(
                                          recoveredAmount
                                        )}
                                      </span>
                                    )}

                                </div>

                              </td>

                              <td className="px-6 py-4">

                                <button
                                  onClick={() =>
                                    setSelectedDecision(
                                      item
                                    )
                                  }
                                  className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                                >
                                  View →
                                </button>

                              </td>

                            </tr>
                          );
                        }
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>

          {/* AUDIT */}

          <section
            id="section-audit"
            className="mt-12 scroll-mt-24"
          >

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">

                <SectionHeader
                  eyebrow="Traceability"
                  title="Audit Trail"
                  description="Every AI recommendation, policy decision, and execution result is recorded."
                  action={
                    <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                      {formatNumber(
                        auditLogs.length
                      )}{" "}
                      records
                    </div>
                  }
                />

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px] text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">

                    <tr>

                      {[
                        "Payment",
                        "AI Diagnosis",
                        "Recommendation",
                        "Policy",
                        "Execution",
                        "Recovered",
                      ].map((heading) => (

                        <th
                          key={heading}
                          className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400"
                        >
                          {heading}
                        </th>

                      ))}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {auditLogs.length === 0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >
                          No audit logs available.
                        </td>

                      </tr>

                    ) : (

                      auditLogs.map(
                        (log, index) => (

                          <tr
                            key={`${log.payment_id || "log"}-${index}`}
                            className="hover:bg-slate-50"
                          >

                            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                              {log.payment_id ||
                                "—"}
                            </td>

                            <td className="max-w-xs px-6 py-4 text-xs leading-5 text-slate-600">
                              <div className="line-clamp-2">
                                {log.ai_diagnosis ||
                                  "—"}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-xs font-bold text-slate-700">
                              {String(
                                log.recommended_action ||
                                "—"
                              ).replaceAll(
                                "_",
                                " "
                              )}
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

                            <td className="px-6 py-4 text-xs font-bold text-emerald-600">
                              {formatINR(
                                log.recovered_amount
                              )}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>

          {/* RUN HISTORY */}

          <section
            id="section-runs"
            className="mt-12 scroll-mt-24"
          >

            <SectionHeader
              eyebrow="Operations history"
              title="Workflow History"
              description="Every RecoverAI workflow execution is preserved so you can compare runs and verify recovery outcomes over time."
              action={
                <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
                  {formatNumber(
                    runHistory.length
                  )}{" "}
                  run
                  {runHistory.length === 1
                    ? ""
                    : "s"}
                </div>
              }
            />

            {runHistory.length === 0 ? (

              <EmptyState message="No workflow executions have been recorded yet. Click Run Recovery to create the first run." />

            ) : (

              <div className="space-y-5">

                {runHistory.map(
                  (run, index) => {

                    const runMetrics =
                      normalizeMetrics(
                        run.metrics || {}
                      );

                    const workflow =
                      run.workflow || {};

                    const isLatest =
                      index === 0;

                    const recovered =
                      runMetrics.recovered_revenue;

                    const bestRecovery =
                      runMetrics.best_recovery;

                    const approved = Number(
                      workflow.approved_actions ??
                      runMetrics.approved_actions ??
                      0
                    );

                    const executed = Number(
                      workflow.executed_actions ??
                      runMetrics.executed_actions ??
                      0
                    );

                    const human =
                      Number(
                        runMetrics.human_reviews ??
                        workflow.human_reviews ??
                        0
                      );

                    const duplicates =
                      Number(
                        runMetrics.duplicate_actions_prevented ??
                        workflow.duplicate_actions_prevented ??
                        0
                      );

                    const failed =
                      Number(
                        runMetrics.failed_recoveries ??
                        workflow.failed_recoveries ??
                        0
                      );

                    return (

                      <div
                        key={
                          run.run_id ||
                          `${run.timestamp}-${index}`
                        }
                        className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${isLatest
                            ? "border-emerald-200"
                            : "border-slate-200"
                          }`}
                      >

                        {/* RUN HEADER */}

                        <div
                          className={`border-b p-5 ${isLatest
                              ? "bg-gradient-to-r from-emerald-50 to-white"
                              : "bg-slate-50/70"
                            }`}
                        >

                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                            <div>

                              <div className="flex flex-wrap items-center gap-2">

                                <span className="font-mono text-sm font-bold text-slate-900">
                                  {run.run_id ||
                                    `Run #${runHistory.length -
                                    index
                                    }`}
                                </span>

                                {isLatest && (
                                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                    Latest
                                  </span>
                                )}

                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                  COMPLETED
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {formatDate(
                                  run.timestamp
                                )}
                              </p>

                            </div>

                            <div className="text-left sm:text-right">

                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Recovery Outcome
                              </p>

                              <p
                                className={`mt-1 text-xl font-bold ${recovered > 0
                                    ? "text-emerald-600"
                                    : "text-slate-900"
                                  }`}
                              >
                                {formatINR(
                                  recovered
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* RUN SUMMARY */}

                        <div className="p-5">

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                            <HistoryStat
                              label="Transactions"
                              value={formatNumber(
                                runMetrics.transactions_processed
                              )}
                            />

                            <HistoryStat
                              label="Revenue at Risk"
                              value={formatINR(
                                runMetrics.revenue_at_risk
                              )}
                              valueClass="text-amber-600"
                            />

                            <HistoryStat
                              label="Recovery Rate"
                              value={formatPercent(
                                runMetrics.recovery_rate_percent
                              )}
                              valueClass="text-emerald-600"
                            />

                            <HistoryStat
                              label="Automation Rate"
                              value={formatPercent(
                                runMetrics.automation_rate_percent
                              )}
                            />

                          </div>

                          {/* EXECUTION STATS */}

                          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">

                            <HistoryStat
                              label="Approved"
                              value={formatNumber(
                                approved
                              )}
                              valueClass="text-blue-600"
                            />

                            <HistoryStat
                              label="Executed"
                              value={formatNumber(
                                executed
                              )}
                              valueClass="text-emerald-600"
                            />

                            <HistoryStat
                              label="Human Reviews"
                              value={formatNumber(
                                human
                              )}
                              valueClass="text-amber-600"
                            />

                            <HistoryStat
                              label="Duplicates Prevented"
                              value={formatNumber(
                                duplicates
                              )}
                              valueClass="text-purple-600"
                            />

                            <HistoryStat
                              label="Failed"
                              value={formatNumber(
                                failed
                              )}
                              valueClass="text-red-600"
                            />

                          </div>

                          {/* BEST RECOVERY */}

                          <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">

                            <div>

                              <p className="text-xs font-bold text-slate-800">
                                Best Recovery Recorded
                              </p>

                              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                RecoverAI preserves the strongest successful
                                recovery result across workflow executions.
                              </p>

                            </div>

                            <div className="text-lg font-bold text-emerald-600">
                              {formatINR(
                                bestRecovery
                              )}
                            </div>

                          </div>

                          {/* IDEMPOTENCY */}

                          <div className="mt-4 flex items-start gap-3 rounded-xl border border-purple-100 bg-purple-50 p-4">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm text-purple-700">
                              ◇
                            </div>

                            <div>

                              <p className="text-xs font-bold text-purple-900">
                                Idempotency protection
                              </p>

                              <p className="mt-1 text-[11px] leading-5 text-purple-900/70">
                                This workflow prevented{" "}
                                <span className="font-bold">
                                  {formatNumber(
                                    duplicates
                                  )}
                                </span>{" "}
                                duplicate recovery action
                                {duplicates === 1
                                  ? ""
                                  : "s"}.
                                Previously executed actions are not
                                repeated.
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </section>

          {/* CONTROLS */}

          <section
            id="section-controls"
            className="mt-12 scroll-mt-24"
          >

            <SectionHeader
              eyebrow="Trust & safety"
              title="Safety & Controls"
              description="RecoverAI is designed so the AI can recommend actions without having unrestricted control over financial execution."
            />

            <div className="grid gap-6 lg:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="text-sm font-bold">
                  Automated Recovery Limits
                </h3>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Maximum retries
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      2
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Prevents repeated payment attempts.
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Max automated amount
                    </p>

                    <p className="mt-2 text-2xl font-bold">
                      ₹50,000
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Higher-value actions can escalate to humans.
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Duplicate protection
                    </p>

                    <p className="mt-2 text-lg font-bold text-emerald-600">
                      ✓ Enabled
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Prevents repeated execution of the same action.
                    </p>

                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Human escalation
                    </p>

                    <p className="mt-2 text-lg font-bold text-emerald-600">
                      ✓ Enabled
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      Unsafe or uncertain cases are not automated.
                    </p>

                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-slate-900 bg-slate-950 p-6 text-white shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    ◇
                  </div>

                  <div>

                    <h3 className="text-sm font-bold">
                      Control Architecture
                    </h3>

                    <p className="text-[11px] text-slate-400">
                      AI is advisory, policy is authoritative.
                    </p>

                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                    <p className="text-xs font-bold">
                      AI Layer
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Diagnoses failures and recommends the safest recovery
                      action.
                    </p>

                  </div>

                  <div className="flex justify-center text-slate-500">
                    ↓
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">

                    <p className="text-xs font-bold text-emerald-300">
                      Policy Layer
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Deterministically validates whether the action is
                      allowed.
                    </p>

                  </div>

                  <div className="flex justify-center text-slate-500">
                    ↓
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">

                    <p className="text-xs font-bold">
                      Execution + Audit
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      Executes approved actions and records the outcome.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* FOOTER */}

          <footer className="mt-12 border-t border-slate-200 py-8">

            <div className="flex flex-col justify-between gap-3 text-xs text-slate-400 sm:flex-row">

              <p>
                RecoverAI — AI Revenue Recovery Agent
              </p>

              <p>
                AI recommends. Policy validates. Code executes. Audit proves.
              </p>

            </div>

          </footer>

        </main>

      </div>

      {/* DETAIL MODAL */}

      {selectedDecision && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={() =>
            setSelectedDecision(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Recovery Decision
                </p>

                <h2 className="mt-1 font-mono text-lg font-bold">
                  {selectedDecision.payment_id ||
                    "Payment Details"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setSelectedDecision(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 hover:bg-slate-200"
              >
                ×
              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* PAYMENT */}

              <div>

                <h3 className="text-sm font-bold">
                  Payment Overview
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-4">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Amount
                    </p>

                    <p className="mt-1 font-bold">
                      {formatINR(
                        selectedDecision.amount
                      )}
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Status
                    </p>

                    <p className="mt-1 text-xs font-bold">
                      {selectedDecision.status ||
                        "—"}
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Payment Method
                    </p>

                    <p className="mt-1 text-xs font-bold">
                      {selectedDecision.payment_method ||
                        "—"}
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
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

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-sm font-semibold text-slate-800">
                    {String(
                      selectedDecision.failure_reason ||
                      "Unknown"
                    ).replaceAll(
                      "_",
                      " "
                    )}
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
                      {String(
                        selectedDecision.ai
                          ?.recommended_action ||
                        selectedDecision.recommended_action ||
                        "HUMAN_REVIEW"
                      ).replaceAll(
                        "_",
                        " "
                      )}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-purple-700">

                      {(() => {

                        const raw =
                          Number(
                            selectedDecision.ai
                              ?.confidence ??
                            selectedDecision.confidence ??
                            0
                          );

                        const percent =
                          raw <= 1
                            ? raw * 100
                            : raw;

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

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <StatusBadge
                      status={
                        selectedDecision.policy
                          ?.decision ||
                        selectedDecision.policy_decision ||
                        "HUMAN_REVIEW"
                      }
                    />

                    <span className="text-[10px] font-semibold text-slate-400">
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
                        selectedDecision
                          .execution
                          ?.recovered_amount ||
                        0
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

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Max Retries
                    </p>

                    <p className="mt-1 font-bold">
                      2
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Max Automated Amount
                    </p>

                    <p className="mt-1 font-bold">
                      ₹50,000
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-[10px] font-semibold uppercase text-slate-400">
                      Idempotency
                    </p>

                    <p className="mt-1 font-bold text-emerald-600">
                      Enabled
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">

              <p className="text-center text-xs font-semibold text-slate-500">
                AI recommends. Policy validates. Code executes.
              </p>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}