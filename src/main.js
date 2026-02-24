/**
 * Main Application Entry Point
 */

const { h, render } = window.preact;
const { useState, useEffect, useCallback, useRef } = window.preactHooks;

import {
  savePlayerPrediction,
  copyPlayerCodeToClipboard,
  decodeFriendCode,
  parseHash,
  parseFriendCodes,
  serializeHash,
} from './state.js';
import { createInitialPermutation } from './game.js';
import { decodePermutation } from './encoding.js';
import { Pyramid } from './components/Pyramid.js';
import { Leaderboard } from './components/Leaderboard.js';
import { FriendManager } from './components/FriendManager.js';
import { Instructions } from './components/Instructions.js';
import { fetchRankings, SCORING_MODES } from './scoring.js';

const CONTESTANTS = [
  { id: 1, name: 'Angelina', tribe: 'cila' },
  { id: 2, name: 'Aubry', tribe: 'cila' },
  { id: 3, name: 'Coach', tribe: 'cila' },
  { id: 4, name: 'Charlie', tribe: 'cila' },
  { id: 5, name: 'Chrissy', tribe: 'cila' },
  { id: 6, name: 'Christian', tribe: 'cila' },
  { id: 7, name: 'Cirie', tribe: 'cila' },
  { id: 8, name: 'Colby', tribe: 'cila' },
  { id: 9, name: 'Dee', tribe: 'kalo' },
  { id: 10, name: 'Emily', tribe: 'kalo' },
  { id: 11, name: 'Genevieve', tribe: 'kalo' },
  { id: 12, name: 'Jenna', tribe: 'kalo' },
  { id: 13, name: 'Joe', tribe: 'kalo' },
  { id: 14, name: 'Jonathan', tribe: 'kalo' },
  { id: 15, name: 'Kamilla', tribe: 'kalo' },
  { id: 16, name: 'Kyle', tribe: 'kalo' },
  { id: 17, name: 'Mike', tribe: 'vatu' },
  { id: 18, name: 'Ozzy', tribe: 'vatu' },
  { id: 19, name: 'Q', tribe: 'vatu' },
  { id: 20, name: 'Rick', tribe: 'vatu' },
  { id: 21, name: 'Rizo', tribe: 'vatu' },
  { id: 22, name: 'Savannah', tribe: 'vatu' },
  { id: 23, name: 'Stephenie', tribe: 'vatu' },
  { id: 24, name: 'Tiffany', tribe: 'vatu' },
].map((c) => ({ ...c, imageUrl: null }));

