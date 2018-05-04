import React from 'react';
import jQuery from 'jquery';
import queryString from 'query-string';
import { connect } from 'dva';
import _ from 'lodash';
import { message, Spin, Divider, Form, Input, Icon, Button } from 'antd';
import { NavLink } from 'dva/router';

import styles from '../login/index.less';
import Services from '../../services';
import formErrorMessageShow from '../../utils/form_error_message_show';
import buildColumnFormItem from '../../utils/build_column_form_item';
import User from '../../utils/user';
import CONSTANTS from '../../constants';
import Filters from '../../filters';

@Form.create()
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('login', this);
    const query = queryString.parse(window.location.search);
    const redirectUri = query.redirect_uri;
    this.state = {
      submitting: false,
      formValidate: {},
      redirectUri,
    };
    this.columns = [
      {
        title: '登录账号/手机号',
        dataIndex: 'username',
        rules: [{
          required: true, message: '请输入登录账号/手机号码',
        }],
        render: () => {
          return (<Input autoComplete="true" prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入登录账号/手机号码" />);
        },
      },
      {
        title: '密码',
        dataIndex: 'password',
        rules: [{
          required: true, message: '请输入密码',
        }],
        render: () => {
          return (<Input autoComplete="true" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入密码" />);
        },
      },
    ];
  }

  handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (this.state.submitting) {
      message.info('正在提交');
      return;
    }

    this.resetFormValidate();
    this.props.form.validateFields((err, values) => {
      if (err) {
        formErrorMessageShow(err);
      }
      if (!err) {
        this.state.submitting = true;
        this.setState({
          submitting: true,
        });
        this.handleSubmitAjax({ values });
      }
    });
  }

  handleSubmitAjax = ({ values }) => {
    const formData = {
      ...values,
      redirect_uri: this.state.redirectUri,
    };

    Services.common.login(queryString.stringify(formData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    }).then((res) => {
      // document.cookie = 'isLogout=false;path=/';
      const data = _.get(res, 'data') || {};
      User.token = data.token;
      User.info = data.user;

      // window.console.log('res', res);
      // window.res = res;
      if (0 === res.code) {
        message.success('登录成功');
        this.setState({
          submitting: false,
        });
        return jQuery(window).trigger(CONSTANTS.EVENT.CAS_CALLBACK);
      }
      else {
        formErrorMessageShow(res);
      }
    }).catch((rej) => {
      // window.console.log('rej', rej);
      formErrorMessageShow(rej);
      this.errorCallback(rej.data);
    });
  }

  resetFormValidate = () => {
    const formValidate = {};
    this.columns.forEach((elem) => {
      const dataIndex = elem.key || elem.dataIndex;
      formValidate[dataIndex] = {};
    });

    this.setState({
      formValidate,
    });
  }

  // 提交表单错误时候的处理。
  errorCallback = (value) => {
    const formValidate = this.state.formValidate;
    for (const [k] of Object.entries(formValidate)) {
      formValidate[k] = {};
    }

    for (const [k, v] of Object.entries(value)) {
      formValidate[k] = {
        validateStatus: 'error',
        help: _.get(v, '[0]') || v,
      };
    }
    this.setState({
      formValidate,
      submitting: false,
    });
  }

  render() {
    const formItem = buildColumnFormItem({
      ...this.props,
      ...this.state,
      columns: this.columns,
      shouldInitialValue: true,
      defaultValueSet: {
        username: '',
        password: '',
      },
      formItemLayout: {},
      formValidate: this.state.formValidate,
      warpCol: false,
      label: false,
    });

    if (!this.state.redirectUri) {
      return (<div>redirect_uri 参数有误</div>);
    }

    return (
      <div className={styles.normal}>
        <Spin spinning={this.state.submitting}>
          <div className={styles.form}>
            <Form onSubmit={this.handleSubmit} className="cas-form cas-login-form">
              {
                formItem.map((elem) => {
                  return elem.render();
                })
              }
              <Form.Item>
                <Button type="primary" htmlType="submit" className={styles.button}>
                  登录
                </Button>
              </Form.Item>
              <Form.Item className={styles.actionLine}>
                <NavLink to={Filters.path('forget', {})}>忘记密码</NavLink>
                <NavLink className="float-right" to={Filters.path('reg', {})}>注册新用户</NavLink>
              </Form.Item>
              <Form.Item className={`${styles.actionLine} ant-hide`}>
                <Divider>社交账号登录</Divider>
                <div className={styles.unionLogin}>
                  <div className={styles.unionLoginItem}><Icon type="wechat" /></div>
                  <div className={styles.unionLoginItem}><Icon type="qq" /></div>
                  <div className={styles.unionLoginItem}><Icon type="weibo" /></div>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </div>
    );
  }
}
