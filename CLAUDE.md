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
