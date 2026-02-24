/**
 * FriendPyramid Component
 * Read-only view of a friend's predictions
 */

const { h } = window.preact;

import { getTierRange } from '../game.js';

const TIER_ORDER = [1, 2, 3, 4, 5];

function permutationToTiers(permutation, contestants) {
  const tiers = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const byId = {};
  for (const c of contestants) byId[c.id] = c;

  for (let i = 0; i < permutation.length; i++) {
    const c = byId[permutation[i]];
    if (!c) continue;

    if (i === 0) tiers[1].push(c);
    else if (i <= 2) tiers[2].push(c);
    else if (i <= 5) tiers[3].push(c);
    else if (i <= 11) tiers[4].push(c);
    else tiers[5].push(c);
  }
  return tiers;
}

export function FriendPyramid({ friend, contestants }) {
  const tiers = permutationToTiers(friend.permutation, contestants);

  return h(
    'div',
    { className: 'friend-pyramid' },
    h('h3', null, `${friend.name}'s Predictions`),
    h('div', { className: 'friend-tiers' },
      TIER_ORDER.map((tierNum) => {
        const info = getTierRange(tierNum);
        return h('div', { key: tierNum, className: 'friend-tier-row' },
          h('div', { className: 'friend-tier-label' },
            h('strong', null, info.name),
            h('span', null, ` (${info.points} pts)`)
          ),
          h('div', { className: 'friend-tier-names' },
            tiers[tierNum].map((c) =>
              h('span', { key: c.id, className: 'friend-pick' }, c.name)
            )
          )
        );
      })
    )
  );
}
