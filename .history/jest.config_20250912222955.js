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
    '<rootDir>/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/**/?(*.)+(spec|test).[jt]s?(x)'
  ],
};