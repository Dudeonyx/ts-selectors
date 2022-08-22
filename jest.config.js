module.exports = {
  testRegex: 'test.ts',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  collectCoverage: true,
  preset: 'ts-jest',
  testMatch: null,
  // roots: ['<rootDir>packages'],
  modulePathIgnorePatterns: ['lib', 'dist', '.rpt2_cache'],
};
