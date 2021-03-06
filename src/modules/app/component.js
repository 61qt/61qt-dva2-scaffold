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
    this.getUserInfo();
  }

  componentDidMount = () => {
    const random = Math.random() * 10;
    prolongingInterval = window.setInterval(this.setLiving, (4 * 60 + random) * 1000);
    this.props.dispatch({
      type: 'area/init',
    });
  }

  componentWillUnmount = () => {
    window.clearInterval(prolongingInterval);
    document.cookie = 'prolonging=false;path=/';
  }

  onEnter() {
    const query = queryString.parse(window.location.search);
    if (query.ticket) {
      // 带有 ticket 进入程序，应该先进行 ticket 换 token 。
      const url = window.location.href.replace(/&*ticket=[^&]*/, '').replace(/#$/, '').replace(/\?$/, '');
      window.location.replace(url);
      return this.ticketToken(query.ticket);
    }

    // 初始化，从本地存储读取登录信息。
    if (!User.token) {
      return jQuery(window).trigger(CONSTANTS.EVENT.CAS_JUMP_AUTH);
    }

    this.props.dispatch({
      type: 'area/init',
    });

    this.setState({
      pending: false,
      logged: true,
    });
    // return this.getAuthInfo();
  }

  getAuthInfo = () => {
    Services.common.loginToken().then((res) => {
      const random = Math.random() * 10;
      prolongingInterval = window.setInterval(this.setLiving, (4 * 60 + random) * 1000);
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

  getUserInfo = () => {
    Services.user.info().then((res) => {
      User.info = res;
      return Promise.resolve(res);
    }).catch((rej) => {
      return Promise.reject(rej);
    });
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

  ticketToken = (ticket) => {
    return Services.common.ticketToken(ticket).then((res) => {
      const data = res.data || {};
      User.token = data.token;
      if (__DEV__) {
        window.console.log('ticketToken', ticket, User.token);
      }
      message.success('登录成功');
    }).catch((rej) => {
      formErrorMessageShow(rej);
      message.success('无效 ticket');
    });
  }

  loginTokenFail({ rej }) {
    document.cookie = 'isLogout=true;path=/';
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
    // data.user.access = data.access.join(',');

    User.info = data.user;
    sentryUndershoot.setUserContent(data.user);

    // this.props.dispatch({
    //   type: 'all_resource/access',
    //   payload: { access },
    // });
    // this.props.dispatch({
    //   type: 'all_resource/list',
    //   payload: { page: 1, filter: '' },
    // });

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
      // 显示加载中的数据
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

      // 显示登录成功的数据
      if (this.state.logged) {
        return this.getAuthedComp();
      }

      if (!this.state.pending && !this.state.logged) {
        setTimeout(() => {
          return jQuery(window).trigger(CONSTANTS.EVENT.CAS_JUMP_AUTH);
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
