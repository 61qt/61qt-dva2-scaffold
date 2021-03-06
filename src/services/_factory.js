import _ from 'lodash';

import http, {
  apiBaseUrl,
} from '../utils/http';
import CONSTANTS from '../constants';

// 创建双驼峰的变量名。
function toBothCamelCase(str) {
  return str.replace(/[-_]\w/ig, (match) => {
    return match.charAt(1).toUpperCase();
  }).replace(/^[a-z]/, (match) => {
    return match.charAt(0).toUpperCase();
  });
}

// 创建提交的数据的 arr 数组。
function buildFormDataArr(values) {
  const valueArr = [];
  for (const [key, value] of Object.entries(values)) {
    if (/(password|password_confirmation)/.test(key)) {
      // ignore this value
    }
    else if (/_{3,4}/.test(key)) {
      // ignore this value
    }
    else if (/phone/.test(key)) {
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
  return valueArr;
}

export { http, apiBaseUrl, buildFormDataArr, toBothCamelCase };

// 获取 graphql 的 action 名字。
function getMutationName({
  mutation,
  action,
  table,
}) {
  let mutationFunc = _.get(mutation, `${action}.name`) || '';
  if (!mutationFunc) {
    mutationFunc = `${action}${toBothCamelCase(table)}`;
  }
  return mutationFunc;
}

export default function actionFactory({
  table,
  namespace,
  PAGE_SIZE = CONSTANTS.PAGE_SIZE,
  PAGE_SIZE_MAX = CONSTANTS.PAGE_SIZE_MAX,
  mutation = {},
  defaultFilter = {},
  ...rest
}) {
  if (!table) {
    // eslint-disable-next-line no-param-reassign
    table = namespace;
  }
  const selectCustom = rest.select;
  const service = {
    // 列表
    list: (options = {}) => {
      let select = select = _.get(selectCustom, 'list');
      if (!select) {
        select = options.select || ['admin.name'].join(',');
      }

      const searchArr = [
        `page=${options.page || 1}`,
        `per_page=${options.pageSize || PAGE_SIZE}`,
        `filter=${options.filter || ''}`,
        `select=${select}`,
        `ignore_filter=${options.ignoreFilter || 0}`,
        `order_by=${options.orderBy || ''}`,
        `sort=${options.sort || ''}`,
        `${options.query ? '&' : ''}${options.query}`,
      ];
      return http.get(`/${namespace}?${searchArr.join('&')}`, options.config || '');
    },
    // 详情
    detail: (options) => {
      const select = _.get(selectCustom, 'detail') || options.select || ['admin.name'].join(',');
      return http.get(`/${namespace}/${options.id}?select=${select}`, options.config);
    },
    // 删除
    remove: (id, values = {}, config = {}) => {
      return http.delete(`/${namespace}/${id}`, values, config);
    },
    // 编辑
    update: (id, values = {}, config = {}) => {
      return http.put(`/${namespace}/${id}`, values, config);
    },
    // 新增
    create: (values, config) => {
      return http.post(`/${namespace}`, values, config);
    },

    // graphql 列表
    graphqlList: (options = {}) => {
      let select = _.get(selectCustom, 'list');
      if (!select) {
        select = options.select || 'id';
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

      let query = [];
      _.each(filter, (elem) => {
        if (elem[0] && 'user_type' === elem[0]) {
          query.push(`${elem[0]}: ${elem[2]}`);
        }
      });

      query = query.join(',');

      const schema = `query List($page: Int, $take: Int, $filter: filterInput) {
        ${table}Pagination (page: $page, take: $take, filterInput: $filter) {
          items {
            ${select}
          }
          perPage
          total
          currentPage
        }
      }`;

      return http.post(`/graphql?f=${table}`, {
        operationName: 'List',
        query: schema,
        variables: {
          filter: {
            filter: [].concat(options.filter || []).concat(defaultFilter.list || []),
          },
          page: options.page || 1,
          take: options.pageSize || PAGE_SIZE,
          orderBy: options.orderBy || 'id',
          sort: options.sort || 'desc',
        },
      }, options.config || {}).then((res) => {
        // 直接返回 转换后的 data 数据。
        const data = _.get(res, `data.${table}Pagination`);
        const returnData = {
          ...res,
        };
        const { items, ...restData } = data;
        returnData.data = {
          ...restData,
          data: items,
        };
        return returnData;
      });
    },
    // graphql 详情
    graphqlDetail: (options) => {
      let select = _.get(selectCustom, 'detail');
      if (!select) {
        select = options.select || '';
      }

      const schema = `query Detail($id: ID!) {
        ${table} (id: $id) {
          ${select}
        }
      }`;
      return http.post(`/graphql?f=${table}`, {
        operationName: 'Detail',
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
    // graphql 删除
    graphqlRemove: (id, values, options = {}) => {
      const schema = `mutation removeMutation($id: ID) {
        ${getMutationName({ mutation, table, action: 'remove' })} (id: $id) {
          id
        }
      }`;

      return http.post(`/graphql?f=${table}`, {
        operationName: 'removeMutation',
        query: schema,
        variables: {
          id: id * 1,
        },
      }, options.config || {});
    },
    // graphql 编辑
    graphqlUpdate: (id, values = {}, options = {}) => {
      const valueArr = buildFormDataArr(values);
      const schema = `mutation updateMutation($id: ID) {
        ${getMutationName({ mutation, table, action: 'update' })} (id: $id, ${valueArr.join(',')}) {
          id
        }
      }`;
      return http.post(`/graphql?f=${table}`, {
        operationName: 'updateMutation',
        query: schema,
        variables: {
          id: id * 1,
        },
      }, options.config || {});
    },
    // graphql 新增
    graphqlCreate: (values = {}, options = {}) => {
      const valueArr = buildFormDataArr(values);
      const schema = `mutation createMutation {
        ${getMutationName({ mutation, table, action: 'create' })} (${valueArr.join(',')}) {
          id
        }
      }`;
      return http.post(`/graphql?f=${table}`, {
        operationName: 'createMutation',
        query: schema,
        variables: {},
      }, options.config || {});
    },

    // graphql 新增
    graphqlPatchUpdate: (mutationType, id, values = {}, options = {}) => {
      const valueArr = buildFormDataArr(values);
      const schema = `mutation patchUpdateMutation($id: ID) {
        ${getMutationName({ mutation, table, action: mutationType })} (id: $id, ${valueArr.join(',')}) {
          id
        }
      }`;
      return http.post(`/graphql?f=${table}`, {
        operationName: 'patchUpdateMutation',
        query: schema,
        variables: {
          id,
        },
      }, options.config || {});
    },

  };

  // 最大列表
  service.maxList = (options = {}) => {
    return service.list({
      ...options,
      pageSize: PAGE_SIZE_MAX,
      isMaxList: true,
    });
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
