import UUID from 'uuid';
import jQuery from 'jquery';
import { Select, Spin } from 'antd';
import _ from 'lodash';
import { connect } from 'dva';
import { http } from '../../services/_factory';

const timeout = {};
const currentValue = {};
const optionsCache = {};
let dispatchSave = false;

// eslint-disable-next-line no-underscore-dangle
window.____foreignSelectOptionsCache = optionsCache;

// 监控全局的 request 事件。如果数据更新了，就把缓存的外键选择进行清除操作。
// 这个需要在 url 那边同时增加触发 httpFinish 的事件。
// todo
jQuery(window).on('httpFinish', (e, options) => {
  if (!options.url || !options.method) {
    return;
  }

  const tagA = document.createElement('a');
  tagA.href = options.url;
  const url = _.get(tagA, 'pathname');

  if (url && -1 === ['get'].indexOf(options.method.toLocaleLowerCase())) {
    const key1 = url;
    delete optionsCache[key1];
    const key2 = url.replace(/^\/+/, '');
    delete optionsCache[key2];
    const key3 = url.replace(/\/+$/, '');
    delete optionsCache[key3];
    const key4 = url.replace(/^\/*(.*?)\/*$/, '$1');
    delete optionsCache[key4];
    if (dispatchSave) {
      dispatchSave({
        type: 'foreign_select/info',
        payload: optionsCache,
      });
    }
  }
});

// 特定的表，显示的名字是不同的字段的。
function getModalOptions({ props }) {
  const url = props.url || '';
  if (-1 < ['class', 'course', 'product'].indexOf(url)) {
    return {
      valueName: 'id',
      textName: 'display_name',
    };
  }
  else if (-1 < ['school'].indexOf(url)) {
    return {
      valueName: 'name',
      textName: 'name',
    };
  }
  else if (-1 < ['keyword_reply'].indexOf(url)) {
    return {
      valueName: 'id',
      textName: 'keyword',
    };
  }
  else {
    return {
      valueName: 'id',
      textName: 'name',
    };
  }
}

// 创建怎么搜索的方法。
function buildQuery({ format, name, method, value, props }) {
  const options = props.options || getModalOptions({ props });
  let query = `?search=${value}`;
  // filter 模式
  if ('filter' === format) {
    let filterArr = [];
    if (_.isArray(props.filterOption)) {
      filterArr = filterArr.concat(props.filterOption);
    }
    if ('' !== value) {
      filterArr.push([name || options.textName, method || 'like', value]);
    }
    if (0 < filterArr.length) {
      query = `?filter=${JSON.stringify(filterArr)}`;
    }
  }


  if ('' === value) {
    query = '?';
  }

  return query;
}

// 进行数据获取更新连接。
// uuid 是用来强行更新缓存的
function fetch({ value, query, url, props, force = false, dispatch }, callback, options = {}) {
  // const timeoutSaveKey = `${uuid}_${url}`;
  const timeoutSaveKey = `timeout_${url}_${query}`;
  if (timeout[timeoutSaveKey]) {
    clearTimeout(timeout[timeoutSaveKey]);
    timeout[timeoutSaveKey] = null;
  }
  currentValue[url] = value;

  const key = `${url}`;
  optionsCache[key] = optionsCache[key] || [];

  if ('specialty' === url) {
    return callback([]);
  }

  // // 从缓存读取。而且缓存大于 5 条记录的时候才读取。
  // if (!force && optionsCache[key] && 5 < optionsCache[key].length && !value) {
  // 从缓存读取。
  if (!force && optionsCache[key] && 1 < optionsCache[key].length && !value) {
    return callback(optionsCache[key]);
  }

  function fake() {
    let urlRequest = `/${url}${query || ''}`;
    if (props.apiSelect) {
      const select = `select=${props.apiSelect}`;
      if (-1 < urlRequest.indexOf('?')) {
        urlRequest = `${urlRequest}&${select}`;
      }
      else {
        urlRequest = `${urlRequest}?${select}`;
      }
    }
    http.get(urlRequest).then((response) => {
      const data = response.data.data;
      const searchList = [];
      data.forEach((elem) => {
        // 获取 elem 的 value 和 text 的 存储 index 。
        searchList.push({
          ...elem,
          value: elem[options.valueName],
          text: elem[options.textName],
        });
      });
      // 是否连接并去重。
      if (false === props.append) {
        optionsCache[key] = [];
      }
      else {
        optionsCache[key] = optionsCache[key] || [];
      }
      optionsCache[key] = _.uniqBy(_.orderBy([].concat(searchList).concat(optionsCache[key]), 'value', 'desc'), 'value');
      callback(optionsCache[key]);
      dispatch({
        type: 'foreign_select/info',
        payload: optionsCache,
      });
    });
  }

  timeout[timeoutSaveKey] = setTimeout(fake, 300);
}

@connect((state) => {
  return {
    foreignSelectInfoState: state.foreign_select.info,
  };
})
export default class Component extends React.Component {
  // static defaultProps = {
  //   // append: true,
  //   force: false,
  //   allowClear: false,
  // }

  constructor(props) {
    super(props);
    if (__DEV__ && props.url && 'specialty' === props.url) {
      window.console.error('使用 SpecialtyTreeSelect 替换专业外键。', '使用例子:', '<FormComponents.SpecialtyTreeSelect allowClear numberFormat data-comment-treeSearch="树搜索" />');
    }
    const value = props.value || undefined;
    const options = props.options || getModalOptions({ props });
    this.state = {
      loading: false,
      value,
      options: {
        ...options,
      },
    };
    this.uuid = UUID().replace(/-/g, '_');
    debugAdd('foreign_select', this);
    // window.console.log('props.url', props.url, 'this.uuid', this.uuid);
    debugAdd(`foreign_select_all_${props.url || ''}_${this.uuid}`, this);
  }

  componentDidMount = () => {
    dispatchSave = this.props.dispatch;
    this.handleSearch('');
    this.handleSearch = _.debounce(this.handleSearch, 300);
    this.initValueElem(this.props.value);
  }

  // 更新传输的 value
  componentWillReceiveProps = (nextProps) => {
    // window.console.log('ForeignSelect componentWillReceiveProps', nextProps.value, nextProps.url, nextProps);
    if ('value' in nextProps && this.props.value !== nextProps.value) {
      const value = nextProps.value;
      this.setState({
        value,
      }, () => {
        this.handleSearch(_.isString(value) ? value : JSON.stringify(value) || '');
        this.initValueElem(value);
      });
    }
    else if ('url' in nextProps && this.props.url !== nextProps.url) {
      this.handleSearch('');
      this.initValueElem('');
    }
  }

  componentWillUnmount = () => {
    this.componentUnmountFlag = true;
  }

  initValueElem = (value) => {
    const { url, foreignSelectInfoState } = this.props;
    if (value) {
      const valueElem = _.find(foreignSelectInfoState[url], {
        value,
      }) || _.find(foreignSelectInfoState[url], {
        value: value * 1,
      });

      let query = `?filter=${JSON.stringify([[this.state.options.valueName, 'multiple' === this.props.mode ? 'in' : '=', value]])}`;

      if (-1 < this.props.url.indexOf('?')) {
        query = '';
      }

      if (!valueElem) {
        fetch({
          value,
          query,
          url: this.props.url,
          search: this.props.search,
          uuid: this.uuid,
          props: this.props,
          force: this.props.force || false,
          dispatch: this.props.dispatch,
        }, (data) => {
          if (this.componentUnmountFlag) {
            return;
          }
          this.setState({
            loading: false,
          });
          return data;
        }, this.state.options);
      }
    }
  }

  formatValue = (value) => {
    let formatedValue = value;

    if ('multiple' === this.props.mode) {
      if (this.props.numberFormat) {
        if (_.isArray(value)) {
          formatedValue = _.map(value, Number);
        }
        else if (_.isString(value)) {
          formatedValue = Number(value);
        }
      }
      // nothing to do
    }
    else if (-1 < [undefined, null].indexOf(value)) {
      formatedValue = undefined;
    }
    else if (this.props.numberFormat) {
      formatedValue = parseInt(value, 10) || 0;
    }

    return formatedValue;
  }

  handleChange = (value) => {
    const formatedValue = this.formatValue(value);
    this.setState({
      value: formatedValue,
    });

    // window.console.log('handleChange formatedValue', value);

    const { onChange } = this.props;
    if ('function' === typeof onChange) {
      onChange(formatedValue);
    }
  }

  handleSelect = (value, option) => {
    // option 挂载了很多信息，供回调时候使用。
    if (this.componentUnmountFlag) {
      return;
    }

    const formatedValue = this.formatValue(value);
    // this.handleChange(formatedValue);

    const { onSelect } = this.props;
    const $selected = _.find(this.props.foreignSelectInfoState[this.props.url] || [], {
      [this.state.options.valueName]: value * 1,
    }) || _.find(this.props.foreignSelectInfoState[this.props.url] || [], {
      [this.state.options.valueName]: value,
    }) || null;
    if ('function' === typeof onSelect) {
      onSelect(formatedValue, {
        ...option,
        $selected,
      });
    }

    // window.console.log('handleSelect value', value, 'option', option, 'formatedValue', formatedValue, '$selected', $selected);
  }

  handleDeselect = (value) => {
    // option 挂载了很多信息，供回调时候使用。
    if (this.componentUnmountFlag) {
      return;
    }

    const formatedValue = this.formatValue(value);
    // this.handleChange(formatedValue);

    const $selected = _.find(this.props.foreignSelectInfoState[this.props.url] || [], {
      [this.state.options.valueName]: value * 1,
    }) || _.find(this.props.foreignSelectInfoState[this.props.url] || [], {
      [this.state.options.valueName]: value,
    }) || null;

    const { onDeselect } = this.props;
    if ('function' === typeof onDeselect) {
      onDeselect(formatedValue, {
        $selected,
      });
    }

    // window.console.log('handleSelect value', value, 'formatedValue', formatedValue, '$selected', $selected);
  }

  handleSearch = (value = '') => {
    let formatedValue = value;
    if ('string' === typeof value) {
      formatedValue = value.trim().replace(/^\t/ig, '').replace(/\t&/ig, '');
    }
    if (this.componentUnmountFlag) {
      return;
    }
    if (formatedValue && 'combobox' === this.props.mode) {
      this.handleChange(formatedValue);
    }
    this.setState({
      loading: true,
    });

    let query = buildQuery({
      url: this.props.url,
      ...this.props.search,
      value: formatedValue,
      props: this.props,
    });

    if (-1 < this.props.url.indexOf('?')) {
      query = '';
    }

    fetch({
      value: formatedValue,
      query,
      url: this.props.url,
      search: this.props.search,
      uuid: this.uuid,
      props: this.props,
      force: this.props.force || false,
      dispatch: this.props.dispatch,
    }, (data) => {
      if (this.componentUnmountFlag) {
        return;
      }
      this.setState({
        loading: false,
      });
      return data;
    }, this.state.options);
  }

  render() {
    const value = this.state.value;
    let formatValue;
    if ('multiple' === this.props.mode) {
      formatValue = _.map(value, String);
    }
    else {
      formatValue = -1 < [undefined, null].indexOf(value) ? value : `${value}`;
    }
    const { url } = this.props;
    const filterFunc = 'function' === typeof this.props.filterFunc ? this.props.filterFunc : (arr) => {
      return arr;
    };

    const renderLabel = 'function' === typeof this.props.renderLabel ? this.props.renderLabel : (elem) => {
      return elem.text;
    };

    const renderValue = 'function' === typeof this.props.renderValue ? this.props.renderValue : (elem) => {
      return `${elem.value}`;
    };

    const size = this.props.size || 'default';
    return (
      <Select
        size={size}
        showSearch={this.props.showSearch || true}
        value={formatValue}
        mode={this.props.mode || ''}
        disabled={this.props.disabled || false}
        placeholder={this.props.placeholder || ''}
        notFoundContent={this.state.loading ? <Spin size="small" /> : (this.props.notFoundContent || 'combobox' === this.props.mode ? '' : '找不到相关信息' || null)}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={undefined === this.props.showArrow ? true : this.props.showArrow}
        bakfilterOption={false}
        onChange={this.handleChange}
        onSearch={this.handleSearch}
        allowClear={this.props.allowClear || false}
        onSelect={this.handleSelect}
        onDeselect={this.handleDeselect}
        filterOption={(input, option) => {
          let formatInput = input;
          if ('string' === typeof input) {
            formatInput = input.trim().replace(/^\t/ig, '').replace(/\t&/ig, '');
          }
          if ('' === formatInput || undefined === formatInput) {
            return true;
          }

          return 0 <= (option.props.filter || '').toLowerCase().indexOf(formatInput.toLowerCase());
        }}
      >
        {
          filterFunc(this.props.foreignSelectInfoState[this.props.url] || []).map((elem) => {
            let filter = renderLabel(elem);
            if ('string' !== typeof filter) {
              filter = JSON.stringify(elem);
            }

            return (
              <Select.Option
                elem={elem}
                key={`${url}_${elem.value}`}
                value={renderValue(elem)}
                title={elem.text}
                filter={filter}
              >
                { renderLabel(elem) }
              </Select.Option>
            );
          })
        }
      </Select>
    );
  }
}
