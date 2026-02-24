/**
 * Test Suite for Encoding Logic
 *
 * Usage: node test-encoding.js
 */

import assert from 'node:assert/strict';
import {
  encodePermutation,
  decodePermutation,
  permutationToFactorial,
  factorialToPermutation,
} from './src/encoding.js';

function makeIdentity() {
  return Array.from({ length: 24 }, (_, i) => i + 1);
}

function makeReverse() {
  return Array.from({ length: 24 }, (_, i) => 24 - i);
}

function makeSwapped() {
  const perm = makeIdentity();
  [perm[0], perm[23]] = [perm[23], perm[0]];
  return perm;
}

function makeRandom(seed = 123456789) {
  // Deterministic LCG for repeatable tests
  let state = seed >>> 0;
  const next = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };

  const perm = makeIdentity();
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

function assertRoundTrip(perm) {
  const code = encodePermutation(perm);
  const decoded = decodePermutation(code);
  assert.deepEqual(decoded, perm, 'Permutation should survive encode/decode round-trip');
  assert.equal(code.length, 14, 'Code length must be exactly 14');
  assert.match(code, /^[0-9a-zA-Z]{14}$/, 'Code must be base62');
  return code;
}

console.log('Testing encoding...');

const identity = makeIdentity();
const reverse = makeReverse();
const swapped = makeSwapped();
const random = makeRandom();

const identityCode = assertRoundTrip(identity);
const reverseCode = assertRoundTrip(reverse);
const swappedCode = assertRoundTrip(swapped);
const randomCode = assertRoundTrip(random);

assert.equal(identityCode, '00000000000000', 'Identity permutation should encode to zero value');
assert.notEqual(reverseCode, identityCode);
assert.notEqual(swappedCode, identityCode);
assert.notEqual(randomCode, identityCode);

const factoradicValue = permutationToFactorial(reverse);
assert.deepEqual(factorialToPermutation(factoradicValue), reverse);

assert.throws(() => encodePermutation(identity.slice(0, 23)), /exactly 24 elements/);
assert.throws(() => decodePermutation('bad'), /must be 14 alphanumeric characters/);

console.log('All encoding tests passed.');
