import DICT from './dict';

const SYSTEM_CONFIG = {
  LIST: ['CAS', 'APP'],
  CONFIG: {
    CAS: {
      // 用来存储回调时候的 url 的 key
      CALLBACK_URL: 'CAS_BALLBACK_URL',
      DOMAIN: __DEV__ ? 'https://cas-dev.61qt.cn/' : 'https://cas.61qt.cn/',
      API_BASE_URL: 'https://zhsng-sng-api.61qt.cn/',
    },
    APP: {
      DOMAIN: __DEV__ ? 'https://app-dev.61qt.cn/' : 'https://app.61qt.cn/',
      API_BASE_URL: 'https://zhsng-sng-api.61qt.cn/',
    },
  },
};

const EVENT = {
  CAS_JUMP_AUTH: 'CAS_JUMP_AUTH',
  CAS_CALLBACK: 'CAS_CALLBACK',
};

const CONSTANTS = {
  EVENT,
  SYSTEM_CONFIG,
  DICT,
  STORE_SAVE_KEY: 'STORE_SAVE_KEY',
  PAGE_SIZE: 20,
  // 直接获取全部数据，会使用到。
  PAGE_SIZE_MAX: 9999,
  API_URL_BASE: DEFINE_API_URL_BASE,
  QINIU_IMG_CDN_URL: 'https://sng-cdn.61qt.cn/',
  NOTIFICATION_DURATION: 10,
  LOGO: {
    LOGO: require('../assets/logo/logo.png'),
    TEXT: require('../assets/logo/logo_text.png'),
  },
};

export { DICT };

export default CONSTANTS;
