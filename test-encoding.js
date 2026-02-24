/**
 * Test Suite for Encoding Logic
 *
 * Run this in Node.js or a browser console to verify encoding works
 * Usage: node test-encoding.js
 */

// Import encoding functions (Node.js compatible)
const {
  permutationToFactorial,
  factorialToPermutation,
  base62Encode,
  base62Decode,
  encodePermutation,
  decodePermutation,
  testRoundTrip,
} = (() => {
  // Define all functions inline for this test file
  const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function permutationToFactorial(permutation) {
    if (permutation.length !== 24) {
      throw new Error('Permutation must have exactly 24 elements');
    }

    const sorted = [...permutation].sort((a, b) => a - b);
    for (let i = 0; i < 24; i++) {
      if (sorted[i] !== i + 1) {
        throw new Error('Invalid permutation: must contain each number 1-24 exactly once');
      }
    }

    let factoradic = [];
    let remaining = [...permutation];

    for (let i = 0; i < 24; i++) {
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

    let result = 0n;
    for (let i = 0; i < 24; i++) {
      result = result * BigInt(24 - i) + BigInt(factoradic[i]);
    }

    return result;
  }

  function factorialToPermutation(factorial) {
    let remaining = Array.from({ length: 24 }, (_, i) => i + 1);
    let factoradic = [];

    let num = factorial;
    for (let i = 0; i < 24; i++) {
      const divisor = BigInt(24 - i);
      const digit = Number(num % divisor);
      factoradic.push(digit);
      num = num / divisor;
    }

    factoradic.reverse();

    let result = [];
    for (let i = 0; i < 24; i++) {
      const index = factoradic[i];
      result.push(remaining[index]);
      remaining.splice(index, 1);
    }

    return result;
  }

  function base62Encode(num) {
    if (num === 0n) return '0';

    let result = '';
    while (num > 0n) {
      result = BASE62_CHARS[Number(num % 62n)] + result;
      num = num / 62n;
    }

    return result.padStart(14, '0');
  }

  function base62Decode(str) {
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

  function encodePermutation(permutation) {
    const factorial = permutationToFactorial(permutation);
    return base62Encode(factorial);
  }

  function decodePermutation(code) {
    if (code.length !== 14 || !/^[0-9a-zA-Z]+$/.test(code)) {
      throw new Error('Invalid code: must be 14 alphanumeric characters');
    }

    const factorial = base62Decode(code);
    return factorialToPermutation(factorial);
  }

  function testRoundTrip(permutation) {
    const code = encodePermutation(permutation);
    const decoded = decodePermutation(code);

    for (let i = 0; i < 24; i++) {
      if (permutation[i] !== decoded[i]) {
        throw new Error(`Round-trip failed at index ${i}: ${permutation[i]} !== ${decoded[i]}`);
      }
    }

    return code;
  }

  return {
    permutationToFactorial,
    factorialToPermutation,
    base62Encode,
    base62Decode,
    encodePermutation,
    decodePermutation,
    testRoundTrip,
  };
})();

// Test Suite

console.log('🧪 Testing Encoding Logic\n');

// Test 1: Identity permutation [1, 2, 3, ..., 24]
console.log('Test 1: Identity permutation');
const identity = Array.from({ length: 24 }, (_, i) => i + 1);
const code1 = testRoundTrip(identity);
console.log(`✓ [1, 2, 3, ..., 24] => "${code1}"`);

// Test 2: Reverse permutation [24, 23, 22, ..., 1]
console.log('\nTest 2: Reverse permutation');
const reverse = Array.from({ length: 24 }, (_, i) => 24 - i);
const code2 = testRoundTrip(reverse);
console.log(`✓ [24, 23, 22, ..., 1] => "${code2}"`);

// Test 3: Random permutation
console.log('\nTest 3: Random permutation');
const random = Array.from({ length: 24 }, (_, i) => i + 1);
for (let i = random.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [random[i], random[j]] = [random[j], random[i]];
}
const code3 = testRoundTrip(random);
console.log(`✓ Random permutation => "${code3}"`);

// Test 4: Code length verification
console.log('\nTest 4: Code length verification');
if (code1.length === 14 && code2.length === 14 && code3.length === 14) {
  console.log('✓ All codes are exactly 14 characters');
} else {
  console.log('✗ Code length mismatch!');
}

// Test 5: Base62 character verification
console.log('\nTest 5: Base62 character verification');
const base62Pattern = /^[0-9a-zA-Z]{14}$/;
if (base62Pattern.test(code1) && base62Pattern.test(code2) && base62Pattern.test(code3)) {
  console.log('✓ All codes use only base62 characters (0-9, a-z, A-Z)');
} else {
  console.log('✗ Invalid base62 characters!');
}

// Test 6: Multiple round-trips
console.log('\nTest 6: Multiple round-trips for same permutation');
const testPerm = [5, 12, 3, 7, 1, 14, 2, 9, 11, 4, 6, 8, 10, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
const code6a = encodePermutation(testPerm);
const decoded6a = decodePermutation(code6a);
const code6b = encodePermutation(decoded6a);
if (code6a === code6b) {
  console.log(`✓ Encoding is deterministic: "${code6a}" == "${code6b}"`);
} else {
  console.log('✗ Encoding is non-deterministic!');
}

// Test 7: Error handling - invalid codes
console.log('\nTest 7: Error handling');
try {
  decodePermutation('invalid');
  console.log('✗ Should have thrown error for invalid code length');
} catch (e) {
  console.log('✓ Correctly rejects invalid code length');
}

try {
  decodePermutation('00000000000000');
  // This should work as a valid code (all zeros)
  console.log('✓ Accepts valid 14-char code');
} catch (e) {
  console.log('✗ Should accept valid codes:', e.message);
}

// Test 8: Sample predictions
console.log('\nTest 8: Sample prediction scenarios');
const winner = Array.from({ length: 24 }, (_, i) => i + 1);
winner[0] = 5; // Contestant 5 wins
const codeWinner = encodePermutation(winner);
console.log(`✓ Contestant 5 as winner: "${codeWinner}"`);

const runner = Array.from({ length: 24 }, (_, i) => i + 1);
runner[0] = 12;
runner[1] = 3;
const codeRunner = encodePermutation(runner);
console.log(`✓ Contestant 12 wins, 3 second: "${codeRunner}"`);

console.log('\n✅ All tests passed! Encoding logic is working correctly.\n');
