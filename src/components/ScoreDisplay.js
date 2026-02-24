/**
 * ScoreDisplay Component
 * Shows current point total
 */

const { h } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { calculateScore, fetchRankings } from '../scoring.js';

export function ScoreDisplay({ permutation }) {
  const [currentScore, setCurrentScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRankings().then((data) => {
      if (data.length > 0) {
        const score = calculateScore(permutation, data);
        setCurrentScore(score.currentScore);
      }
      setLoading(false);
    });
  }, [permutation]);

  if (loading) {
    return h('div', { className: 'score-display' }, 'Loading...');
  }

  return h(
    'div',
    { className: 'score-display' },
    h('span', { className: 'score-number' }, currentScore),
    h('span', { className: 'score-label' }, currentScore === 1 ? ' point' : ' points')
  );
}
