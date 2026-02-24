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
import { getTierInfo, getTierRange } from '../game.js';

const TIER_ORDER = [1, 2, 3, 4, 5];
const TRIBE_ORDER = ['cila', 'kalo', 'vatu'];
const TRIBE_LABELS = {
  cila: 'Cila',
  kalo: 'Kalo',
  vatu: 'Vatu',
};

/**
 * Tier Component (one row of the pyramid)
 */
function Tier({ tierNum, contestants, maxSlots, onDrop, onDragOver, readOnly, statusById }) {
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
        onDrop: readOnly ? undefined : (e) => onDrop(e, tierNum),
        onDragOver: readOnly ? undefined : onDragOver,
      },
      contestants.length > 0
        ? contestants.map((c) =>
            h(ContestantCard, {
              key: c.id,
              id: c.id,
              name: c.name,
              imageUrl: c.imageUrl,
              tribe: c.tribe,
              draggable: !readOnly,
              status: statusById[c.id] || null,
              onDragStart: (e, id) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(id));
              },
            })
          )
        : h('div', { className: 'drop-hint' }, readOnly ? `No picks (${maxSlots} spots)` : `Drag contestants here (${maxSlots} spots)`)
    )
  );
}

/**
 * Build initial tiers.
 * If an initial permutation exists, populate tiers from placement order.
 */
function buildInitialTiers(contestants, initialPermutation = null) {
  const tribeById = {};
  for (const c of contestants) {
    tribeById[c.id] = c.tribe;
  }

  const emptyPool = {
    cila: [],
    kalo: [],
    vatu: [],
  };

  if (!initialPermutation || initialPermutation.length === 0) {
    for (const c of contestants) {
      const tribe = tribeById[c.id] || 'cila';
      emptyPool[tribe].push(c.id);
    }
    return {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      pool: emptyPool,
    };
  }

  const validIds = new Set(contestants.map((c) => c.id));
  const seen = new Set();
  const orderedIds = [];

  for (const id of initialPermutation) {
    if (!validIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    orderedIds.push(id);
  }

  for (const c of contestants) {
    if (!seen.has(c.id)) orderedIds.push(c.id);
  }

  const tier1Count = getTierRange(1).count;
  const tier2Count = getTierRange(2).count;
  const tier3Count = getTierRange(3).count;
  const tier4Count = getTierRange(4).count;
  const tier5Count = getTierRange(5).count;

  let cursor = 0;
  const tier1 = orderedIds.slice(cursor, cursor + tier1Count);
  cursor += tier1Count;
  const tier2 = orderedIds.slice(cursor, cursor + tier2Count);
  cursor += tier2Count;
  const tier3 = orderedIds.slice(cursor, cursor + tier3Count);
  cursor += tier3Count;
  const tier4 = orderedIds.slice(cursor, cursor + tier4Count);
  cursor += tier4Count;
  const tier5 = orderedIds.slice(cursor, cursor + tier5Count);
  cursor += tier5Count;
  const poolIds = orderedIds.slice(cursor);
  const pool = {
    cila: [],
    kalo: [],
    vatu: [],
  };
  for (const id of poolIds) {
    const tribe = tribeById[id] || 'cila';
    pool[tribe].push(id);
  }

  return {
    1: tier1,
    2: tier2,
    3: tier3,
    4: tier4,
    5: tier5,
    pool,
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
  for (const tribe of TRIBE_ORDER) {
    for (const id of tierMap.pool[tribe]) perm.push(id);
  }
  return perm;
}

function buildStatusById(tierMap, rankings) {
  if (!Array.isArray(rankings) || rankings.length === 0) return {};

  const placementById = new Map();
  const knownPlacements = new Set();
  for (const c of rankings) {
    placementById.set(c.id, c.placement);
    if (c.placement !== null && c.placement !== undefined) {
      knownPlacements.add(c.placement);
    }
  }

  const tierResolved = {};
  for (const tierNum of TIER_ORDER) {
    const { min, max } = getTierRange(tierNum);
    let resolved = true;
    for (let placement = min; placement <= max; placement++) {
      if (!knownPlacements.has(placement)) {
        resolved = false;
        break;
      }
    }
    tierResolved[tierNum] = resolved;
  }

  const statusById = {};
  for (const tierNum of TIER_ORDER) {
    for (const id of tierMap[tierNum]) {
      const placement = placementById.get(id);
      if (placement !== null && placement !== undefined) {
        const actualTier = getTierInfo(placement);
        statusById[id] = actualTier && actualTier.tier === tierNum ? 'correct' : 'wrong';
      } else if (tierResolved[tierNum]) {
        statusById[id] = 'wrong';
      }
    }
  }

  return statusById;
}

/**
 * Main Pyramid Component
 */
export function Pyramid({
  contestants,
  onPermutationChange,
  initialPermutation,
  readOnly = false,
  title = 'Your Predictions',
  rankings = [],
}) {
  const [tierMap, setTierMap] = useState(() => buildInitialTiers(contestants, initialPermutation));

  // Lookup table: id → contestant object
  const contestantById = {};
  for (const c of contestants) contestantById[c.id] = c;
  const statusById = buildStatusById(tierMap, rankings);

  // Whenever tierMap changes, push a fresh permutation up to parent
  useEffect(() => {
    if (onPermutationChange) {
      onPermutationChange(tiersToPermutation(tierMap));
    }
  }, [tierMap, onPermutationChange]);

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
      for (const key of TIER_ORDER) {
        next[key] = prev[key].filter((id) => id !== contestantId);
      }
      next.pool = {};
      for (const tribe of TRIBE_ORDER) {
        next.pool[tribe] = prev.pool[tribe].filter((id) => id !== contestantId);
      }

      // Insert into target
      if (targetTier === 'pool') {
        const tribe = (contestantById[contestantId] && contestantById[contestantId].tribe) || 'cila';
        next.pool[tribe].push(contestantId);
      } else {
        next[targetTier].push(contestantId);
      }
      return next;
    });
  }, [contestantById]);

  return h(
    'div',
    { className: 'pyramid' },
    h('div', { className: 'pyramid-header' },
      h('h2', null, title)
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
          readOnly,
          statusById,
        });
      })
    ),
    !readOnly && h(
      'div',
      { className: 'tier tier-pool' },
      h('div', { className: 'tier-label' },
        h('div', { className: 'tier-title' }, 'Contestants'),
        h('div', { className: 'tier-count' },
          `${TRIBE_ORDER.reduce((sum, tribe) => sum + tierMap.pool[tribe].length, 0)} remaining`
        )
      ),
      h('div', { className: 'pool-tribes' },
        TRIBE_ORDER.map((tribe) =>
          h('div', { key: tribe, className: `pool-tribe pool-tribe-${tribe}` },
            h('div', { className: 'pool-tribe-label' }, TRIBE_LABELS[tribe]),
            h(
              'div',
              {
                className: 'tier-slots pool-slots',
                onDrop: (e) => handleDrop(e, 'pool'),
                onDragOver: handleDragOver,
              },
              tierMap.pool[tribe].map((id) => {
                const c = contestantById[id];
                if (!c) return null;
                return h(ContestantCard, {
                  key: c.id,
                  id: c.id,
                  name: c.name,
                  imageUrl: c.imageUrl,
                  tribe: c.tribe,
                  onDragStart: (e, cid) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', String(cid));
                  },
                });
              })
            )
          )
        )
      )
    )
  );
}
