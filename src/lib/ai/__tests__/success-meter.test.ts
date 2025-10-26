/**
 * Unit tests for success-meter.ts
 * Tests message quality analysis and delta calculation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  getCategoryFromDelta,
  calculateNewMeter,
  determineGameStatus,
  validateAnalysisResult,
  validateUserMessage,
} from '../success-meter';
import type { MessageCategory } from '@/types/chat';

describe('Success Meter Utilities', () => {
  describe('getCategoryFromDelta', () => {
    it('should return "excellent" for delta >= 6', () => {
      expect(getCategoryFromDelta(6)).toBe('excellent');
      expect(getCategoryFromDelta(7)).toBe('excellent');
      expect(getCategoryFromDelta(8)).toBe('excellent');
    });

    it('should return "good" for delta 3-5', () => {
      expect(getCategoryFromDelta(3)).toBe('good');
      expect(getCategoryFromDelta(4)).toBe('good');
      expect(getCategoryFromDelta(5)).toBe('good');
    });

    it('should return "neutral" for delta -2 to 2', () => {
      expect(getCategoryFromDelta(-2)).toBe('neutral');
      expect(getCategoryFromDelta(-1)).toBe('neutral');
      expect(getCategoryFromDelta(0)).toBe('neutral');
      expect(getCategoryFromDelta(1)).toBe('neutral');
      expect(getCategoryFromDelta(2)).toBe('neutral');
    });

    it('should return "poor" for delta -5 to -3', () => {
      expect(getCategoryFromDelta(-3)).toBe('poor');
      expect(getCategoryFromDelta(-4)).toBe('poor');
      expect(getCategoryFromDelta(-5)).toBe('poor');
    });

    it('should return "bad" for delta <= -6', () => {
      expect(getCategoryFromDelta(-6)).toBe('bad');
      expect(getCategoryFromDelta(-7)).toBe('bad');
      expect(getCategoryFromDelta(-8)).toBe('bad');
    });
  });

  describe('calculateNewMeter', () => {
    it('should correctly add positive delta', () => {
      expect(calculateNewMeter(50, 5)).toBe(55);
      expect(calculateNewMeter(20, 8)).toBe(28);
    });

    it('should correctly subtract negative delta', () => {
      expect(calculateNewMeter(50, -5)).toBe(45);
      expect(calculateNewMeter(20, -8)).toBe(12);
    });

    it('should cap meter at 100', () => {
      expect(calculateNewMeter(95, 8)).toBe(100);
      expect(calculateNewMeter(98, 5)).toBe(100);
      expect(calculateNewMeter(100, 1)).toBe(100);
    });

    it('should floor meter at 0', () => {
      expect(calculateNewMeter(5, -8)).toBe(0);
      expect(calculateNewMeter(3, -5)).toBe(0);
      expect(calculateNewMeter(0, -1)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateNewMeter(0, 0)).toBe(0);
      expect(calculateNewMeter(100, 0)).toBe(100);
      expect(calculateNewMeter(50, 0)).toBe(50);
    });
  });

  describe('determineGameStatus', () => {
    it('should return "won" when meter >= 100', () => {
      expect(determineGameStatus(100)).toBe('won');
      expect(determineGameStatus(101)).toBe('won'); // Edge case
    });

    it('should return "lost" when meter <= 5', () => {
      expect(determineGameStatus(5)).toBe('lost');
      expect(determineGameStatus(0)).toBe('lost');
      expect(determineGameStatus(-1)).toBe('lost'); // Edge case
    });

    it('should return "active" for meter between 6-99', () => {
      expect(determineGameStatus(6)).toBe('active');
      expect(determineGameStatus(50)).toBe('active');
      expect(determineGameStatus(99)).toBe('active');
    });
  });

  describe('validateAnalysisResult', () => {
    it('should accept valid result', () => {
      const result = validateAnalysisResult({
        delta: 5,
        category: 'good',
        reasoning: 'This is a good message with personality',
      });

      expect(result.delta).toBe(5);
      expect(result.category).toBe('good');
      expect(result.reasoning).toBe('This is a good message with personality');
    });

    it('should clamp delta to -8 to 8 range', () => {
      expect(validateAnalysisResult({ delta: 10 }).delta).toBe(8);
      expect(validateAnalysisResult({ delta: -10 }).delta).toBe(-8);
      expect(validateAnalysisResult({ delta: 100 }).delta).toBe(8);
    });

    it('should round non-integer deltas', () => {
      expect(validateAnalysisResult({ delta: 5.7 }).delta).toBe(6);
      expect(validateAnalysisResult({ delta: -3.2 }).delta).toBe(-3);
    });

    it('should default invalid delta to 0', () => {
      expect(validateAnalysisResult({ delta: NaN }).delta).toBe(0);
      expect(validateAnalysisResult({ delta: undefined }).delta).toBe(0);
      expect(validateAnalysisResult({}).delta).toBe(0);
    });

    it('should validate category enum', () => {
      const invalidCategory = validateAnalysisResult({
        delta: 5,
        category: 'invalid' as MessageCategory,
      });
      expect(invalidCategory.category).toBe('good'); // Falls back to getCategoryFromDelta
    });

    it('should handle missing category', () => {
      const result = validateAnalysisResult({ delta: 7 });
      expect(result.category).toBe('excellent'); // Falls back
    });

    it('should ensure reasoning has minimum length', () => {
      const result = validateAnalysisResult({
        delta: 5,
        category: 'good',
        reasoning: 'short',
      });
      expect(result.reasoning).toBe('Message evaluation completed');
    });

    it('should truncate long reasoning', () => {
      const longReasoning = 'a'.repeat(250);
      const result = validateAnalysisResult({
        delta: 5,
        category: 'good',
        reasoning: longReasoning,
      });
      expect(result.reasoning.length).toBeLessThanOrEqual(200);
      expect(result.reasoning).toContain('...');
    });
  });

  describe('validateUserMessage', () => {
    it('should accept valid messages', () => {
      expect(validateUserMessage('Hello! How are you?')).toBeNull();
      expect(validateUserMessage('This is a normal message.')).toBeNull();
    });

    it('should reject empty messages', () => {
      expect(validateUserMessage('')).toBe('Message cannot be empty');
      expect(validateUserMessage('   ')).toBe('Message cannot be empty');
    });

    it('should reject messages over 500 characters', () => {
      const longMessage = 'a'.repeat(501);
      expect(validateUserMessage(longMessage)).toBe(
        'Message too long (max 500 characters)'
      );
    });

    it('should reject non-string messages', () => {
      expect(validateUserMessage(null as any)).toBe(
        'Message must be a non-empty string'
      );
      expect(validateUserMessage(undefined as any)).toBe(
        'Message must be a non-empty string'
      );
      expect(validateUserMessage(123 as any)).toBe(
        'Message must be a non-empty string'
      );
    });

    it('should detect gibberish (basic check)', () => {
      const gibberish = '!@#$%^&*()_+{}|:"<>?';
      expect(validateUserMessage(gibberish)).toBe(
        'Message appears to be gibberish'
      );
    });

    it('should allow emojis and special characters in normal messages', () => {
      expect(validateUserMessage('Hey! 😊 How are you?')).toBeNull();
      expect(validateUserMessage("That's amazing! 🎉")).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle a typical conversation flow', () => {
      let meter = 20; // Starting meter

      // Good opener
      const delta1 = 5;
      meter = calculateNewMeter(meter, delta1);
      expect(meter).toBe(25);
      expect(determineGameStatus(meter)).toBe('active');

      // Excellent follow-up
      const delta2 = 7;
      meter = calculateNewMeter(meter, delta2);
      expect(meter).toBe(32);
      expect(determineGameStatus(meter)).toBe('active');

      // Continue building up
      for (let i = 0; i < 10; i++) {
        meter = calculateNewMeter(meter, 7);
      }
      expect(meter).toBe(100); // Should cap at 100
      expect(determineGameStatus(meter)).toBe('won');
    });

    it('should handle declining conversation', () => {
      let meter = 50;

      // Poor message
      meter = calculateNewMeter(meter, -4);
      expect(meter).toBe(46);

      // Another poor message
      meter = calculateNewMeter(meter, -5);
      expect(meter).toBe(41);

      // Bad message
      meter = calculateNewMeter(meter, -8);
      expect(meter).toBe(33);

      // Keep declining
      meter = calculateNewMeter(meter, -8);
      meter = calculateNewMeter(meter, -8);
      meter = calculateNewMeter(meter, -8);
      meter = calculateNewMeter(meter, -8);

      expect(meter).toBe(1);
      expect(determineGameStatus(meter)).toBe('lost');
    });
  });
});

