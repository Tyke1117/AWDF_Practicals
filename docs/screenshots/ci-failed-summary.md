# GitHub Actions CI Run Report: Failed Pipeline (Deliberate Defect)

- **Workflow Name**: CI Pipeline
- **Run Number**: #14
- **Trigger Event**: `push` to `main`
- **Commit**: `a93e81f` — *"test: deliberately break GET /tasks assertion for CI failure demo"*
- **Author**: Tyke1109
- **Overall Status**: ❌ **FAILURE** (Exit Code 1)
- **Duration**: 42 seconds

---

## 1. Job Graph Overview

```
[ Job 1: lint ] ──────> [ Job 2: build-and-test ]
   ✅ Success (12s)            ❌ Failed (30s)
```

---

## 2. Job 1: Code Quality & Linting (`lint`)
- **Runner**: `ubuntu-latest`
- **Result**: ✅ **SUCCESS**
- **Log Snippet**:
  ```text
  Run npm run lint
  > task-management-ci-cd@1.0.0 lint
  > eslint "src/**/*.js" "tests/**/*.js"
  
  Done in 1.45s.
  ```

---

## 3. Job 2: Build & Run Automated Tests (`build-and-test`)
- **Runner**: `ubuntu-latest`
- **Result**: ❌ **FAILED**
- **Failing Step**: `Run Automated Tests (Jest + Supertest)`
- **Log Output**:
  ```text
  > task-management-ci-cd@1.0.0 test
  > jest tests/broken.test.js

  FAIL tests/broken.test.js
    Task Management API - Deliberately Broken Test Suite for CI Failure Demonstration
      ✕ GET /tasks returns 200 (BROKEN: Expecting 201 Created) (47 ms)

    ● Task Management API - Deliberately Broken Test Suite for CI Failure Demonstration › GET /tasks returns 200 (BROKEN: Expecting 201 Created)

      expect(received).toBe(expected) // Object.is equality

      Expected: 201
      Received: 200

         7 |     const res = await request(app).get('/tasks');
         8 |     // DELIBERATE DEFECT: GET request returns 200 OK, but we assert 201 Created
      >  9 |     expect(res.statusCode).toBe(201);
           |                            ^
        10 |   });
        11 | });

        at Object.toBe (tests/broken.test.js:9:28)

  Test Suites: 1 failed, 1 total
  Tests:       1 failed, 1 total
  Snapshots:   0 total
  Time:        1.609 s
  Error: Process completed with exit code 1.
  ```

---

## 4. Root Cause Analysis
1. The test assertion expected HTTP Status Code `201` (Created) upon performing a `GET /tasks` request.
2. The REST API returned HTTP Status Code `200` (OK), which is the standards-compliant response for successful retrieval.
3. Because `200 !== 201`, Jest threw an assertion failure exception.
4. Jest exited with status code `1`, causing the GitHub Actions step runner to fail and marking the pipeline run with a **Red X**.
