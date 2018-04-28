import React from 'react';
import _ from 'lodash';
// import { Link } from 'dva/router';
import { Modal, Progress, Spin, Upload, message, Button } from 'antd';
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
      file: {},
      info: {},
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
      beforeUpload: (file) => {
        this.setState({
          visible: true,
          file,
          submitting: true,
        });
        return true;
      },
      onChange: (info) => {
        this.setState({
          info,
        });
        if ('done' === info.file.status) {
          message.success(`${info.file.name} file uploaded successfully`);
        }
        else if ('error' === info.file.status) {
          message.error(`${info.file.name} file upload failed.`);
        }

        if (-1 < ['error', 'done'].indexOf(info.file.status)) {
          this.setState({
            // visible: false,
            submitting: false,
          });
          if ('function' === typeof this.props.onUploaded) {
            this.props.onUploaded(info);
          }
        }
      },
    };

    const percent = parseInt(_.get(this.state.info, 'file.percent') || 0, 10);
    const status = _.get(this.state.info, 'file.status') || 'uploading';
    return (<span key={this.state.random}>
      <Modal
        visible={this.state.visible}
        wrapClassName={styles.normal}
        keyboard="false"
        maskClosable="false"
        footer={null}>
        <Spin spinning={false} data-bak-spinning={this.state.submitting}>
          <div className={styles.uploadTipContent}>
            <div>{this.state.file.name}</div>
            <br />
            <Progress percent={percent} status={'uploading' === status} />
            <br />
            <br />
            {
              'uploading' === status ? (<div>正在批量导入中，请耐心等待</div>) : null
            }
            {
              'error' === status ? (<div>上传失败</div>) : null
            }
            {
              'done' === status ? (<div>上传成功</div>) : null
            }
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
