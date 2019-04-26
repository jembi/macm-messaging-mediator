module.exports = {
  'roots': ['./src'],
  'transform': {
    '^.+\\.ts?$': 'ts-jest'
  },
  "testMatch": ["**/*.spec.ts"],
  'moduleFileExtensions': ['ts', 'js', 'json', 'node']
}
