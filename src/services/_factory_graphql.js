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
      let schema = _.get(schemaCustom, 'list');
      if (!schema) {
        schema = options.schema || '';
      }

      let filter = [];
      if (options.filter) {
        if (_.isString(options.filter)) {
          try {
            filter = JSON.parse(options.filter);
          }
          catch (e) {
            filter = [];
          }
          if (!_.isArray(filter)) {
            filter = [];
          }
        }
      }

      const query = _.map(filter, (elem) => {
        return `${elem[0]}: ${elem[2]}`;
      }).join(',');

      const take = options.pageSize || PAGE_SIZE;
      const schemaArr = [
        `{
          ${namespace} (page: ${options.page || 1}, take: ${take}, orderBy: "${options.orderBy || 'id'}", sort: "${options.sort || 'desc'}"${query ? ',' : ''} ${query}) {
            data {
              id
              ${schema}
            }
            current_page
            last_page
            per_page
            total
            from
            to
          }
        }`,
      ];
      return http.post('/graphql', {
        query: schemaArr.join('\n'),
      }, options.config || {});
    },
    // 详情
    graphqlDetail: (options) => {
      let schema = _.get(schemaCustom, 'list');
      if (!schema) {
        schema = options.schema || '';
      }

      const schemaArr = [
        `{
          ${namespace} (id: ${options.id}) {
            data {
              id
              ${schema}
            }
          }
        }`,
      ];
      return http.post('/graphql/', {
        query: schemaArr.join('\n'),
      }, options.config || {});
    },
    // 删除
    graphqlRemove: (id, values = {}, config = {}) => {
      return http.post('/graphql/', values, config);
    },
    // 编辑
    graphqlUpdate: (id, values = {}, options = {}) => {
      const valueArr = [];
      for (const [key, value] of Object.entries(values)) {
        if (_.isString(value)) {
          if (/_id$/.test(key)) {
            valueArr.push(`${key}: ${value || 0}`);
          }
          else {
            valueArr.push(`${key}: "${value}"`);
          }
        }
        else {
          valueArr.push(`${key}: ${value}`);
        }
      }
      valueArr.push(`id: ${id}`);
      const schemaArr = [
        `mutation {
          updateCityAdmin (${valueArr.join(',')}) {
            id
            name
          }
        }`,
      ];
      return http.post('/graphql/', {
        query: schemaArr.join('\n'),
      }, options.config || {});
    },
    // 新增
    graphqlCreate: (values = {}, options = {}) => {
      const valueArr = [];
      for (const [key, value] of Object.entries(values)) {
        if (_.isString(value)) {
          if (/_id$/.test(key)) {
            valueArr.push(`${key}: ${value || 0}`);
          }
          else if (/phone/.test(key)) {
            valueArr.push(`${key}: ${value || 0}`);
          }
          else {
            valueArr.push(`${key}: "${value}"`);
          }
        }
        else {
          valueArr.push(`${key}: ${value}`);
        }
      }
      const schemaArr = [
        `mutation {
          createCityAdmin (${valueArr.join(',')}) {
            id
            name
          }
        }`,
      ];
      return http.post('/graphql/', {
        query: schemaArr.join('\n'),
      }, options.config || {});
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
