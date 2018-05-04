import _ from 'lodash';
import React from 'react';
import { Icon } from 'antd';
import { Link } from 'dva/router';

import styles from './detail_row.less';

export default class Component extends React.Component {
  static defaultProps = {
    col: 1,
    currentExpand: 9999999,
  };

  componentWillMount = () => {}

  componentWillUnmount = () => {}

  getValue = (elem, dataSource) => {
    const text = _.get(dataSource, elem.dataIndex);
    return 'function' === typeof elem.render ? elem.render(text, dataSource) : text;
  }

  getRows = (col = this.props.col) => {
    const dataSource = this.props.dataSource;
    const showColumn = _.filter(this.props.columns, (elem) => {
      const removeRule = elem.removeRule;
      const text = _.get(dataSource, elem.dataIndex);
      let rowIsRemov = false;

      if ('boolean' === typeof removeRule) {
        rowIsRemov = removeRule;
      }
      else if ('function' === typeof removeRule) {
        rowIsRemov = removeRule(text, dataSource);
      }

      return !rowIsRemov;
    });

    const tableColumns = [];
    let columnsIndex = 0;
    let rowColSum = 0;
    const eachRowMaxColSave = {};
    // 初始化创建一个一维数组，存储每一列的长度。
    _.each(showColumn, (elem, index) => {
      eachRowMaxColSave[index] = col * 2;
    });

    // 计算每一列。保存应该存储的 elem 。到时候渲染直接通过 elem 来渲染。
    // let rowColSpanTotal = 0;
    _.each(showColumn, (elem) => {
      tableColumns[columnsIndex] = tableColumns[columnsIndex] || [];
      const colSpan = elem.colSpan || 1;
      let rowSpan = elem.rowSpan || 1;
      let titleSpan = 1;
      if (null === elem.title) {
        titleSpan = 0;
      }

      // if (rowColSpanTotal + 1 + colSpan > eachRowMaxColSave[columnsIndex]) {
      //   colSpan = eachRowMaxColSave[columnsIndex] - rowColSpanTotal - 1;
      // }
      if (colSpan + titleSpan >= col * 2) {
        rowSpan = 1;
      }
      if (rowColSum + titleSpan + colSpan > eachRowMaxColSave[columnsIndex]) {
        columnsIndex += titleSpan;
        rowColSum = titleSpan + colSpan;
        // rowColSpanTotal = 0;
      }
      else {
        rowColSum += titleSpan + colSpan;
      }
      // rowColSpanTotal += colSpan + titleSpan;
      tableColumns[columnsIndex] = tableColumns[columnsIndex] || [];
      tableColumns[columnsIndex].push({
        ...elem,
        colSpan,
        rowSpan,
      });
      if (1 < rowSpan) {
        do {
          const rowIndex = columnsIndex + rowSpan - 1;
          eachRowMaxColSave[rowIndex] -= 2 * colSpan;
          rowSpan -= 1;
        }
        while (1 < rowSpan);
      }
    });
    if (this.props.console) {
      window.console.clear();
      window.console.log('tableColumns', tableColumns, 'eachRowMaxColSave', eachRowMaxColSave);
    }

    // 展开了的列
    const expandColumn = _.filter(tableColumns, (elem, index) => {
      return index < this.props.currentExpand;
    });

    const renderTitle = this.props.renderTitle || function renderTitle(elem) {
      return elem.title;
    };

    // 渲染已经展开的列。
    return expandColumn.map((rowElem, rowIndex) => {
      const tdArr = [];
      let colSpanLength = 0;
      _.each(rowElem, (colElem) => {
        colSpanLength += (colElem.colSpan + 1);
        if (null !== colElem.title) {
          tdArr.push(<td className={`${this.props.titleClassName || ''}`} rowSpan={colElem.rowSpan} key={`${rowIndex}_${colSpanLength}_1`} style={this.buildLabelStyle()}>{renderTitle(colElem)}</td>);
        }
        tdArr.push(<td rowSpan={colElem.rowSpan} key={`${rowIndex}_${colSpanLength}_2`} colSpan={colElem.colSpan}>{this.getValue(colElem, dataSource)}</td>);
      });

      while (eachRowMaxColSave[rowIndex] > colSpanLength) {
        // colSpanLength += 1;
        // tdArr.push(<td key={`${rowIndex}_${colSpanLength}`} />);
        colSpanLength += 2;
        tdArr.push(<td className="detail-view-empty" colSpan="2" key={`${rowIndex}_${colSpanLength}`} />);
      }
      return (<tr key={rowIndex}>
        { tdArr }
      </tr>);
    });
  }

  getShowMoreRow = () => {
    const { columns, expand, currentExpand, col } = this.props;
    if (!expand || expand >= columns.length) {
      return null;
    }

    const expandFlag = currentExpand >= columns.length;

    return (
      <tr key="expand" >
        <td style={this.buildLabelStyle()}>更多信息</td>
        <td onClick={this.props.toggleShowMore}>
          <Link to="#">
            { expandFlag ? '收起' : '展开' } <Icon type={expandFlag ? 'up' : 'down'} />
          </Link>
        </td>
        {
          1 < col ? (<td className="detail-view-empty" colSpan={2 * (col - 1)} />) : null
        }
      </tr>
    );
  }

  buildLabelStyle = () => {
    if (this.labelStyles) {
      return this.labelStyles;
    }
    let labelWidth = this.props.labelWidth;
    if (undefined === labelWidth) {
      this.labelStyles = {};
    }
    const labelStyles = {};
    if (`${labelWidth * 1}` === labelWidth) {
      labelWidth = `${labelWidth}px`;
    }

    labelStyles.width = labelWidth;

    this.labelStyles = labelStyles;
    return labelStyles;
  }

  render() {
    const { title, col } = this.props;
    return (
      <div className={styles.normal}>
        <div className={`detail-view ${this.props.className || ''}`}>
          <table>
            {
              title ? (<thead>
                <tr>
                  <th colSpan={2 * col}>
                    { title }
                  </th>
                </tr>
              </thead>) : null
            }
            <tbody>
              { this.getRows() }
              { this.getShowMoreRow() }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
