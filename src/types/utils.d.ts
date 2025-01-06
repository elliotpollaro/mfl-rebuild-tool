import { ClassValue } from 'clsx'

export type ClassNameValue = ClassValue | ClassValue[]

export interface VariantProps<T> {
  [key: string]: any
}

export type MotionVariants = {
  initial?: {
    [key: string]: any
  }
  animate?: {
    [key: string]: any
  }
  exit?: {
    [key: string]: any
  }
  transition?: {
    duration?: number
    ease?: string | number[]
    delay?: number
  }
} 