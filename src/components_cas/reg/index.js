import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
// import jQuery from 'jquery';
import { message, Spin, Select, Form, Input, Button } from 'antd';
// InputNumber Icon
import { NavLink } from 'dva/router';

import styles from '../login/index.less';
// import CONSTANTS from '../../constants';
import { DICT } from '../../constants';
import Services from '../../services';
import formErrorMessageShow from '../../utils/form_error_message_show';
import Filters from '../../filters';
import User from '../../utils/user';
import buildColumnFormItem from '../../utils/build_column_form_item';

@Form.create()
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('reg', this);
    this.state = {
      submitting: false,
      formValidate: {},
    };

    this.columns = [
      {
        title: '身份',
        dataIndex: 'role',
        rules: [{
          required: true, message: '请选择注册身份',
        }],
        extra: '目前只支持注册家长身份的用户',
        render: () => {
          return (<Select placeholder="请选择注册身份">
            {
              _.filter(Filters.dict(['user', 'user_type']), {
                value: DICT.USER.USER_TYPE.PARENT,
              }).map((elem) => {
                return (<Select.Option key={elem.value} value={elem.value}>{elem.label}</Select.Option>);
              })
            }
          </Select>);
        },
      },
      {
        title: '姓名',
        dataIndex: 'name',
        rules: [{
          required: true, message: '请输入你的姓名(必填)',
        }],
        // render: () => {
        //   return (<Input autoComplete="true" prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="请输入你的姓名(必填)" />);
        // },
      },
      {
        title: '身份证号',
        dataIndex: 'id_card',
        rules: [{
          required: true, message: '请输入你的身份证号码(必填)',
        }],
        // render: () => {
        //   return (<Input autoComplete="true" prefix={<Icon type="credit-card" style={{ fontSize: 13 }} />} placeholder="请输入你的身份证号码(必填)" />);
        // },
      },
      {
        title: '邮箱',
        dataIndex: 'mail',
        rules: [{
          required: false, message: '请输入你的邮箱(选填)',
        }],
        // render: () => {
        //   return (<Input htmlType="email" autoComplete="true" prefix={<Icon type="mail" style={{ fontSize: 13 }} />} placeholder="请输入你的邮箱(选填)" />);
        // },
      },
      {
        title: '密码',
        dataIndex: 'password',
        rules: [{
          required: true, message: '请输入你的密码',
        }],
        // render: () => {
        //   return (<Input autoComplete="true" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请输入新密码密码" />);
        // },
      },
      {
        title: '确认密码',
        dataIndex: 'confirm_password',
        rules: [{
          required: true, message: '请再一次输入你的密码',
        }],
        // render: () => {
        //   return (<Input autoComplete="true" prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="请重复输入新密码密码" />);
        // },
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        rules: [{
          required: true, message: '请输入手机号码',
        }],
        inputNumberOptions: {
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        // render: () => {
        //   const inputNumberOptions = {
        //     min: 13000000000,
        //     max: 19999999999,
        //   };
        //   return (<InputNumber {...inputNumberOptions} autoComplete="true" prefix={<Icon type="mobile" style={{ fontSize: 13 }} />} placeholder="请输入手机号码" />);
        // },
      },
      {
        title: '短信验证码',
        dataIndex: 'verify_code',
        rules: [{
          required: true, message: '请输入短信验证码',
        }],
        render: () => {
          // prefix={<Icon type="message" style={{ fontSize: 13 }} />}
          return (<Input autoComplete="true" placeholder="请输入短信验证码" addonAfter={this.getVerifyCodeTipComp()} />);
        },
      },
    ];
  }

  getVerifyCodeTipComp = () => {
    return (<div className={styles.smsExtra} onClick={this.sms}>
      <a>获取验证码</a>
    </div>);
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
      return window.location.replace(Filters.path('login', {}));
      // return jQuery(window).trigger(CONSTANTS.EVENT.CAS_CALLBACK});
    }).catch((rej) => {
      formErrorMessageShow(rej);
      this.errorCallback(rej.data);
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
      defaultValueSet: {
        role: DICT.USER.USER_TYPE.PARENT,
      },
      formItemLayout: {},
      formValidate: this.state.formValidate,
      warpCol: false,
      label: false,
    });

    return (
      <div className={styles.normal}>
        <Spin spinning={this.state.submitting}>
          <div className={styles.form}>
            <Form onSubmit={this.handleSubmit} className="cas-form cas-reg-form">
              {
                formItem.map((elem) => {
                  return elem.render();
                })
              }
              <Form.Item>
                <Button type="primary" htmlType="submit" className={styles.button}>
                  马上注册
                </Button>
              </Form.Item>
              <Form.Item className={`${styles.actionLine}`}>
                <NavLink to={Filters.path('forget', {})}>忘记密码</NavLink>
                <NavLink className="float-right" to={Filters.path('login', {})}>直接登录</NavLink>
              </Form.Item>
            </Form>
          </div>
        </Spin>
      </div>
    );
  }
}
