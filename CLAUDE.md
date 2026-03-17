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
