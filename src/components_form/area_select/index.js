import UUID from 'uuid';
import { Select, Spin } from 'antd';
import _ from 'lodash';
import { connect } from 'dva';

@connect((state) => {
  return {
    areaState: state.area,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      value: props.value || undefined,
    };
    this.uuid = UUID().replace(/-/g, '_');
    debugAdd('area', this);
    // window.console.log('props.url', props.url, 'this.uuid', this.uuid);
    debugAdd(`area_all_${props.url || ''}_${this.uuid}`, this);
  }

  componentDidMount = () => {}

  // 更新传输的 value
  componentWillReceiveProps = (nextProps) => {
    if ('value' in nextProps && this.props.value !== nextProps.value) {
      const value = nextProps.value;
      this.setState({
        value,
      });
    }
  }

  componentWillUnmount = () => {
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
    // window.console.log('option', option);

    const { onSelect } = this.props;
    if ('function' === typeof onSelect) {
      onSelect(formatedValue, {
        ...option,
      });
    }
  }

  render() {
    const value = this.state.value;
    let formatValue = value;
    if ('multiple' === this.props.mode) {
      formatValue = _.map(value, String);
    }
    else {
      // formatValue = -1 < [undefined, null].indexOf(value) ? value : `${value}`;
      formatValue = value;
    }

    const areaList = _.get(this.props.areaState, `key[${this.props.areaParentId}].children`) || [];
    return (
      <Select
        size={this.props.size || 'default'}
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
          _.map(areaList, (elem) => {
            return (
              <Select.Option
                elem={elem}
                key={`area_${elem.id}`}
                value={elem.value}
                title={elem.name}
                filter={elem.name}
              >
                { elem.name }
              </Select.Option>
            );
          })
        }
      </Select>
    );
  }
}
