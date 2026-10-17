# Practical 12 Lab Report: CI/CD Pipeline with GitHub Actions

**Course**: Application Workflows & Development Frameworks (AWDF)  
**Practical**: Practical 12  
**Title**: CI/CD Pipeline with GitHub Actions  
**CO/PO Mapping**: CO5 / PO3, PO5  
**Date**: September 24, 2026  
**Student Name / GitHub**: Tyke1109  

---

## 1. Objective
To automate the testing, linting, and continuous integration of a container-ready Task Management application using a **GitHub Actions CI/CD pipeline**, demonstrating automated dependency installation, test execution on code triggers, failure diagnosis from continuous integration logs, and subsequent automated recovery upon bug resolution.

---

## 2. Theory Concepts & Coursera Pointer Reference

### Reference: Week 12 GitHub Actions Masterclass (Packt)
- **Module 1: Workflow Basics, Triggers, Jobs, and Steps**:
  - **Workflow**: An automated configurable process composed of one or more jobs defined in YAML files within the `.github/workflows/` directory.
  - **Triggers (`on`)**: Specific repository events (e.g., `push`, `pull_request`, `schedule`, `workflow_dispatch`) that prompt GitHub to execute the workflow.
  - **Jobs**: Independent units composed of sequential steps running inside an isolated virtual container or VM (e.g., `ubuntu-latest`). By default, jobs run concurrently unless sequential ordering is enforced via `needs`.
  - **Steps**: Individual execution tasks within a job that either run shell commands (`run`) or invoke reusable marketplace actions (`uses`, such as `actions/checkout@v4` or `actions/setup-node@v4`).
- **Module 2: CI/CD Pipeline Setup & Automated Testing on Push**:
  - Setting up node runner environments (`actions/setup-node@v4` with dependency caching).
  - Executing headless automated test suites (`Jest`, `Supertest`) in a deterministic CI sandbox.
  - Establishing feedback loops where pull requests and commits are blocked from merging if quality gates (linting or tests) fail.

---

## 3. Architecture & Flow Diagram

### CI/CD Workflow Execution Diagram

```
                              git push origin main
                                       │
                                       ▼
                    GitHub Actions Trigger (on: push, on: pull_request)
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
          [Job 1: lint]                              [Job 2: build-and-test]
          ├── Checkout code                          (depends on: lint via `needs`)
          ├── Setup Node.js 18                       ├── Checkout code
          ├── npm ci / npm install                   ├── Setup Node.js 18
          └── Run ESLint                             ├── npm ci / npm install
                     │                               ├── Run Jest + Supertest
                     ├──────────────┬────────────────┴───┐
                     ▼              ▼                    ▼
                Lint Error    Tests Pass            Test Failure
                     │              │                    │
                     ▼              ▼                    ▼
                ❌ Red X       ✅ Green Checkmark    ❌ Red X
              (Build Halted)  (Ready to Deploy)    (PR Blocked)
```

### Visual Dashboard Evidence

![GitHub Actions Visual Dashboard](docs/screenshots/pipeline-status.svg)

---

## 4. Key Questions & In-Depth Technical Analysis

### Q1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical actually demonstrate?

**Analysis & Distinction**:
1. **Continuous Integration (CI)**:
   - **Definition**: The software engineering practice where developers frequently merge code changes into a central repository (often multiple times per day). Each integration is automatically verified by an automated build and automated test suite.
   - **Primary Goal**: Detect integration bugs, syntax errors, and regressions as early as possible (shifting quality verification left in the lifecycle).
   - **Key Artifacts / Steps**: Linting, compiling/building, dependency validation, unit testing, and integration testing.

2. **Continuous Deployment (CD)**:
   - **Definition**: The subsequent phase where every change that successfully passes all stages of the CI pipeline is automatically released into a staging or live production environment without manual intervention. (Distinct from *Continuous Delivery*, where code is kept in a deployable state but the deployment itself requires human approval).
   - **Primary Goal**: Minimize lead time between writing a feature and delivering it to end users safely.
   - **Key Artifacts / Steps**: Container image builds (Docker), pushing to container registries (Docker Hub/GHCR), infrastructure provisioning, database migrations, and rolling updates to Kubernetes or cloud providers (AWS, Azure, Render).

**Which one does this practical demonstrate?**:
- This practical **specifically demonstrates Continuous Integration (CI)**.
- **Justification**: The pipeline triggers on repository events (`push` and `pull_request` to `main`), checks out the source code, prepares the Node.js runtime environment, installs external dependencies (`npm install`), executes linting checks, and runs an automated regression test suite using Jest and Supertest. The pipeline concludes with a clear pass/fail status (Green checkmark vs. Red X) without initiating deployment to a hosting target or container registry.

---

### Q2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?

**Analysis & Benefits**:
1. **Immediate Feedback & Reduced Blast Radius**:
   - When tests execute automatically on every individual push, developers receive immediate feedback within 1 to 2 minutes of committing code.
   - The bug is isolated directly to the specific commit or PR just authored, eliminating the need to comb through weeks of accumulated changes across multiple developers.
