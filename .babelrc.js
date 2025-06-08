// This Babel configuration is only used for Jest testing
// Next.js will use SWC for application code
module.exports = {
  presets: ['next/babel'],
  // Only apply this configuration when running tests
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-react'
      ]
    }
  }
}