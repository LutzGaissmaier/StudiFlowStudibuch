const { runAllTests } = require('../../tests.js');

test('runAllTests function exists', () => {
  expect(typeof runAllTests).toBe('function');
});
