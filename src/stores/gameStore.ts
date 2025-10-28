import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Message, GirlProfile, GameStatus } from '@/types/chat';

interface GameState {
  // Round data
  roundId: string | null;
  girl: GirlProfile | null;

  // Success meter
  currentMeter: number;
  lastDelta: number | null;
  showDelta: boolean;

  // Messages
  messages: Message[];

  // Game status
  gameStatus: GameStatus;
  failReason: string | null;
  isWonThisSession: boolean; // NEW: Track if win happened in current session

  // UI state
  isLoading: boolean;
  error: string | null;

  // Hydration flag
  hasHydrated: boolean;

  // Actions
  initializeRound: (
    roundId: string,
    girl: GirlProfile,
    initialMessages: Message[],
    initialMeter: number
  ) => void;
  updateSuccessMeter: (delta: number, newValue: number) => void;
  addMessages: (userMessage: Message, aiMessage: Message) => void;
  addOptimisticMessage: (message: Message) => void;
  removeOptimisticMessage: (messageId: string) => void;
  updateMessageStatus: (messageId: string, status: 'sending' | 'read' | 'sent') => void;
  setGameStatus: (status: GameStatus, reason?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
  hideDelta: () => void;
}

const initialState = {
  roundId: null,
  girl: null,
  currentMeter: 20,
  lastDelta: null,
  showDelta: false,
  messages: [],
  gameStatus: 'active' as GameStatus,
  failReason: null,
  isWonThisSession: false,
  isLoading: false,
  error: null,
  hasHydrated: false,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeRound: (roundId, girl, initialMessages, initialMeter) => {
        const state = get();

        // CRITICAL: If this is a different round, immediately reset gameStatus
        // to prevent VictoryOverlay from rendering with persisted 'won' status
        if (state.roundId !== roundId && state.gameStatus === 'won') {
          console.log('🔄 Detected round change - resetting game status from won to active');
          set({ gameStatus: 'active', failReason: null, isWonThisSession: false });
        }

        // Check if we already have data for this round and it's recent
        if (
          state.hasHydrated &&
          state.roundId === roundId &&
          state.messages.length > 0
        ) {
          // Don't reinitialize if we already have data for this round
          console.log('Using persisted game state for round:', roundId);
          return;
        }

        // Initialize with new data (always reset game status for new rounds)
        set({
          roundId,
          girl,
          messages: initialMessages,
          currentMeter: initialMeter,
          lastDelta: null,
          showDelta: false,
          gameStatus: 'active',
          failReason: null,
          isWonThisSession: false, // Reset session flag for new round
          isLoading: false,
          error: null,
          hasHydrated: true,
        });
        
        console.log('Initialized new round:', roundId, 'with status: active');
      },

      updateSuccessMeter: (delta, newValue) => {
        set({
          currentMeter: newValue,
          lastDelta: delta,
          showDelta: true,
        });
      },

      addMessages: (userMessage, aiMessage) => {
        set((state) => ({
          messages: [...state.messages, userMessage, aiMessage],
        }));
      },

      addOptimisticMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      removeOptimisticMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        }));
      },

      updateMessageStatus: (messageId, status) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, status } : msg
          ),
        }));
      },

      setGameStatus: (status, reason) => {
        set({
          gameStatus: status,
          failReason: reason || null,
          isWonThisSession: status === 'won' ? true : false, // Track session win
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      resetGame: () => {
        set(initialState);
      },

      hideDelta: () => {
        set({ showDelta: false });
      },
    }),
    {
      name: 'charmdojo-game-state',
      // Only persist essential data
      // NOTE: isWonThisSession is deliberately NOT persisted - it should reset on page reload
      partialize: (state) => ({
        roundId: state.roundId,
        girl: state.girl,
        messages: state.messages,
        currentMeter: state.currentMeter,
        gameStatus: state.gameStatus,
        failReason: state.failReason,
        hasHydrated: state.hasHydrated,
        // isWonThisSession: NOT persisted - defaults to false on reload
      }),
    }
  )
);

