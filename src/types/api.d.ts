export interface Asset {
  id: string
  name: string
  details: string
  type: 'player' | 'pick'
  owner?: string
}

export interface APIResponse<T> {
  success: boolean
  error?: string
  data?: T
}

export interface AssetsResponse {
  assets: Asset[]
}

export interface TradeResponse {
  success: boolean
  message?: string
  failed?: string[]
  trades_sent?: {
    franchise_id: string
    franchise_name: string
    giving: Asset[]
    receiving: Asset[]
  }[]
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
} 