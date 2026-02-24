/**
 * Game Module - Core Game Logic
 *
 * Handles game state initialization and validation
 */

/**
 * Create initial permutation [1, 2, 3, ..., 24]
 * This represents the starting state where all contestants are unranked
 * @returns {number[]} - Array [1, 2, 3, ..., 24]
 */
export function createInitialPermutation() {
  return Array.from({ length: 24 }, (_, i) => i + 1);
}

/**
 * Validate that a permutation is valid (contains 1-24 each exactly once)
 * @param {number[]} perm - Permutation to validate
 * @returns {boolean} - True if valid
 */
export function isValidPermutation(perm) {
  if (perm.length !== 24) return false;

  const sorted = [...perm].sort((a, b) => a - b);
  for (let i = 0; i < 24; i++) {
    if (sorted[i] !== i + 1) return false;
  }

  return true;
}

/**
 * Get tier info for a placement
 * @param {number} placement - Placement number (1-24)
 * @returns {Object} - { tier, name, points }
 */
export function getTierInfo(placement) {
  if (placement === 1) return { tier: 1, name: 'Winner', points: 10 };
  if (placement >= 2 && placement <= 3) return { tier: 2, name: 'Runner-Ups', points: 5 };
  if (placement >= 4 && placement <= 6) return { tier: 3, name: 'Top 6', points: 3 };
  if (placement >= 7 && placement <= 12) return { tier: 4, name: 'Top 12', points: 2 };
  if (placement >= 13 && placement <= 24) return { tier: 5, name: 'Bottom 12', points: 1 };
  return null;
}

/**
 * Get all placements for a tier
 * @param {number} tier - Tier number (1-5)
 * @returns {Object} - { min, max, count, points }
 */
export function getTierRange(tier) {
  const ranges = {
    1: { min: 1, max: 1, count: 1, points: 10, name: 'Winner' },
    2: { min: 2, max: 3, count: 2, points: 5, name: 'Runner-Ups' },
    3: { min: 4, max: 6, count: 3, points: 3, name: 'Top 6' },
    4: { min: 7, max: 12, count: 6, points: 2, name: 'Top 12' },
    5: { min: 13, max: 24, count: 12, points: 1, name: 'Bottom 12' },
  };
  return ranges[tier];
}

/**
 * Get total possible points
 * @returns {number} - 53 points (1*12 + 2*6 + 3*3 + 5*2 + 10*1)
 */
export function getTotalPossiblePoints() {
  return 53;
}
