const plugins = [
  '@babel/plugin-syntax-flow',
  '@babel/plugin-transform-runtime',
  '@babel/plugin-proposal-export-default-from',
  'transform-class-properties',
  '@babel/plugin-proposal-object-rest-spread',
  '@babel/plugin-syntax-dynamic-import',
]

if (process.env.FROM_SUBMODULES) {
  plugins.push([
    'module-resolver',
    {
      alias: {
        '@bhe/node-core/lib': './_submodules/node-core/src',
        '@bhe/core-modules/lib': './_submodules/core-modules/src',
      },
    },
  ])
}

module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-flow'],
  plugins,
}
