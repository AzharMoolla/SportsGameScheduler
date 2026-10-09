import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Follow, Preferences, SurfaceMode } from '../lib/store'
import type { SignInProvider } from '../lib/authProviders'

export type AppState = {
  follows: Follow[]
  toggleFollow: (follow: Follow) => void
  followedTeams: string[]
  followedEventIds: string[]
  followedLeagueIds: string[]
  followedCompetitorIds: string[]
  prefs: Preferences
  surfaceMode: SurfaceMode
  setPrefs: (prefs: Preferences) => void
  auth: {
    ready: boolean
    user: User | null
    configured: boolean
    signInWithMagicLink: (email: string) => Promise<void>
    signInWithProvider: (provider: SignInProvider) => Promise<void>
    signOut: () => Promise<void>
  }
}

export const AppStateContext = createContext<AppState | null>(null)

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) throw new Error('useAppState must be used inside AppStateProvider')
  return context
}
