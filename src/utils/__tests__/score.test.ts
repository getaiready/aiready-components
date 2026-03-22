import { describe, it, expect } from 'vitest';
import {
  scoreColor,
  scoreBg,
  scoreLabel,
  getScoreRating,
  scoreGlow,
} from '../score';

describe('Score Utilities', () => {
  it('should return correct color for scores', () => {
    expect(scoreColor(95)).toBe('text-emerald-400');
    expect(scoreColor(80)).toBe('text-emerald-400');
    expect(scoreColor(65)).toBe('text-amber-400');
    expect(scoreColor(45)).toBe('text-red-400');
    expect(scoreColor(20)).toBe('text-red-400');
    expect(scoreColor(null)).toBe('text-slate-400');
  });

  it('should return correct background for scores', () => {
    expect(scoreBg(95)).toContain('emerald');
    expect(scoreBg(80)).toContain('emerald');
    expect(scoreBg(65)).toContain('amber');
    expect(scoreBg(45)).toContain('red');
    expect(scoreBg(20)).toContain('red');
    expect(scoreBg(null)).toContain('slate');
  });

  it('should return correct labels', () => {
    expect(scoreLabel(95)).toBe('Excellent');
    expect(scoreLabel(80)).toBe('AI-Ready');
    expect(scoreLabel(65)).toBe('Fair');
    expect(scoreLabel(45)).toBe('Needs Improvement');
    expect(scoreLabel(20)).toBe('Critical Issues');
    expect(scoreLabel(null)).toBe('Not analyzed');
  });

  it('should return correct glow for scores', () => {
    expect(scoreGlow(95)).toContain('emerald');
    expect(scoreGlow(80)).toContain('emerald');
    expect(scoreGlow(65)).toContain('amber');
    expect(scoreGlow(45)).toContain('red');
    expect(scoreGlow(20)).toContain('red');
    expect(scoreGlow(null)).toBe('');
  });

  it('should return correct rating strings', () => {
    expect(getScoreRating(95)).toBe('excellent');
    expect(getScoreRating(80)).toBe('good');
    expect(getScoreRating(65)).toBe('fair');
    expect(getScoreRating(45)).toBe('needs-work');
    expect(getScoreRating(20)).toBe('critical');
    expect(getScoreRating(null)).toBe('critical');
  });
});
