/**
 * Pyramid Component
 * Main game interface with 6-tier pyramid structure and drag-and-drop
 */

const { h } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { ContestantCard } from './ContestantCard.js';
import { getTierRange } from '../game.js';

/**
 * Tier Component (one level of pyramid)
 */
function Tier({ tierNum, contestants, onDrop, onDragOver }) {
  const tierInfo = getTierRange(tierNum);

  return h(
    'div',
    {
      className: `tier tier-${tierNum}`,
      'data-tier': tierNum,
    },
    h('div', { className: 'tier-label' },
      h('div', { className: 'tier-title' }, tierInfo.name),
      h('div', { className: 'tier-placements' }, `Places ${tierInfo.min}-${tierInfo.max}`),
      h('div', { className: 'tier-points' }, `${tierInfo.points} pts each`)
    ),
    h(
      'div',
      {
        className: 'tier-slots',
        onDrop: (e) => onDrop(e, tierNum),
        onDragOver: onDragOver,
      },
      contestants.map((contestant) =>
        contestant ? (
          h(ContestantCard, {
            key: contestant.id,
            id: contestant.id,
            name: contestant.name,
            imageUrl: contestant.imageUrl,
            onDragStart: (e, id) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('contestantId', id);
            },
          })
        ) : (
          h('div', { key: `empty-${Math.random()}`, className: 'empty-slot' })
        )
      )
    )
  );
}

/**
 * Main Pyramid Component
 */
export function Pyramid({ permutation, contestants, onPermutationChange }) {
  const [draggedId, setDraggedId] = useState(null);
  const [pyramidState, setPyramidState] = useState(null);

  // Build pyramid layout from permutation
  useEffect(() => {
    // Create 6 tiers (winner, final 2, final 3, top 6, bottom 12, unranked pool)
    const tiers = {
      1: [], // Winner (1 slot, placement 1)
      2: [], // Final 2 (2 slots, placements 2-3)
      3: [], // Final 3 (3 slots, placements 4-6)
      4: [], // Top 6 (6 slots, placements 7-12)
      5: [], // Bottom 12 (12 slots, placements 13-24)
      6: [], // Unranked pool (all remaining)
    };

    // Map permutation indices to tiers
    // Permutation[i] = contestant ID at placement i+1
    // So permutation[0] = winner, permutation[1] = runner-up, etc.
    for (let i = 0; i < permutation.length; i++) {
      const contestantId = permutation[i];
      let tier = 6; // Default to unranked

      if (i === 0) tier = 1; // Winner
      else if (i <= 2) tier = 2; // Final 2
      else if (i <= 5) tier = 3; // Final 3
      else if (i <= 11) tier = 4; // Top 6
      else if (i <= 23) tier = 5; // Bottom 12

      const contestant = contestants.find((c) => c.id === contestantId);
      if (contestant) {
        tiers[tier].push(contestant);
      }
    }

    setPyramidState(tiers);
  }, [permutation, contestants]);

  const handleDrop = (e, targetTier) => {
    e.preventDefault();
    e.stopPropagation();

    const contestantId = parseInt(e.dataTransfer.getData('contestantId'));
    if (!contestantId) return;

    // Remove from current position in permutation
    let newPerm = permutation.filter((id) => id !== contestantId);

    // Get tier ranges
    const tierRange = getTierRange(targetTier);
    const currentTierSize = pyramidState[targetTier].length;

    // Check if tier is full (except unranked pool)
    if (targetTier !== 6 && currentTierSize >= tierRange.count) {
      console.warn(`Tier ${targetTier} is full`);
      return;
    }

    // Calculate insertion position based on target tier
    let insertPos = 0;
    if (targetTier === 1) insertPos = 0; // Winner
    else if (targetTier === 2) insertPos = 1 + currentTierSize; // After winner
    else if (targetTier === 3) insertPos = 3 + currentTierSize; // After final 2
    else if (targetTier === 4) insertPos = 6 + currentTierSize; // After final 3
    else if (targetTier === 5) insertPos = 12 + currentTierSize; // After top 6
    else insertPos = newPerm.length; // End for unranked

    newPerm.splice(insertPos, 0, contestantId);
    onPermutationChange(newPerm);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  if (!pyramidState) {
    return h('div', null, 'Loading pyramid...');
  }

  return h(
    'div',
    { className: 'pyramid' },
    h('div', { className: 'pyramid-header' },
      h('h2', null, 'Your Predictions'),
      h('p', null, 'Drag contestants into the pyramid by predicted placement')
    ),
    h(
      'div',
      { className: 'pyramid-tiers' },
      [1, 2, 3, 4, 5].map((tierNum) =>
        h(Tier, {
          key: `tier-${tierNum}`,
          tierNum,
          contestants: pyramidState[tierNum],
          onDrop: handleDrop,
          onDragOver: handleDragOver,
        })
      )
    ),
    h(
      'div',
      { className: 'tier tier-pool' },
      h('div', { className: 'tier-label' },
        h('div', { className: 'tier-title' }, 'Unranked'),
        h('div', { className: 'tier-count' }, `${pyramidState[6].length} remaining`)
      ),
      h(
        'div',
        {
          className: 'tier-slots pool-slots',
          onDrop: (e) => handleDrop(e, 6),
          onDragOver: handleDragOver,
        },
        pyramidState[6].map((contestant) =>
          h(ContestantCard, {
            key: contestant.id,
            id: contestant.id,
            name: contestant.name,
            imageUrl: contestant.imageUrl,
            onDragStart: (e, id) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('contestantId', id);
              setDraggedId(id);
            },
          })
        )
      )
    )
  );
}
