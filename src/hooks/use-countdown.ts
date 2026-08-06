import { useCallback, useEffect, useState } from 'react'

export function useCountdown(initialSeconds = 0) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft])

  const start = useCallback((seconds: number) => {
    setSecondsLeft(seconds)
  }, [])

  return {
    secondsLeft,
    start,
    isActive: secondsLeft > 0,
  }
}
