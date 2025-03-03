'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const Loader = () => {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStartLoading = () => setLoading(true)
    const handleCompleteLoading = () => setLoading(false)

    // Detect clicks on links to show the loader early
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('a')) {
        handleStartLoading()
      }
    }

    document.addEventListener('click', handleClick)

    // Hide loader only when new page fully renders
    const timeout = setTimeout(handleCompleteLoading, 1500) // Adjust if needed

    return () => {
      document.removeEventListener('click', handleClick)
      clearTimeout(timeout)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-75 flex items-center justify-center z-50">
      <img src="/loader.gif" alt="Loading..." className="w-50 h-50" />
    </div>
  )
}

export default Loader
