/** @type {import('ts-jest').JestConfigWithTsJest} */

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['./src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest'
  },
  coveragePathIgnorePatterns: [
    'config',
    'inversifyConfig.ts',
    'constants',
    'controllers',
    'errors',
    'db',
    'log',
    'apiDocs',
    'apiModels'
  ],
  coverageReporters: ['text'],
  moduleDirectories: ['node_modules', 'src'],
  modulePaths: ['src']
};
