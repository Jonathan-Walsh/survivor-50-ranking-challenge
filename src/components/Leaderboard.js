/**
 * Leaderboard Component
 * Display scores for multiple players (current player + friends)
 */

const { h } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { calculateScore, fetchRankings, compareScores } from '../scoring.js';

export function Leaderboard({ playerName, playerCode, friends, permutation }) {
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings().then((data) => {
      const players = [
        {
          name: playerName || 'You',
          code: playerCode,
          permutation,
        },
        ...friends
          .filter((f) => f.permutation && f.permutation.length === 24)
          .map((f) => ({
            name: f.name,
            code: f.code,
            permutation: f.permutation,
          })),
      ];

      const scores = compareScores(
        players.filter((p) => p.permutation && p.permutation.length === 24),
        data
      );

      setStandings(scores);
      setLoading(false);
    });
  }, [playerName, playerCode, friends, permutation]);

  if (loading || !standings) {
    return h('div', { className: 'leaderboard-loading' }, 'Loading leaderboard...');
  }

  if (standings.length === 0) {
    return h('div', { className: 'leaderboard-empty' },
      'No scores to display. Lock in your predictions first.'
    );
  }

  return h(
    'div',
    { className: 'leaderboard' },
    h('h2', null, 'Leaderboard'),
    h(
      'div',
      { className: 'leaderboard-table' },
      h('div', { className: 'leaderboard-header' },
        h('div', { className: 'col-rank' }, 'Rank'),
        h('div', { className: 'col-name' }, 'Player'),
        h('div', { className: 'col-score' }, 'Points')
      ),
      standings.map((player, index) =>
        h('div', { className: 'leaderboard-row', key: player.code || index },
          h('div', { className: 'col-rank' }, `#${index + 1}`),
          h('div', { className: 'col-name' },
            h('span', { className: 'player-name' }, player.name)
          ),
          h('div', { className: 'col-score' },
            h('span', { className: 'score-value' }, `${player.currentScore}`)
          )
        )
      )
    )
  );
}
