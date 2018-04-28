import _ from 'lodash';
import jQuery from 'jquery';
import moment from 'moment';
import Services from '../services';
import CONSTANTS from '../constants';
import User from '../utils/user';
import formErrorMessageShow from '../utils/form_error_message_show';
import { undershoot as sentryUndershoot } from '../utils/dva-sentry';
import {
  // LogoutError,
  NotFoundError,
  RequestUncatchError,
  NetworkRequestFailedError,
  ServerRequestError,
  UserRequestError,
  NetworkRequestOfflineError,
} from '../utils/error_class';

const networkDetection = {
  // 单个请求超过多少秒之后，显示当前网络有点慢。
  xhrTooSlowTimeoutConfig: 3 * 1000,
  // 是否太慢的标志。
  isTooSlow: false,
  // // 太慢了之后，计算开始快起来的速度的问题。
  // afterTooSlowCount: 0,
  // 用于存储每次请求的 timeout 的 promise ，用完之后清空。
  timeoutDetection: {},
  resetTooSlowToFalseTimeoutSave: {},
  // 若置为太慢，就多少秒之后自动变回不显示。
  resetTooSlowToFalseTimeout: 3 * 1000,
  tip: jQuery('<div class="network-too-slow-tip" id="network-too-slow-tip" style="display: none;position: fixed; bottom: 1.5rem; right: 50%; margin-right: -7em; z-index: 1; border-radius: 5px; padding: 6px 1rem; font-weight: 100; background: rgba(0,0,0,.75); color: white; font-size: 13px;">网络有点慢，请耐心等候...</div>'),
  // 延迟队列。
  deferredArr: [],
  // 延迟队列标志，更新状态。
  inRefreshingFlag: false,
};
window.networkDetection = networkDetection;

// 增加到 页面
jQuery(document.body).append(networkDetection.tip);

function uuidFunc() {
  return `uuid_${moment().unix()}_${String(Math.random()).substr(2)}`;
}

// 开始清空显示网络过慢的问题。
function clearNetworkTimeout(uuid) {
  const { timeoutDetection } = networkDetection;
  clearTimeout(timeoutDetection[uuid]);
  delete timeoutDetection[uuid];
  cleanDetectTimeout(uuid);
  return true;
}

// 请求完毕之后，延时处理优化显示网络过慢的内容。。
function cleanDetectTimeout(uuid) {
  const { resetTooSlowToFalseTimeoutSave, timeoutDetection } = networkDetection;
  resetTooSlowToFalseTimeoutSave[uuid] = setTimeout(() => {
    clearTimeout(resetTooSlowToFalseTimeoutSave[uuid]);
    delete resetTooSlowToFalseTimeoutSave[uuid];
    if (1 > Object.keys(resetTooSlowToFalseTimeoutSave || {}).length && 1 > Object.keys(timeoutDetection || {}).length) {
      networkDetection.isTooSlow = false;
      networkDetection.tip.hide();
    }
  }, networkDetection.resetTooSlowToFalseTimeout);
}

// 创建时间处理的延时函数。
function makeTimeoutDetection(uuid) {
  const { timeoutDetection } = networkDetection;
  timeoutDetection[uuid] = setTimeout(() => {
    // window.console.log('timeoutDetection[uuid]', uuid, timeoutDetection[uuid]);
    networkDetection.isTooSlow = true;
    networkDetection.tip.show();
  }, networkDetection.xhrTooSlowTimeoutConfig);
}

export function responseSuccessInterceptor(response) {
  clearNetworkTimeout(response.uuid || _.get(response, 'config.uuid'));
  const { data } = response;
  jQuery(window).trigger('request', response);
  jQuery(window).trigger('httpFinish', response);
  return data;
}

export function responseFailInterceptor(config) {
  const duration = new Date() * 1 - config.startTime;
  const status = config.status;
  if (404 === status) {
    return sentryUndershoot.capture(new NotFoundError(config), {
      ...config,
    });
  }

  // 进行错误捕抓忽略判断。
  const ignoreStrArr = [
    'Token has expired and can no longer be refreshed',
  ];
  let retJsonString = '';
  let findFlag = false;
  if (config) {
    retJsonString = `${config.responseText || ''}`;
    _.each(ignoreStrArr, (elem) => {
      if (-1 < retJsonString.indexOf(elem)) {
        window.console.log('elem', elem);
        findFlag = true;
      }
    });
    if (findFlag) {
      window.console.log('findFlag', findFlag);
      return;
    }
  }

  if (400 <= status && 500 > status) {
    if (config.url.endsWith('/login')) {
      // 登录错误的 ，不处理。
    }
    else {
      try {
        const exp = User.decodeToken().exp;
        const now = moment().unix();
        if (window.console && window.console.log) {
          window.console.log('request ', status, ', config is', JSON.stringify(config), 'document.cookie is', document.cookie, ' . token is ', User.token, 'now is', now, 'exp is', exp, 'offset (exp - now) is', exp - now);
        }
      }
      catch (e) {
        // nothing to do
      }
      sentryUndershoot.capture(new UserRequestError(config), config);
    }
  }
  else if (500 <= status && 600 > status) {
    sentryUndershoot.capture(new ServerRequestError(config), config);
  }
  else if (0 === status) {
    if (window.console && window.console.log) {
      // 输出请求的时间。
      window.console.log('request status === 0, duration is ', duration);
    }

    if (50 > duration) {
      const newError = new NetworkRequestOfflineError(config);
      newError.title = '网络连接已经断开，请检查网络。';
      setTimeout(() => {
        formErrorMessageShow(newError, {
          capture: false,
        });
      }, 100);
      sentryUndershoot.capture(newError, config);
    }
    else {
      const newError = new NetworkRequestFailedError(config);
      newError.title = '网络繁忙，请稍后重试';
      setTimeout(() => {
        formErrorMessageShow(newError, {
          capture: false,
        });
      }, 100);
      sentryUndershoot.capture(newError, config);
    }
  }
  else {
    // 未知的错误。
    sentryUndershoot.capture(new RequestUncatchError(config), config);
  }
  return Promise.reject(_.get(config, 'response.data') || {});
}

