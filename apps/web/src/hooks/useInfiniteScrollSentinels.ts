import { useEffect, useRef } from "react"

interface Options {
  onTopReached: () => void
  onBottomReached: () => void
  rootMargin?: string
}

/**
 * Returns refs to attach to sentinel divs placed at the top and bottom of a
 * list. When a sentinel enters the viewport the corresponding callback fires.
 * Re-registers the observer whenever the callbacks change so stale closures
 * never prevent a fetch.
 */
export function useInfiniteScrollSentinels({
  onTopReached,
  onBottomReached,
  rootMargin = "200px",
}: Options) {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (entry.target === topRef.current) onTopReached()
          if (entry.target === bottomRef.current) onBottomReached()
        }
      },
      { rootMargin }
    )

    if (topRef.current) observer.observe(topRef.current)
    if (bottomRef.current) observer.observe(bottomRef.current)

    return () => observer.disconnect()
  }, [onTopReached, onBottomReached, rootMargin])

  return { topRef, bottomRef }
}
