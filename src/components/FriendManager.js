/**
 * FriendManager Component
 * Add friends and click to view their picks
 */

const { h } = window.preact;
const { useState } = window.preactHooks;

import { addFriend, removeFriend, decodeFriendCode } from '../state.js';

export function FriendManager({ friends, onFriendAdded, onFriendSelected, selectedFriend }) {
  const [friendCode, setFriendCode] = useState('');
  const [friendName, setFriendName] = useState('');
  const [error, setError] = useState(null);

  const handleAddFriend = (e) => {
    e.preventDefault();
    setError(null);

    if (!friendCode || friendCode.length !== 14) {
      setError('Code must be exactly 14 characters');
      return;
    }

    if (!friendName.trim()) {
      setError('Please enter a name');
      return;
    }

    try {
      const permutation = decodeFriendCode(friendCode);
      if (!permutation) {
        setError('Invalid code');
        return;
      }

      addFriend(friendCode, friendName);
      onFriendAdded({ code: friendCode, name: friendName, permutation });
      setFriendCode('');
      setFriendName('');
    } catch (err) {
      setError('Invalid code');
    }
  };

  const handleRemoveFriend = (e, code) => {
    e.stopPropagation();
    removeFriend(code);
    window.location.reload();
  };

  return h(
    'div',
    { className: 'friend-manager' },
    h('h3', null, 'Friends'),
    h(
      'form',
      { onSubmit: handleAddFriend, className: 'friend-form' },
      h('input', {
        type: 'text',
        value: friendCode,
        onChange: (e) => setFriendCode(e.target.value),
        placeholder: 'Friend code (14 chars)',
        maxLength: 14,
      }),
      h('input', {
        type: 'text',
        value: friendName,
        onChange: (e) => setFriendName(e.target.value),
        placeholder: 'Name',
      }),
      error && h('div', { className: 'error-message' }, error),
      h('button', { type: 'submit', className: 'btn btn-secondary btn-small' }, 'Add')
    ),
    friends && friends.length > 0 && h(
      'ul',
      { className: 'friends-list' },
      friends.map((friend) =>
        h(
          'li',
          {
            key: friend.code,
            className: `friend-item ${selectedFriend && selectedFriend.code === friend.code ? 'friend-selected' : ''}`,
            onClick: () => onFriendSelected(friend),
          },
          h('span', { className: 'friend-name' }, friend.name),
          h('span', { className: 'friend-view-hint' }, 'view picks'),
          h(
            'button',
            {
              className: 'btn-remove',
              onClick: (e) => handleRemoveFriend(e, friend.code),
            },
            '\u00d7'
          )
        )
      )
    )
  );
}
