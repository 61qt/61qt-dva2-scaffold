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
