/**
 * Main Application Entry Point
 */

const { h, render } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { loadPlayerPrediction, savePlayerPrediction, copyPlayerCodeToClipboard, decodeFriendCode } from './state.js';
import { createInitialPermutation } from './game.js';
import { encodePermutation } from './encoding.js';
import { Pyramid } from './components/Pyramid.js';
import { ScoreDisplay } from './components/ScoreDisplay.js';
import { Leaderboard } from './components/Leaderboard.js';
import { FriendManager } from './components/FriendManager.js';
import { Instructions } from './components/Instructions.js';
import { FriendPyramid } from './components/FriendPyramid.js';

const CONTESTANTS = [
  { id: 1, name: 'Frank Jones' },
  { id: 2, name: 'Maria Santos' },
  { id: 3, name: 'Derek Chen' },
  { id: 4, name: 'Aisha Williams' },
  { id: 5, name: 'Tyler Brooks' },
  { id: 6, name: 'Nina Patel' },
  { id: 7, name: 'Jake Morrison' },
  { id: 8, name: 'Carmen Rivera' },
  { id: 9, name: 'Owen Hayes' },
  { id: 10, name: 'Priya Sharma' },
  { id: 11, name: 'Dustin Cole' },
  { id: 12, name: 'Lena Zhao' },
  { id: 13, name: 'Marcus Bell' },
  { id: 14, name: 'Sofia Reyes' },
  { id: 15, name: 'Caleb Wright' },
  { id: 16, name: 'Hannah Kim' },
  { id: 17, name: 'Ricky Tran' },
  { id: 18, name: 'Brooke Davis' },
  { id: 19, name: 'Elijah Grant' },
  { id: 20, name: 'Tessa Okafor' },
  { id: 21, name: 'Nolan Ruiz' },
  { id: 22, name: 'Jada Thompson' },
  { id: 23, name: 'Spencer Lee' },
  { id: 24, name: 'Mia Novak' },
].map((c) => ({ ...c, imageUrl: null }));

function App() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState('Player');
  const [playerCode, setPlayerCode] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const saved = loadPlayerPrediction();
    if (saved) {
      const decodedFriends = saved.friends.map((friend) => ({
        ...friend,
        permutation: decodeFriendCode(friend.code),
      }));
      setGameState({ ...saved, friends: decodedFriends });
      setPlayerName(saved.name);
      // Restore code from URL
      setPlayerCode(saved.code || null);
    } else {
      setGameState({
        permutation: createInitialPermutation(),
        name: 'Player',
        friends: [],
      });
    }
    setLoading(false);
  }, []);

  const handlePermutationChange = (newPerm) => {
    setGameState((prev) => ({ ...prev, permutation: newPerm }));
    // Clear stale code when predictions change
    setPlayerCode(null);
  };

  const handleLockIn = () => {
    if (!gameState) return;
    // Log the permutation so we can debug encoding issues
    console.log('Locking in permutation:', gameState.permutation);
    const code = savePlayerPrediction(gameState.permutation, playerName, gameState.friends);
    console.log('Generated code:', code);
    setPlayerCode(code);
  };

  const handleCopyCode = async () => {
    try {
      await copyPlayerCodeToClipboard();
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleNameChange = (newName) => {
    setPlayerName(newName);
    setGameState((prev) => prev ? { ...prev, name: newName } : prev);
  };

  const handleFriendAdded = (newFriend) => {
    setGameState((prev) => ({
      ...prev,
      friends: [...prev.friends, newFriend],
    }));
  };

  const handleFriendSelected = (friend) => {
    setSelectedFriend((prev) => (prev && prev.code === friend.code) ? null : friend);
  };

  if (loading) return h('div', { className: 'loading' }, 'Loading...');

  return h(
    'div',
    { className: 'app' },
    h('header', { className: 'header' },
      h('h1', null, 'Survivor 50 Fantasy League')
    ),
    h('main', { className: 'main' },
      h('div', { className: 'layout' },
        // Left: Pyramid
        h('div', { className: 'layout-left' },
          gameState && h(Pyramid, {
            contestants: CONTESTANTS,
            onPermutationChange: handlePermutationChange,
          })
        ),
        // Right: Management sidebar
        h('div', { className: 'layout-right' },
          // Player info
          h('div', { className: 'sidebar-section' },
            h('label', null, 'Your Name'),
            h('input', {
              type: 'text',
              value: playerName,
              onChange: (e) => handleNameChange(e.target.value),
              placeholder: 'Enter your name',
              className: 'player-name-input',
            }),
            gameState && h(ScoreDisplay, { permutation: gameState.permutation }),
            h('button', { className: 'btn btn-primary', onClick: handleLockIn },
              'Lock In Predictions'
            ),
            playerCode && h('div', { className: 'player-code' },
              h('p', null, 'Your code:'),
              h('code', null, playerCode),
              h('button', { className: 'btn btn-secondary', onClick: handleCopyCode },
                'Copy Link'
              )
            )
          ),
          // Friends
          h('div', { className: 'sidebar-section' },
            gameState && h(FriendManager, {
              friends: gameState.friends,
              onFriendAdded: handleFriendAdded,
              onFriendSelected: handleFriendSelected,
              selectedFriend,
            })
          ),
          // Leaderboard
          gameState && playerCode && h('div', { className: 'sidebar-section' },
            h(Leaderboard, {
              playerName,
              playerCode,
              friends: gameState.friends,
              permutation: gameState.permutation,
            })
          )
        )
      ),
      // Friend's picks viewer (shown below when a friend is selected)
      selectedFriend && selectedFriend.permutation && h(FriendPyramid, {
        friend: selectedFriend,
        contestants: CONTESTANTS,
      })
    ),
    h('footer', { className: 'footer' },
      h('p', null, 'Survivor 50 Fantasy League')
    ),
    h(Instructions)
  );
}

render(h(App), document.getElementById('app'));
