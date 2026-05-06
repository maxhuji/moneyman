// Polyfill for @actual-app/api which expects browser globals
globalThis.navigator = {
  platform: 'linux',
  userAgent: 'Node.js'
};
