import React from 'react';
import _ from 'lodash';
// import { Link } from 'dva/router';
import { Modal, Spin, Upload, message, Button } from 'antd';
import CONSTANTS from '../../constants';
import upload from '../../utils/download';
import User from '../../utils/user';
import styles from './index.less';

function random() {
  return `${Math.random()}`.replace(/0./, '');
}

export default class Component extends React.Component {
  static defaultProps = {
    path: '',
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      submitting: false,
      random: random(),
    };

    debugAdd('upload', this);
  }

  componentWillReceiveProps = () => {}

  upload = () => {
    const { path, query, method = 'POST' } = this.props;

    const buildModule = `${DEFINE_MODULE || 'app'}`.toUpperCase();
    const apiBaseUrl = _.get(CONSTANTS, `SYSTEM_CONFIG.CONFIG.${buildModule}.API_BASE_URL`);

    upload(path, {
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

  uploadCancel = () => {
    this.setState({
      random: random(),
      visible: false,
    });
  }

  renderContent = () => {
    const { children, onUploaded, path, query, link, ...rst } = this.props;

    if (link) {
      return (<a {...rst} onClick={this.uploadBirdge}>
        { children }
      </a>);
    }
    else {
      return (<Button {...rst} onClick={this.uploadBirdge}>
        { children }
      </Button>);
    }
  }

  render() {
    const buildModule = `${DEFINE_MODULE || 'app'}`.toUpperCase();
    const apiBaseUrl = _.get(CONSTANTS, `SYSTEM_CONFIG.CONFIG.${buildModule}.API_BASE_URL`);

    const action = `${apiBaseUrl.replace(/\/$/, '')}/${this.props.path.replace(/^\//, '')}`;

    const props = {
      showUploadList: false,
      withCredentials: true,
      name: 'upload_file',
      action,
      headers: {
        Authorization: `Bearer ${User.token}`,
      },
      beforeUpload: () => {
        this.setState({
          visible: true,
          submitting: true,
        });
        return true;
      },
      onChange: (info) => {
        if (100 <= info.file.percent) {
          this.setState({
            visible: false,
            submitting: false,
          });

          if ('done' === info.file.status) {
            message.success(`${info.file.name} file uploaded successfully`);
          }
          else if ('error' === info.file.status) {
            message.error(`${info.file.name} file upload failed.`);
          }

          if ('error' === info.file.status && 'function' === typeof this.props.onUploaded) {
            this.props.onUploaded(info);
          }
        }
      },
    };

    return (<span key={this.state.random}>
      <Modal
        visible={this.state.visible}
        wrapClassName={styles.normal}
        keyboard="false"
        maskClosable="false"
        footer={null}>
        <Spin spinning={this.state.submitting}>
          <div className={styles.uploadTipContent}>
            <span>正在批量导入中，请耐心等待</span>
          </div>
        </Spin>
        <div className={styles.uploadCancelAction}>
          <Button onClick={this.uploadCancel}>
            取消上传
          </Button>
        </div>
      </Modal>
      <Upload key={this.state.key} {...props}>
        { this.renderContent() }
      </Upload>
    </span>);
  }
}
