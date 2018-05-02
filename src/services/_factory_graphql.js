import _ from 'lodash';

import http, {
  apiBaseUrl,
} from '../utils/http';
import CONSTANTS from '../constants';

export { http, apiBaseUrl };

export default function actionFactory({
  namespace,
  PAGE_SIZE = CONSTANTS.PAGE_SIZE,
  PAGE_SIZE_MAX = CONSTANTS.PAGE_SIZE_MAX,
  Service = {},
  ...rest
}) {
  const schemaCustom = rest.schema;
  const service = {
    ...Service,
    // 列表
    graphqlList: (options = {}) => {
      let schema = '';
      if (options.isMaxList) {
        schema = _.get(schemaCustom, 'maxList') || _.get(schemaCustom, 'list');
      }
      else {
        schema = _.get(schemaCustom, 'list');
      }
      if (!schema) {
        schema = options.schema || '';
      }

      const schemaArr = [
        `{
          ${namespace} (take: ${options.pageSize || PAGE_SIZE}, orderBy: "${options.orderBy || 'id'}", sort: "${options.sort || 'desc'}") {
            id
            ${schema}
          }
        }`,
      ];
      return http.post('/graphql', {
        query: schemaArr.join('\n'),
      }, options.config || '');
    },
    // 详情
    graphqlDetail: (options) => {
      const select = _.get(schemaCustom, 'detail') || options.schema || ['admin.name'].join(',');
      return http.post(`/graphql/${options.id}?select=${select}`, {}, options.config);
    },
    // 删除
    graphqlRemove: (id, values = {}, config = {}) => {
      return http.post(`/graphql/${id}`, values, config);
    },
    // 编辑
    graphqlUpdate: (id, values = {}, config = {}) => {
      return http.post(`/graphql/${id}`, values, config);
    },
    // 新增
    graphqlCreate: (values, config) => {
      return http.post('/graphql', values, config);
    },
  };

  // 最大列表
  service.graphqlMaxList = (options = {}) => {
    return service.graphqlList({
      ...options,
      pageSize: PAGE_SIZE_MAX,
      isMaxList: true,
    });
  };

  return service;
}
