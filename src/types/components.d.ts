import { ReactNode } from 'react'
import { VariantProps } from 'class-variance-authority'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export interface ToastProps {
  id: string
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  variant?: 'default' | 'destructive'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

export interface TabsListProps {
  children: ReactNode
}

export interface TabsTriggerProps {
  value: string
  children: ReactNode
}

export interface TabsContentProps {
  value: string
  children: ReactNode
}

export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

export interface DialogTriggerProps {
  asChild?: boolean
  children: ReactNode
}

export interface DialogContentProps {
  children: ReactNode
}

export interface DialogTitleProps {
  children: ReactNode
}

export interface DialogDescriptionProps {
  children: ReactNode
} 