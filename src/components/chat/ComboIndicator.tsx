'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/hooks/useGame';
import {
  getComboDisplayText,
  getComboTooltip,
  getComboColorTheme,
  MAX_COMBO_LEVEL,
} from '@/lib/game/combo-system';

export function ComboIndicator() {
  const { currentCombo, lastComboChange, clearComboAnimation } = useGame();
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Trigger animation when combo changes
  useEffect(() => {
    if (lastComboChange) {
      setIsAnimating(true);
      
      // Clear animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
        clearComboAnimation();
      }, 600); // Match animation duration
      
      return () => clearTimeout(timer);
    }
  }, [lastComboChange, clearComboAnimation]);
  
  const displayText = getComboDisplayText(currentCombo);
  const tooltip = getComboTooltip(currentCombo);
  const colors = getComboColorTheme(currentCombo);
  
  // Determine animation class
  const animationClass = isAnimating
    ? lastComboChange === 'increase'
      ? 'animate-combo-increase'
      : 'animate-combo-break'
    : '';
  
  // Special fire animation for max combo
  const isOnFire = currentCombo === MAX_COMBO_LEVEL;
  
  return (
    <div
      className={`
        relative px-3 py-1.5 rounded-full 
        ${colors.bg} ${colors.text} ${colors.glow}
        border border-white/10
        transition-all duration-300
        ${animationClass}
        ${isOnFire ? 'fire-background' : ''}
      `}
      title={tooltip}
    >
      {/* Fire animation background for max combo */}
      {isOnFire && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="fire-animation" />
        </div>
      )}
      
      {/* Text content */}
      <span className="relative z-10 text-sm font-semibold whitespace-nowrap">
        {displayText}
      </span>
      
      {/* Glow pulse effect for combo increases */}
      {isAnimating && lastComboChange === 'increase' && (
        <div className="absolute inset-0 rounded-full bg-current opacity-30 animate-ping" />
      )}
      
      <style jsx>{`
        @keyframes combo-increase {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes combo-break {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        
        @keyframes fire {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-10px) scale(1.1);
            opacity: 1;
          }
        }
        
        .animate-combo-increase {
          animation: combo-increase 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-combo-break {
          animation: combo-break 0.4s ease-in-out;
        }
        
        .fire-background {
          position: relative;
          overflow: hidden;
        }
        
        .fire-animation {
          position: absolute;
          inset: -20%;
          background: linear-gradient(
            to top,
            rgba(251, 146, 60, 0.4),
            rgba(239, 68, 68, 0.4),
            rgba(251, 191, 36, 0.4)
          );
          filter: blur(8px);
          animation: fire 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

