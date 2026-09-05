````markdown
# RecoverAI — AI Revenue Recovery Agent

RecoverAI is an AI-powered revenue recovery system designed to identify failed or at-risk payments, diagnose the reason for revenue loss, recommend the safest recovery action, validate that action against business policies, execute it, and maintain a complete audit trail.

---

## 🎯 Problem

Payment failures and abandoned transactions create significant revenue leakage.

Traditional recovery systems often rely on fixed retry rules and do not consider:

- Failure reason
- Payment history
- Retry count
- Transaction value
- Risk level
- Whether automated recovery is safe

RecoverAI addresses this by combining **AI decision-making with deterministic policy enforcement**.

---

## 💡 Solution

RecoverAI follows a controlled recovery pipeline:

**Detect → Diagnose → Validate → Execute → Audit**

The AI recommends an appropriate recovery action, while a separate policy engine determines whether that action is actually allowed.

The AI never directly controls money movement.

### Core Principle

> **AI recommends. Policy decides. Code executes. Audit proves.**

---

## 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │     Transactions    │
                    │      CSV / Data     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Risk Engine     │
                    │   Revenue-at-Risk   │
                    │  Risk Classification│
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     AI Decision     │
                    │  Diagnosis + Action │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Policy Engine    │
                    │  Limits + Guardrails│
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                     ▼                   ▼
              ┌──────────────┐    ┌──────────────┐
              │   Executor   │    │ Human Review │
              │              │    │ High-risk    │
              │ Retry        │    │ cases        │
              │ Reminder     │    └──────────────┘
              │ Alternative  │
              │ Card Update  │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────────────┐
              │ Audit + Idempotency  │
              │ Execution History    │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Metrics Dashboard  │
              │ Revenue Recovered    │
              │ Recovery Rate        │
              │ Automation Rate      │
              └──────────────────────┘
````

---

## 🤖 AI Decision Layer

For every recovery candidate, RecoverAI evaluates:

* Payment status
* Failure reason
* Retry history
* Transaction amount
* Risk level

The AI can recommend actions such as:

* `RETRY_PAYMENT`
* `SEND_PAYMENT_REMINDER`
* `REQUEST_ALTERNATIVE_PAYMENT`
* `REQUEST_CARD_UPDATE`
* `HUMAN_REVIEW`

A deterministic policy engine independently validates the recommendation before execution.

This creates a separation between **AI intelligence and financial execution**.

---

## 🛡️ Safety & Guardrails

RecoverAI uses deterministic controls around AI decisions.

### Current Policies

| Policy                    |        Limit |
| ------------------------- | -----------: |
| Maximum automated retries |            2 |
| Maximum automated amount  |      ₹50,000 |
| Configured reminder limit |            2 |
| High-risk escalation      | Human review |
| Duplicate actions         |      Blocked |

The policy engine can block or escalate an AI recommendation even when the AI recommends an automated action.

### Why this matters

An AI model should not have unrestricted authority over financial actions.

RecoverAI therefore uses:

```text
AI Recommendation
       ↓
Policy Validation
       ↓
Approved / Blocked / Human Review
       ↓
Execution
```

---

## 🔁 Idempotency

Recovery actions are protected using an idempotency key:

```text
payment_id + action
```

If the same recovery action is attempted again, RecoverAI prevents duplicate execution.

This is particularly important for payment APIs where a timeout does not necessarily mean the payment failed.

Instead of assuming:

```text
API Timeout = Payment Failed
```

RecoverAI treats uncertain execution states carefully and uses idempotency to prevent accidental duplicate recovery actions.

---

## 📊 Current Demo Results

A sample recovery run processes **120 recovery candidates**.

| Metric                               |     Result |
| ------------------------------------ | ---------: |
| Payments analyzed                    |        120 |
| Revenue at risk                      | ₹31,96,779 |
| Revenue recovered                    |  ₹8,26,946 |
| Recovery rate                        |     25.87% |
| Automation rate                      |     70.83% |
| Automated executions                 |         85 |
| Human reviews                        |         35 |
| Recovered transactions               |         36 |
| Additional recovery actions executed |         49 |
| Failed recoveries                    |          0 |
| Duplicate actions prevented          |          0 |

### Latest Demo Run

```text
Run ID: run_20260905113536992550

Transactions processed: 120
Approved actions: 85
Executed actions: 85
Human reviews: 35

Revenue at risk: ₹31,96,779
Revenue recovered: ₹8,26,946

Recovery rate: 25.87%
Automation rate: 70.83%

Failed recoveries: 0
Duplicate actions prevented: 0
```

