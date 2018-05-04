import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
// import queryString from 'query-string';
import { Layout } from 'antd';

import styles from './index.less';
import CONSTANTS from '../../constants';
import { modelReset } from '../../models';
import Router from './router';

@connect((state) => {
  debugAdd('state', state);
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('cas', this);
  }

  componentWillMount() {
    this.onEnter();
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    if (__DEV__) {
      // 开发模式，退到登录页面，不会清空 model 的信息。
    }
    else {
      modelReset(dispatch);
    }
  }

  onEnter = () => {
    // 必须带有 redirect_uri 参数
    // const query = queryString.parse(window.location.search);
    // const url = window.location.href.replace(/\?.*/, '').replace(/#.*/, '');

    // let referrer = document.referrer;
    // if (!referrer) {
    //   try {
    //     if (window.opener) {
    //       // IE下如果跨域则抛出权限异常
    //       // Safari和Chrome下window.opener.location没有任何属性
    //       referrer = window.opener.location.href;
    //     }
    //   }
    //   catch (e) {
    //     referrer = '';
    //   }
    // }
    // // 如果是相同域名的，就直接忽略
    // if (new RegExp(`^https?://${location.hostname}${location.port ? ':' : ''}${location.port}`).test(referrer)) {
    //   referrer = '';
    // }

    // // eslint-disable-next-line camelcase
    // let redirect_uri = query.redirect_uri;
    // // eslint-disable-next-line camelcase
    // if (!query.redirect_uri && !referrer) {
    //   if (window.console && window.console.log) {
    //     // eslint-disable-next-line no-alert
    //     window.console.log('没有输入路径，将自动跳转到统一管理平台');
    //   }

    //   // eslint-disable-next-line camelcase
    //   redirect_uri = encodeURIComponent(CONSTANTS.SYSTEM_CONFIG.CONFIG.APP.DOMAIN);
    //   // eslint-disable-next-line camelcase
    //   window.location.replace(`${url}${window.location.search}${window.location.search ? '&' : '?'}redirect_uri=${redirect_uri}`);
    // }
    // else if (!query.redirect_uri && referrer) {
    //   // eslint-disable-next-line camelcase
    //   redirect_uri = encodeURIComponent(document.referrer);
    //   // eslint-disable-next-line camelcase
    //   window.location.replace(`${url}${window.location.search}${window.location.search ? '&' : '?'}redirect_uri=${redirect_uri}`);
    // }
  }

  render() {
    return (<Layout className={styles.normal}>
      <Layout.Content>
        <div className={styles.header}>
          <br /><br />
          <h1 className={styles.title}>智慧教育云平台</h1>
          <div>
            <img src={CONSTANTS.LOGIN_HEADER} alt="login_header_img" />
          </div>
        </div>
        <Router {...this.props} />
      </Layout.Content>
      <Layout.Footer>
        <div className={styles.copyright}>
          Copyright © { moment().format('YYYY') } <a href="http://www.61qt.cn" target="_blank" rel="noopener noreferrer">XX网</a> • <a href="http://www.61qt.cn" target="_blank" rel="noopener noreferrer">XX网</a>
        </div>
      </Layout.Footer>
    </Layout>);
  }
}
