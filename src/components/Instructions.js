/**
 * Instructions Component
 * Displays game rules and how to play
 */

const { h } = window.preact;
const { useState } = window.preactHooks;

export function Instructions() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return h(
      'button',
      {
        className: 'btn-instructions',
        onClick: () => setIsOpen(true),
      },
      'How to Play'
    );
  }

  return h(
    'div',
    { className: 'modal-overlay', onClick: () => setIsOpen(false) },
    h(
      'div',
      { className: 'modal-content', onClick: (e) => e.stopPropagation() },
      h('div', { className: 'modal-header' },
        h('h2', null, 'How to Play'),
        h('button', { className: 'modal-close', onClick: () => setIsOpen(false) }, '×')
      ),
      h('div', { className: 'modal-body' },
        h('h3', null, 'The Basics'),
        h('p', null, 'Welcome to my Survivor 50 Ranking Challenge! Place the Survivor 50 contestants into tiers based on how you think they\'ll perform during the season and receive points based on whether or not your predictions are correct.'),
        h('p', null, 'The game has five tiers:'),
        h('ul', null,
          h('li', null, 'Winner (1 spot) - 10 points'),
          h('li', null, 'Runner-Ups (2 spots) - 5 points each'),
          h('li', null, 'Top 6 (3 spots) - 3 points each'),
          h('li', null, 'Top 12 (6 spots) - 2 points each'),
          h('li', null, 'Bottom 12 (12 spots) - 1 point each')
        ),
        h('h3', null, 'Scoring'),
        h('p', null, 'This game uses a progressive scoring system where you earn *up to* the points in your selected tier.'),
        h('p', null, 'Example: pick a contestant for Top 12 and get 1 point if they finish Bottom 12, or 2 points if they finish Top 12 or better. For your winner pick, receive 1 point if they place Bottom 12, 2 points if they 7-12, 3 points if they place 4-6, and so on.'),
        h('p', null, 'Bottom 12 picks are the one exception: score 1 point only if the contestant finishes 13-24 and zero points if they place better.'),
        h('h3', null, 'Playing the Game'),
        h('ol', null,
          h('li', null, 'Drag contestants from the pool into tiers'),
          h('li', null, 'Enter your name and click "Lock In Predictions"'),
          h('li', null, 'Share your friend code with others and add friends to your own leaderboard. All info is saved in the URL, so bookmark the page to save your and your friends\' picks.'),
          h('li', null, 'As the season progresses and players are voted out, rankings will update automatically'),
          h('li', null, 'Check the leaderboard to see how your predictions stack up against your friends and family!')
        )
      )
    )
  );
}
