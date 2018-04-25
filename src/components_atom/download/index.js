import React from 'react';
import _ from 'lodash';
import { Link } from 'dva/router';
import { Button, Dropdown, Menu, Modal, Checkbox } from 'antd';
import CONSTANTS from '../../constants';
import download from '../../utils/download';
import User from '../../utils/user';

import styles from './index.less';

function random() {
  return `${Math.random()}`.replace(/0./, '');
}
class Component extends React.Component {
  constructor(props) {
    super(props);
    const defaultValue = _.map(props.selectRow, (row) => {
      return row.dataIndex || row.key;
    });
    this.state = {
      visible: false,
      excludeRow: [],
      random: random(),
      defaultValue,
    };
    debugAdd('download', this);
  }

  componentWillReceiveProps = (nextProps) => {
    if (!_.isEqual(nextProps.selectRow, this.props.selectRow)) {
      const defaultValue = _.map(nextProps.selectRow, (row) => {
        return row.dataIndex || row.key;
      });
      this.setState({
        excludeRow: [],
        defaultValue,
      });
    }
  }

  onChange = (checkedValues) => {
    const excludeRow = _.xor(this.state.defaultValue, checkedValues);
    this.setState({
      excludeRow,
    });
  }

  handleMenuClick = (e) => {
    if ('custom' === e.key) {
      this.setState({
        visible: true,
        excludeRow: [],
        random: random(),
      });
    }
    else {
      this.downloadBirdge();
    }
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.downloadBirdge();
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      excludeRow: [],
    });
  }

  downloadBirdge = () => {
    const { path, query, method = 'POST' } = this.props;

    const buildModule = `${DEFINE_MODULE || 'app'}`.toUpperCase();
    const apiBaseUrl = _.get(CONSTANTS, `SYSTEM_CONFIG.CONFIG.${buildModule}.API_BASE_URL`);

    download(path, {
      ...query,
      token: User.token,
      excludeRow: this.state.excludeRow.join(','),
    }, {
      base: apiBaseUrl,
      method,
    });

    this.setState({
      excludeRow: [],
    });

    return true;
  }

  render() {
    const { children, selectRow = [], path, query, link, ...rst } = this.props;

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="default">默认表头导出</Menu.Item>
        <Menu.Item key="custom">自定义表头导出</Menu.Item>
      </Menu>
    );

    if (selectRow && selectRow.length) {
      return (<span>
        <Modal
          key={this.state.random}
          className={styles.normal}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          title="自定义下载文件表头">
          <Checkbox.Group key={this.state.random} defaultValue={this.state.defaultValue} style={{ width: '100%' }} onChange={this.onChange}>
            {
              selectRow.map((row) => {
                const value = row.dataIndex || row.key;
                return (<Checkbox defaultChecked key={value} value={value}>{row.title}</Checkbox>);
              })
            }
          </Checkbox.Group>
          <div>
            { this.state.excludeRow.join(',') }
          </div>
        </Modal>
        <Dropdown.Button {...rst} onClick={this.downloadBirdge} trigger="click" overlay={menu}>
          { children }
        </Dropdown.Button>
      </span>);
    }
    else if (link) {
      return (<Link {...rst} onClick={this.downloadBirdge}>
        { children }
      </Link>);
    }
    else {
      return (<Button {...rst} onClick={this.downloadBirdge}>
        { children }
      </Button>);
    }
  }
}

export default Component;
