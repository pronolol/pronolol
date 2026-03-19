import { useState, useMemo, useCallback } from "react"
import type { Match } from "@/api/generated/models"

export const isPredictionLocked = (matchDate: string): boolean =>
  new Date() > new Date(new Date(matchDate).getTime() + 5 * 60 * 1000)

const isUnpredicted = (match: Match): boolean => {
  if (!match.matchDate) return false
  if (match.state === "completed") return false
  if (isPredictionLocked(match.matchDate)) return false
  if (match.myPrediction) return false
  return true
}

export const computeAllScores = (bestOf: number) => {
  const maxWins = Math.ceil(bestOf / 2)
  const teamAWins: { teamA: number; teamB: number }[] = []
  const teamBWins: { teamA: number; teamB: number }[] = []
  for (let loserScore = 0; loserScore < maxWins; loserScore++) {
    teamAWins.push({ teamA: maxWins, teamB: loserScore })
    teamBWins.push({ teamA: loserScore, teamB: maxWins })
  }
  return { teamAWins, teamBWins }
}

type Phase = "predicting" | "review-skipped" | "done"

export interface PredictionWizardHook {
  isOpen: boolean
  currentMatch: Match | null
  progress: { done: number; total: number }
  phase: Phase
  skippedCount: number
  open: () => void
  skip: () => void
  advance: () => void
  startReview: () => void
  close: () => void
}

export const usePredictionWizard = (
  allMatches: Match[]
): PredictionWizardHook => {
  const [isOpen, setIsOpen] = useState(false)
  const [queue, setQueue] = useState<Match[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set())

  const open = useCallback(() => {
    const unpredicted = allMatches.filter(isUnpredicted)
    if (unpredicted.length === 0) return
    setQueue(unpredicted)
    setCurrentIndex(0)
    setSkippedIds(new Set())
    setIsOpen(true)
  }, [allMatches])

  const close = useCallback(() => {
    setIsOpen(false)
    setQueue([])
    setCurrentIndex(0)
    setSkippedIds(new Set())
  }, [])

  const advance = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const skip = useCallback(() => {
    const currentMatch = queue[currentIndex]
    if (currentMatch) {
      setSkippedIds((prev) => {
        const next = new Set(prev)
        next.add(currentMatch.id)
        return next
      })
    }
    setCurrentIndex((prev) => prev + 1)
  }, [queue, currentIndex])

  const startReview = useCallback(() => {
    const skippedMatches = queue.filter((m) => skippedIds.has(m.id))
    setQueue(skippedMatches)
    setCurrentIndex(0)
    setSkippedIds(new Set())
  }, [queue, skippedIds])

  const phase = useMemo((): Phase => {
    if (!isOpen) return "done"
    if (currentIndex < queue.length) return "predicting"
    if (skippedIds.size > 0) return "review-skipped"
    return "done"
  }, [isOpen, currentIndex, queue.length, skippedIds.size])

  const currentMatch = useMemo((): Match | null => {
    if (phase !== "predicting") return null
    return queue[currentIndex] ?? null
  }, [phase, queue, currentIndex])

  const progress = useMemo(
    () => ({ done: currentIndex, total: queue.length }),
    [currentIndex, queue.length]
  )

  return {
    isOpen,
    currentMatch,
    progress,
    phase,
    skippedCount: skippedIds.size,
    open,
    skip,
    advance,
    startReview,
    close,
  }
}
