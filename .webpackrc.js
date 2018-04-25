// import pxtorem from 'postcss-pxtorem';
const path = require('path');
const git = require('git-rev-sync');
const moment = require('moment');

const buildModule = process.env.RELEASE_MODULE || 'app';
const buildModules = ['app', 'cas', 'example'];

if (0 > buildModules.indexOf(buildModule)) {
  console.log('传入 RELEASE_MODULE 出错，必须为', JSON.stringify(buildModules), ' 中的一个');
  process.exit();
}

let releaseHash = '';
try {
  releaseHash = git.long();
}
catch (e) {}

// const svgSpriteDirs = [
//   path.resolve(__dirname, 'src/svg/'),
// ];

const publicPath = './'; // 你的 cdn 路径'; // '//cdn.example.cn/'

let config = {
  entry: `./src/modules/${buildModule}/index.js`,
  outputPath: `prod_${buildModule}`,
  disableCSSModules: false,
  // svgSpriteLoaderDirs: svgSpriteDirs,
  // sass: true,
  // publicPath: publicPath,
  hash: true,
  externals: {
    'js-cookie': 'Cookies',
    echarts: 'echarts',
    jquery: 'jQuery',
    'raven-js': 'Raven',
    lodash: '_',
    react: 'React',
    'react-dom': 'ReactDOM',
    antd: 'antd',
    axios: 'axios',
    moment: 'moment',
  },
  extraPostCSSPlugins: [
    // pxtorem({
    //   rootValue: 14,
    //   propWhiteList: [],
    // }),
  ],
  browserslist: [
    '> 1%',
    'last 2 versions',
  ],
  extraBabelPlugins: [],
  define: {
    DEFINE_MODULE: buildModule,
    DEFINE_SENTRY_PROJECT_TOKEN: '自己的 sentry 统计 token', // 'c20ad4d76fe97759aa27a0c99bff6710'
    DEFINE_SENTRY_PEOJECT_ID: '自己的 sentry 统计 id', // '3'
    DEFINE_API_URL_BASE: '自己的后端 api url', // '//api.example.com'
    DEFINE_BAIDU_TONGJI_KEY: '自己的百度统计key', // 'c20ad4d76fe97759aa27a0c99bff6710'
    DEFINE_RELEASE_VERSION: releaseHash,
    DEFINE_RELEASE_DATE: moment().format('YYYY-MM-DD HH:mm:DD'),
    DEFINE_RELEASE_ENV: process.env.RELEASE_ENV || 'DEV',
    DEFINE_HOTJAR_KEY: '你的 HOTJAR key', // 123456
  },
  html: {
    template: './src/index.ejs',
  },
  env: {
    development: {
      publicPath: '/',
      extraBabelPlugins: [
        // 'dva-hmr',
      ],
      define: {
        __DEV__: true,
        __PROD__: false,
      }
    },
    production: {
      publicPath: publicPath,
      extraBabelPlugins: [],
      define: {
        __DEV__: false,
        __PROD__: true,
      }
    },
  },
}

export default config;

