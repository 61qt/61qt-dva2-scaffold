import _ from 'lodash';
import Services from '../services';
import modelFactory from './_factory';

const modelName = 'area';

const STORE_CACHE_KEY = 'AREA_CACHE_V1';


const modelExtend = {
  state: {
    key: [],
    list: [],
    tree: [],
  },
  reducers: {
    save(state, { payload: { list, tree, key } }) {
      return { ...state, list, tree, key };
    },
  },
  effects: {
    *init(payload, { call, put }) {
      let data;
      try {
        data = JSON.parse(localStorage.getItem(STORE_CACHE_KEY));
      }
      catch (e) {
        // do nothing
        data = false;
      }

      if (!data) {
        try {
          const areaAllData = yield call(Services.area.graphqlAll, { });
          data = areaAllData.data;
          localStorage.setItem(STORE_CACHE_KEY, JSON.stringify(data));
        }
        catch (e) {
          return Promise.reject(e);
        }
      }

      const key = {};
      _.map(data, (elem) => {
        // eslint-disable-next-line no-param-reassign
        elem.id *= 1;
        // eslint-disable-next-line no-param-reassign
        elem.parent_id *= 1;
        key[elem.id] = elem;
      });
      data.forEach((elem) => {
        const children = _.filter(data, {
          parent_id: elem.id,
        });
        const options = {
          label: elem.name,
          value: elem.id,
        };
        if (children.length) {
          options.children = children;
        }
        Object.assign(elem, options);
      });
      const tree = _.filter(data, {
        parent_id: 1,
      });
      yield put({
        type: 'save',
        payload: {
          key,
          list: data,
          tree,
        },
      });
    },
  },
};

export default modelFactory({
  modelName,
  modelExtend,
});
