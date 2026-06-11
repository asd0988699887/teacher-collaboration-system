'use client'

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

export const ONBOARDING_EXIT_SHRINK_MS = 220
export const ONBOARDING_EXIT_FLY_MS = 520

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

type OnboardingDismissOptions = { showReopenHint?: boolean }

export function useOnboardingExitAnimation(open: boolean, panelZIndex = 102) {
  const [isExiting, setIsExiting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [backdropFading, setBackdropFading] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties | undefined>()
  const panelRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (open) {
      setIsExiting(false)
      setIsCompleting(false)
      setBackdropFading(false)
      setPanelStyle(undefined)
      return
    }
    setIsExiting(false)
    setIsCompleting(false)
    setBackdropFading(false)
    setPanelStyle(undefined)
  }, [open])

  const beginExitAnimation = useCallback(
    (
      reopenButtonSelector: string,
      onComplete: (options?: OnboardingDismissOptions) => void
    ) => {
      if (isCompleting) return
      setIsCompleting(true)

      const finishWithReopenHint = () => {
        onComplete({ showReopenHint: true })
      }

      if (prefersReducedMotion) {
        finishWithReopenHint()
        return
      }

      const target = document.querySelector(reopenButtonSelector)
      const panel = panelRef.current
      if (!target || !panel) {
        finishWithReopenHint()
        return
      }

      const panelRect = panel.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const originX = panelRect.left + panelRect.width / 2
      const originY = panelRect.top + panelRect.height / 2
      const flyDx = targetRect.left + targetRect.width / 2 - originX
      const flyDy = targetRect.top + targetRect.height / 2 - originY

      setIsExiting(true)
      setPanelStyle({
        position: 'fixed',
        left: originX,
        top: originY,
        width: panelRect.width,
        maxWidth: panelRect.width,
        margin: 0,
        transform: 'translate(-50%, -50%) scale(1)',
        opacity: 1,
        transition: 'none',
        zIndex: panelZIndex,
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setBackdropFading(true)
          setPanelStyle((prev) => ({
            ...prev,
            transform: 'translate(-50%, -50%) scale(0.9)',
            transition: `transform ${ONBOARDING_EXIT_SHRINK_MS}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${ONBOARDING_EXIT_SHRINK_MS}ms ease`,
          }))

          window.setTimeout(() => {
            setPanelStyle((prev) => ({
              ...prev,
              transform: `translate(calc(-50% + ${flyDx}px), calc(-50% + ${flyDy}px)) scale(0.08)`,
              opacity: 0,
              transition: `transform ${ONBOARDING_EXIT_FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${ONBOARDING_EXIT_FLY_MS}ms ease`,
            }))

            window.setTimeout(() => {
              finishWithReopenHint()
            }, ONBOARDING_EXIT_FLY_MS + 20)
          }, ONBOARDING_EXIT_SHRINK_MS + 20)
        })
      })
    },
    [isCompleting, prefersReducedMotion]
  )

  return {
    panelRef,
    panelStyle,
    isExiting,
    isCompleting,
    backdropFading,
    beginExitAnimation,
    shouldRender: open || isExiting,
  }
}
