# Go Hook Commands

Use this reference when the repository contains `go.mod` or `go.work`.

## Lightweight checks

Good `pre-commit` candidates:

```bash
gofmt -w .
go test ./... -run TestName -count=1
```

Prefer checking staged formatting through the repository's existing formatter or
Makefile target if one exists. Avoid adding network-heavy dependency downloads
to `pre-commit`.

## Pre-push quality gate

If `product-unit-test-init` has configured report generation, use the confirmed
coverage command as a `pre-push` candidate:

```bash
bash init_test_env.sh
# or
make coverage
```

Expected artifacts:

- `junit.xml`
- `reports/coverage.xml`

If those artifacts are missing, route to `product-unit-test-init`. If tests fail
or coverage is low, route to `product-unit-test-generator`.
