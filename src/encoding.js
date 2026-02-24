/**
 * Encoding Module - Factorial Number System + Base62
 *
 * Converts permutations of 24 contestants to 14-character codes
 * and back, enabling URL-based state persistence.
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Convert a permutation array [5, 12, 3, ...] to factorial number system representation
 * This produces a unique integer for each possible permutation of 24 elements.
 *
 * @param {number[]} permutation - Array of 1-24 in some order
 * @returns {bigint} - Factorial number representation as integer
 */
export function permutationToFactorial(permutation) {
  if (permutation.length !== 24) {
    throw new Error('Permutation must have exactly 24 elements');
  }

  // Validate that it's a valid permutation
  const sorted = [...permutation].sort((a, b) => a - b);
  for (let i = 0; i < 24; i++) {
    if (sorted[i] !== i + 1) {
      throw new Error('Invalid permutation: must contain each number 1-24 exactly once');
    }
  }

  // Convert permutation to factorial number system
  let factoradic = [];
  let remaining = [...permutation];

  for (let i = 0; i < 24; i++) {
    // Find the index of the smallest remaining element
    const element = permutation[i];
    let index = 0;
    for (let j = 0; j < remaining.length; j++) {
      if (remaining[j] === element) {
        index = j;
        break;
      }
    }
    factoradic.push(index);
    remaining.splice(index, 1);
  }

  // Convert factorial number system to integer
  let result = 0n;
  for (let i = 0; i < 24; i++) {
    result = result * BigInt(24 - i) + BigInt(factoradic[i]);
  }

  return result;
}

/**
 * Convert factorial number system representation back to permutation
 *
 * @param {bigint} factorial - Factorial number representation
 * @returns {number[]} - Permutation array [1-24]
 */
export function factorialToPermutation(factorial) {
  let remaining = Array.from({ length: 24 }, (_, i) => i + 1);
  let factoradic = [];

  // Extract factorial digits
  let num = factorial;
  for (let i = 0; i < 24; i++) {
    const divisor = BigInt(24 - i);
    const digit = Number(num % divisor);
    factoradic.push(digit);
    num = num / divisor;
  }

  // Reverse to get original order
  factoradic.reverse();

  // Reconstruct permutation from factoradic
  let result = [];
  for (let i = 0; i < 24; i++) {
    const index = factoradic[i];
    result.push(remaining[index]);
    remaining.splice(index, 1);
  }

  return result;
}

/**
 * Encode integer to base62 string
 * @param {bigint} num - Number to encode
 * @returns {string} - Base62 encoded string
 */
export function base62Encode(num) {
  if (num === 0n) return '00000000000000';

  let result = '';
  while (num > 0n) {
    result = BASE62_CHARS[Number(num % 62n)] + result;
    num = num / 62n;
  }

  return result.padStart(14, '0');
}

/**
 * Decode base62 string to integer
 * @param {string} str - Base62 encoded string
 * @returns {bigint} - Decoded number
 */
export function base62Decode(str) {
  if (!/^[0-9a-zA-Z]+$/.test(str)) {
    throw new Error('Invalid base62 string');
  }

  let result = 0n;
  for (const char of str) {
    const index = BASE62_CHARS.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base62 character: ${char}`);
    }
    result = result * 62n + BigInt(index);
  }

  return result;
}

/**
 * Encode permutation to 14-character code
 * @param {number[]} permutation - Array [1-24] in some order
 * @returns {string} - 14-character code
 */
export function encodePermutation(permutation) {
  const factorial = permutationToFactorial(permutation);
  return base62Encode(factorial);
}

/**
 * Decode 14-character code back to permutation
 * @param {string} code - 14-character code
 * @returns {number[]} - Permutation array [1-24]
 */
export function decodePermutation(code) {
  if (code.length !== 14 || !/^[0-9a-zA-Z]+$/.test(code)) {
    throw new Error('Invalid code: must be 14 alphanumeric characters');
  }

  const factorial = base62Decode(code);
  return factorialToPermutation(factorial);
}

/**
 * Test round-trip encoding/decoding
 * @param {number[]} permutation - Test permutation
 */
export function testRoundTrip(permutation) {
  const code = encodePermutation(permutation);
  const decoded = decodePermutation(code);

  for (let i = 0; i < 24; i++) {
    if (permutation[i] !== decoded[i]) {
      throw new Error(`Round-trip failed at index ${i}: ${permutation[i]} !== ${decoded[i]}`);
    }
  }

  return code;
}
