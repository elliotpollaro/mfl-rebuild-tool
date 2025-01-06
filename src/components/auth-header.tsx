"use client"

import * as React from 'react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'

interface League {
  id: string
  name: string
}

interface AuthHeaderProps {
  onLeagueChange: (leagueId: string | null) => void
}

export default function AuthHeader({ onLeagueChange }: AuthHeaderProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/status', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      })
      const data = await response.json()

      setIsAuthenticated(data.authenticated)
      if (data.authenticated) {
        const leaguesResponse = await fetch('http://localhost:5000/api/auth/leagues', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        })
        const leaguesData = await leaguesResponse.json()
        
        if (leaguesData.success) {
          setLeagues(leaguesData.leagues)
          if (data.league_id) {
            setSelectedLeague(data.league_id)
            onLeagueChange(data.league_id)
          }
        } else {
          setError('Failed to fetch leagues')
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setError('Failed to check authentication status')
    }
  }

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Username and password are required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        setIsAuthenticated(true)
        setLeagues(data.leagues || [])
        setPassword('') // Clear password for security
        setError(null) // Clear any previous errors
      } else {
        console.error('Login failed:', data)
        setError(data.error || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      })
      
      if (response.ok) {
        setIsAuthenticated(false)
        setSelectedLeague(null)
        setLeagues([])
        onLeagueChange(null)
        setUsername('')
        setPassword('')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to logout')
      }
    } catch (error) {
      console.error('Error logging out:', error)
      setError('Failed to logout')
    }
  }

  const handleLeagueChange = async (leagueId: string) => {
    setSelectedLeague(leagueId)
    try {
      const response = await fetch('http://localhost:5000/api/auth/select-league', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ league_id: leagueId })
      })
      const data = await response.json()
      if (data.success) {
        onLeagueChange(leagueId)
      } else {
        setError(data.error || 'Failed to select league')
      }
    } catch (error) {
      console.error('Error selecting league:', error)
      setError('Failed to select league')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as unknown as React.MouseEvent)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            type="text"
            placeholder="MFL Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-w-[200px]"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 min-w-[200px]"
          />
          <Button 
            onClick={handleLogin}
            disabled={isLoading || !username || !password}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {isLoading ? 'Logging in...' : 'Login with MFL'}
          </Button>
          {error && <div className="text-red-400 text-sm w-full">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={selectedLeague || ''} onValueChange={handleLeagueChange}>
          <SelectTrigger className="flex-1 min-w-[200px]">
            {selectedLeague ? 
              leagues.find(l => l.id === selectedLeague)?.name || 'Select League' 
              : 'Select League'}
          </SelectTrigger>
          <SelectContent>
            {leagues.map((league) => (
              <SelectItem key={league.id} value={league.id}>
                {league.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>
      {error ? (
        <div className="text-red-400 text-sm mt-2">{error}</div>
      ) : (
        <div className="text-gray-100 text-sm mt-2">Successfully logged in</div>
      )}
    </div>
  )
} 