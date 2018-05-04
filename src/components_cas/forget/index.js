import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
// import jQuery from 'jquery';
import { message, Spin, Form, Input, Icon, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from '../login/index.less';
import Services from '../../services';
import Filters from '../../filters';
import formErrorMessageShow from '../../utils/form_error_message_show';
import buildColumnFormItem from '../../utils/build_column_form_item';
import User from '../../utils/user';
// import CONSTANTS from '../../constants';

@Form.create()
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('forget', this);
    this.state = {
      submitting: false,
      formValidate: {},
    };

    this.columns = [
      {
        title: '手机号',
        // dataIndex: 'username',
        dataIndex: 'phone',
        rules: [{
          required: true, message: '请输入手机号码',
        }],
        render: () => {
          return (<Input autoComplete="true" prefix={<Icon type="mobile" style={{ fontSize: 13 }} />} placeholder="请输入手机号码" />);
        },
      },
      {
        title: '短信验证码',
        dataIndex: 'verify_code',
        rules: [{
          required: true, message: '请输入短信验证码',
        }],
        render: () => {
          return (<Input autoComplete="true" prefix={<Icon type="mail" style={{ fontSize: 13 }} />} placeholder="请输入短信验证码" addonAfter={this.getVerifyCodeTipComp()} />);
        },
      },
      {
        title: '新密码',
        dataIndex: 'password',
        rules: [{
          required: true, message: '请输入新密码',
        }],
        render: () => {
          return (<Input autoComplete="true" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入新密码密码" />);
        },
      },
      {
        title: '确认密码',
        dataIndex: 'confirm_password',
        rules: [{
          required: true, message: '请重复输入新密码密码',
        }],
        render: () => {
          return (<Input autoComplete="true" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请重复输入新密码密码" />);
        },
      },
    ];
  }

  getVerifyCodeTipComp = () => {
    return (<div className={styles.smsExtra} onClick={this.sms}>
      <a>获取短信验证码</a>
    </div>);
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
    };
    Services.common.login(formData).then(({ data = {} }) => {
      // document.cookie = 'isLogout=false;path=/';
      User.token = data.token;
      User.info = data.info;

      message.success('登录成功');
      this.setState({
        submitting: false,
      });
      return window.location.replcae(Filters.path('login', {}));
      // return jQuery(window).trigger(CONSTANTS.EVENT.CAS_CALLBACK);
    }).catch((rej) => {
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

  sms = () => {
    const phone = this.props.form.getFieldValue('phone') * 1 || '';
    window.console.log('去获取验证码', phone);
  }

  render() {
    const formItem = buildColumnFormItem({
      ...this.props,
      ...this.state,
      columns: this.columns,
      shouldInitialValue: true,
      defaultValueSet: {},
      formItemLayout: {},
      formValidate: this.state.formValidate,
      warpCol: false,
      label: false,
    });

    return (
      <div className={styles.normal}>
        <Spin spinning={this.state.submitting}>
          <div className={styles.form}>
            <Form onSubmit={this.handleSubmit}>
              {
                formItem.map((elem) => {
                  return elem.render();
                })
              }
              <Form.Item>
                <Button type="primary" htmlType="submit" className={styles.button}>
                  重置密码
                </Button>
              </Form.Item>
              <Form.Item className={`${styles.actionLine}`}>
                <NavLink to={Filters.path('login', {})}>直接登录</NavLink>
                <NavLink className="float-right" to={Filters.path('reg', {})}>注册新用户</NavLink>
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </div>
    );
  }
}
