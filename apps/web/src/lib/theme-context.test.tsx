import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import React from "react"
import { ThemeProvider, useTheme } from "./theme-context"

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
)

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove("dark")
  })

  it("defaults to light theme when no saved preference", () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe("light")
  })

  it("reads dark preference from localStorage on mount", () => {
    localStorage.setItem("theme", "dark")
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe("dark")
  })

  it("toggles from light to dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe("dark")
  })

  it("toggles from dark back to light", () => {
    localStorage.setItem("theme", "dark")
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe("light")
  })

  it("adds .dark class to documentElement when switching to dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => {
      result.current.toggleTheme()
    })
    expect(document.documentElement.classList.contains("dark")).toBe(true)
  })

  it("removes .dark class from documentElement when switching to light", () => {
    localStorage.setItem("theme", "dark")
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => {
      result.current.toggleTheme()
    })
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("persists theme choice to localStorage", () => {
    const { result } = renderHook(() => useTheme(), { wrapper })
    act(() => {
      result.current.toggleTheme()
    })
    expect(localStorage.getItem("theme")).toBe("dark")
  })
})
