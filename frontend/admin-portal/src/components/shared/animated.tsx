import * as React from 'react'
import { cn } from '@/lib/utils'

interface AnimatedProps {
  animation?: 'fade-in' | 'slide-in-up' | 'slide-in-down' | 'slide-in-left' | 'slide-in-right' | 'scale-in'
  delay?: number
  className?: string
  children: React.ReactNode
}

export function Animated({
  animation = 'fade-in',
  delay = 0,
  className,
  children,
}: AnimatedProps) {
  return (
    <div
      className={cn(`animate-${animation}`, className)}
      style={delay ? { animationDelay: `${delay}ms`, animationFillMode: 'both' } : undefined}
    >
      {children}
    </div>
  )
}

/** Stagger-animate a list of children */
export function StaggeredList({
  children,
  staggerMs = 50,
  animation = 'slide-in-up',
  className,
}: {
  children: React.ReactNode
  staggerMs?: number
  animation?: AnimatedProps['animation']
  className?: string
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) => (
        <Animated animation={animation} delay={i * staggerMs}>
          {child}
        </Animated>
      ))}
    </div>
  )
}
