/**
 * FriendManager Component
 * Manage adding/removing friends to leaderboard
 */

const { h } = window.preact;
const { useState } = window.preactHooks;

import { addFriend, removeFriend, decodeFriendCode } from '../state.js';

export function FriendManager({ friends, onFriendAdded }) {
  const [friendCode, setFriendCode] = useState('');
  const [friendName, setFriendName] = useState('');
  const [error, setError] = useState(null);

  const handleAddFriend = (e) => {
    e.preventDefault();
    setError(null);

    if (!friendCode || friendCode.length !== 14) {
      setError('Friend code must be exactly 14 characters');
      return;
    }

    if (!friendName.trim()) {
      setError('Please enter friend name');
      return;
    }

    try {
      // Verify code is decodable
      const permutation = decodeFriendCode(friendCode);
      if (!permutation) {
        setError('Invalid friend code');
        return;
      }

      // Add friend to URL
      addFriend(friendCode, friendName);

      // Call callback with decoded data
      onFriendAdded({
        code: friendCode,
        name: friendName,
        permutation,
      });

      setFriendCode('');
      setFriendName('');
    } catch (err) {
      setError('Invalid friend code');
    }
  };

  const handleRemoveFriend = (code) => {
    removeFriend(code);
    // Force page reload to update leaderboard
    window.location.reload();
  };

  return h(
    'div',
    { className: 'friend-manager' },
    h('h3', null, '👥 Manage Friends'),
    h(
      'form',
      { onSubmit: handleAddFriend, className: 'friend-form' },
      h(
        'div',
        { className: 'form-group' },
        h('label', null, 'Friend Code (14 chars)'),
        h('input', {
          type: 'text',
          value: friendCode,
          onChange: (e) => setFriendCode(e.target.value),
          placeholder: 'aBcDeFgHiJkLm',
          maxLength: 14,
        })
      ),
      h(
        'div',
        { className: 'form-group' },
        h('label', null, 'Friend Name'),
        h('input', {
          type: 'text',
          value: friendName,
          onChange: (e) => setFriendName(e.target.value),
          placeholder: 'Their name',
        })
      ),
      error && h('div', { className: 'error-message' }, error),
      h('button', { type: 'submit', className: 'btn btn-secondary' },
        '➕ Add Friend'
      )
    ),
    friends && friends.length > 0 && h(
      'div',
      { className: 'friends-list' },
      h('h4', null, 'Added Friends'),
      h(
        'ul',
        null,
        friends.map((friend) =>
          h(
            'li',
            { key: friend.code, className: 'friend-item' },
            h('span', { className: 'friend-name' }, friend.name),
            h('span', { className: 'friend-code' }, `${friend.code.slice(0, 7)}...`),
            h(
              'button',
              {
                className: 'btn btn-small btn-danger',
                onClick: () => handleRemoveFriend(friend.code),
              },
              '❌'
            )
          )
        )
      )
    )
  );
}
