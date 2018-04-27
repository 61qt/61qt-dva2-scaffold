import menuConfig from './menu_config';
import modelFactory from '../../models/_factory';
import appFactory from '../../index';
import models from '../../models';

const app = appFactory();

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
app.router(require('./router_config').default);

// 5. Start
app.start('#root');
