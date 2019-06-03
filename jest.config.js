module.exports = {
  'roots': ['./tests'],
  'transform': {
    '^.+\\.ts?$': 'ts-jest'
  },
  "testMatch": ["**/*.spec.ts"],
  'moduleFileExtensions': ['ts', 'js', 'json', 'node']
}