2. **Preventing Broken Baselines ("Works On My Machine" Fallacy)**:
   - Automated CI runs on neutral, standardized virtual runners (`ubuntu-latest`) with fresh environments. It flags missing configuration variables, undeclared dependencies in `package.json`, and OS-specific path issues that local developer machines frequently conceal.
3. **Exponential Cost Reduction**:
   - In software engineering economics (Boehm's Curve), resolving a bug identified within minutes of authoring costs up to **10x to 100x less** than discovering the same defect during pre-release staging or post-release production outages.
4. **Enforcing Team Quality Gates**:
   - Automated testing on push prevents defective code from ever merging into the shared `main` branch, ensuring that other developers never pull broken master branches that block team productivity.

---

### Q3: What would happen to the pipeline if the test file path were incorrect — would the workflow fail at the same step as a genuine test failure?

**Analysis & Diagnostic Breakdown**:
1. **Execution Step Comparison**:
   - **Yes, the workflow fails at the *same overall step*** (`Run tests` / `npm test`), because both scenarios cause the test runner executable (`jest`) to exit with a non-zero exit code (`exit code 1`).
2. **Critical Differences in Failure Mode and Root Cause**:
   - **Scenario A: Incorrect Test File Path (e.g., `jest tests/invalid-path.test.js`)**:
     - Jest searches for files matching the regex or glob pattern and finds **0 matching test suites**.
     - Jest outputs:
       ```text
       No tests found related to files changed since last commit.
       Pattern: tests/invalid-path.test.js - 0 matches
       Error: Process completed with exit code 1.
       ```
     - Alternatively, if run without fallback flags, Jest aborts before compilation because the target specification is invalid.
   - **Scenario B: Genuine Test Failure (e.g., `expect(res.statusCode).toBe(201)` when API returns 200)**:
     - Jest successfully locates, loads, and executes the test files.
     - The Express server responds to HTTP requests via Supertest.
     - Jest reaches an assertion check, detects a divergence between expected and actual values, prints a colored assertion diff (`Expected: 201`, `Received: 200`), and reports:
       ```text
       FAIL tests/tasks.test.js
       ✕ GET /tasks returns 200 (BROKEN: Expecting 201 Created)
       Test Suites: 1 failed, 1 total
       Tests:       1 failed, 1 total
       ```
3. **Pipeline Diagnostic Significance**:
   - While GitHub Actions displays a Red X in both cases at the `Run tests` step, inspecting the console output instantly reveals whether the failure was an **infrastructure/configuration mistake** (file path not found) or a **functional regression** (code logic broken).

---

## 5. Implementation of Supplementary Problems

### Supplementary Problem 1: Second Job Running a Linter (ESLint) Before the Test Job

- **Requirement**: Add a separate job to the workflow that runs a linter before the test job runs.
- **Implementation**:
  1. Configured `.eslintrc.json` with standard Node.js/CommonJS rules.
  2. Created an independent `lint` job in `.github/workflows/ci.yml`.
  3. Added `needs: lint` to the `build-and-test` job so that testing is only triggered if linting passes completely.

```yaml
jobs:
  lint:
    name: Code Quality & Linting
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      - name: Setup Node.js 18
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - name: Install Dependencies
        run: npm ci || npm install
      - name: Run ESLint
        run: npm run lint

  build-and-test:
    name: Build & Run Automated Tests
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
      ...
```

---

### Supplementary Problem 2: Configure Workflow to Run Only on Pull Requests Targeting Main

- **Requirement**: Configure the workflow to trigger only on pull requests targeting `main`, rather than on direct branch pushes.
- **Workflow Trigger Configuration**:
  ```yaml
  name: CI Pipeline (PR Only)
  on:
    pull_request:
      branches: [main]
  ```
- **Explanation**: This ensures that developers can push exploratory commits to feature branches without consuming GitHub Actions runner minutes until they officially submit a Pull Request targeting the production baseline (`main`).

---

### Supplementary Problem 3: Add Status Badge to README Reflecting Current Pipeline Status

- **Requirement**: Add a dynamic status badge in `README.md` that reflects real-time CI status.
- **Implementation**:
  ```markdown
  [![CI Pipeline](https://github.com/Tyke1109/task-management-ci-cd/actions/workflows/ci.yml/badge.svg)](https://github.com/Tyke1109/task-management-ci-cd/actions/workflows/ci.yml)
  ```
- **Status States**:
  - `passing` (Green pill): Latest workflow on `main` succeeded.
  - `failing` (Red pill): Latest workflow on `main` failed.
  - `no status` (Grey pill): Workflow has not executed yet.

---

## 6. Student Assignment / Post Laboratory Work

### Task 1: Second Automated Test Covering a Different Endpoint (`POST /tasks`)
- **Implemented in `tests/tasks.test.js`**:
```javascript
test('POST /tasks creates a new task and returns 201', async () => {
  const newTaskPayload = {
    title: 'Configure GitHub Actions Workflow',
    completed: false
  };

  const res = await request(app)
    .post('/tasks')
    .send(newTaskPayload)
    .set('Accept', 'application/json');

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body.title).toBe('Configure GitHub Actions Workflow');
  expect(res.body.completed).toBe(false);

  // Verify task persistence
  const fetchRes = await request(app).get('/tasks');
  expect(fetchRes.body.some(t => t.title === 'Configure GitHub Actions Workflow')).toBe(true);
});
```

### Task 2: Status Badge Added to Project README
- Verified in `README.md` with links directly referencing the GitHub Actions workflow path.

---

## 7. Demonstration of Pipeline Failure and Resolution

### Step 5: Deliberately Broken Test (Failure Demonstration)
- **Defect Introduced**: Modified `tests/broken.test.js` where `GET /tasks` expects status `201 Created`:
  ```javascript
  test('GET /tasks returns 200 (BROKEN: Expecting 201 Created)', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(201); // BUG: 200 expected
  });
  ```
- **Execution Log Output**:
  ```text
  > task-management-ci-cd@1.0.0 test:broken
  > jest tests/broken.test.js

  FAIL tests/broken.test.js
    ✕ GET /tasks returns 200 (BROKEN: Expecting 201 Created) (47 ms)

    ● GET /tasks returns 200 (BROKEN: Expecting 201 Created)
      expect(received).toBe(expected) // Object.is equality
      Expected: 201
      Received: 200

       9 |     expect(res.statusCode).toBe(201);
         |                            ^
      at Object.toBe (tests/broken.test.js:9:28)

  Test Suites: 1 failed, 1 total
  Tests:       1 failed, 1 total
  Error: Process completed with exit code 1.
  ```
- **GitHub Status**: Workflow halted with **Red X**. Pull Request merge button disabled.

### Step 6: Fix the Test and Restore Green Pipeline
- **Correction Applied**: Restored `tests/tasks.test.js` assertion to expect status `200`:
  ```javascript
  test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  ```
- **Execution Log Output**:
  ```text
  > task-management-ci-cd@1.0.0 test
  > jest --runInBand

  PASS tests/tasks.test.js
    Task Management API Test Suite
      ✓ GET /tasks returns 200 (51 ms)
      ✓ POST /tasks creates a new task and returns 201 (555 ms)
      ✓ GET /tasks/:id returns 200 and task details for valid ID (21 ms)
      ✓ GET /tasks/:id returns 404 for non-existent ID (14 ms)
      ✓ POST /tasks returns 400 when title is missing or empty (8 ms)
      ✓ PUT /tasks/:id updates existing task and returns 200 (10 ms)
      ✓ DELETE /tasks/:id deletes task and returns 200 (35 ms)

  Test Suites: 1 passed, 1 total
  Tests:       7 passed, 7 total
  Time:        25.644 s
  ```
- **GitHub Status**: All jobs passed. Pipeline turns **Green Checkmark**.

---

## 8. Troubleshooting Guide

| Symptom | Likely Cause | Solution / Fix |
|---|---|---|
| Workflow does not appear under Actions tab | File not located at `.github/workflows/` or has incorrect extension | Confirm file is `.github/workflows/ci.yml`, committed and pushed to remote. |
| Workflow fails immediately with YAML syntax error | Incorrect indentation in YAML file | YAML requires consistent 2-space indentation; never use tab characters. |
| `npm test` fails with `'no test specified'` | `package.json` test script not configured | Ensure `"scripts": { "test": "jest" }` is defined in `package.json`. |
| Pipeline passes even with broken test | Test logic does not make active assertions | Ensure test returns a promise (`async/await`) and uses explicit `expect(...)` matchers. |
| Port in use error when running Jest with Supertest | Express calls `app.listen()` inside test environment | Export `app` without listening if `process.env.NODE_ENV === 'test'`. |

---

## 9. Evaluation Rubrics Self-Assessment

| Criteria (Marks) | Max | Score | Justification / Evidence |
|---|:---:|:---:|---|
| **Conceptual Understanding (2 Marks)** | 2 | 2 | In-depth technical breakdown of CI vs CD, shift-left testing principles, and execution step failure modes. |
| **Implementation (4 Marks)** | 4 | 4 | Complete Node.js/Express API with CRUD, Jest & Supertest test suites, ESLint linter, and multi-job GitHub Actions workflow YAML. |
| **Correctness (2 Marks)** | 2 | 2 | 100% test pass rate across 7 endpoint assertions; verified exit codes for both failed and passed runs. |
| **Reflection (1 Mark)** | 1 | 1 | Clear error logs documented for deliberate test failure with root cause analysis and resolution workflow. |
| **Lab File Evidence (1 Mark)** | 1 | 1 | Structured project with `ci.yml`, visual execution diagrams, status badges, and thorough Markdown documentation. |
| **TOTAL** | **10** | **10** | **Passing Threshold: 5 / 10 (50%)** |
