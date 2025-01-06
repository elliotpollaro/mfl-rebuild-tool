"use client"

import * as React from 'react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import * as Tabs from '@radix-ui/react-tabs'
import * as Dialog from '@radix-ui/react-dialog'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import type { Asset } from '@/types'
import { X } from 'lucide-react'
import AuthHeader from '@/components/auth-header'
import { AnimatePresence, motion, LazyMotion, domAnimation } from 'framer-motion'
import _ from 'lodash'

const API_BASE_URL = 'http://localhost:5000'

interface AssetItemProps {
  asset: Asset;
  onSelect: () => void;
}

interface TradePanelProps {
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  onAddAssets: () => void;
  title: string;
}

interface EmptyStateProps {
  message: string;
}

interface MobileLayoutProps {
  giving: Asset[];
  receiving: Asset[];
  removeFromTrade: (asset: Asset, type: 'giving' | 'receiving') => void;
  setIsYourAssetsModalOpen: (open: boolean) => void;
  setIsAvailableAssetsModalOpen: (open: boolean) => void;
  setIsConfirmTradeModalOpen: (open: boolean) => void;
}

interface DesktopLayoutProps {
  giving: Asset[];
  receiving: Asset[];
  yourAssets: Asset[];
  availableAssets: Asset[];
  loading: boolean;
  yourSearchTerm: string;
  availableSearchTerm: string;
  handleSearch: (term: string, type: 'your' | 'available') => void;
  addToTrade: (asset: Asset, type: 'giving' | 'receiving') => void;
  removeFromTrade: (asset: Asset, type: 'giving' | 'receiving') => void;
  filteredYourAssets: (assets: Asset[], type: 'player' | 'pick') => Asset[];
  filteredAvailableAssets: (assets: Asset[], type: 'player' | 'pick') => Asset[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  proposeTrade: () => Promise<void>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <div className="text-center text-gray-500 py-4">
    {message}
  </div>
)

const AssetItem = React.forwardRef<HTMLButtonElement, AssetItemProps>(({ asset, onSelect }, ref) => (
  <button
    ref={ref}
    onClick={onSelect}
    className="w-full p-2 mb-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors flex justify-between items-center"
  >
    <div>
      <div className="font-medium">{asset.name}</div>
      <div className="text-sm text-gray-400">{asset.details}</div>
    </div>
    <div className="text-blue-400">+</div>
  </button>
))

AssetItem.displayName = 'AssetItem'

const TradePanel = React.forwardRef<HTMLDivElement, TradePanelProps>(({ assets, onAssetSelect, onAddAssets, title }, ref) => (
  <div ref={ref} className="flex-1 h-full">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-blue-400">{title}</h3>
      <Button 
        onClick={onAddAssets} 
        size="sm" 
        variant="outline" 
        className="text-blue-400 border-blue-400 hover:bg-blue-400/10 min-w-[70px]"
      >
        Add
      </Button>
    </div>
    <div className="space-y-2 min-h-[200px] md:min-h-[300px] overflow-y-auto">
      {assets.length === 0 ? (
        <EmptyState message="Tap 'Add' to select items..." />
      ) : (
        assets.map(asset => (
          <div key={asset.id} className="transition-all duration-200">
            <AssetItem asset={asset} onSelect={() => onAssetSelect(asset)} />
          </div>
        ))
      )}
    </div>
  </div>
));

TradePanel.displayName = 'TradePanel'

const DialogDescription = Dialog.Description as React.ForwardRefExoticComponent<
  React.PropsWithoutRef<{ className?: string }> & React.RefAttributes<HTMLParagraphElement>
>

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
  </div>
)

const AssetSelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  title: string;
  isYourAssets?: boolean;
}> = ({ isOpen, onClose, assets, onAssetSelect, searchTerm, onSearchChange, title, isYourAssets }) => {
  const [assetType, setAssetType] = useState<'players' | 'picks'>(isYourAssets ? 'players' : 'picks')

  // Filter assets based on search term and type
  const filteredAssets = assets.filter(asset => {
    // For available assets, only show picks
    if (!isYourAssets) return asset.type === 'pick';

    // For your assets, filter by the selected type (players/picks) and search term
    const matchesType = asset.type?.toLowerCase() === (assetType === 'players' ? 'player' : 'pick');
    const matchesSearch = !searchTerm || 
      asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.details?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-4 top-[50%] -translate-y-[50%] bg-gray-800 text-gray-100 rounded-lg shadow-xl max-h-[85vh] flex flex-col">
          <div className="flex-none p-4 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-gray-200 rounded-full p-1">
                  <X className="h-6 w-6" />
                </button>
              </Dialog.Close>
            </div>
            {isYourAssets && (
              <div className="flex space-x-2 mt-4">
                <Button
                  onClick={() => setAssetType('players')}
                  variant={assetType === 'players' ? 'default' : 'outline'}
                  className={cn(
                    "flex-1 text-sm font-medium rounded-lg",
                    assetType === 'players' 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-gray-700/50 hover:bg-gray-600/50"
                  )}
                >
                  Players
                </Button>
                <Button
                  onClick={() => setAssetType('picks')}
                  variant={assetType === 'picks' ? 'default' : 'outline'}
                  className={cn(
                    "flex-1 text-sm font-medium rounded-lg",
                    assetType === 'picks' 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-gray-700/50 hover:bg-gray-600/50"
                  )}
                >
                  Picks
                </Button>
              </div>
            )}
            <Input 
              className="mt-4" 
              placeholder={`Search ${isYourAssets ? (assetType === 'players' ? 'players' : 'picks') : 'picks'}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence>
              {filteredAssets.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-gray-500 py-4"
                >
                  No {isYourAssets ? (assetType === 'players' ? 'players' : 'picks') : 'picks'} found matching your search.
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {filteredAssets.map(asset => (
                    <AssetItem key={asset.id} asset={asset} onSelect={() => {
                      onAssetSelect(asset);
                      onClose();
                    }} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Mobile version component
const MobileLayout: React.FC<MobileLayoutProps> = ({
  giving,
  receiving,
  removeFromTrade,
  setIsYourAssetsModalOpen,
  setIsAvailableAssetsModalOpen,
  setIsConfirmTradeModalOpen,
}) => (
  <Card className="bg-gray-800/50 border-gray-700 shadow-lg mb-4">
    <CardContent className="p-3">
      <div className="grid grid-cols-1 gap-3">
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-400">Giving</h3>
            <Button 
              onClick={() => setIsYourAssetsModalOpen(true)} 
              size="sm" 
              variant="outline" 
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10 min-w-[60px] h-8 px-2"
            >
              Add
            </Button>
          </div>
          <div className="min-h-[120px] bg-gray-900/30 rounded-lg p-2">
            {giving.length === 0 ? (
              <EmptyState message="Tap 'Add' to select items..." />
            ) : (
              <div className="space-y-1">
                {giving.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => removeFromTrade(asset, 'giving')}
                    className="w-full p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors flex justify-between items-center text-left"
                  >
                    <div>
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-gray-400">{asset.details}</div>
                    </div>
                    <div className="text-red-400 text-lg">×</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowLeftRight className="w-5 h-5 text-purple-400" />
        </div>

        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-blue-400">Receiving</h3>
            <Button 
              onClick={() => setIsAvailableAssetsModalOpen(true)} 
              size="sm" 
              variant="outline" 
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10 min-w-[60px] h-8 px-2"
            >
              Add
            </Button>
          </div>
          <div className="min-h-[120px] bg-gray-900/30 rounded-lg p-2">
            {receiving.length === 0 ? (
              <EmptyState message="Tap 'Add' to select items..." />
            ) : (
              <div className="space-y-1">
                {receiving.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => removeFromTrade(asset, 'receiving')}
                    className="w-full p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors flex justify-between items-center text-left"
                  >
                    <div>
                      <div className="font-medium text-sm">{asset.name}</div>
                      <div className="text-xs text-gray-400">{asset.details}</div>
                    </div>
                    <div className="text-red-400 text-lg">×</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out w-full text-sm"
          disabled={giving.length === 0 || receiving.length === 0}
          onClick={() => setIsConfirmTradeModalOpen(true)}
        >
          {giving.length === 0 || receiving.length === 0 
            ? "Select items to offer and request" 
            : "Submit Trade"}
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Desktop version component
const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  giving,
  receiving,
  yourAssets,
  availableAssets,
  loading,
  yourSearchTerm,
  availableSearchTerm,
  handleSearch,
  addToTrade,
  removeFromTrade,
  filteredYourAssets: handleFilterYourAssets,
  filteredAvailableAssets: handleFilterAvailableAssets,
  isDialogOpen,
  setIsDialogOpen,
  proposeTrade
}: DesktopLayoutProps) => {
  const renderAssetItem = (asset: Asset, onSelect: () => void) => (
    <AssetItem key={asset.id} asset={asset} onSelect={onSelect} />
  );

  return (
    <div className="flex flex-col space-y-8">
      {/* Disclaimer and How it Works */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl">
        <div className="flex flex-col space-y-3 bg-gray-900/50 rounded-lg p-4 h-full">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 px-3 py-1 rounded-md border border-purple-500/50 flex items-center space-x-2">
              <svg 
                className="w-4 h-4 flex-shrink-0 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <span className="text-white font-semibold text-sm uppercase tracking-wider">Disclaimer</span>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed text-center">
            This tool is for entertainment only and provided "as is." We're not responsible for any errors, outcomes, or damages. Use at your own risk and always do your own research.
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 bg-gray-900/50 rounded-lg p-4 h-full">
          <div className="flex justify-center">
            <div className="bg-gradient-to-r from-blue-400/20 via-purple-500/20 to-pink-500/20 px-3 py-1 rounded-md border border-purple-500/50 flex items-center space-x-2">
              <svg 
                className="w-4 h-4 flex-shrink-0 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" 
                />
              </svg>
              <span className="text-white font-semibold text-sm uppercase tracking-wider">How it works</span>
            </div>
          </div>
          <p className="text-gray-300 leading-relaxed text-center">
            This tool automatically identifies and sends trade offers to every team that has the picks you're targeting. For example, if you want Derrick Henry for a first and second, it will instantly propose that trade to any team holding those exact picks.
          </p>
        </div>
      </div>

      {/* Trade Interface */}
      <div className="grid grid-cols-4 gap-8">
        {/* Left Column - Your Assets */}
        <div className="col-span-1">
          <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Your Assets</h2>
              <Input 
                className="mb-4" 
                placeholder="Search your assets..." 
                value={yourSearchTerm}
                onChange={(e) => handleSearch(e.target.value, 'your')}
                disabled={loading}
              />
              <Tabs.Root defaultValue="players">
                <Tabs.List className="flex space-x-2 mb-4">
                  <Tabs.Trigger 
                    value="players"
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700/50 data-[state=active]:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    Players
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    value="picks"
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-700/50 data-[state=active]:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    Picks
                  </Tabs.Trigger>
                </Tabs.List>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Tabs.Content value="players" className="outline-none">
                      {handleFilterYourAssets(yourAssets, 'player').length === 0 ? (
                        <EmptyState message={yourSearchTerm ? "No players found matching your search." : "No players available."} />
                      ) : (
                        handleFilterYourAssets(yourAssets, 'player').map(asset => 
                          renderAssetItem(asset, () => addToTrade(asset, 'giving'))
                        )
                      )}
                    </Tabs.Content>
                    <Tabs.Content value="picks" className="outline-none">
                      {handleFilterYourAssets(yourAssets, 'pick').length === 0 ? (
                        <EmptyState message={yourSearchTerm ? "No picks found matching your search." : "No picks available."} />
                      ) : (
                        handleFilterYourAssets(yourAssets, 'pick').map(asset => 
                          renderAssetItem(asset, () => addToTrade(asset, 'giving'))
                        )
                      )}
                    </Tabs.Content>
                  </>
                )}
              </Tabs.Root>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Trade */}
        <div className="col-span-2">
          <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
            <CardContent className="p-6">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-semibold text-blue-400">Giving</h2>
                <h2 className="text-2xl font-semibold text-blue-400">Receiving</h2>
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  {giving.length === 0 ? (
                    <EmptyState message="Select items to give..." />
                  ) : (
                    giving.map(asset => 
                      renderAssetItem(asset, () => removeFromTrade(asset, 'giving'))
                    )
                  )}
                </div>
                <div className="flex items-center">
                  <ArrowLeftRight className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  {receiving.length === 0 ? (
                    <EmptyState message="Select items to receive..." />
                  ) : (
                    receiving.map(asset => 
                      renderAssetItem(asset, () => removeFromTrade(asset, 'receiving'))
                    )
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                  disabled={giving.length === 0 || receiving.length === 0}
                >
                  {giving.length === 0 || receiving.length === 0 
                    ? "Select items to offer and request" 
                    : "Submit Trade"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Available Assets */}
        <div className="col-span-1">
          <Card className="bg-gray-800/50 border-gray-700 shadow-lg h-full">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Available Assets</h2>
              <Input 
                className="mb-4" 
                placeholder="Search available assets..." 
                value={availableSearchTerm}
                onChange={(e) => handleSearch(e.target.value, 'available')}
                disabled={loading}
              />
              <Tabs.Root defaultValue="picks">
                <Tabs.List className="mb-4">
                  <Tabs.Trigger 
                    value="picks"
                    className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-gray-700/50 data-[state=active]:bg-blue-600 transition-colors"
                    disabled={loading}
                  >
                    Picks
                  </Tabs.Trigger>
                </Tabs.List>
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <Tabs.Content value="picks" className="outline-none">
                    {handleFilterAvailableAssets(availableAssets, 'pick').length === 0 ? (
                      <EmptyState message={availableSearchTerm ? "No picks found matching your search." : "No picks available."} />
                    ) : (
                      handleFilterAvailableAssets(availableAssets, 'pick').map(asset => 
                        renderAssetItem(asset, () => addToTrade(asset, 'receiving'))
                      )
                    )}
                  </Tabs.Content>
                )}
              </Tabs.Root>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function DynastyTradeCalculator() {
  const [giving, setGiving] = useState<Asset[]>([])
  const [receiving, setReceiving] = useState<Asset[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>("All Teams")
  const [yourSearchTerm, setYourSearchTerm] = useState("")
  const [availableSearchTerm, setAvailableSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [yourAssets, setYourAssets] = useState<Asset[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [isYourAssetsModalOpen, setIsYourAssetsModalOpen] = useState(false)
  const [isAvailableAssetsModalOpen, setIsAvailableAssetsModalOpen] = useState(false)
  const [isConfirmTradeModalOpen, setIsConfirmTradeModalOpen] = useState(false)
  const { toast } = useToast()

  const handleLeagueChange = (leagueId: string | null) => {
    // Clear existing data
    setGiving([])
    setReceiving([])
    setYourAssets([])
    setAvailableAssets([])
    setYourSearchTerm("")
    setAvailableSearchTerm("")
    
    // If a league is selected, fetch data
    if (leagueId) {
      fetchData()
    }
  }

  // Memoize filter functions
  const filterAssets = useCallback((assets: Asset[], term: string, type: 'player' | 'pick') => {
    if (!term) {
      return assets.filter(asset => asset.type === type);
    }
    const lowerTerm = term.toLowerCase();
    return assets.filter(asset => 
      asset.type === type && 
      (asset.name?.toLowerCase().includes(lowerTerm) || 
      asset.details?.toLowerCase().includes(lowerTerm))
    );
  }, []);

  const handleFilterYourAssets = useCallback((assets: Asset[], type: 'player' | 'pick'): Asset[] => {
    return filterAssets(assets, yourSearchTerm, type);
  }, [filterAssets, yourSearchTerm]);

  const handleFilterAvailableAssets = useCallback((assets: Asset[], type: 'player' | 'pick'): Asset[] => {
    return filterAssets(assets, availableSearchTerm, type);
  }, [filterAssets, availableSearchTerm]);

  // Debounce search handler
  const debouncedSearch = useCallback(
    _.debounce((term: string, type: 'your' | 'available') => {
      if (type === 'your') {
        setYourSearchTerm(term)
      } else {
        setAvailableSearchTerm(term)
      }
    }, 300),
    []
  );

  const handleSearch = (term: string, type: 'your' | 'available') => {
    debouncedSearch(term, type);
  };

  // Memoize add/remove handlers
  const addToTrade = useCallback((asset: Asset, type: 'giving' | 'receiving') => {
    if (type === 'giving') {
      setGiving(prev => [...prev, asset])
    } else {
      setReceiving(prev => [...prev, asset])
      setAvailableSearchTerm('')
    }
  }, []);

  const removeFromTrade = useCallback((asset: Asset, type: 'giving' | 'receiving') => {
    if (type === 'giving') {
      setGiving(prev => prev.filter(a => a.id !== asset.id))
    } else {
      setReceiving(prev => prev.filter(a => a.id !== asset.id))
    }
  }, []);

  // Optimize data fetching
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      
      // Check if backend is healthy
      const healthCheck = await fetch(`${API_BASE_URL}/health`, { signal })
      if (!healthCheck.ok) {
        throw new Error('Backend service is not available')
      }

      const [myAssetsResponse, availableAssetsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/get_my_assets`, {
          credentials: 'include',
          signal
        }),
        fetch(`${API_BASE_URL}/get_available_assets`, {
          credentials: 'include',
          signal
        })
      ])

      if (!myAssetsResponse.ok || !availableAssetsResponse.ok) {
        throw new Error('Failed to fetch assets')
      }

      const [myAssets, availableAssets] = await Promise.all([
        myAssetsResponse.json(),
        availableAssetsResponse.json()
      ])

      setYourAssets(myAssets.assets || [])
      setAvailableAssets(availableAssets.assets || [])
    } catch (error) {
      if ((error as { name?: string })?.name === 'AbortError') {
        console.log('Fetch aborted');
        return;
      }
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData();
    return () => controller.abort();
  }, [fetchData]);

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('Handling error:', errorMessage)
    setError(errorMessage)
    toast({
      title: "Error",
      description: errorMessage,
    })
  }

  const retryFetch = () => {
    setError(null)
    fetchData()
  }

  const proposeTrade = async () => {
    try {
      setSubmitting(true)
      const tradeData = {
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
      }
      console.log('Submitting trade with data:', tradeData)

      const response = await fetch(`${API_BASE_URL}/submit_trade`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tradeData)
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Trade response:', data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Trade submitted successfully",
        })
        
        // Clear selections
        setGiving([])
        setReceiving([])
        setIsConfirmTradeModalOpen(false)
        
        // If there were any failed trades, show warning
        if (data.failed?.length > 0) {
          toast({
            title: "Warning",
            description: `Trade failed for franchises: ${data.failed.join(', ')}`,
          })
        }
      } else {
        console.error('Trade submission failed:', data.error || 'Unknown error')
        throw new Error(data.error || "Failed to submit trade. Please try again.")
      }
    } catch (error) {
      console.error('Trade error:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack)
      }
      handleError(error)
      setIsConfirmTradeModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-400">Error</h1>
          <div className="text-lg mb-8">{error}</div>
          <Button 
            onClick={retryFetch}
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col p-2 md:p-8">
        <div className="w-full max-w-[95%] md:max-w-6xl mx-auto">
          {/* Donation Banner - Desktop Only */}
          <div className="hidden md:block mb-4">
            <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Support the Project</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400/90 text-sm font-medium">Cashapp:</span>
                  <code className="text-gray-200 select-all text-sm">$elliot1deag</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-400/90 text-sm font-medium">ETH:</span>
                  <code className="text-gray-200 select-all font-mono text-sm">0xc71e3870Ae47780Dc37e103FE56782A62d7b7eeF</code>
                </div>
              </div>
            </div>
          </div>

          {/* Title and Auth Header */}
          <h1 className="text-xl sm:text-2xl md:text-5xl font-bold mb-2 md:mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            MFL Rebuild Trade Tool
          </h1>

          <div className="mb-2 md:mb-4">
            <AuthHeader onLeagueChange={handleLeagueChange} />
          </div>

          {loading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                <p className="text-gray-300">Loading...</p>
              </div>
            </div>
          )}

          {/* Show mobile layout on small screens and desktop layout on medium and up */}
          <div className="block md:hidden">
            <MobileLayout
              giving={giving}
              receiving={receiving}
              removeFromTrade={removeFromTrade}
              setIsYourAssetsModalOpen={setIsYourAssetsModalOpen}
              setIsAvailableAssetsModalOpen={setIsAvailableAssetsModalOpen}
              setIsConfirmTradeModalOpen={setIsConfirmTradeModalOpen}
            />
          </div>
          <div className="hidden md:block">
            <DesktopLayout
              giving={giving}
              receiving={receiving}
              yourAssets={yourAssets}
              availableAssets={availableAssets}
              loading={loading}
              yourSearchTerm={yourSearchTerm}
              availableSearchTerm={availableSearchTerm}
              handleSearch={handleSearch}
              addToTrade={addToTrade}
              removeFromTrade={removeFromTrade}
              filteredYourAssets={handleFilterYourAssets}
              filteredAvailableAssets={handleFilterAvailableAssets}
              isDialogOpen={isConfirmTradeModalOpen}
              setIsDialogOpen={setIsConfirmTradeModalOpen}
              proposeTrade={proposeTrade}
            />
          </div>

          {/* Rest of the modals */}
          <AssetSelectionModal
            isOpen={isYourAssetsModalOpen}
            onClose={() => setIsYourAssetsModalOpen(false)}
            assets={yourAssets}
            onAssetSelect={(asset) => addToTrade(asset, 'giving')}
            searchTerm={yourSearchTerm}
            onSearchChange={(term) => handleSearch(term, 'your')}
            title="Your Assets"
            isYourAssets={true}
          />

          <AssetSelectionModal
            isOpen={isAvailableAssetsModalOpen}
            onClose={() => setIsAvailableAssetsModalOpen(false)}
            assets={availableAssets}
            onAssetSelect={(asset) => addToTrade(asset, 'receiving')}
            searchTerm={availableSearchTerm}
            onSearchChange={(term) => handleSearch(term, 'available')}
            title="Available Assets"
          />

          <Dialog.Root open={isConfirmTradeModalOpen} onOpenChange={setIsConfirmTradeModalOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
              <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 text-gray-100 p-6 rounded-lg shadow-xl w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title className="text-xl font-semibold">Confirm Trade</Dialog.Title>
                  <Dialog.Close asChild>
                    <button className="text-gray-400 hover:text-gray-200 rounded-full p-1">
                      <X className="h-6 w-6" />
                    </button>
                  </Dialog.Close>
                </div>
                <Dialog.Description className="mb-4">
                  Are you sure you want to propose this trade?
                </Dialog.Description>
                <div className="mb-4">
                  <h3 className="font-semibold text-blue-400 mb-2">You are giving:</h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {giving.map(asset => (
                      <li key={asset.id}>{asset.name} ({asset.details})</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-6">
                  <h3 className="font-semibold text-blue-400 mb-2">You are receiving:</h3>
                  <ul className="list-disc list-inside text-gray-300">
                    {receiving.map(asset => (
                      <li key={asset.id}>{asset.name} ({asset.details})</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={proposeTrade}
                    className="bg-green-600 hover:bg-green-700 transition-colors duration-200 w-full py-3"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Confirm Trade"}
                  </Button>
                  <Button 
                    onClick={() => setIsConfirmTradeModalOpen(false)}
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-600 w-full py-3"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>

          {/* Donation Section - Mobile Only */}
          <div className="md:hidden mt-4 mb-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center">
                <div className="text-sm text-blue-400/90 font-medium bg-gray-800/80 px-3 py-1 rounded-md border border-blue-500/10">
                  Support the Project
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div className="bg-gray-800/80 px-3 py-2 rounded-md border border-blue-500/10">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400/90 text-sm font-medium">Cashapp</span>
                    <code className="text-gray-200 select-all text-sm">$elliot1deag</code>
                  </div>
                </div>
                <div className="bg-gray-800/80 px-3 py-2 rounded-md border border-blue-500/10">
                  <div className="flex flex-col gap-1">
                    <span className="text-blue-400/90 text-sm font-medium">ETH</span>
                    <code className="text-gray-200 select-all font-mono text-xs break-all">0xc71e3870Ae47780Dc37e103FE56782A62d7b7eeF</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <details className="bg-gray-800/50 rounded-lg p-4">
            <summary className="font-semibold text-blue-400 cursor-pointer">Disclaimer & How it works</summary>
            <div className="mt-2 text-sm text-gray-300">
              <p className="mb-2">
                <strong>Disclaimer:</strong> This tool is for entertainment purposes only and is provided "as is." We are not responsible for any errors, outcomes, or damages. Use at your own risk and always do your own research.
              </p>
              <p>
                <strong>How it works:</strong> This tool automatically identifies and sends trade offers to every team that has the picks you're targeting. For example, if you want Derrick Henry for a first and second round pick, it will instantly propose that trade to any team holding those exact picks.
              </p>
            </div>
          </details>
        </div>
      </div>
    </LazyMotion>
  )
}

