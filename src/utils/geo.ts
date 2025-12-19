export const decimalToDMS = (deg: number, type: 'lat' | 'lon'): string => {
  const absolute = Math.abs(deg)
  const degrees = Math.floor(absolute)
  const minutesNotTruncated = (absolute - degrees) * 60
  const minutes = Math.floor(minutesNotTruncated)
  const seconds = (minutesNotTruncated - minutes) * 60

  let direction = ''
  if (type === 'lat') {
    direction = deg >= 0 ? 'N' : 'S'
  } else {
    direction = deg >= 0 ? 'E' : 'W'
  }

  const minutesStr = minutes.toString().padStart(2, '0')
  const secondsStr = seconds.toFixed(3).padStart(6, '0')

  return `${degrees}° ${minutesStr}′ ${secondsStr}″ ${direction}`
}
