import _ from 'lodash';

import { DICT } from '../constants';


function dictFilter(options) {
  // 获取参数字典，默认为全局常量 DICT 。
  const constantObj = options.dict || DICT;

  // 获取读取字段的参数，参数值，用于查询参数名 。
  const { value, path, getList } = options;

  // 查询字典。
  let dictObj = constantObj;
  _.each(path, (way) => {
    if (way) {
      dictObj = _.get(dictObj, `${way || ''}`.toUpperCase()) || {};
    }
  });

  const dict = [];

  for (const [k, v] of Object.entries(dictObj)) {
    if (!k.startsWith('___')) {
      const text = dictObj[`___${k}`] || k;
      dict.push({
        label: text,
        value: v,
      });
    }
  }

  if (getList) {
    return dict;
  }

  const item = _.find(dict, { value });
  return item ? item.label : value;
}

export default function (path, value = undefined) {
  return dictFilter({
    path,
    value,
    getList: value === undefined,
    dict: DICT,
  });
}
