module.exports = (wallaby) => ({
  files: ['src/**/*.ts', '!src/**/*.spec.ts', 'jest.config.js', 'package.json', 'tsconfig.json'],
  tests: ['src/**/*.spec.ts'],
  testFramework: 'jest',
  env: {
    type: 'node',
    runner: 'node',
  }
});
