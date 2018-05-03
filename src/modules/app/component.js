import { Route } from 'dva/router';
import _ from 'lodash';
import { connect } from 'dva';
import jQuery from 'jquery';
import { message } from 'antd';
import queryString from 'query-string';
import formErrorMessageShow from '../../utils/form_error_message_show';

import Services from '../../services';
import CONSTANTS from '../../constants';
import User from '../../utils/user';
import Layout from '../../components_atom/layout';
import { undershoot as sentryUndershoot } from '../../utils/dva-sentry';
import styles from './index.less';
import Router from './router';

let prolongingInterval = '';

@connect((state) => {
  debugAdd('state', state);
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('app', this);
    prolongingInterval = '';
    this.state = {
      userId: User.id,
      pending: true,
      logged: false,
    };
    window.addEventListener('unload', () => {
      document.cookie = 'prolonging=false;path=/';
    });

    jQuery(window).on('focus', () => {
      this.handleGlobalClick({});
    });
  }

  componentWillMount() {
    this.onEnter();
  }

  componentDidMount = () => {
    const random = Math.random() * 10;
    prolongingInterval = window.setInterval(this.setLiving, (4 * 60 + random) * 1000);
    // this.props.dispatch({
    //   type: 'area/init',
    // });
  }

  componentWillUnmount = () => {
    window.clearInterval(prolongingInterval);
    document.cookie = 'prolonging=false;path=/';
  }

  onEnter() {
    const query = queryString.parse(window.location.search);
    if (query.ticket && User.validToken(query.ticket)) {
      User.token = query.ticket;
      const url = window.location.href.replace(/&*ticket=[^&]*/, '').replace(/#$/, '').replace(/\?$/, '');
      window.location.replace(url);
      return;
    }

    // 初始化，从本地存储读取登录信息。
    if (!User.token) {
      this.loginTokenFail({});
      return false;
    }

    // this.props.dispatch({
    //   type: 'area/init',
    // });

    Services.common.loginToken().then((res) => {
      return this.loginTokenSuccess({ res });
    }).catch((rej) => {
      this.loginTokenFail({ rej });
      return Promise.reject(rej);
    });
  }

  getAuthedComp() {
    const props = this.props;
    const {
      breadcrumb,
    } = this.props;
    return (<Layout
      onClick={this.handleGlobalClick}
      user={props.user}
      location={props.location}
      history={props.history}
      breadcrumb={breadcrumb}>
      <Router {...this.props} />
    </Layout>);
  }

  setLiving = (options = {}) => {
    const prolonging = (document.cookie || '').match(/\bprolonging=true\b/);
    if (!prolonging || options.force) {
      if (window.console && window.console.log) {
        window.console.log('prolonging document.cookie', document.cookie, 'token is', User.token);
      }
      document.cookie = 'prolonging=true;path=/';

      Services.common.loginToken().then((res) => {
        this.loginTokenSuccess({ res });
        // setting cookies
        setTimeout(() => {
          document.cookie = 'prolonging=false;path=/';
        }, 30 * 1000);
      }).catch(() => {
        // setting cookies
        setTimeout(() => {
          document.cookie = 'prolonging=false;path=/';
        }, 30 * 1000);
      });
    }
  }

  loginTokenFail({ rej }) {
    // document.cookie = 'isLogout=true;path=/';
    if (rej && undefined !== rej.status) {
      if (rej && 401 === rej.status) {
        message.error('授权已经过期，需要重新登录');
      }
      else {
        const tips = '系统出现错误，请联系管理员，错误信息查看控制台';
        window.console.error('系统出现错误，请联系管理员，错误信息查看控制台', tips, rej);
        formErrorMessageShow(rej);
      }
    }
    this.setState({
      pending: false,
      logged: false,
    });
  }

  loginTokenSuccess({ res }) {
    const data = _.get(res, 'data') || {};
    const { user, access } = data;

    user.access = access.join(',');

    User.info = user;
    sentryUndershoot.setUserContent(user);

    this.props.dispatch({
      type: 'all_resource/access',
      payload: { access },
    });
    this.props.dispatch({
      type: 'all_resource/list',
      payload: { page: 1, filter: '' },
    });
    this.setState({
      pending: false,
      logged: true,
    });
    return res;
  }

  handleGlobalClick() {
    // 检测其他网页已经切换了用户
    const userId = User.id;
    if (userId && this.state.userId !== userId) {
      this.setState({
        userId,
      }, () => {
        this.setLiving({
          force: true,
        });
      });
    }
  }

  render() {
    const render = () => {
      // const render = (...args) => {
      // window.console.log('app index render args', args);
      if (this.state.pending) {
        let loadingHtml = '加载中';
        // eslint-disable-next-line no-underscore-dangle
        if ('string' === typeof window.____loadingHtml) {
          // eslint-disable-next-line no-underscore-dangle
          loadingHtml = window.____loadingHtml;
        }
        const loadingHtmlProps = {
          dangerouslySetInnerHTML: { __html: loadingHtml },
        };
        return (<div className={styles.normal}>
          <div {...loadingHtmlProps} />
        </div>);
      }

      if (this.state.logged) {
        return this.getAuthedComp();
      }

      else {
        setTimeout(() => {
          jQuery(window).trigger(CONSTANTS.EVENT.CAS_JUMP_AUTH);
        }, 1000);
        return (<div>
          <div>授权中。。。</div>
        </div>);
      }
    };

    return (
      <Route {...this.props} render={render} />
    );
  }
}
