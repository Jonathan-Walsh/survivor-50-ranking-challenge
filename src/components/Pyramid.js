/**
 * Pyramid Component
 * Main game interface with 6-tier pyramid structure and drag-and-drop
 *
 * Instead of deriving tiers from a flat permutation array, we store
 * explicit tier assignments: { 1: [ids], 2: [ids], ..., 5: [ids], pool: [ids] }
 * and only flatten to a permutation when the user locks in.
 */

const { h } = window.preact;
const { useState, useEffect, useCallback } = window.preactHooks;

import { ContestantCard } from './ContestantCard.js';
import { getTierRange } from '../game.js';

const TIER_ORDER = [1, 2, 3, 4, 5];

/**
 * Tier Component (one row of the pyramid)
 */
function Tier({ tierNum, contestants, maxSlots, onDrop, onDragOver }) {
  const tierInfo = getTierRange(tierNum);
  const spotsLeft = maxSlots - contestants.length;

  return h(
    'div',
    { className: `tier tier-${tierNum}` },
    h('div', { className: 'tier-label' },
      h('div', { className: 'tier-title' }, tierInfo.name),
      h('div', { className: 'tier-placements' },
        tierInfo.min === tierInfo.max
          ? `Place ${tierInfo.min}`
          : `Places ${tierInfo.min}\u2013${tierInfo.max}`
      ),
      h('div', { className: 'tier-points' }, `${tierInfo.points} pts each`),
      spotsLeft > 0 && h('div', { className: 'tier-spots' }, `${spotsLeft} open`)
    ),
    h(
      'div',
      {
        className: `tier-slots ${contestants.length === 0 ? 'tier-slots-empty' : ''}`,
        onDrop: (e) => onDrop(e, tierNum),
        onDragOver,
      },
      contestants.length > 0
        ? contestants.map((c) =>
            h(ContestantCard, {
              key: c.id,
              id: c.id,
              name: c.name,
              imageUrl: c.imageUrl,
              onDragStart: (e, id) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(id));
              },
            })
          )
        : h('div', { className: 'drop-hint' }, `Drag contestants here (${maxSlots} spots)`)
    )
  );
}

/**
 * Build the initial tier map: everyone in the pool.
 */
function buildInitialTiers(contestants) {
  return {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    pool: contestants.map((c) => c.id),
  };
}

/**
 * Convert tier map → flat permutation array for encoding.
 * Tier 1 first, then 2, …, 5.  Pool members go at the end in their current order.
 */
function tiersToPermutation(tierMap) {
  const perm = [];
  for (const t of TIER_ORDER) {
    for (const id of tierMap[t]) perm.push(id);
  }
  for (const id of tierMap.pool) perm.push(id);
  return perm;
}

/**
 * Main Pyramid Component
 */
export function Pyramid({ contestants, onPermutationChange }) {
  const [tierMap, setTierMap] = useState(() => buildInitialTiers(contestants));

  // Lookup table: id → contestant object
  const contestantById = {};
  for (const c of contestants) contestantById[c.id] = c;

  // Whenever tierMap changes, push a fresh permutation up to parent
  useEffect(() => {
    onPermutationChange(tiersToPermutation(tierMap));
  }, [tierMap]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e, targetTier) => {
    e.preventDefault();
    e.stopPropagation();

    const raw = e.dataTransfer.getData('text/plain');
    const contestantId = parseInt(raw, 10);
    if (!contestantId || isNaN(contestantId)) return;

    setTierMap((prev) => {
      // If target is a numbered tier, enforce capacity
      if (targetTier !== 'pool') {
        const range = getTierRange(targetTier);
        if (prev[targetTier].length >= range.count) return prev; // full
      }

      // Clone
      const next = {};
      for (const key of [...TIER_ORDER, 'pool']) {
        next[key] = prev[key].filter((id) => id !== contestantId);
      }

      // Insert into target
      next[targetTier].push(contestantId);
      return next;
    });
  }, []);

  return h(
    'div',
    { className: 'pyramid' },
    h('div', { className: 'pyramid-header' },
      h('h2', null, 'Your Predictions')
    ),
    h(
      'div',
      { className: 'pyramid-tiers' },
      TIER_ORDER.map((tierNum) => {
        const range = getTierRange(tierNum);
        return h(Tier, {
          key: tierNum,
          tierNum,
          contestants: tierMap[tierNum].map((id) => contestantById[id]).filter(Boolean),
          maxSlots: range.count,
          onDrop: handleDrop,
          onDragOver: handleDragOver,
        });
      })
    ),
    h(
      'div',
      { className: 'tier tier-pool' },
      h('div', { className: 'tier-label' },
        h('div', { className: 'tier-title' }, 'Contestants'),
        h('div', { className: 'tier-count' }, `${tierMap.pool.length} remaining`)
      ),
      h(
        'div',
        {
          className: 'tier-slots pool-slots',
          onDrop: (e) => handleDrop(e, 'pool'),
          onDragOver: handleDragOver,
        },
        tierMap.pool.map((id) => {
          const c = contestantById[id];
          if (!c) return null;
          return h(ContestantCard, {
            key: c.id,
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl,
            onDragStart: (e, cid) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(cid));
            },
          });
        })
      )
    )
  );
}
