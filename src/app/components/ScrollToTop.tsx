import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, search, hash } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  useLayoutEffect(() => {
    if (hash) return

    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, pathname, search])

  useEffect(() => {
    if (!hash) return

    const targetId = decodeURIComponent(hash.slice(1))
    let attempts = 0
    let timeoutId = 0

    const scrollToTarget = () => {
      const target = document.getElementById(targetId)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      attempts += 1
      if (attempts < 20) timeoutId = window.setTimeout(scrollToTarget, 100)
    }

    scrollToTarget()
    return () => window.clearTimeout(timeoutId)
  }, [hash, pathname])

  return null
}
