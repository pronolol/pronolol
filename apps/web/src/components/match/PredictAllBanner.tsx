interface PredictAllBannerProps {
  count: number
  onStart: () => void
}

export const PredictAllBanner = ({ count, onStart }: PredictAllBannerProps) => {
  if (count === 0) return null

  return (
    <div className="flex items-center justify-between border-t border-border bg-primary/5 px-4 py-2">
      <span className="text-sm font-medium">
        🎯 You have {count} match{count === 1 ? "" : "es"} to predict
      </span>
      <button
        onClick={onStart}
        className="text-sm font-semibold text-primary hover:underline"
      >
        Start Predicting →
      </button>
    </div>
  )
}
