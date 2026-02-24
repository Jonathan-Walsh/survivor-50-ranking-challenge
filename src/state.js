/**
 * State Module - URL State Management
 *
 * Handles reading and writing game state to/from URL hash
 * Format: #p=CODE&n=NAME&f=CODE1:NAME1,CODE2:NAME2
 */

import { encodePermutation, decodePermutation } from './encoding.js';

/**
 * Parse URL hash parameters
 * @returns {Object} - Parsed hash parameters
 */
export function parseHash() {
  const hash = window.location.hash.slice(1); // Remove #
  const params = {};
  if (!hash) return params;

  const searchParams = new URLSearchParams(hash);
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Serialize state to URL hash
 * @param {Object} state - State object with keys: p, n, f
 */
export function serializeHash(state) {
  const params = [];

  if (state.p) params.push(`p=${encodeURIComponent(state.p)}`);
  if (state.n) params.push(`n=${encodeURIComponent(state.n)}`);
  if (state.f && state.f.length > 0) {
    params.push(`f=${encodeURIComponent(state.f)}`);
  }

  const newHash = '#' + params.join('&');
  window.location.hash = newHash;
}

/**
 * Load player's prediction from URL
 * @returns {Object|null} - { permutation, name, friends } or null if not in URL
 */
export function loadPlayerPrediction() {
  const params = parseHash();

  if (!params.p) return null;

  try {
    const permutation = decodePermutation(params.p);
    const name = params.n || 'Player';
    const friends = parseFriendCodes(params.f);

    return { permutation, name, friends };
  } catch (error) {
    console.error('Failed to load prediction from URL:', error);
    return null;
  }
}

/**
 * Parse friend codes from URL
 * Format: CODE1:NAME1,CODE2:NAME2
 * @param {string} friendString - Friend string from URL
 * @returns {Array} - Array of { code, name }
 */
export function parseFriendCodes(friendString) {
  if (!friendString) return [];

  try {
    const friends = [];
    const pairs = friendString.split(',');

    for (const pair of pairs) {
      const [code, name] = pair.split(':');
      if (code && code.length === 14) {
        friends.push({
          code,
          name: name || 'Friend',
        });
      }
    }

    return friends;
  } catch (error) {
    console.error('Failed to parse friend codes:', error);
    return [];
  }
}

/**
 * Save player prediction to URL
 * @param {number[]} permutation - Player's predictions [1-24]
 * @param {string} playerName - Player's name
 * @param {Array} friends - Friend list [{ code, name }, ...]
 */
export function savePlayerPrediction(permutation, playerName, friends = []) {
  const code = encodePermutation(permutation);
  const friendString = friends.map((f) => `${f.code}:${f.name}`).join(',');

  serializeHash({
    p: code,
    n: playerName,
    f: friendString,
  });

  return code;
}

/**
 * Add a friend to the URL
 * @param {string} friendCode - 14-character friend code
 * @param {string} friendName - Friend's name
 */
export function addFriend(friendCode, friendName) {
  const params = parseHash();
  const friends = parseFriendCodes(params.f);
  friends.push({ code: friendCode, name: friendName });

  const friendString = friends.map((f) => `${f.code}:${f.name}`).join(',');
  params.f = friendString;

  serializeHash(params);
}

/**
 * Remove a friend from the URL
 * @param {string} friendCode - 14-character friend code to remove
 */
export function removeFriend(friendCode) {
  const params = parseHash();
  let friends = parseFriendCodes(params.f);

  friends = friends.filter((f) => f.code !== friendCode);

  const friendString = friends.map((f) => `${f.code}:${f.name}`).join(',');
  params.f = friendString;

  serializeHash(params);
}

/**
 * Get the current player's code from URL
 * @returns {string|null} - 14-character code or null
 */
export function getPlayerCode() {
  const params = parseHash();
  return params.p || null;
}

/**
 * Copy player's code to clipboard
 * @returns {string} - The code that was copied
 */
export function copyPlayerCodeToClipboard() {
  const params = parseHash();
  if (!params.p) {
    throw new Error('No prediction code to copy');
  }

  // Build shareable URL with full persisted state (player + friends)
  const hashParams = new URLSearchParams();
  hashParams.set('p', params.p);
  hashParams.set('n', params.n || 'Player');
  if (params.f) {
    hashParams.set('f', params.f);
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}#${hashParams.toString()}`;
  navigator.clipboard.writeText(shareUrl);

  return params.p;
}

/**
 * Decode a friend's predictions from their code
 * @param {string} friendCode - 14-character code
 * @returns {number[]} - Decoded permutation
 */
export function decodeFriendCode(friendCode) {
  try {
    return decodePermutation(friendCode);
  } catch (error) {
    console.error('Failed to decode friend code:', error);
    return null;
  }
}
