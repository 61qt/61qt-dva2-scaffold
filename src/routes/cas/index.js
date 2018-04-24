import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import Cookies from 'js-cookie';
import queryString from 'query-string';

import styles from './index.less';
import CONSTANTS from '../../constants';
import { modelReset } from '../../models';
import Router from './router';

class Component extends React.Component {
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
    const query = queryString.parse(window.location.search);
    const url = window.location.href.replace(/\?.+/, '');

    let referrer = document.referrer;
    if (!referrer) {
      try {
        if (window.opener) {
          // IE下如果跨域则抛出权限异常
          // Safari和Chrome下window.opener.location没有任何属性
          referrer = window.opener.location.href;
        }
      }
      catch (e) {
        referrer = '';
      }
    }

    let dt = query.dt;
    if (!query.dt && !referrer) {
      if (window.console && window.console.log) {
        // eslint-disable-next-line no-alert
        window.console.log('没有输入路径，将自动跳转到统一管理平台');
      }

      dt = encodeURIComponent(CONSTANTS.URL_CONFIG.APP);
      window.location.replace(`${url}${window.location.search}${window.location.search ? '&' : ''}dt=${dt}`);
    }
    else if (!query.dt && referrer) {
      dt = encodeURIComponent(document.referrer);
      window.location.replace(`${url}${window.location.search}${window.location.search ? '&' : ''}dt=${dt}`);
    }

    Cookies.set(CONSTANTS.CAS.CALLBACK_URL, dt);
  }

  render() {
    return (
      <div className={styles.normal}>
        <div className={styles.header}>
          <img alt="logo" className={styles.logoImage} src={CONSTANTS.LOGO} />
          <br /><br />
          <h1 className={styles.title}>管理系统</h1>
          <div className={styles.desc}>
            <div>智慧教育统一管理系统</div>
          </div>
        </div>

        <Router {...this.props} />

        <p className={styles.copyright}>
          Copyright © { moment().format('YYYY') } <a href="http://www.example.cn" target="_blank" rel="noopener noreferrer">XX网</a> • <a href="http://www.example.cn" target="_blank" rel="noopener noreferrer">XX网</a>
        </p>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    state,
  };
}

export default connect(mapStateToProps)(Component);
