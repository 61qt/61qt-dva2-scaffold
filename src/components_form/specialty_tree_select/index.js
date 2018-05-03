import { TreeSelect, Spin } from 'antd';
import _ from 'lodash';
import { connect } from 'dva';
import styles from './index.less';

@connect((state) => {
  return {
    tree: state.specialty.tree,
    all: state.specialty.all,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      value: props.value || undefined,
    };
    debugAdd('specialty_tree_select', this);
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'specialty/all',
      payload: { },
    });
  }

  // 更新传输的 value
  componentWillReceiveProps = (nextProps) => {
    const { treeCheckable = false, treeSearch = false } = this.props;

    if ('value' in nextProps) {
      if (treeCheckable) {
        this.setState({
          value: _.get(nextProps, 'value') || [],
        });
      }
      else if (treeSearch) {
        this.setState({
          value: _.get(nextProps, 'value[0]') || _.get(nextProps, 'value') || undefined,
        });
      }
      else {
        this.setState({
          value: _.get(nextProps, 'value'),
        });
      }
    }
  }

  componentWillUnmount = () => {
    this.componentUnmountFlag = true;
  }

  formatValue = (value) => {
    let formatedValue = value;

    if (this.props.treeCheckable) {
      formatedValue = value;
      if (this.props.numberFormat) {
        formatedValue = _.map(value, Number);
      }
    }
    else if (-1 < [undefined, null].indexOf(value)) {
      formatedValue = undefined;
    }
    else if (this.props.numberFormat) {
      formatedValue = parseInt(value, 10) || 0;
    }

    return formatedValue;
  }

  handleChange = (value, label, extra) => {
    const formatedValue = this.formatValue(value);

    const { onChange, treeSearch = false } = this.props;
    if ('function' === typeof onChange) {
      const $selected = _.find(this.props.all, {
        id: formatedValue * 1,
      });
      if (treeSearch) {
        if ($selected && $selected.downIds) {
          onChange($selected.downIds, label, {
            ...extra,
            treeCheckable: this.props.treeCheckable,
            $selected,
          });
        }
        else {
          onChange(formatedValue, label, {
            ...extra,
            treeCheckable: this.props.treeCheckable,
            $selected,
          });
        }
      }
      else {
        onChange(formatedValue, label, {
          ...extra,
          treeCheckable: this.props.treeCheckable,
          $selected,
        });
      }
    }
  }

  handleSelect = (value, option, extra) => {
    // option 挂载了很多信息，供回调时候使用。
    if (this.componentUnmountFlag) {
      return;
    }

    const formatedValue = this.formatValue(value);
    this.handleChange(formatedValue);

    const { onSelect, treeSearch = false } = this.props;
    if ('function' === typeof onSelect) {
      const $selected = _.find(this.props.all, {
        id: formatedValue * 1,
      });
      if (treeSearch) {
        if ($selected && $selected.downIds) {
          onSelect($selected.downIds, option, {
            ...extra,
            $selected,
          });
        }
        else {
          onSelect(formatedValue, option, {
            ...extra,
            $selected,
          });
        }
      }
      else {
        onSelect(formatedValue, option, {
          ...extra,
          $selected,
        });
      }
    }
  }

  render() {
    let value = `${this.state.value}`;
    if (this.props.treeCheckable) {
      value = [];
      if (_.isArray(this.state.value)) {
        value = _.map(this.state.value, String);
      }
    }
    else if (-1 < [undefined, null, ''].indexOf(this.state.value)) {
      value = undefined;
    }

    const filterFunc = 'function' === typeof this.props.filterFunc ? this.props.filterFunc : (tree) => {
      return tree;
    };

    const treeData = filterFunc(this.props.tree);
    let treeDefaultExpandAll = false;
    try {
      treeDefaultExpandAll = /"disabled":\s*?true/.test(JSON.stringify(treeData));
    }
    catch (e) {
      treeDefaultExpandAll = false;
    }

    if ('treeDefaultExpandAll' in this.props) {
      treeDefaultExpandAll = this.props.treeDefaultExpandAll || treeDefaultExpandAll;
    }

    let tree = this.props.tree;
    if (this.props.selectAll) {
      tree = [{
        label: '全部专业',
        value: '0',
        key: '0',
        children: this.props.tree,
      }];
    }

    const tProps = {
      showSearch: true,
      treeData: filterFunc(tree),
      value,
      onChange: this.handleChange,
      onSelect: this.handleSelect,
      disabled: this.props.disabled || false,
      allowClear: this.props.allowClear,
      showCheckedStrategy: this.props.showCheckedStrategy || TreeSelect.SHOW_ALL,
      searchPlaceholder: '选择专业',
      placeholder: this.props.placeholder || '选择专业',
      treeDefaultExpandAll,
      // treeCheckStrictly: true,
      treeCheckable: this.props.treeCheckable || false,
      treeNodeFilterProp: 'label',
      dropdownStyle: this.props.dropdownStyle || { maxHeight: 400, overflow: 'auto' },
      notFoundContent: this.state.loading ? <Spin size="small" /> : (this.props.notFoundContent || '找不到相关信息' || null),
    };
    return (<Spin spinning={this.state.loading}>
      <TreeSelect {...tProps} value={value} className={`${styles.normal} ${this.props.className || ''}`} />
    </Spin>);
  }
}
