import dva from 'dva';
import _ from 'lodash';
import createHistory from 'history/createBrowserHistory';

import createLoading from 'dva-loading';
import 'blueimp-canvas-to-blob';

import menuConfig from './menu_config';
import modelFactory from '../../models/_factory';
import '../../index';
import models from '../../models';
import CONSTANTS from '../../constants';

const browserHistory = createHistory();

// 1. Initialize
const app = dva({
  history: browserHistory,
  onStateChange: () => {
    // eslint-disable-next-line no-underscore-dangle
    const store = app._store.getState();
    const searchValuesStoreSave = {};
    if (window.localStorage && localStorage.setItem) {
      for (const [key, value] of Object.entries(store)) {
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

// 3. Model
// 创建个 menu 的 model
const menuModel = modelFactory({
  modelName: 'menu_config',
  modelExtend: {
    state: {
      menu: menuConfig,
    },
  },
});
[].concat(models).concat(menuModel).forEach((model) => {
  app.model(model);
});

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

window.app = app;
window.browserHistory = browserHistory;
// eslint-disable-next-line no-underscore-dangle
window.dispatch = app._store.dispatch;
