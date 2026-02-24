/**
 * ScoreDisplay Component
 * Shows current score, potential points, and progress
 */

const { h } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { calculateScore, fetchRankings, getScoreTier } from '../scoring.js';

export function ScoreDisplay({ permutation }) {
  const [scoreData, setScoreData] = useState(null);
  const [rankings, setRankings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load rankings and calculate score
    fetchRankings().then((data) => {
      setRankings(data);
      if (data.length > 0) {
        const score = calculateScore(permutation, data);
        setScoreData(score);
      }
      setLoading(false);
    });
  }, [permutation]);

  if (loading || !scoreData) {
    return h('div', { className: 'score-loading' }, '📊 Loading scores...');
  }

  const tier = getScoreTier(scoreData.currentScore);

  return h(
    'div',
    { className: 'score-display' },
    h('div', { className: 'score-main' },
      h('div', { className: 'score-current' },
        h('div', { className: 'score-number' }, scoreData.currentScore),
        h('div', { className: 'score-label' }, 'Current Points')
      ),
      h('div', { className: 'score-divider' }, '/'),
      h('div', { className: 'score-max' },
        h('div', { className: 'score-number' }, scoreData.maxPossibleScore),
        h('div', { className: 'score-label' }, 'Maximum Points')
      )
    ),
    h('div', { className: 'score-progress' },
      h('div', { className: 'progress-bar' },
        h('div', {
          className: 'progress-fill',
          style: {
            width: `${(scoreData.currentScore / scoreData.maxPossibleScore * 100).toFixed(1)}%`,
          },
        })
      ),
      h('div', { className: 'progress-text' },
        `${scoreData.accuracy}% Accuracy`
      )
    ),
    h('div', { className: 'score-tier' },
      h('span', { className: 'tier-badge' }, tier.tier),
      h('span', { className: 'tier-message' }, tier.message)
    ),
    scoreData.potentialRemaining > 0 && h('div', { className: 'score-potential' },
      h('p', null, `💡 ${scoreData.potentialRemaining} points still available`)
    )
  );
}
