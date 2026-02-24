/**
 * Leaderboard Component
 * Display scores for current player + friends and allow selecting whose board to view.
 */

const { h } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { calculateScore, fetchRankings } from '../scoring.js';

export function Leaderboard({ players, scoringMode, selectedPlayerKey, onSelectPlayer }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const rankings = await fetchRankings();

      if (cancelled) return;

      const scoredPlayers = (players || [])
        .filter((p) => p && Array.isArray(p.permutation) && p.permutation.length === 24)
        .map((p) => ({
          ...p,
          ...calculateScore(p.permutation, rankings, scoringMode),
        }))
        .sort((a, b) => {
          if (a.currentScore !== b.currentScore) return b.currentScore - a.currentScore;
          if (a.maxPossibleScore !== b.maxPossibleScore) return b.maxPossibleScore - a.maxPossibleScore;
          return a.name.localeCompare(b.name);
        });

      setStandings(scoredPlayers);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [players, scoringMode]);

  return h(
    'div',
    { className: 'leaderboard' },
    h('h3', null, 'Leaderboard'),
    loading
      ? h('div', { className: 'leaderboard-loading' }, 'Loading leaderboard...')
      : standings.length === 0
        ? h('div', { className: 'leaderboard-empty' }, 'No players to show yet.')
        : h(
            'table',
            { className: 'leaderboard-table' },
            h('thead', null,
              h('tr', null,
                h('th', { scope: 'col' }, 'Name'),
                h('th', { scope: 'col' }, 'Current Score'),
                h('th', { scope: 'col' }, 'Max Possible Score')
              )
            ),
            h('tbody', null,
              standings.map((player) => {
                const isActive = player.viewKey === selectedPlayerKey;
                return h('tr', {
                  key: player.viewKey,
                  className: `leaderboard-row ${isActive ? 'leaderboard-row-active' : ''}`,
                  onClick: () => onSelectPlayer && onSelectPlayer(player),
                },
                h('td', null, `${player.name}${player.isSelf ? ' (you)' : ''}`),
                h('td', { className: 'col-score' }, String(player.currentScore)),
                h('td', { className: 'col-score' }, String(player.maxPossibleScore))
                );
              })
            )
          )
  );
}
