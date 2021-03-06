import React from 'react';
import jQuery from 'jquery';
import { Input, Tree } from 'antd';
import _ from 'lodash';

export default class Component extends React.Component {
  static defaultProps = {
    deep: 9999999,
  }

  constructor(props) {
    super(props);

    debugAdd('filter_tree', this);

    this.state = {
      searchValue: '',
      expandedKeys: [],
      checkedKeys: props.defaultValue || [],
      autoExpandParent: true,
    };

    this.search = _.debounce(this.search, 300);
  }

  componentDidMount = () => {
    const last = _.last(this.state.checkedKeys);
    if (last) {
      jQuery(`[data-tree-value=${last}]`).click();
    }
  }

  onExpand = (expandedKeys) => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  }

  onCheck = (checkedKeys) => {
    // window.console.log('onCheck checkedKeys', checkedKeys, rest);
    this.setState({
      checkedKeys,
    });

    if ('function' === typeof this.props.onCheck) {
      this.props.onCheck(checkedKeys);
    }
  }

  onSearch = (value) => {
    this.search(value);
  }

  onSelect = (selectedId) => {
    // window.console.log('onSelect selectedId', selectedId, rest);
    if ('function' === typeof this.props.onSelect) {
      this.props.onSelect(selectedId);
    }
  }

  deepFirstSearch = (tree, name) => {
    return tree.map((node) => {
      if (-1 < node.name.indexOf(name)) {
        return node.id;
      }
      else if (node.children) {
        return this.deepFirstSearch(node.children, name);
      }
      else {
        return null;
      }
    });
  }

  search = (inputValue) => {
    const tree = _.get(this.props, 'tree') || [];

    const expandedKeys = _.compact(_.flattenDeep(this.deepFirstSearch(tree, inputValue)));

    this.setState({
      expandedKeys,
      searchValue: inputValue,
      autoExpandParent: true,
    });
  }

  recursiveRender = (data, deep) => {
    const searchValue = this.state.searchValue;
    return data.map((node) => {
      const selectable = !this.props.checkable;
      const index = node.name.indexOf(searchValue);
      const beforeStr = node.name.substr(0, index);
      const afterStr = node.name.substr(index + searchValue.length);
      const title = -1 < index ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : <span>{node.name}</span>;

      return (<Tree.TreeNode title={<span data-tree-value={node.value}>{title}</span>} value={node.value} key={node.value} selectable={selectable}>
        {
          deep < 1 * this.props.deep && _.isArray(node.children) ? this.recursiveRender(node.children, 1 + deep) : null
        }
      </Tree.TreeNode>);
    });
  }

  renderTreeNode = () => {
    // [ { "id", "name", value", "children"? } ]
    const tree = _.get(this.props, 'tree');
    if (_.isArray(tree)) {
      return this.recursiveRender(tree, 1);
    }
    else {
      throw new Error('side_tree component only accept an array\n the struct of array is [ { "id", "name", value", "children"? } ]');
    }
  }

  render() {
    return (
      <div className={`side-tree ${this.props.className || ''}`}>
        <div className="side-tree-input">
          <Input.Search
            onSearch={this.onSearch}
            size={this.props.size || 'small'}
            placeholder={this.props.placeholder || '搜索'}
            enterButton
            />
        </div>
        <Tree
          className="side-tree-select"
          onExpand={this.onExpand}
          onCheck={this.onCheck}
          onSelect={this.onSelect}
          autoExpandParent={this.state.autoExpandParent}
          expandedKeys={this.state.expandedKeys}
          checkedKeys={this.state.checkedKeys}
          multiple={this.props.multiple || false}
          checkable={this.props.checkable || false}
          showLine
        >
          {
            this.renderTreeNode()
          }
        </Tree>
      </div>
    );
  }
}
