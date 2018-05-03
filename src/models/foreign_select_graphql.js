import modelFactory from './_factory';

const modelExtend = {
  state: {
    info: {},
  },
  reducers: {
    saveInfo(state, { payload: { info } }) {
      return { ...state, info };
    },
  },
  effects: {
    *info({ payload }, { put }) {
      yield put({
        type: 'saveInfo',
        payload: {
          info: {
            ...payload,
          },
        },
      });
    },
  },
};


const modelName = 'foreign_select_graphql';
export default modelFactory({
  modelName,
  modelExtend,
});
