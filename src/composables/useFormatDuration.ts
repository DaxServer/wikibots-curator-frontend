export interface FormattedDuration {
  hours: string
  minutes: string
  seconds: string
}

const pad = (num: number): string => num.toString().padStart(2, '0')

export const formatDuration = (startedAt: Date): FormattedDuration => {
  const diffMs = Date.now() - startedAt.getTime()

  const currentTotalSeconds = Math.floor(diffMs / 1000)
  const totalSeconds = Math.max(0, currentTotalSeconds)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
  }
}
