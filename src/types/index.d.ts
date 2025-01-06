import { ReactNode } from 'react'
import { HTMLMotionProps } from 'framer-motion'

declare module 'react' {
  interface JSX {
    IntrinsicElements: {
      [elemName: string]: any;
    }
  }
}

export interface Asset {
  id: string;
  name: string;
  details: string;
  type: 'player' | 'pick';
  owner?: string;
}

export interface AssetItemProps {
  asset: Asset;
  onSelect?: (asset: Asset) => void;
}

export interface TradePanelProps {
  title: string;
  assets: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

export interface MotionDivProps extends HTMLMotionProps<"div"> {
  children?: ReactNode;
}

export type ToastVariant = 'default' | 'destructive' | 'warning'; 