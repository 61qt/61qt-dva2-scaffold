import _ from 'lodash';

import http, {
  apiBaseUrl,
} from '../utils/http';
import CONSTANTS from '../constants';

export { http, apiBaseUrl };

export default function actionFactory({
  table,
  PAGE_SIZE = CONSTANTS.PAGE_SIZE,
  PAGE_SIZE_MAX = CONSTANTS.PAGE_SIZE_MAX,
  Service = {},
  ...rest
}) {
  const selectCustom = rest.select;
  const service = {
    ...Service,
    // 列表
    graphqlList: (options = {}) => {
      let select = _.get(selectCustom, 'list');
      if (!select) {
        select = options.select || '';
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

      const schema = `query List($page: Int, $take: Int, $orderBy: String, $sort: String) {
        ${table} (page: $page, take: $take, orderBy: $orderBy, sort: $sort, ${query ? ',' : ''} ${query}) {
          data {
            ${select}
          }
          current_page
          last_page
          per_page
          total
          from
          to
        }
      }`;

      return http.post('/graphql', {
        query: schema,
        variables: {
          page: options.page || 1,
          take: options.pageSize || PAGE_SIZE,
          orderBy: options.orderBy || 'id',
          sort: options.sort || 'desc',
        },
      }, options.config || {}).then((res) => {
        // 直接返回 转换后的 data 数据。
        const data = _.get(res, `data.${table}`);
        const returnData = {
          ...res,
        };
        returnData.data = data;
        return returnData;
      });
    },
    // 详情
    graphqlDetail: (options) => {
      let select = _.get(selectCustom, 'detail');
      if (!select) {
        select = options.select || '';
      }

      const schema = `query Detail($id: ID) {
        ${table} (id: $id) {
          data {
            ${select}
          }
        }
      }`;
      return http.post('/graphql/', {
        query: schema,
        variables: {
          id: options.id * 1,
        },
      }, options.config || {}).then((res) => {
        // 直接返回 转换后的 data 数据。
        const data = _.get(res, `data.${table}`);
        const returnData = {
          ...res,
        };
        returnData.data = data;
        return returnData;
      });
    },
    // 删除
    graphqlRemove: (id, values = {}, config = {}) => {
      return http.post('/graphql/', values, config);
    },
    // 编辑
    graphqlUpdate: (id, values = {}, options = {}) => {
      const valueArr = [];
      for (const [key, value] of Object.entries(values)) {
        if (/phone/.test(key)) {
          valueArr.push(`${key}: "${value || 0}"`);
        }
        else if (/_id$/.test(key)) {
          valueArr.push(`${key}: ${value || 0}`);
        }
        else if (_.isString(value)) {
          valueArr.push(`${key}: "${value}"`);
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
        if (/phone/.test(key)) {
          valueArr.push(`${key}: "${value || 0}"`);
        }
        else if (/_id$/.test(key)) {
          valueArr.push(`${key}: ${value || 0}`);
        }
        else if (_.isString(value)) {
          valueArr.push(`${key}: "${value}"`);
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
