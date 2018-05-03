import UUID from 'uuid';
import jQuery from 'jquery';
import { Select, Spin } from 'antd';
import _ from 'lodash';
import { connect } from 'dva';
import Services from '../../services';

const timeout = {};
const optionsCache = {};
let dispatchSave = false;

// eslint-disable-next-line no-underscore-dangle
window.____foreignSelectGraphqlOptionsCache = optionsCache;

// 监控全局的 request 事件。如果数据更新了，就把缓存的外键选择进行清除操作。
// 这个需要在 url 那边同时增加触发 httpFinish 的事件。
// todo
jQuery(window).on('httpFinish', (e, options) => {
  if (!options.url || !options.method) {
    return;
  }

  const tagA = document.createElement('a');
  tagA.href = options.url;
  const url = _.get(tagA, 'pathname') || '';

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
        type: 'foreign_select_graphql/info',
        payload: optionsCache,
      });
    }
  }
});

// 特定的表，显示的名字是不同的字段的。
function getModalOptions({ props }) {
  if (-1 < ['school'].indexOf(props.table)) {
    return {
      valueName: 'name',
      textName: 'name',
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
function buildFilter({ name, method, value, props }) {
  const options = props.options || getModalOptions({ props });
  let filterArr = [];
  if (_.isArray(props.filterOption)) {
    filterArr = filterArr.concat(props.filterOption);
  }
  if ('' !== value) {
    filterArr.push([name || options.textName, method || 'like', value]);
  }

  return filterArr;
}

// 进行数据获取更新连接。
// uuid 是用来强行更新缓存的
function fetch({ value, query, props, callback, options = {} }) {
  // const timeoutSaveKey = `${uuid}_${props.table}`;
  const timeoutSaveKey = `timeout_${props.table}_${query}`;
  if (timeout[timeoutSaveKey]) {
    clearTimeout(timeout[timeoutSaveKey]);
    timeout[timeoutSaveKey] = null;
  }

  const key = `${props.table}`;
  optionsCache[key] = optionsCache[key] || [];

  // // 从缓存读取。而且缓存大于 5 条记录的时候才读取。
  // if (!props.force && optionsCache[key] && 5 < optionsCache[key].length && !value) {
  // 从缓存读取。
  if (!props.force && optionsCache[key] && 1 < optionsCache[key].length && !value) {
    return callback(optionsCache[key]);
  }

  function debunceFakeFetch() {
    Services[props.table].graphqlMaxList().then((response) => {
      // const data = _.get(response, `data.${props.table}.data`);
      const data = _.get(response, 'data.data');
      // window.console.log('data', data);
      // window.console.log('response', response);
      // window.response = response;
      // window.data = data;
      const searchList = [];
      _.each(data || [], (elem) => {
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
      props.dispatch({
        type: 'foreign_select_graphql/info',
        payload: optionsCache,
      });
      return optionsCache[key];
    }).catch((rej) => {
      window.console.log('rej', rej);
    });
  }

  timeout[timeoutSaveKey] = setTimeout(debunceFakeFetch, 300);
}

@connect((state) => {
  return {
    foreignSelectGraphqlInfoState: state.foreign_select_graphql.info,
  };
})
export default class Component extends React.Component {
  static defaultProps = {
    append: true,
    force: false,
    allowClear: false,
    table: '',
  }

  constructor(props) {
    super(props);
    if (!props.table) {
      window.console.error('ForeignSelectGraphql 必须传输 table 参数');
    }
    const value = props.value || undefined;
    const options = props.options || getModalOptions({ props });
    this.state = {
      loading: false,
      value,
      options: {
        valueName: 'id',
        textName: 'name',
        ...options,
      },
    };
    this.uuid = UUID().replace(/-/g, '_');
    debugAdd('foreign_select_graphql', this);
    // window.console.log('props.table', props.table, 'this.uuid', this.uuid);
    debugAdd(`foreign_select_graphql_all_${props.table || ''}_${this.uuid}`, this);
  }

  componentDidMount = () => {
    dispatchSave = this.props.dispatch;
    this.handleSearch('');
    this.handleSearch = _.debounce(this.handleSearch, 300);
    this.initValueElem(this.props.value);
  }

  // 更新传输的 value
  componentWillReceiveProps = (nextProps) => {
    // window.console.log('ForeignSelectGraphql componentWillReceiveProps', nextProps.value, nextProps.table, nextProps);
    if ('value' in nextProps && this.props.value !== nextProps.value) {
      this.setState({
        value: nextProps.value,
      }, () => {
        this.handleSearch(_.isString(nextProps.value) ? nextProps.value : JSON.stringify(nextProps.value) || '');
        this.initValueElem(nextProps.value);
      });
    }
    else if ('table' in nextProps && this.props.table !== nextProps.table) {
      this.handleSearch('');
      this.initValueElem('');
    }
  }

  componentWillUnmount = () => {
    this.componentUnmountFlag = true;
  }

  initValueElem = (value) => {
    if (value) {
      const valueElem = _.find(this.props.foreignSelectGraphqlInfoState[this.props.table], {
        value,
      }) || _.find(this.props.foreignSelectGraphqlInfoState[this.props.table], {
        value: value * 1,
      });

      const query = [[this.state.options.valueName, 'multiple' === this.props.mode ? 'in' : '=', value]];

      // 如果缓存中没有。
      if (!valueElem) {
        fetch({
          value,
          query,
          props: this.props,
          callback: (data) => {
            if (this.componentUnmountFlag) {
              return;
            }
            this.setState({
              loading: false,
            });
            return data;
          },
          options: this.state.options,
        });
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
    const $selected = _.find(this.props.foreignSelectGraphqlInfoState[this.props.table] || [], {
      [this.state.options.valueName]: value * 1,
    }) || _.find(this.props.foreignSelectGraphqlInfoState[this.props.table] || [], {
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

    const $selected = _.find(this.props.foreignSelectGraphqlInfoState[this.props.table] || [], {
      [this.state.options.valueName]: value * 1,
    }) || _.find(this.props.foreignSelectGraphqlInfoState[this.props.table] || [], {
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

    const query = buildFilter({
      ...this.props.search,
      value: formatedValue,
      props: this.props,
    });

    fetch({
      value: formatedValue,
      query,
      props: this.props,
      callback: (data) => {
        if (this.componentUnmountFlag) {
          return;
        }
        this.setState({
          loading: false,
        });
        return data;
      },
      options: this.state.options,
    });
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
          filterFunc(this.props.foreignSelectGraphqlInfoState[this.props.table] || []).map((elem) => {
            let filter = renderLabel(elem);
            if ('string' !== typeof filter) {
              filter = JSON.stringify(elem);
            }

            return (
              <Select.Option
                elem={elem}
                key={`${this.props.table}_${elem.value}`}
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
