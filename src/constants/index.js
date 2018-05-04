import DICT from './dict';

const SYSTEM_CONFIG = {
  LIST: ['CAS', 'APP'],
  CONFIG: {
    CAS: {
      DOMAIN: __DEV__ ? 'http://cas-dev.edu.com/' : 'http://cas.edu.com/',
      API_BASE_URL: 'http://openapi.edu.com/',
    },
    APP: {
      DOMAIN: __DEV__ ? 'http://app-dev.edu.com/' : 'http://app.edu.com/',
      API_BASE_URL: 'http://api.edu.com/',
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
  // PAGE_SIZE: 5,
  PAGE_SIZE: 20,
  // 直接获取全部数据，会使用到。
  PAGE_SIZE_MAX: 9999,
  API_URL_BASE: DEFINE_API_URL_BASE,
  QINIU_IMG_CDN_URL: 'https://sng-cdn.61qt.cn/',
  NOTIFICATION_DURATION: 10,
  LOGO: {
    LOGO: require('../assets/logo/logo.png'),
    LOGO_WHITE: require('../assets/logo/logo_white.png'),
    TEXT: require('../assets/logo/logo_text.png'),
    TEXT_WHITE: require('../assets/logo/logo_text_white.png'),
  },
};

export { DICT };

export default CONSTANTS;
