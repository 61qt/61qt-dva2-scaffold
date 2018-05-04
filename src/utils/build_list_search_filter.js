import _ from 'lodash';
import moment from 'moment';

function searchFormat(value) {
  let formatedValue;
  if ('string' === typeof value) {
    formatedValue = value.trim().replace(/^\t/ig, '').replace(/\t&/ig, '');
  }
  else if (_.isArray(value) && 1 === value.length) {
    return '';
  }
  else if ('number' === typeof value) {
    if (isNaN(value)) {
      formatedValue = '';
    }
    else {
      formatedValue = value;
    }
  }
  else if (value && 'function' === typeof value.getFullYear) {
    formatedValue = moment(value).unix();
  }
  else if ('null' === value || undefined === value || '' === value || null === value) {
    formatedValue = '';
  }
  else if (value && 'function' === typeof value.unix) {
    formatedValue = value.unix() || '';
  }
  else if (_.isArray(value)) {
    formatedValue = value;
  }
  return formatedValue;
}

export { searchFormat };

// 目前最多两级的数据
function buildListSearchFilter({ defaultFilter = [], values = {}, rebuildFormFilterName = [], formFilterName = {}, formFilterMethod = {}, rebuildFormValueFunc = {}, stringify = true }) {
  const filters = [].concat(defaultFilter);
  for (const [key, value] of Object.entries(values)) {
    if (-1 < rebuildFormFilterName.indexOf(key)) {
      // 二级数据搜索，例如 date_range 返回的对象，就需要使用这个逻辑遍历出来。
      if (_.isObject(value)) {
        for (const [subkey, subvalue] of Object.entries(value)) {
          let newSubValue = subvalue;
          if ('function' === typeof rebuildFormValueFunc[subkey]) {
            newSubValue = rebuildFormValueFunc[subkey](subvalue);
          }
          const subFormatValue = searchFormat(newSubValue);
          // 获取元素的 filter 符号
          let elemFormFilterMethod = '=';
          if ('function' === typeof formFilterMethod[subkey]) {
            elemFormFilterMethod = formFilterMethod[subkey]({ value: subFormatValue });
          }
          else if (formFilterMethod[subkey]) {
            elemFormFilterMethod = formFilterMethod[subkey];
          }

          if ('' !== subFormatValue) {
            filters.push([
              formFilterName[subkey] || subkey,
              elemFormFilterMethod,
              subFormatValue,
            ]);
          }
        }
      }
    }
    else if ('function' === typeof rebuildFormValueFunc[key]) {
      // 一级数据格式化。例如班级列表的，招生人数那边，返回的数值需要这里进行重新格式化，然后二层赋值搜索。
      const newValue = rebuildFormValueFunc[key](value);
      // 格式化之后数据，二级搜索。
      if (_.isObject(newValue)) {
        for (const [subkey, subvalue] of Object.entries(newValue)) {
          const subFormatValue = searchFormat(subvalue);
          // 获取元素的 filter 符号
          let elemFormFilterMethod = '=';
          if ('function' === typeof formFilterMethod[subkey]) {
            elemFormFilterMethod = formFilterMethod[subkey]({ value: subFormatValue });
          }
          else if (formFilterMethod[subkey]) {
            elemFormFilterMethod = formFilterMethod[subkey];
          }
          if ('' !== subFormatValue) {
            filters.push([
              formFilterName[subkey] || subkey,
              elemFormFilterMethod,
              subFormatValue,
            ]);
          }
        }
      }
      else {
        // 直接一级数据搜索
        const formatValue = searchFormat(newValue);
        // 获取元素的 filter 符号
        let elemFormFilterMethod = '=';
        if ('function' === typeof formFilterMethod[key]) {
          elemFormFilterMethod = formFilterMethod[key]({ value: formatValue });
        }
        else if (formFilterMethod[key]) {
          elemFormFilterMethod = formFilterMethod[key];
        }

        if ('' !== formatValue) {
          filters.push([
            formFilterName[key] || key,
            elemFormFilterMethod,
            formatValue,
          ]);
        }
      }
    }
    else {
      // 直接一级数据搜索
      const formatValue = searchFormat(value);
      // 获取元素的 filter 符号
      let elemFormFilterMethod = '=';
      if ('function' === typeof formFilterMethod[key]) {
        elemFormFilterMethod = formFilterMethod[key]({ value: formatValue });
      }
      else if (formFilterMethod[key]) {
        elemFormFilterMethod = formFilterMethod[key];
      }

      if ('' !== formatValue) {
        filters.push([
          formFilterName[key] || key,
          elemFormFilterMethod,
          formatValue,
        ]);
      }
    }
  }

  if (!stringify) {
    return filters;
  }

  return JSON.stringify(filters);
}

export default buildListSearchFilter;
