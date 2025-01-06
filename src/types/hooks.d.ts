import { Asset } from './api'

export interface UseTradeCalculatorReturn {
  giving: Asset[]
  receiving: Asset[]
  selectedTeam: string
  searchTerm: string
  loading: boolean
  yourAssets: Asset[]
  availableAssets: Asset[]
  searchResults: Asset[]
  setSearchTerm: (term: string) => void
  addToTrade: (asset: Asset, type: 'giving' | 'receiving') => void
  removeFromTrade: (asset: Asset, type: 'giving' | 'receiving') => void
  proposeTrade: () => Promise<void>
  filteredAssets: (assets: Asset[], type: 'player' | 'pick') => Asset[]
}

export interface UseToastReturn {
  toasts: {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    variant?: 'default' | 'destructive' | 'warning'
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }[]
  toast: (props: {
    title?: React.ReactNode
    description?: React.ReactNode
    action?: React.ReactNode
    variant?: 'default' | 'destructive' | 'warning'
  }) => void
  dismiss: (toastId?: string) => void
} 