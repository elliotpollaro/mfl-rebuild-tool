export type Theme = {
  colors: {
    primary: string
    secondary: string
    background: string
    foreground: string
    border: string
    ring: string
    input: string
    destructive: {
      DEFAULT: string
      foreground: string
    }
    muted: {
      DEFAULT: string
      foreground: string
    }
    accent: {
      DEFAULT: string
      foreground: string
    }
  }
  borderRadius: {
    lg: string
    md: string
    sm: string
  }
  spacing: {
    [key: string]: string
  }
  fontSize: {
    [key: string]: [string, { lineHeight: string }]
  }
  boxShadow: {
    [key: string]: string
  }
} 