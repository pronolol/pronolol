interface PredictAllBannerProps {
  count: number
  onStart: () => void
}

export const PredictAllBanner = ({ count, onStart }: PredictAllBannerProps) => {
  if (count === 0) return null

  return (
    <div className="my-2 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
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
