import _ from 'lodash';
import jQuery from 'jquery';
import { Modal, version, Layout, Icon, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import Header from './header';
import AppMenu from './menu';
import styles from './index.less';
import User from '../../utils/user';
import CONSTANTS from '../../constants';

@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('layout', this);
    this.state = {
      collapsed: false,
      modalVisible: false,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    };

    this.changeInnerWidth = _.debounce(this.changeInnerWidth, 200);
  }

  componentDidMount = () => {
    jQuery(window).on('resize', () => {
      this.changeInnerWidth();
    });
    jQuery(window).on('focus', () => {
      this.handleGlobalClick({});
    });
  }

  componentWillReceiveProps = () => {
  }

  getRightLayout = () => {
    return (
      <Layout.Content className={`rightLayout ${styles.rightLayout}`}>
        { this.props.children }
      </Layout.Content>
    );
  }

  getTrigger = () => {
    return (<Tooltip mouseEnterDelay={3} mouseLeaveDelay={0} overlayClassName="cyan-tooltip" placement="top" title={`${this.state.collapsed ? '展开' : '收起'}菜单`}>
      <div className={styles.collapseTrigger}>
        <Link to="#">
          { this.state.collapsed ? (<Icon type="menu-unfold" />) : (<Icon type="menu-fold" />) }
        </Link>
      </div>
    </Tooltip>);
  }

  changeInnerWidth = () => {
    this.setState({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
    });
  }

  handleModelClose = () => {
    this.setState({
      modalVisible: false,
    });
  }

  handleModelOk = () => {
    this.setState({
      modalVisible: false,
    }, () => {
      setTimeout(() => {
        jQuery(window).trigger(CONSTANTS.EVENT.CAS_JUMP_AUTH);
      }, 1000);
    });
  }

  handleCollapse = (collapsed) => {
    this.setState({
      collapsed,
    });
  }

  handleGlobalClick = (e) => {
    // 检测其他网页已经切换了用户
    if (User.id && this.state.modalVisible) {
      this.setState({
        modalVisible: false,
      });
    }
    else if (!User.id && !this.state.modalVisible) {
      this.setState({
        modalVisible: true,
      });
    }

    const target = _.get(e, 'target');
    // eslint-disable-next-line no-underscore-dangle
    if (window && window._hmt && window._hmt.push && target && target.children && 0 === target.children.length && -1 < ['a', 'button', 'span', 'i'].indexOf(target.tagName.toLowerCase()) && 1000 > target.outerHTML.length) {
      // 全局统计事件绑定。
      let length = 0;
      const clickList = [];
      let current = target;
      while (11 > length && current) {
        let select = current.tagName.toLowerCase();
        length += 1;
        if (current.id) {
          select = `${select}#${current.id}`;
          length += 10;
        }
        else if (current.className) {
          select = `${select}.${current.className.replace(/\s+/ig, '.')}`;
          length += 3;
        }
        current = current.parentNode;
        clickList.unshift(select);
      }

      // eslint-disable-next-line no-underscore-dangle
      window._hmt.push(['_trackEvent', 'global', 'click', clickList.join(' > '), target.outerHTML]);
    }
  }

  render() {
    const { location, history } = this.props;

    const layoutStyle = {};
    if (this.state.collapsed) {
      // 因为侧导航要滚动的问题，所以必须设置最小高度。
      // layoutStyle.minHeight = $('.mainLayoutHeaderLogoContainer').outerHeight() + $('.mainLayoutMenuContainer').outerHeight();
    }

    let globalStyle = '';
    if (__DEV__) {
      globalStyle = `
        #print-table {
          display: block;
        }
      `;
    }

    const key = `${User.id}`;
    // Layout.Sider collapsed & trigger 相关
    // data-bak-collapsedWidth="50"
    // data-bak-breakpoint="md"
    // data-bak-collapsed={this.state.collapsed}
    // data-bak-collapsible
    // data-bak-onCollapse={this.handleCollapse}
    // data-bak-trigger={this.getTrigger()}
    return (
      <Layout key={key} data-key={key} onClick={this.handleGlobalClick} className={styles.layout} data-antd-version={version} style={layoutStyle}>
        <style>{globalStyle}</style>
        <Header {...this.props} {...this.state} className="header" />
        <Layout>
          <Layout.Sider width={160} className={styles.sider}>
            <AppMenu collapsed={this.state.collapsed} location={location} history={history} />
          </Layout.Sider>
          <Layout>
            { this.getRightLayout() }
            <Modal title="错误提示" visible={this.state.modalVisible} onOk={this.handleModelOk} onCancel={this.handleModelClose} cancelText="关闭" okText="跳转至登陆页面">
              <div>
                检测到已经在其他窗口退出登录了。
                <br />
                请重新登录之后再进行操作，如果已经登录或在其他页面登录，关闭此弹窗即可。
                <br />
              </div>
            </Modal>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}
