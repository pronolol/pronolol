import "@testing-library/jest-dom"
import { vi, beforeAll, afterEach, afterAll } from "vitest"
import { server } from "./mocks/server"

// Node.js 25 exposes a built-in localStorage getter on globalThis that shadows jsdom's
// Storage. It only supports file-backed persistence and doesn't implement clear/getItem/
// setItem. Override it with a proper in-memory implementation so tests work correctly.
const createInMemoryStorage = () => {
  const store = new Map<string, string>()
  return {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, String(value)),
  }
}
vi.stubGlobal("localStorage", createInMemoryStorage())

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
