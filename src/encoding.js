/**
 * Encoding Module - Factorial Number System + Base62
 *
 * Converts permutations of 24 contestants to 14-character codes
 * and back, enabling URL-based state persistence.
 */

const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const PERMUTATION_SIZE = 24;

function factorial(n) {
  let result = 1n;
  for (let i = 2; i <= n; i++) {
    result *= BigInt(i);
  }
  return result;
}

const FACTORIAL_24 = factorial(PERMUTATION_SIZE);

/**
 * Convert a permutation array [5, 12, 3, ...] to factorial number system representation
 * This produces a unique integer for each possible permutation of 24 elements.
 *
 * @param {number[]} permutation - Array of 1-24 in some order
 * @returns {bigint} - Factorial number representation as integer
 */
export function permutationToFactorial(permutation) {
  if (permutation.length !== PERMUTATION_SIZE) {
    throw new Error(`Permutation must have exactly ${PERMUTATION_SIZE} elements`);
  }

  // Validate that it's a valid permutation
  const sorted = [...permutation].sort((a, b) => a - b);
  for (let i = 0; i < PERMUTATION_SIZE; i++) {
    if (sorted[i] !== i + 1) {
      throw new Error(`Invalid permutation: must contain each number 1-${PERMUTATION_SIZE} exactly once`);
    }
  }

  // Lehmer code: pick each element's index in the remaining sorted domain.
  const remaining = Array.from({ length: PERMUTATION_SIZE }, (_, i) => i + 1);
  let result = 0n;
  for (let i = 0; i < PERMUTATION_SIZE; i++) {
    const element = permutation[i];
    const index = remaining.indexOf(element);
    if (index === -1) {
      throw new Error('Invalid permutation: duplicate or missing element');
    }
    result = result * BigInt(PERMUTATION_SIZE - i) + BigInt(index);
    remaining.splice(index, 1);
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
  if (typeof factorial !== 'bigint' || factorial < 0n || factorial >= FACTORIAL_24) {
    throw new Error('Invalid factorial value: out of range for 24-element permutations');
  }

  const remaining = Array.from({ length: PERMUTATION_SIZE }, (_, i) => i + 1);
  const factoradic = [];
  let num = factorial;

  // Extract mixed-radix digits with bases 1..N, then reverse.
  for (let i = 1; i <= PERMUTATION_SIZE; i++) {
    const base = BigInt(i);
    factoradic.push(Number(num % base));
    num = num / base;
  }
  factoradic.reverse();

  const result = [];
  for (let i = 0; i < PERMUTATION_SIZE; i++) {
    const index = factoradic[i];
    if (index >= remaining.length) {
      throw new Error('Invalid factorial value: digit out of bounds');
    }
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
  if (factorial >= FACTORIAL_24) {
    throw new Error('Invalid code: value out of range');
  }
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
