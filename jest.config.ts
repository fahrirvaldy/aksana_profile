
import type { Config } from 'jest';

const config: Config = {
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',

  // The test environment that will be used for testing
  testEnvironment: 'jest-environment-jsdom',

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },

  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(next-intl))/',
  ],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^next-intl/routing$': '<rootDir>/src/__mocks__/next-intl.tsx',
    '^next-intl/navigation$': '<rootDir>/src/__mocks__/next-intl.tsx',
  },

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

export default config;
