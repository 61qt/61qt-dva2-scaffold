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
  ...rest
}) {
  const selectCustom = rest.select;
  const service = {
    // 列表
    list: (options = {}) => {
      const {
        page = 1,
        filter = '',
        pageSize = PAGE_SIZE,
        orderBy = '',
        sort = '',
        ignoreFilter = 0,
        select = ['admin.name'].join(','),
        query,
        isMaxList = false,
      } = options;
      let typeSelectCustom = '';
      if (isMaxList) {
        typeSelectCustom = _.get(selectCustom, 'maxList');
      }
      else {
        _.get(selectCustom, 'list');
      }
      return http.get(`/${namespace}?page=${page}&per_page=${pageSize}&filter=${filter}&select=${typeSelectCustom || select}&ignore_filter=${ignoreFilter}&order_by=${orderBy}&sort=${sort}${query ? '&' : ''}${query}`);
    },
    // 详情
    detail: (options) => {
      const typeSelectCustom = _.get(selectCustom, 'detail');
      const { id, select = ['admin.name'].join(',') } = options;
      return http.get(`/${namespace}/${id}?select=${typeSelectCustom || select}`);
    },
    // 删除
    remove: (id) => {
      return http.delete(`/${namespace}/${id}`, {});
    },
    // 编辑
    update: (id, values) => {
      return http.put(`/${namespace}/${id}`, {
        ...values,
      });
    },
    // 新增
    create: (values) => {
      return http.post(`/${namespace}`, {
        ...values,
      });
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

  return service;
}
