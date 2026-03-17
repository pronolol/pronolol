interface DayHeaderProps {
  date: Date
}

const formatDayHeader = (date: Date): string => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export const DayHeader = ({ date }: DayHeaderProps) => {
  const isToday = date.toDateString() === new Date().toDateString()

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex-1 h-px bg-border" />
      <span
        className={`text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ${
          isToday
            ? "bg-primary-light text-primary"
            : "bg-surface-secondary text-text-secondary"
        }`}
      >
        {formatDayHeader(date)}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
