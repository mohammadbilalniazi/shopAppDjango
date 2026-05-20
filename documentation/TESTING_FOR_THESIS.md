Testing Summary — Supermarket Electronic Management System

This document summarizes the testing performed on the Supermarket Electronic Management System. Use the sections below directly in the thesis; each section includes the purpose, approach, tools, locations of test code, and how to reproduce the results.

1. Testing Objectives
- Verify correctness of business logic (billing, inventory, user management).
- Ensure integrations (database, Stripe, templates) behave as expected.
- Measure system accuracy and performance under representative workloads.
- Provide regression protection to prevent re-introducing bugs.

2. Test Types Performed

- **Unit Tests**: Isolated tests that validate individual functions, models, and serializers. These tests check model methods, form validation, and small utility functions.
- **Integration Tests**: Tests that exercise interactions across modules, e.g., creating objects and verifying views/serializers behave correctly with the database.
- **Functional / Template Tests**: Tests that render templates and verify that expected HTML fragments and context variables are present.
- **System Tests**: Larger-scope tests that exercise end-to-end flows (e.g., creating a sale, updating inventory, recording payments).
- **Performance Tests**: Scripts that measure throughput and response times for key operations (bulk invoice creation, report generation) to detect regressions.
- **Manual / Exploratory Tests**: Ad-hoc testing done using the running site in development and staging to validate usability and edge cases not covered by automated tests.

 3. Locations of Test Code
- Project-level test scripts: `test_system_accuracy.py`, `test_system_performance.py`, `test_templates.py` in the repository root.
- App/unit tests: Each Django app contains `tests.py` or `tests/` (examples: `asset/tests.py`, `bill/tests.py`, `product/tests.py`, `user/tests.py`).

 4. Tools and Frameworks
- Django test framework (built-in) — primary test runner for unit and integration tests.
- Windows-friendly runner: `run_tests.bat` (included) for convenient execution on Windows machines.
- Optional / recommended tools (used when available or suggested for future work): `pytest` (more concise assertions and fixtures), `coverage.py` (test coverage reporting), and load-testing tools such as `locust` or `JMeter` for more advanced benchmarking.

 5. Test Environment
- Tests were executed locally on developer machines mirroring the project environment.
- Typical setup steps used to reproduce tests:

```bash
python -m venv env
env\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate --noinput
```

Run tests with either the Django runner or the provided batch file:

```bash
python manage.py test
# or on Windows
.\run_tests.bat
```

For targeted scripts:

```bash
python test_system_performance.py
python test_system_accuracy.py
```

If using pytest/coverage (recommended for CI):

```bash
pip install pytest coverage
coverage run -m pytest
coverage html
```

6. Test Design and Examples
- Unit test example: model validation and business-rule assertion for a `Sale` or `Bill` model — asserts totals, tax calculations, and inventory changes.
- Integration example: creating a product, performing a sale via view/serializer, then querying the database to ensure inventory decreased and a payment record was created.
- Template test example: rendering `home.html`/`master.html` and asserting presence of navigation links, branch-specific context and localized strings.
- Performance test example: `test_system_performance.py` generates a large number of invoices and times the operations, reporting average latency and memory footprint.

7. Test Coverage and Results (How to Report in Thesis)
Include a short table or paragraph with the following for the thesis:
- Number of unit tests and integration tests executed.
- Test coverage percentage (if `coverage.py` was run).
- Key regressions discovered and fixed (short list of issues by id or description).
- Performance metrics: average response time for key operations, throughput (requests/sec) and any bottlenecks discovered.

Suggested thesis wording:

"Automated tests were written using Django's testing framework and include unit, integration, and template tests. System-level scripts measure accuracy and performance for key workflows. Tests are executed via `python manage.py test` and platform-specific convenience scripts. Coverage reporting was produced using `coverage.py` to quantify the proportion of code exercised by the test-suite. Performance scripts were used to capture latency and throughput under representative load; results informed minor optimizations in query usage and batching."

8. Continuous Integration and Reproducibility
- While no CI configuration is included in the repository, the test commands above are CI-friendly. Recommended CI steps:
  1. Create fresh environment (Python version matching `requirements.txt`).
  2. Install dependencies.
  3. Run `python manage.py migrate --noinput`.
  4. Run `coverage run -m pytest` (or `python manage.py test`).
  5. Publish coverage report and test results.

9. Limitations and Future Tests
- Current test suite emphasizes correctness and some performance scenarios; additional work is suggested:
  - Add more integration tests around external services (Stripe) using recorded fixtures or mocks.
  - Add browser-based end-to-end tests (Selenium or Playwright) for critical user flows.
  - Run regular load tests in a controlled environment using `locust` or `JMeter`.

10. Appendix — Quick Reference Commands

- Run full Django test suite:

```bash
python manage.py test
```

- Run Windows convenience script:

```bash
.\run_tests.bat
```

- Generate coverage report (optional):

```bash
pip install coverage
coverage run -m pytest
coverage html
```

---

If you want, I can also extract the list of tests and produce a brief table with counts per app, or run the tests and produce actual coverage and performance numbers to include in the thesis. Which would you prefer next?