This run demonstrates the complete RecoverAI workflow from risk detection through policy validation, controlled execution, audit logging, and revenue measurement.

### Recovery Impact

```text
Revenue at Risk

₹31,96,779
     │
     ├── Recovered
     │   ₹8,26,946
     │
     └── Remaining Risk
         ₹23,69,833
```

### Recovery Result

**₹8,26,946 recovered from ₹31,96,779 identified revenue risk.**

---

## 🧮 Metrics

### Recovery Rate

```text
                 Recovered Revenue

Recovery Rate = ─────────────────── × 100

                  Revenue at Risk
```

Current demo:

```text
₹8,26,946

────────── × 100 = 25.87%

₹31,96,779
```

### Automation Rate

```text
                 Automated Actions Executed

Automation Rate = ─────────────────────────── × 100

                  Recovery Candidates Processed
```

Current demo:

```text
85

──── × 100 = 70.83%

120
```

The automation rate measures the percentage of recovery candidates for which RecoverAI successfully executed an approved automated recovery action.

---

## 🔄 Recovery Workflow

RecoverAI processes each recovery candidate through the following stages:

### 1. Detect

Identify failed, pending, or otherwise at-risk transactions.

### 2. Diagnose

Analyze payment status, failure reason, retry history, transaction amount, and risk.

### 3. Recommend

The AI recommends the safest recovery action.

### 4. Validate

The policy engine checks whether the recommended action is allowed.

### 5. Execute

Approved actions are executed through the recovery executor.

### 6. Escalate

Unsafe or high-risk cases are sent for human review.

### 7. Audit

Every decision and execution result is recorded.

### 8. Measure

RecoverAI calculates revenue recovered, recovery rate, automation rate, and other business metrics.

---

## 🧠 AI + Deterministic Control

RecoverAI intentionally does **not** allow the AI model to directly execute financial actions.

Instead:

```text
                  ┌─────────────────┐
                  │       AI        │
                  │                 │
                  │ Diagnose        │
                  │ Recommend       │
                  │ Explain         │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Policy Engine  │
                  │                 │
                  │ Limits          │
                  │ Guardrails      │
                  │ Risk Controls   │
                  └────────┬────────┘
                           │
                      ┌────┴────┐
                      │         │
                      ▼         ▼
                   Execute   Human Review
```

This makes the system safer and easier to audit.

---

## 🧰 Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript

### Backend

* Python
* FastAPI
* REST APIs

### AI

* Google Gemini API
* Structured AI decision generation
* Deterministic fallback decisions

### Data & Storage

* CSV transaction dataset
* JSON audit logs
* JSON run state
* Idempotency store
* Workflow history

### Development Tools

* VS Code
* Git
* GitHub
* Postman

---

## 📁 Project Structure

```text
recoverai/
│
├── backend/
│   ├── .venv/
│   └── app/
│       ├── main.py
│       ├── risk_engine.py
│       ├── ai_decision.py
│       ├── policy_engine.py
│       ├── executor.py
│       ├── workflow.py
│       ├── metrics.py
│       ├── audit.py
│       ├── idempotency.py
│       └── run_store.py
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── ai/
│   └── generate_transactions.py
│
├── data/
│   ├── transactions.csv
│   ├── audit_log.json
│   ├── latest_run.json
│   ├── run_history.json
│   └── processed_actions.json
│
├── README.md
└── .gitignore
```

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/chantiprasad/recoverai.git
cd recoverai
```

### 2. Start the Backend

Open a terminal:

```powershell
cd backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

### 3. Start the Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

---

## 🔑 Environment Variables

If Gemini AI is enabled, configure the API key in the backend environment.

Example:

```text
GEMINI_API_KEY=your_api_key_here
```

 

---

## 🔄 Demo Flow

The recommended demonstration flow is:

```text
Open Dashboard
      ↓
Show Revenue at Risk
      ↓
Run Recovery Workflow
      ↓
Analyze Transactions
      ↓
AI Diagnoses Failures
      ↓
AI Recommends Recovery Actions
      ↓
Policy Engine Validates Actions
      ↓
Approved Actions Execute
      ↓
Unsafe Cases → Human Review
      ↓
Audit Trail Updated
      ↓
Metrics Calculated
      ↓
Revenue Recovered Displayed
```

### Live Demo