export function requestInterceptor(config) {
  // eslint-disable-next-line no-param-reassign
  config.uuid = uuidFunc();
  // eslint-disable-next-line no-param-reassign
  config.startTime = new Date() * 1;

  const noTokenMsgData = {
    msg: '没有密钥，用户已经退出',
    data: {},
    status_code: 0,
    code: 0,
  };

  const noTokenRejData = {
    ...config,
    config,
    data: {
      data: noTokenMsgData,
    },
  };

  if (config.headers && 'Content-Type' in config.headers) {
    // eslint-disable-next-line no-param-reassign
    config.headers['Content-Type'] = config.headers['Content-Type'];
    if (!config.headers['Content-Type']) {
      // eslint-disable-next-line no-param-reassign
      delete config.headers['Content-Type'];
    }
  }
  else {
    // eslint-disable-next-line no-param-reassign
    config.headers['Content-Type'] = 'application/json; charset=utf-8';
  }

  if (User.token && !config.skipAuthorization) {
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${User.token}`;
  }
  else if (!User.token && !config.skipAuthorization) {
    // 这里应该退出了，应该跳到登录页面
    return Promise.reject(noTokenRejData);
  }

  // 调试强制
  if (window.forceRejectRequest) {
    window.forceRejectRequest = false;


    return Promise.reject(noTokenRejData);
  }

  // 判断，写多几个，方便阅读。
  if (!User.token || config.skipAuthorization || config.skipExpireCheck) {
    // 不需要更新 token 或者不需要带上 token 。直接请求。
    makeTimeoutDetection(config.uuid);
    return Promise.resolve(config);
  }

  function makeDeferRequest() {
    makeTimeoutDetection(config.uuid);
    return new Promise((resolve, reject) => {
      const deferRequest = (newConfig) => {
        setTimeout(() => {
          resolve(newConfig);
          _.defaultsDeep(newConfig, config);
        }, 50);
      };

      // 全局存储已经暂缓的 xhr
      networkDetection.deferredArr.push({
        config,
        deferRequest,
        deferRequestReject: reject,
      });
    });
  }

  // 刷新中，需要暂缓处理 xhr
  if (networkDetection.inRefreshingFlag) {
    // 需要更新 token ，队列延迟
    if (window.console && window.console.log) {
      window.console.log('in refresh ing', User.token);
    }
    return makeDeferRequest();
  }

  // 需要先判断是不是需要更新 token 。
  if (window.forceRefreshToken || !User.validToken()) {
    networkDetection.inRefreshingFlag = true;
    // 需要更新 token
    if (window.console && window.console.log) {
      window.console.log('need to refresh token, token is', User.token);
    }

    Services.common.refreshToken().then((res) => {
      window.forceRefreshToken = false;
      const { data } = res;
      // 使用新的 token 覆盖 headers 原本的 token。
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${data.token}`;
      // let tokenOffset = User.getTokenOffset(data);
      // if (data.timestamps) {
      //   tokenOffset = User.getTokenOffset({ ...data });
      // }
      User.token = data.token;
      networkDetection.inRefreshingFlag = false;
      setTimeout(() => {
        while (0 < networkDetection.deferredArr.length) {
          const { deferRequest } = networkDetection.deferredArr.shift();
          if ('function' === typeof deferRequest) {
            deferRequest({
              headers: {
                Authorization: `Bearer ${data.token}`,
              },
            });
          }
        }
      }, 1);
    }).catch((rej) => {
      networkDetection.inRefreshingFlag = false;
      setTimeout(() => {
        while (networkDetection.deferredArr.length) {
          const deferRequestElem = networkDetection.deferredArr.shift();
          if ('function' === typeof deferRequestReject) {
            deferRequestElem.deferRequestReject({
              ...deferRequestElem.config,
              dat: rej,
            });
          }
        }
      }, 1);
      formErrorMessageShow(rej);
      // 切换回登录页面。
      setTimeout(() => {
        jQuery(window).trigger(CONSTANTS.EVENT.CAS_JUMP_AUTH);
      }, 2000);
      return rej;
    });
    return makeDeferRequest();
  }

  // 最终情况。直接请求
  makeTimeoutDetection(config.uuid);
  return Promise.resolve(config);
}