function App() {
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState('Player');
  const [playerCode, setPlayerCode] = useState(null);
  const [friends, setFriends] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [resetVersion, setResetVersion] = useState(0);
  // viewingPlayer: null = viewing own picks, otherwise { name, permutation, code }
  const [viewingPlayer, setViewingPlayer] = useState(null);
  const [scoringMode, setScoringMode] = useState(SCORING_MODES.PROGRESSIVE);

  // Store the current permutation in a ref so the Pyramid callback is stable
  const permRef = useRef(createInitialPermutation());

  useEffect(() => {
    const params = parseHash();

    if (params.n) {
      setPlayerName(params.n);
    }
    if (params.m === SCORING_MODES.CLASSIC || params.m === SCORING_MODES.PROGRESSIVE) {
      setScoringMode(params.m);
    }

    const parsedFriends = parseFriendCodes(params.f);
    const decodedFriends = parsedFriends.map((f) => ({
      ...f,
      permutation: decodeFriendCode(f.code),
    }));
    setFriends(decodedFriends);

    if (params.p) {
      try {
        permRef.current = decodePermutation(params.p);
        setPlayerCode(params.p);
      } catch (error) {
        console.error('Failed to decode player code from URL:', error);
        setPlayerCode(null);
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRankings().then((data) => {
      setRankings(data || []);
    });
  }, []);

  // Stable callback — Pyramid calls this on every drag
  const handlePermutationChange = useCallback((newPerm) => {
    const samePermutation = (
      Array.isArray(newPerm) &&
      Array.isArray(permRef.current) &&
      newPerm.length === permRef.current.length &&
      newPerm.every((id, idx) => id === permRef.current[idx])
    );

    if (samePermutation) {
      return;
    }

    permRef.current = newPerm;
    setPlayerCode(null); // Clear stale code
  }, []);

  const handleLockIn = () => {
    const perm = permRef.current;
    console.log('Locking in. First 5 of permutation:', perm.slice(0, 5));
    const code = savePlayerPrediction(perm, playerName, friends, scoringMode);
    console.log('Generated code:', code);
    setPlayerCode(code);
  };

  const handleResetPicks = () => {
    permRef.current = createInitialPermutation();
    setPlayerCode(null);
    setResetVersion((v) => v + 1);

    const params = parseHash();
    delete params.p;
    serializeHash({
      n: params.n || playerName,
      f: params.f || '',
      m: params.m || scoringMode,
    });
  };

  const handleCopyCode = async () => {
    try {
      await copyPlayerCodeToClipboard();
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleFriendAdded = (newFriend) => {
    setFriends((prev) => [...prev, newFriend]);
  };

  const handleViewPlayer = (player) => {
    if (player === null) {
      // Back to own picks
      setViewingPlayer(null);
    } else {
      setViewingPlayer(player);
    }
  };

  if (loading) return h('div', { className: 'loading' }, 'Loading...');

  // Build the "players" list for the combined leaderboard/viewer
  const allPlayers = [
    { name: playerName, code: playerCode, permutation: permRef.current, isSelf: true, viewKey: 'self' },
    ...friends
      .filter((f) => f.permutation && f.permutation.length === 24)
      .map((f, index) => ({ ...f, isSelf: false, viewKey: `friend:${index}:${f.code}` })),
  ];

  const isViewingFriend = viewingPlayer !== null;
  const activePermutation = isViewingFriend ? viewingPlayer.permutation : (playerCode ? permRef.current : null);
  const pyramidTitle = isViewingFriend ? `${viewingPlayer.name}'s Picks` : 'Your Predictions';

  return h(
    'div',
    { className: 'app' },
    h('header', { className: 'header' },
      h('h1', null, 'Survivor 50 Fantasy League'),
      h(Instructions, { scoringMode })
    ),
    h('main', { className: 'main' },
      h('div', { className: 'layout' },
        // Left: Pyramid (own picks or friend's read-only view)
        h('div', { className: 'layout-left' },
          h(Pyramid, {
            key: isViewingFriend ? viewingPlayer.viewKey : `self:${resetVersion}`,
            contestants: CONTESTANTS,
            onPermutationChange: isViewingFriend ? null : handlePermutationChange,
            initialPermutation: activePermutation,
            readOnly: isViewingFriend,
            title: pyramidTitle,
            rankings,
            scoringMode,
          }),
          isViewingFriend && h('div', { style: 'margin-top: 8px;' },
            h('button', {
              className: 'btn btn-secondary btn-small',
              onClick: () => handleViewPlayer(null),
            }, 'Back to My Picks')
          )
        ),
        // Right: Sidebar
        h('div', { className: 'layout-right' },
          // Player info & lock in (only when viewing own picks)
          !isViewingFriend && h('div', { className: 'sidebar-section' },
            h('label', null, 'Your Name'),
            h('input', {
              type: 'text',
              value: playerName,
              onChange: (e) => setPlayerName(e.target.value),
              placeholder: 'Enter your name',
              className: 'player-name-input',
            }),
            h('button', { className: 'btn btn-primary', onClick: handleLockIn },
              'Lock In Predictions'
            ),
            h('button', { className: 'btn btn-secondary', onClick: handleResetPicks },
              'Reset Picks'
            ),
            playerCode && h('div', { className: 'player-code' },
              h('p', null, 'Your code:'),
              h('code', null, playerCode),
              h('button', { className: 'btn btn-secondary btn-small', onClick: handleCopyCode },
                'Copy Link'
              )
            )
          ),
          h('div', { className: 'sidebar-section' },
            h('label', null, 'Scoring Mode'),
            h('select', {
              className: 'scoring-mode-select',
              value: scoringMode,
              onChange: (e) => {
                const nextMode = e.target.value;
                setScoringMode(nextMode);
                const params = parseHash();
                serializeHash({
                  p: params.p || '',
                  n: params.n || playerName,
                  f: params.f || '',
                  m: nextMode,
                });
              },
            },
            h('option', { value: SCORING_MODES.PROGRESSIVE }, 'Progressive (partial credit)'),
            h('option', { value: SCORING_MODES.CLASSIC }, 'Classic (exact tier)')
            ),
            h('p', { className: 'text-muted-small' },
              scoringMode === SCORING_MODES.PROGRESSIVE
                ? 'Earn partial points up to your selected tier.'
                : 'Score only when predicted and actual tiers match.'
            )
          ),
          // Leaderboard
          h('div', { className: 'sidebar-section' },
            h(Leaderboard, {
              players: allPlayers,
              scoringMode,
              selectedPlayerKey: isViewingFriend ? viewingPlayer.viewKey : 'self',
              onSelectPlayer: (player) => player.isSelf ? handleViewPlayer(null) : handleViewPlayer(player),
            })
          ),
          // Add friend
          h('div', { className: 'sidebar-section' },
            h(FriendManager, {
              friends,
              onFriendAdded: handleFriendAdded,
              showList: false,
            })
          )
        )
      )
    )
  );
}

render(h(App), document.getElementById('app'));
