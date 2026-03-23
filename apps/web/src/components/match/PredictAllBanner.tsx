interface PredictAllBannerProps {
  count: number
  onStart: () => void
}

export const PredictAllBanner = ({ count, onStart }: PredictAllBannerProps) => {
  if (count === 0) return null

  return (
    <div className="mx-4 mb-2.5 mt-1 rounded-xl bg-gradient-to-r from-primary/10 via-primary/8 to-primary/5 border border-primary/20 px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base leading-none">🎯</span>
        <span className="text-sm font-medium text-text-primary truncate">
          {count} match{count === 1 ? "" : "es"} to predict
        </span>
      </div>
      <button
        onClick={onStart}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors shadow-sm"
      >
        Start →
      </button>
    </div>
  )
}
