import { useState, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import type { Asset } from '@/types'

const API_BASE_URL = 'http://localhost:5000'

export function useTradeCalculator() {
  const [giving, setGiving] = useState<Asset[]>([])
  const [receiving, setReceiving] = useState<Asset[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("All Teams")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [yourAssets, setYourAssets] = useState<Asset[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [searchResults, setSearchResults] = useState<Asset[]>([])
  const { toast } = useToast()

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    })
  }

  const filteredAssets = (assets: Asset[], type: 'player' | 'pick') => {
    return assets.filter(a => a.type === type)
  }

  const addToTrade = (asset: Asset, type: 'giving' | 'receiving') => {
    if (type === 'giving') {
      setGiving(prev => [...prev, asset])
    } else {
      setReceiving(prev => [...prev, asset])
    }
  }

  const removeFromTrade = (asset: Asset, type: 'giving' | 'receiving') => {
    if (type === 'giving') {
      setGiving(prev => prev.filter(a => a.id !== asset.id))
    } else {
      setReceiving(prev => prev.filter(a => a.id !== asset.id))
    }
  }

  const proposeTrade = async () => {
    if (giving.length === 0 || receiving.length === 0) {
      toast({
        title: "Invalid Trade",
        description: "Please select items to give and receive.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/submit_trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          giving: giving.map(asset => ({
            id: asset.id,
            type: asset.type,
            name: asset.name
          })),
          receiving: receiving.map(asset => ({
            id: asset.id,
            type: asset.type,
            name: asset.name
          }))
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit trade')
      }

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Trade submitted successfully",
        })
        
        // Clear selections
        setGiving([])
        setReceiving([])
        
        // If there were any failed trades, show warning
        if (data.failed?.length > 0) {
          toast({
            title: "Warning",
            description: `Trade failed for franchises: ${data.failed.join(', ')}`,
            variant: "warning",
          })
        }
      } else {
        throw new Error(data.error || "Failed to submit trade")
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Check if backend is healthy
        const healthCheck = await fetch(`${API_BASE_URL}/health`)
        if (!healthCheck.ok) {
          throw new Error('Backend service is not available')
        }

        const [myAssetsResponse, availableAssetsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/get_my_assets`),
          fetch(`${API_BASE_URL}/get_available_assets`)
        ])

        if (!myAssetsResponse.ok || !availableAssetsResponse.ok) {
          throw new Error('Failed to fetch assets')
        }

        const myAssets = await myAssetsResponse.json()
        const availableAssets = await availableAssetsResponse.json()

        setYourAssets(myAssets.assets || [])
        setAvailableAssets(availableAssets.assets || [])
      } catch (error) {
        handleError(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    giving,
    receiving,
    selectedTeam,
    searchTerm,
    loading,
    yourAssets,
    availableAssets,
    searchResults,
    setSearchTerm,
    addToTrade,
    removeFromTrade,
    proposeTrade,
    filteredAssets
  }
} 