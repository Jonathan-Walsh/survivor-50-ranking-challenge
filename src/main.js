/**
 * Main Application Entry Point
 * Initialize Preact app and load initial state from URL
 */

const { h, render } = window.preact;
const { useState, useEffect } = window.preactHooks;

import { loadPlayerPrediction, savePlayerPrediction, copyPlayerCodeToClipboard, decodeFriendCode } from './state.js';
import { createInitialPermutation } from './game.js';
import { Pyramid } from './components/Pyramid.js';
import { ScoreDisplay } from './components/ScoreDisplay.js';
import { Leaderboard } from './components/Leaderboard.js';
import { FriendManager } from './components/FriendManager.js';

// Sample contestants data
const CONTESTANTS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `Contestant ${String.fromCharCode(65 + i)}`,
  imageUrl: null, // Placeholder images
}));

/**
 * Main App Component
 */
function App() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState('Player');
  const [playerCode, setPlayerCode] = useState(null);

  useEffect(() => {
    // Load initial state from URL
    const saved = loadPlayerPrediction();
    if (saved) {
      // Decode friend permutations
      const decodedFriends = saved.friends.map((friend) => ({
        ...friend,
        permutation: decodeFriendCode(friend.code),
      }));
      setGameState({
        ...saved,
        friends: decodedFriends,
      });
      setPlayerName(saved.name);
    } else {
      // Create new game with default permutation
      const defaultPerm = createInitialPermutation();
      setGameState({
        permutation: defaultPerm,
        name: 'Player',
        friends: [],
      });
    }
    setLoading(false);
  }, []);

  const handlePermutationChange = (newPerm) => {
    setGameState((prev) => ({
      ...prev,
      permutation: newPerm,
    }));
  };

  const handleLockIn = () => {
    if (!gameState) return;
    const code = savePlayerPrediction(gameState.permutation, playerName, gameState.friends);
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
    if (gameState) {
      setGameState((prev) => ({
        ...prev,
        name: newName,
      }));
    }
  };

  if (loading) {
    return h('div', { className: 'loading' }, '🏝️ Loading Survivor 50...');
  }

  return h(
    'div',
    { className: 'app' },
    h('header', { className: 'header' },
      h('h1', null, '🏝️ Survivor 50 Fantasy League'),
      h('p', null, 'Rank contestants by predicted elimination order and earn points')
    ),
    h('main', { className: 'main' },
      h('div', { className: 'player-section' },
        h('div', { className: 'player-info' },
          h('label', null, 'Your Name:'),
          h('input', {
            type: 'text',
            value: playerName,
            onChange: (e) => handleNameChange(e.target.value),
            placeholder: 'Enter your name',
            className: 'player-name-input',
          })
        ),
        h('div', { className: 'score-panel' },
          gameState && h(ScoreDisplay, {
            permutation: gameState.permutation,
          })
        ),
        playerCode && h('div', { className: 'player-code' },
          h('p', null, '✅ Locked In!'),
          h('code', null, playerCode),
          h('button', { className: 'btn btn-secondary', onClick: handleCopyCode },
            '📋 Copy Link'
          )
        )
      ),
      gameState && h(Pyramid, {
        permutation: gameState.permutation,
        contestants: CONTESTANTS,
        onPermutationChange: handlePermutationChange,
      }),
      h('div', { className: 'control-panel' },
        h('button', { className: 'btn btn-primary', onClick: handleLockIn },
          '🔒 Lock In Predictions'
        )
      ),
      gameState && playerCode && h(Leaderboard, {
        playerName,
        playerCode,
        friends: gameState.friends,
        permutation: gameState.permutation,
      }),
      gameState && h(FriendManager, {
        friends: gameState.friends,
        onFriendAdded: (newFriend) => {
          setGameState((prev) => ({
            ...prev,
            friends: [...prev.friends, newFriend],
          }));
        },
      })
    ),
    h('footer', { className: 'footer' },
      h('p', null, '✅ Phase 4 Complete: Leaderboard & Friends | Total Points: 48')
    )
  );
}

// Render app
const appElement = document.getElementById('app');
render(h(App), appElement);

console.log('✅ Survivor 50 Fantasy League - Phase 2: Pyramid UI Complete');
console.log('Drag-and-drop interface ready for predictions');
