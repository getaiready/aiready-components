import { getRatingSlug } from '@aiready/core/client';

type RatingSlug = 'excellent' | 'good' | 'fair' | 'needs-work' | 'critical';

interface ScoreMetadata {
  color: string;
  bg: string;
  label: string;
  glow: string;
}

const SCORE_METADATA: Record<RatingSlug, ScoreMetadata> = {
  excellent: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30 border-emerald-500/30',
    label: 'Excellent',
    glow: 'shadow-emerald-500/20',
  },
  good: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/30 border-emerald-500/30',
    label: 'AI-Ready',
    glow: 'shadow-emerald-500/20',
  },
  fair: {
    color: 'text-amber-400',
    bg: 'bg-amber-900/30 border-amber-500/30',
    label: 'Fair',
    glow: 'shadow-amber-500/20',
  },
  'needs-work': {
    color: 'text-red-400',
    bg: 'bg-red-900/30 border-red-500/30',
    label: 'Needs Improvement',
    glow: 'shadow-red-500/20',
  },
  critical: {
    color: 'text-red-400',
    bg: 'bg-red-900/30 border-red-500/30',
    label: 'Critical Issues',
    glow: 'shadow-red-500/20',
  },
};

const DEFAULT_METADATA: ScoreMetadata = {
  color: 'text-slate-400',
  bg: 'bg-slate-800/50 border-slate-700',
  label: 'Not analyzed',
  glow: '',
};

/**
 * Get the metadata for a score using core rating system
 */
function getMetadata(score: number | null | undefined): ScoreMetadata {
  if (score == null) return DEFAULT_METADATA;
  const rating = getRatingSlug(score) as RatingSlug;
  return SCORE_METADATA[rating] || SCORE_METADATA.critical;
}

/**
 * Get the Tailwind color class for a score using core rating system
 */
export function scoreColor(score: number | null | undefined): string {
  return getMetadata(score).color;
}

/**
 * Get the Tailwind background/border class for a score using core rating system
 */
export function scoreBg(score: number | null | undefined): string {
  return getMetadata(score).bg;
}

/**
 * Get the display label for a score using core rating system
 */
export function scoreLabel(score: number | null | undefined): string {
  return getMetadata(score).label;
}

/**
 * Get the Tailwind shadow glow class for a score using core rating system
 */
export function scoreGlow(score: number | null | undefined): string {
  return getMetadata(score).glow;
}

/**
 * Get rating from score (for use with ScoreBar component)
 */
export function getScoreRating(score: number | null | undefined): RatingSlug {
  if (score == null) return 'critical';
  return getRatingSlug(score) as RatingSlug;
}
