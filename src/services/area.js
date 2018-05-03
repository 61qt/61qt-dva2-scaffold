import _ from 'lodash';

import FactoryGraphql, { http } from '../services/_factory_graphql';

const namespace = 'area';
const table = 'area';

const modelFields = [
  'id',
  'parent_id',
  'name',
  'pinyin',
];

const modelRelate = [
];

const select = {
  list: [
    ...modelFields,
    ...modelRelate,
  ].join('\n'),
  detail: [
    ...modelFields,
  ].join('\n'),
};

const Service = FactoryGraphql({
  namespace,
  table: namespace,
  select,
});


Service.graphqlAll = (options = {}) => {
  const schema = `query All {
    area {
      id
      name
      parent_id
    }
  }`;

  return http.post('/graphql?c=area', {
    operationName: 'All',
    query: schema,
    variables: {},
  }, options.config || {}).then((res) => {
    // 直接返回 转换后的 data 数据。
    const data = _.get(res, `data.${table}`);
    const returnData = {
      ...res,
    };
    returnData.data = data;
    return returnData;
  });
};

export default Service;
