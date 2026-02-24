/**
 * FriendManager Component
 * Add friends and click to view their picks
 */

const { h } = window.preact;
const { useState } = window.preactHooks;

import { addFriend, removeFriend, decodeFriendCode } from '../state.js';

export function FriendManager({
  friends,
  onFriendAdded,
  onFriendSelected,
  selectedFriend,
  showList = true,
}) {
  const [friendCode, setFriendCode] = useState('');
  const [friendName, setFriendName] = useState('');
  const [error, setError] = useState(null);

  const handleAddFriend = (e) => {
    e.preventDefault();
    setError(null);

    const normalizedCode = friendCode.trim();
    const normalizedName = friendName.trim();

    if (!normalizedCode || normalizedCode.length !== 14) {
      setError('Code must be exactly 14 characters');
      return;
    }

    if (!normalizedName) {
      setError('Please enter a name');
      return;
    }

    try {
      const permutation = decodeFriendCode(normalizedCode);
      if (!permutation) {
        setError('Invalid code');
        return;
      }

      addFriend(normalizedCode, normalizedName);
      onFriendAdded({ code: normalizedCode, name: normalizedName, permutation });
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
    h('h3', null, 'Add Friend'),
    h(
      'form',
      { onSubmit: handleAddFriend, className: 'friend-form' },
      h('input', {
        type: 'text',
        value: friendName,
        onChange: (e) => setFriendName(e.target.value),
        placeholder: 'Name',
      }),
      h('input', {
        type: 'text',
        value: friendCode,
        onChange: (e) => setFriendCode(e.target.value),
        placeholder: 'Friend code (14 characters)',
        maxLength: 14,
      }),
      error && h('div', { className: 'error-message' }, error),
      h('button', { type: 'submit', className: 'btn btn-secondary btn-small' }, 'Add')
    ),
    showList && friends && friends.length > 0 && h(
      'ul',
      { className: 'friends-list' },
      friends.map((friend) =>
        h(
          'li',
          {
            key: friend.code,
            className: `friend-item ${selectedFriend && selectedFriend.code === friend.code ? 'friend-selected' : ''}`,
            onClick: () => onFriendSelected && onFriendSelected(friend),
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
