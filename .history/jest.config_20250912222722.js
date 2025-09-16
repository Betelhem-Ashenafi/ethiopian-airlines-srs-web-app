module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testMatch: [
    '<rootDir>/__tests__/**/*.test.tsx',
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.spec.tsx',
    '<rootDir>/__tests__/**/*.spec.ts',
  ],
};