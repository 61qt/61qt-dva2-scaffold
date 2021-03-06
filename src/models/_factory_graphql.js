import _ from 'lodash';
import CONSTANTS from '../constants';
import defaultService from '../services/common';

let initialState = {};
try {
  initialState = JSON.parse(localStorage.getItem(CONSTANTS.STORE_SAVE_KEY));
}
catch (e) {
  initialState = {};
}

export default function modelFactory({
  Service = defaultService,
  PAGE_SIZE = CONSTANTS.PAGE_SIZE,
  PAGE_SIZE_MAX = CONSTANTS.PAGE_SIZE_MAX,
  modelName = 'model',
  modelExtend = {},
}) {
  const defaultListState = {
    query: '',
    expand: false,
    searchValues: {},
    filter: '',
  };

  let savedState = _.get(initialState, `${modelName}`) || {};
  if (!_.isPlainObject(savedState)) {
    savedState = {};
  }

  const initState = {
    start: savedState.start || 0,
    end: savedState.end || 0,
    list: [],
    data: [],
    detail: {},
    total: null,
    all: [],
    allLoaded: false,
    page: savedState.page || 1,
    pageSize: PAGE_SIZE,
    pageMaxSize: PAGE_SIZE_MAX,
    listState: savedState.listState || defaultListState,
    summary: {},
  };

  const extendInitState = _.defaultsDeep(modelExtend.state || {}, initState);

  const modelTemplate = _.defaultsDeep(modelExtend, {
    namespace: modelName,
    state: _.cloneDeep(extendInitState),
    reducers: {
      saveReset() {
        return _.cloneDeep({
          ...extendInitState,
          listState: defaultListState,
        });
      },
      saveSummary(state, { payload: { data: summary } }) {
        return { ...state, summary };
      },
      saveDetail(state, { payload }) {
        const detail = {
          ...state.detail,
          ...payload,
        };
        return { ...state, detail };
      },

      saveList(state, { payload: { data: list, total, page, pageSize, start, end } }) {
        return { ...state, list, total, page, pageSize, start, end };
      },

      // saveMaxList(state, { payload: { data: list, total, page, pageMaxSize, start, end } }) {
      //   return { ...state, list, total, page, pageMaxSize, start, end };
      // },

      saveListState(state, { payload: { filter = '', searchValues = {}, query = '', expand = false, ...rest } }) {
        const listState = {
          filter,
          searchValues,
          query,
          expand,
          ...rest,
        };
        return { ...state, listState };
      },

      saveAll(state, { payload: { data: all } }) {
        return { ...state, allLoaded: true, all };
      },
    },
    effects: {
      *list({ payload: { page = 1, pageSize: pageSizeArgs, query = '', filter = '', orderBy = '', sort = '' } }, { call, put, select }) {
        let pageSize;
        if (pageSizeArgs) {
          pageSize = pageSizeArgs;
        }
        else {
          pageSize = yield select(state => state[modelName].pageSize);
        }
        try {
          const data = yield call(Service.graphqlList, { page, filter, query, pageSize, orderBy, sort });
          const modelData = _.get(data, 'data');
          // window.listData = data;
          // window.listModelData = modelData;
          const start = modelData.perPage * 1 * (modelData.currentPage * 1 - 1) * 1 + 1;
          const length = _.get(modelData, 'data.length') * 1 || 0;
          yield put({
            type: 'saveList',
            payload: {
              data: modelData.data,
              total: modelData.total,
              pageSize: modelData.perPage * 1,
              page: modelData.currentPage,
              start,
              end: start + length - 1,
            },
          });
          return data;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },

      // *maxList({ payload: { page = 1, filter = '', query = '' } }, { call, put, select }) {
      //   const pageMaxSize = yield select(state => state[modelName].pageMaxSize);
      //   try {
      //     const data = yield call(Service.graphqlMaxList, { page, filter, query, pageSize: pageMaxSize });
      //     const start = data.data.perPage * 1 * (data.data.currentPage * 1 - 1) * 1 + 1;
      //     const length = _.get(data, 'data.data.length') * 1 || 0;
      //     yield put({
      //       type: 'saveMaxList',
      //       payload: {
      //         data: data.data.data,
      //         total: data.data.total,
      //         pageMaxSize: data.data.perPage * 1,
      //         page: data.data.currentPage,
      //         start,
      //         end: start + length,
      //       },
      //     });
      //     return data;
      //   }
      //   catch (e) {
      //     return Promise.reject(e);
      //   }
      // },

      *remove({ payload: { id, values = {} } }, { call }) {
        try {
          const data = yield call(Service.graphqlRemove, id, values);
          return data;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },

      *update({ payload: { id, values } }, { call }) {
        try {
          const data = yield call(Service.graphqlUpdate, id, values);
          return data;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },

      *create({ payload: { values } }, { call }) {
        try {
          const data = yield call(Service.graphqlCreate, values);
          return data;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },

      *detail({ payload: values }, { call, put }) {
        try {
          const data = yield call(Service.graphqlDetail, values);
          const detail = _.get(data, 'data');
          if (!detail) {
            return Promise.reject('找不到该资源');
          }
          yield put({
            type: 'saveDetail',
            payload: detail,
          });
          return detail;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },

      // 存储 index 的搜索状态的。
      *listState({ payload }, { put, select }) {
        const listState = yield select(state => state[modelName].listState);
        yield put({
          type: 'saveListState',
          payload: {
            ...listState,
            ...payload,
          },
        });
        return true;
      },

      *summary({ payload: { filter = '', query = '', id = '' } }, { call, put }) {
        try {
          const data = yield call(Service.graphqlSummary, { id, filter, query });
          yield put({
            type: 'saveSummary',
            payload: {
              data: data.data,
            },
          });
          return data;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },

      *all({ payload: { ignoreFilter = 1 } }, { call, put }) {
        try {
          const data = yield call(Service.graphqlList, { ignoreFilter });
          yield put({
            type: 'saveAll',
            payload: {
              data: data.data,
            },
          });
          return data;
        }
        catch (e) {
          return Promise.reject(e);
        }
      },
      *reset(action, { put }) {
        const newState = _.cloneDeep(initState);
        yield put({
          type: 'saveReset',
          payload: {
            ...newState,
          },
        });
        return newState;
      },
    },
    subscriptions: {},
  });
  return modelTemplate;
}
