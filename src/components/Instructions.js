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
        h('h3', null, 'The Game'),
        h('p', null, 'Drag 24 Survivor contestants into tiers based on how you think they\'ll be eliminated. The pyramid has 5 tiers:'),
        h('ul', null,
          h('li', null, 'Winner (1 spot) - 10 points'),
          h('li', null, 'Final 2 (2 spots) - 4 points each'),
          h('li', null, 'Final 3 (3 spots) - 3 points each'),
          h('li', null, 'Top 6 (6 spots) - 2 points each'),
          h('li', null, 'Bottom 12 (12 spots) - 1 point each')
        ),
        h('h3', null, 'How Scoring Works'),
        h('p', null, 'You earn points when contestants are voted out and match your predicted tier. If you guess someone makes the Final 2 and they do, you get 4 points. If they get voted out before that, you get 0 points.'),
        h('h3', null, 'Playing the Game'),
        h('ol', null,
          h('li', null, 'Drag contestants from the pool into tiers'),
          h('li', null, 'Enter your name and click "Lock In Predictions"'),
          h('li', null, 'Copy the link to share with friends'),
          h('li', null, 'As episodes air, rankings update automatically'),
          h('li', null, 'Check the leaderboard to see who predicted best')
        ),
        h('h3', null, 'Key Points'),
        h('ul', null,
          h('li', null, 'You only get points if the tier matches exactly'),
          h('li', null, 'Maximum possible score: 48 points'),
          h('li', null, 'Your link saves everything - bookmark it'),
          h('li', null, 'Add friend codes to compare scores')
        )
      )
    )
  );
}
