import React from 'react';
import _ from 'lodash';
import jQuery from 'jquery';
import moment from 'moment';
import store from 'store';
import queryString from 'query-string';
import dva from 'dva';
import createHistory from 'history/createBrowserHistory';
import createLoading from 'dva-loading';

import 'blueimp-canvas-to-blob';

import CONSTANTS, { DICT } from './constants';
import Filters from './filters';
import { http } from './services/_factory';
import User from './utils/user';
import FormComponents from './components_form';
import Services from './services';
import formErrorMessageShow from './utils/form_error_message_show';
import './utils/hotjar';
import './utils/ctrl_d';
import './utils/debug_add';
import './utils/system_event_listener';

import './index.less';

export default function appFactory() {
  const browserHistory = createHistory();
  window.browserHistory = browserHistory;

  // 1. Initialize
  const app = dva({
    history: browserHistory,
    onStateChange: () => {
      // eslint-disable-next-line no-underscore-dangle
      const state = app._store.getState();
      const searchValuesStoreSave = {};
      if (window.localStorage && localStorage.setItem) {
        for (const [key, value] of Object.entries(state)) {
          if (_.isPlainObject(value) && 'listState' in value) {
            searchValuesStoreSave[key] = {
              listState: value.listState || {},
              page: value.page || 1,
              start: value.start || 0,
              end: value.end || 0,
            };
          }
        }
        localStorage.setItem(CONSTANTS.STORE_SAVE_KEY, JSON.stringify(searchValuesStoreSave));
      }
    },
  });

  // 2. Plugins
  app.use(createLoading({
    effects: true,
  }));

  window.app = app;
  return app;
}

// 全局变量挂载，方便调试使用。
// eslint-disable-next-line no-underscore-dangle
window._ = _;
window.jQuery = jQuery;
window.$ = jQuery;
window.moment = moment;
window.DICT = DICT;
window.CONSTANTS = CONSTANTS;
window.Filters = Filters;
window.FormComponents = FormComponents;
window.User = User;
window.React = React;
window.Services = Services;
window.formErrorMessageShow = formErrorMessageShow;
window.http = http;
window.store = store;
window.queryString = queryString;
