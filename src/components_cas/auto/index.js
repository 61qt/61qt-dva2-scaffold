import React from 'react';
import jQuery from 'jquery';
import _ from 'lodash';
import { connect } from 'dva';
import { Form, Spin, message } from 'antd';
import styles from '../login/index.less';
import Services from '../../services';
import CONSTANTS from '../../constants';
import User from '../../utils/user';
import Filters from '../../filters';

@Form.create()
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('auto', this);
    this.state = {
      submitting: false,
    };
  }

  componentDidMount = () => {
    this.handleSubmit();
  }

  handleSubmit = () => {
    const { location } = this.props;

    const ticket = _.get(location, 'query.ticket');
    if (!ticket) {
      message.success('没有 ticket ，不能自动登录');
      setTimeout(() => {
        window.location.replace(Filters.path('login', {}));
      }, 10);
      return false;
    }

    Services.common.ticketLogin(ticket).then((res) => {
      const data = res.data || {};
      User.token = data.token;
      message.success('自动登录成功');
      return jQuery(window).trigger(CONSTANTS.EVENT.CAS_CALLBACK, {
        ticket: data.token,
      });
    }).catch(() => {
      message.error('自动登录失败，请使用密码登录');
      setTimeout(() => {
        window.location.replace(Filters.path('login', {}));
      }, 2000);
    });
  }

  render() {
    return (
      <div className={styles.normal}>
        <Spin spinning={this.state.submitting}>
          <div className={styles.form}>
            正在登录
          </div>
        </Spin>
      </div>
    );
  }
}
