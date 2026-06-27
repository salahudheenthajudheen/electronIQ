import { useRef, useEffect } from 'react'

export function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: any[] = []) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * devicePixelRatio
      canvas.height = rect.height * devicePixelRatio
      ctx.scale(devicePixelRatio, devicePixelRatio)
      drawRef.current(ctx, rect.width, rect.height)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, deps)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const id = requestAnimationFrame(() => {
      const rect = canvas.getBoundingClientRect()
      drawRef.current(ctx, rect.width, rect.height)
    })
    return () => cancelAnimationFrame(id)
  })

  return canvasRef
}
