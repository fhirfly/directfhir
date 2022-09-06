module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|ts|tsx)?$': 'esbuild-jest',
    // '^.+\\.(js|ts|tsx)?$': '@swc/jest',
  },
  setupFiles: ['<rootDir>/test/setupFiles.js'],
};