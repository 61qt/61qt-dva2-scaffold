import React from 'react';
import moment from 'moment';
import _ from 'lodash';
// import { Link } from 'dva/router';
import store from 'store';
import { Button, Dropdown, Menu, Modal, Checkbox } from 'antd';
import CONSTANTS from '../../constants';
import download from '../../utils/download';
import User from '../../utils/user';

import styles from './index.less';

const DOWNLOAD_CONFIRM_STORE_KEY = 'DOWNLOAD_CONFIRM_STORE_KEY';

function random() {
  return `${Math.random()}`.replace(/0./, '');
}
export default class Component extends React.Component {
  static defaultProps = {
    confirm: false,
  };

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

  onRowSelectChange = (checkedValues) => {
    const excludeRow = _.xor(this.state.defaultValue, checkedValues);
    this.setState({
      excludeRow,
    });
  }

  onConfirmCheckboxChange = (e) => {
    const value = _.get(e, 'target.checked');
    if (value) {
      const today = moment().format('YYYY-MM-DD');
      store.set(DOWNLOAD_CONFIRM_STORE_KEY, today);
    }
    else {
      store.remove(DOWNLOAD_CONFIRM_STORE_KEY);
    }
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
      this.download();
    }
  }

  handleOk = () => {
    this.setState({
      visible: false,
    });
    this.download();
  }

  handleCancel = () => {
    this.setState({
      visible: false,
      excludeRow: [],
    });
  }

  downloadBirdge = () => {
    const today = moment().format('YYYY-MM-DD');
    if (today === store.get(DOWNLOAD_CONFIRM_STORE_KEY)) {
      return this.download();
    }
    if (-1 < ['true', true].indexOf(this.props.confirm)) {
      Modal.confirm({
        title: '下载提示',
        content: (<div>
          <span>导出的表格仅导出本次搜索的结果</span>
          <br />
          <br />
          <Checkbox onChange={this.onConfirmCheckboxChange}>今天内不在显示该提示</Checkbox>
        </div>),
        okText: '确认',
        okType: 'primary',
        cancelText: '取消',
        onOk: () => {
          this.download();
        },
        onCancel: () => {
          if (__DEV__) {
            window.console.log('取消了下载');
          }
        },
      });
    }
    else {
      this.download();
    }
  }

  download = () => {
    const { path, query, method = 'POST' } = this.props;

    const buildModule = `${DEFINE_MODULE || 'app'}`.toUpperCase();
    const apiBaseUrl = _.get(CONSTANTS, `SYSTEM_CONFIG.CONFIG.${buildModule}.API_BASE_URL`);

    download(path, {
      ...query,
      token: User.token,
      excludeRow: this.state.excludeRow.join(','),
    }, {
      base: apiBaseUrl,
      method: -1 < location.search.indexOf('method=get') ? 'GET' : method,
    });

    this.setState({
      excludeRow: [],
    });

    return true;
  }

  render() {
    const { children, selectRow = [], confirm, path, query, link, ...rst } = this.props;

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
          <Checkbox.Group key={this.state.random} defaultValue={this.state.defaultValue} style={{ width: '100%' }} onChange={this.onRowSelectChange}>
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
      return (<a {...rst} onClick={this.downloadBirdge}>
        { children }
      </a>);
    }
    else {
      return (<Button {...rst} onClick={this.downloadBirdge}>
        { children }
      </Button>);
    }
  }
}