1. Open the RecoverAI dashboard.
2. Show the current revenue-at-risk amount.
3. Run the recovery workflow once.
4. Show the recovery result and business metrics.
5. Open **Recovery Insights** to show failure patterns and recommended actions.
6. Open **Recovery Decisions** to show individual AI decisions and execution results.
7. Open **Audit Trail** to demonstrate traceability.
8. Open **Workflow History** to show the preserved workflow execution.
9. Open **Safety & Controls** to demonstrate policy limits and idempotency protection.

> For the submitted demo dataset, the workflow should be executed once to establish the baseline run. Subsequent executions are protected by idempotency and may show duplicate actions being prevented.

---

## 📋 Recovery Decisions

The dashboard provides visibility into individual recovery decisions.

Each decision contains information such as:

* Payment ID
* Customer ID
* Transaction amount
* Failure reason
* Risk level
* AI diagnosis
* Recommended action
* Policy decision
* Execution status
* Recovered revenue

Example workflow:

```text
Payment Failed
      ↓
Risk Assessment
      ↓
AI Diagnosis
      ↓
AI Recommendation
      ↓
Policy Validation
      ↓
Approved
      ↓
Recovery Executed
      ↓
Result Recorded
```

---

## 🧾 Audit Trail

Every recovery candidate is recorded in the audit trail.

The audit information includes:

* Transaction information
* AI diagnosis
* AI recommendation
* Policy decision
* Execution result
* Recovered amount
* Timestamp
* Idempotency information

This provides traceability for every automated decision.

---

## 🔐 Design Principle

RecoverAI follows a simple principle:

> **AI recommends. Policy decides. Code executes. Audit proves.**

This prevents the AI model from directly controlling payment execution.

The architecture intentionally separates:

```text
Intelligence

     +

Safety

     +

Execution

     +

Measurement
```

---

## 💰 Business Impact

The goal of RecoverAI is not simply to generate AI responses.

The primary business metric is:

> **How much revenue did the system actually recover?**

For the current demo dataset:

```text
Revenue at Risk        ₹31,96,779

Revenue Recovered       ₹8,26,946

Remaining Risk         ₹23,69,833

Recovery Rate              25.87%
```

This turns the AI system into a measurable business workflow rather than a simple chatbot.

---

## 🚨 Failure Handling

RecoverAI is designed to handle different payment failure scenarios.

Examples include:

### Network Timeout

A timeout does not automatically mean the payment failed.

The system avoids blindly retrying and uses idempotency to prevent duplicate actions.

### Retry Limit Reached

If the transaction has already reached the maximum retry limit:

```text
→ Human Review
```

### High Transaction Amount

If the transaction exceeds the automated recovery limit:

```text
→ Human Review
```

### Duplicate Action

If the same payment/action combination has already been processed:

```text
→ Block Duplicate
```

### Unsafe AI Recommendation

If the AI produces an unsupported action:

```text
→ Block
```

---

## 🎯 Why RecoverAI?

RecoverAI is not simply an AI chatbot for payment failures.

It is an end-to-end revenue recovery workflow where AI is combined with:

* Risk scoring
* AI diagnosis
* Action recommendation
* Policy enforcement
* Controlled execution
* Idempotency
* Human escalation
* Auditability
* Revenue measurement

The system connects AI intelligence to a measurable business outcome:

**Revenue recovered.**

---

## 🚀 Future Improvements

### Payment Integration

* Connect to real Razorpay payment APIs
* Real payment status verification
* Payment webhooks
* Real-time recovery triggers

### Infrastructure

* PostgreSQL for production data
* Redis for distributed idempotency
* Message queues for asynchronous recovery
* Production-grade logging and monitoring

### Customer Communication

* Email recovery workflows
* WhatsApp payment reminders
* SMS notifications
* Personalized recovery messages

### AI Improvements

* Recovery strategy optimization
* Revenue recovery prediction
* Customer-level recovery scoring
* A/B testing of recovery strategies
* Learning from historical recovery outcomes

### Operations

* Human approval dashboard
* Recovery campaign management
* Advanced analytics
* Production observability
* Role-based access control

---

## 🏆 Project Vision

RecoverAI aims to evolve from a batch-based recovery prototype into a real-time autonomous revenue recovery platform.

The long-term vision is:

```text
Payment Event
      ↓
Risk Detection
      ↓
AI Diagnosis
      ↓
Policy Validation
      ↓
Safe Automated Recovery
      ↓
Human Escalation When Needed
      ↓
Execution Verification
      ↓
Revenue Measurement
      ↓
Continuous Optimization
```

The system continuously answers three important questions:

1. **What revenue is at risk?**
2. **What is the safest action to recover it?**
3. **How much revenue did we actually recover?**

---