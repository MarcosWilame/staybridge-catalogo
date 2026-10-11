import React, { useEffect, useRef, useState } from 'react'
import { trackPerformanceMetric } from '../../utils/analytics'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const startedAtRef = useRef(0)

  const { src, alt, style, className, fetchPriority, onLoad, onError, ...rest } = props
  const resolvedAlt = alt === '' ? '' : alt?.trim() || 'Imagem de acomodação em Londres'
  const imageVariantValue = (rest as Record<string, unknown>)['data-image-variant']
  const imageVariant = typeof imageVariantValue === 'string'
    ? imageVariantValue
    : ''
  const fetchPriorityAttribute = fetchPriority
    ? ({ fetchpriority: fetchPriority } as Record<string, string>)
    : {}

  useEffect(() => {
    setDidError(false)
    startedAtRef.current = typeof performance !== 'undefined' ? performance.now() : Date.now()
  }, [src])

  const trackImageResult = (status: 'loaded' | 'error') => {
    if (!imageVariant || !src) return
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    trackPerformanceMetric('image_delivery', {
      variant: imageVariant,
      status,
      duration_ms: Math.max(0, Math.round(now - startedAtRef.current)),
    })
  }

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    trackImageResult('loaded')
    onLoad?.(event)
  }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    trackImageResult('error')
    setDidError(true)
    onError?.(event)
  }

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt={resolvedAlt ? `${resolvedAlt} — imagem indisponível` : ''}
          {...rest}
          {...fetchPriorityAttribute}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={resolvedAlt}
      className={className}
      style={style}
      {...rest}
      {...fetchPriorityAttribute}
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  )
}
