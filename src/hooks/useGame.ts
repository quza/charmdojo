'use client';

import { useGameStore } from '@/stores/gameStore';

/**
 * Custom hook for accessing game state and actions.
 * Uses selective subscriptions for better performance.
 */
export function useGame() {
  // State selectors
  const roundId = useGameStore((state) => state.roundId);
  const girl = useGameStore((state) => state.girl);
  const currentMeter = useGameStore((state) => state.currentMeter);
  const lastDelta = useGameStore((state) => state.lastDelta);
  const showDelta = useGameStore((state) => state.showDelta);
  const messages = useGameStore((state) => state.messages);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const failReason = useGameStore((state) => state.failReason);
  const isLoading = useGameStore((state) => state.isLoading);
  const error = useGameStore((state) => state.error);

  // Action selectors
  const initializeRound = useGameStore((state) => state.initializeRound);
  const updateSuccessMeter = useGameStore((state) => state.updateSuccessMeter);
  const addMessages = useGameStore((state) => state.addMessages);
  const addOptimisticMessage = useGameStore((state) => state.addOptimisticMessage);
  const removeOptimisticMessage = useGameStore((state) => state.removeOptimisticMessage);
  const setGameStatus = useGameStore((state) => state.setGameStatus);
  const setLoading = useGameStore((state) => state.setLoading);
  const setError = useGameStore((state) => state.setError);
  const resetGame = useGameStore((state) => state.resetGame);
  const hideDelta = useGameStore((state) => state.hideDelta);

  return {
    // State
    roundId,
    girl,
    currentMeter,
    lastDelta,
    showDelta,
    messages,
    gameStatus,
    failReason,
    isLoading,
    error,

    // Actions
    initializeRound,
    updateSuccessMeter,
    addMessages,
    addOptimisticMessage,
    removeOptimisticMessage,
    setGameStatus,
    setLoading,
    setError,
    resetGame,
    hideDelta,
  };
}

