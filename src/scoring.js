/**
 * Scoring Module
 *
 * Calculates points based on prediction accuracy
 */

import { getTierInfo } from './game.js';

export const SCORING_MODES = {
  CLASSIC: 'classic',
  PROGRESSIVE: 'progressive',
};

/**
 * Get points for a contestant based on their placement
 * @param {number} placement - Actual placement (1-24, or null)
 * @returns {number} - Points earned (0 if not yet placed)
 */
export function getPointsForPlacement(placement) {
  if (placement === null) return 0;
  const tier = getTierInfo(placement);
  return tier ? tier.points : 0;
}

/**
 * Get points for a predicted placement vs actual placement.
 * Classic: exact-tier only.
 * Progressive: partial credit up to predicted tier cap.
 * @param {number} predictedPlacement
 * @param {number|null} actualPlacement
 * @param {string} mode
 * @returns {number}
 */
export function getPointsForMatch(predictedPlacement, actualPlacement, mode = SCORING_MODES.CLASSIC) {
  if (actualPlacement === null || actualPlacement === undefined) return 0;

  const predictedTier = getTierInfo(predictedPlacement);
  const actualTier = getTierInfo(actualPlacement);
  if (!predictedTier || !actualTier) return 0;

  if (mode === SCORING_MODES.PROGRESSIVE) {
    // Winner slot uses linear points by exact finish (1st=10 ... 10th+=1)
    if (predictedTier.tier === 1) {
      return Math.max(1, 11 - actualPlacement);
    }
    return Math.min(predictedTier.points, actualTier.points);
  }

  return predictedTier.tier === actualTier.tier ? predictedTier.points : 0;
}

/**
 * Calculate score for a player's predictions
 * @param {number[]} permutation - Player's predictions [1-24]
 * @param {Array} rankings - Actual placement data from rankings.json
 * @returns {Object} - { currentScore, maxPossibleScore, breakdown }
 */
export function calculateScore(permutation, rankings, mode = SCORING_MODES.CLASSIC) {
  let currentScore = 0;
  let maxPossibleScore = 0;
  const breakdown = {
    exact: [],
    partial: [],
    miss: [],
    unresolved: [],
  };

  // For each predicted position
  for (let i = 0; i < permutation.length; i++) {
    const contestantId = permutation[i];
    const predictedPlacement = i + 1; // Position in pyramid

    // Find actual placement from rankings
    const contestant = rankings.find((c) => c.id === contestantId);
    if (!contestant) continue;

    const tierInfo = getTierInfo(predictedPlacement);
    const maxPoints = tierInfo ? tierInfo.points : 0;
    maxPossibleScore += maxPoints;

    if (contestant.placement === null) {
      // Not yet resolved
      breakdown.unresolved.push({
        id: contestantId,
        name: contestant.name,
        predictedTier: tierInfo.name,
        potentialPoints: maxPoints,
      });
    } else {
      const earnedPoints = getPointsForMatch(predictedPlacement, contestant.placement, mode);
      const actualTier = getTierInfo(contestant.placement);
      currentScore += earnedPoints;

      // Once resolved, potential equals what was actually earned.
      maxPossibleScore -= maxPoints;
      maxPossibleScore += earnedPoints;

      const detail = {
        id: contestantId,
        name: contestant.name,
        predictedTier: tierInfo.name,
        actualTier: actualTier ? actualTier.name : null,
        actualPlacement: contestant.placement,
        points: earnedPoints,
        maxPoints,
      };

      if (earnedPoints === maxPoints) {
        breakdown.exact.push(detail);
      } else if (earnedPoints > 0) {
        breakdown.partial.push(detail);
      } else {
        breakdown.miss.push(detail);
      }
    }
  }

  const potentialRemaining = maxPossibleScore - currentScore;

  return {
    currentScore,
    maxPossibleScore,
    potentialRemaining,
    breakdown,
    progress: `${currentScore}/${maxPossibleScore}`,
    accuracy: maxPossibleScore > 0 ? (currentScore / maxPossibleScore * 100).toFixed(1) : 'N/A',
  };
}

/**
 * Compare multiple players' scores
 * @param {Array} players - Array of { name, code, permutation }
 * @param {Array} rankings - Actual placement data
 * @returns {Array} - Sorted by score descending
 */
export function compareScores(players, rankings, mode = SCORING_MODES.CLASSIC) {
  const scores = players.map((player) => {
    const scoreData = calculateScore(player.permutation, rankings, mode);
    return {
      name: player.name,
      code: player.code,
      ...scoreData,
    };
  });

  // Sort by current score (descending), then by max possible (descending)
  return scores.sort((a, b) => {
    if (a.currentScore !== b.currentScore) {
      return b.currentScore - a.currentScore;
    }
    return b.maxPossibleScore - a.maxPossibleScore;
  });
}

/**
 * Fetch rankings from rankings.json
 * @returns {Promise<Array>} - Rankings data
 */
export async function fetchRankings() {
  try {
    const response = await fetch('public/data/rankings.json');
    if (!response.ok) throw new Error('Failed to fetch rankings');
    const data = await response.json();
    return data.contestants || [];
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }
}

/**
 * Get summary statistics for a score
 * @param {Object} scoreData - From calculateScore()
 * @returns {Object} - { tier, message }
 */
export function getScoreTier(score) {
  if (score >= 40) {
    return { tier: 'S', message: 'Champion' };
  } else if (score >= 30) {
    return { tier: 'A', message: 'Excellent' };
  } else if (score >= 20) {
    return { tier: 'B', message: 'Good' };
  } else if (score >= 10) {
    return { tier: 'C', message: 'Fair' };
  } else {
    return { tier: 'D', message: 'Beginner' };
  }
}
