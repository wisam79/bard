# CONTRIBUTING.md - Bard POS

## Getting Started

### Prerequisites
- Go 1.24.0+
- Node.js 18+
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Development Setup
```bash
# Install dependencies
cd frontend && npm install

# Run in development mode
wails dev
```

## Code Style

### Backend (Go)
- Follow Clean Architecture: Domain → Repository → Service → Handler
- Every bound method returns `(data, error)`
- Use `domain.AppError` for all errors
- No `panic` or `log.Fatal`
- Use transactions for multi-table operations
- Validate ALL inputs in the service layer
- Add godoc comments to exported functions

### Frontend (TypeScript)
- Mirror Go domain types exactly in `types/index.ts`
- Use ONLY Wails bindings (`@/wailsjs/go/...`)
- Every backend call in try/catch
- Business logic in Go, not frontend
- No `any` types
- RTL by default, Arabic first

## Testing

### Backend
```bash
go test ./... -v -count=1
```
- Table-driven tests for multiple scenarios
- Mock repositories for isolation
- Test: happy path, validation errors, edge cases

### Frontend
```bash
cd frontend && npm run test:ci
```
- Test components, hooks, and stores
- Use Arrange-Act-Assert pattern

### E2E
```bash
cd frontend && npx playwright test
```
- Test complete workflows (login, sale, CRUD)

## Pull Request Process

1. Ensure all tests pass
2. Run linters: `golangci-lint run` + `npm run lint`
3. Update documentation if needed
4. Follow the feature request workflow in `agent.md`

## Commit Messages

Format: `type: description`

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat: add purchase order receive with transactional stock update`
- `fix: prevent debt field overwrite on partial customer update`
- `test: add SaleService unit tests for installment calculation`
