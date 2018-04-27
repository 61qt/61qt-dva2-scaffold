const path = require('path');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const SpritesmithPlugin = require('webpack-spritesmith');

const spritesmithPlugin = new SpritesmithPlugin({
  src: {
    cwd: path.resolve(__dirname, 'src/sprites/png'),
    glob: '*.png',
  },
  target: {
    image: path.resolve(__dirname, 'src/.sprites/sprites.png'),
    css: path.resolve(__dirname, 'src/.sprites/sprites.less'),
  },
  apiOptions: {
    cssImageRef: 'sprites.png',
  },
});

/* eslint-disable no-param-reassign */
module.exports = (webpackConfig) => {
  webpackConfig.module.rules.forEach((item) => {
    if (-1 < String(item.loader).indexOf('url-loader')) {
      item.exclude.push(/\.svg$/);
    }
  });

  webpackConfig.plugins = webpackConfig.plugins.concat([
    new SpriteLoaderPlugin(),
    spritesmithPlugin,
  ]);

  webpackConfig.module.rules = ([
    {
      test: /\.svg$/,
      use: [
        {
          loader: 'svg-sprite-loader',
          options: {
            extract: true,
          },
        },
        {
          loader: 'svgo-loader',
          options: {
            plugins: [
              { removeTitle: true },
              { removeStyleElement: true },
            ],
          },
        },
      ],
    },
  ]).concat(webpackConfig.module.rules);

  return webpackConfig;
};
/* eslint-enable */
