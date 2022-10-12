/**
 * It takes an array of any type and returns a random element of that array
 * @param {T[]} array - T[] - The array to get a random key from.
 * @returns The random key from the array.
 */
export const getRandomKeyFromArray = <T>(array: T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};
