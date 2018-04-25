import dva from 'dva';
import createHistory from 'history/createBrowserHistory';

import createLoading from 'dva-loading';
import 'blueimp-canvas-to-blob';

import menuConfig from './menu_config';
import modelFactory from '../../models/_factory';
import '../../index';
import models from '../../models';


const browserHistory = createHistory();

// 1. Initialize
const app = dva({
  history: browserHistory,
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

// eslint-disable-next-line no-underscore-dangle
window.app = app;
// eslint-disable-next-line no-underscore-dangle
window.browserHistory = browserHistory;
// eslint-disable-next-line no-underscore-dangle
window.dispatch = app._store.dispatch;
