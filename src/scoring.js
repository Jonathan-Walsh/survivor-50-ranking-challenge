/**
 * Scoring Module
 *
 * Calculates points based on prediction accuracy
 */

import { getTierInfo } from './game.js';

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
 * Calculate score for a player's predictions
 * @param {number[]} permutation - Player's predictions [1-24]
 * @param {Array} rankings - Actual placement data from rankings.json
 * @returns {Object} - { currentScore, maxPossibleScore, breakdown }
 */
export function calculateScore(permutation, rankings) {
  let currentScore = 0;
  let totalPossibleScore = 0;
  let pointsLost = 0;
  const breakdown = {
    correct: [],
    incorrect: [],
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
    const maxPoints = tierInfo.points;
    totalPossibleScore += maxPoints;

    if (contestant.placement === null) {
      // Not yet resolved
      breakdown.unresolved.push({
        id: contestantId,
        name: contestant.name,
        predictedTier: tierInfo.name,
        potentialPoints: maxPoints,
      });
    } else {
      // Check if in correct tier
      const actualTier = getTierInfo(contestant.placement);
      const isCorrect = actualTier.tier === tierInfo.tier;

      if (isCorrect) {
        currentScore += maxPoints;
        breakdown.correct.push({
          id: contestantId,
          name: contestant.name,
          predictedTier: tierInfo.name,
          actualPlacement: contestant.placement,
          points: maxPoints,
        });
      } else {
        pointsLost += maxPoints;
        breakdown.incorrect.push({
          id: contestantId,
          name: contestant.name,
          predictedTier: tierInfo.name,
          actualTier: actualTier.name,
          actualPlacement: contestant.placement,
          points: 0,
        });
      }
    }
  }

  const maxPossibleScore = totalPossibleScore - pointsLost;
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
export function compareScores(players, rankings) {
  const scores = players.map((player) => {
    const scoreData = calculateScore(player.permutation, rankings);
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
