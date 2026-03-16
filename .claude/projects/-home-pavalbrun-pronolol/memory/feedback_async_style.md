---
name: async_style
description: Prefer try/catch over .then/.catch for async error handling
type: feedback
---

Always use try/catch for async error handling. Never use `.then()` or `.catch()` chaining.

**Why:** User's explicit preference for consistency and readability.

**How to apply:** Any time async operations need error handling, wrap in try/catch. This applies everywhere in the codebase — scraper, API, frontend, etc.
