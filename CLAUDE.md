# Project Rules

## Stack

- **Frontend:** Vite + React SPA, Tailwind v4, Orval (API client generation)
- **Deployment:** Caddy
- **App location:** `apps/web/`

## Coding Rules

### Async Error Handling

Always use `try/catch` for async error handling. Never use `.then()` or `.catch()` chaining.

```ts
// Good
try {
  const data = await fetchSomething();
} catch (err) {
  // handle error
}

// Bad
fetchSomething().then(data => ...).catch(err => ...);
```

This applies everywhere in the codebase — frontend, API, scraper, etc.

### Function Style

Always use `const` arrow functions. Never use the `function` keyword.

```ts
// Good
const myFunction = () => { ... };
const MyComponent = () => <div />;

// Bad
function myFunction() { ... }
function MyComponent() { return <div />; }
```

This applies everywhere in the codebase — components, utilities, handlers, etc.

### Testing

Every new feature or service must include tests. Use **Vitest** across the whole monorepo.

**Backend** (`apps/api`): test service-layer logic by mocking `@pronolol/database` with `vi.mock()`. Cover the main happy path plus key edge cases (empty input, null values, partial updates).

**Frontend** (`apps/web`): test components with `@testing-library/react` + `renderWithProviders` (see `src/test/utils.tsx`), and hooks with `renderHook`. Mock HTTP at the network level with **MSW** — add handlers to `src/test/mocks/handlers.ts` for any new endpoints.

```ts
// Backend — mock Prisma and test the pure logic
vi.mock("@pronolol/database", () => ({ prisma: { myModel: { findUnique: vi.fn() } } }))

// Frontend hook — use renderHook + MSW
const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() })
await waitFor(() => expect(result.current.isLoading).toBe(false))

// Frontend component — use renderWithProviders
renderWithProviders(<MyComponent />)
expect(screen.getByText("Hello")).toBeInTheDocument()
```

Factory helpers (`makeMatch()`, `makeProps()`, etc.) are preferred over inline object literals to keep tests readable and DRY.

### Linting & Formatting

Always run `npm run lint:fix` before committing to auto-fix Prettier formatting and ESLint issues. The project enforces zero warnings — `npm run lint` must pass clean.

**Important:** The root ESLint config ignores `apps/web/**`. Each package must be linted from its own directory.

**Important:** ESLint packages (`@eslint/js`, `eslint`, etc.) are declared in the **root** `package.json`, not in `apps/web/package.json`. They are resolved from the root `node_modules/`. If linting fails with `Cannot find package '@eslint/js'`, run `npm install --ignore-scripts` from the repo root first.

```sh
# From apps/web/ — frontend
# (run `npm install --ignore-scripts` at repo root first if @eslint/js is missing)
cd apps/web
npm run lint:fix   # auto-fix formatting + fixable lint errors
git add -u         # restage any files reformatted by lint:fix
npm run lint       # verify clean (0 warnings, 0 errors)

# From repo root — everything except apps/web (api, scraper, packages)
npm run lint:fix
npm run lint
```

### Pre-commit Checklist

Before every commit, run the following for any package you've touched:

```sh
# Frontend (apps/web/)
# Run `npm install --ignore-scripts` at repo root first if node_modules/@eslint is missing
cd apps/web
npm run lint:fix   # format + fix lint
git add -u         # restage files reformatted by lint:fix so the commit includes fixed versions
npm run lint       # verify 0 warnings
npm test           # all Vitest unit tests must pass

# Backend / scraper / packages (from repo root)
npm run lint:fix
npm run lint
npm test           # all Vitest tests must pass
```

**Never commit with failing tests or lint errors.**

The `e2e/` visual tests (`npm run test:e2e` in `apps/web/`) run only in CI via the `visual-diff` workflow — do not run them locally as part of the pre-commit checklist (they require a built app and Playwright browsers).
