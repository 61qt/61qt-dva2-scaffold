import React from 'react';
import jQuery from 'jquery';
import { connect } from 'dva';
// import _ from 'lodash';
import { NavLink } from 'dva/router';
import { notification, Menu, Dropdown, Icon, Badge } from 'antd';
import styles from './header_account.less';
import CONSTANTS from '../../constants';
import Filters from '../../filters';
import User from '../../utils/user';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    debugAdd('header_account', this);
  }

  componentDidMount = () => {
    this.getUnreadMessage();
  }

  componentWillReceiveProps = () => {
  }

  componentWillUnmount = () => {}

  getUnreadMessage = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sys_message/unreadCount',
      payload: {},
    });
  }

  handleVisibleChange = (flag) => {
    this.setState({ visible: flag });
  }

  handleMenuClick = (e) => {
    if ('logout' === e.key) {
      jQuery(window).trigger(CONSTANTS.EVENT.CAS_JUMP_AUTH);

      User.clean();
      notification.success({
        message: '系统提示',
        description: '你已经成功退出登录',
        duration: CONSTANTS.NOTIFICATION_DURATION,
      });
      return true;
    }
    this.setState({ visible: false });
  }

  render() {
    const { unreadCount } = this.props;
    if (!User.info) {
      return (<div>请先登录</div>);
    }

    const menu = (
      <Menu selectedKeys={[]} defaultSelectedKeys={[]} onClick={this.handleMenuClick} className={styles.accountDownMenu}>
        <Menu.Item key="account_1">
          <div>
            <NavLink to="/app/sys_message">
              <Icon type="message" />
              <span>我的消息</span>
              <Badge count={unreadCount} />
            </NavLink>
          </div>
        </Menu.Item>
        <Menu.Item key="account_2">
          <div>
            <NavLink to="/app/password/edit">
              <Icon type="edit" />
              <span>修改密码</span>
            </NavLink>
          </div>
        </Menu.Item>
        <Menu.Item key="detect">
          <div>
            <NavLink to="/app/detect">
              <Icon type="dashboard" />
              <span>系统检测</span>
            </NavLink>
          </div>
        </Menu.Item>
        <Menu.Item key="logout">
          <div>
            <a>
              <Icon type="logout" />
              <span>退出登录</span>
            </a>
          </div>
        </Menu.Item>
      </Menu>
    );

    /*
    */
    return (
      <div className={styles.normal}>
        <Dropdown
          overlay={menu}
          trigger={['click']}
          onVisibleChange={this.handleVisibleChange}
          visible={this.state.visible}
        >
          <div className="text-white">
            <img className={`img-1-1-40 ${styles.accountImg}`} src={Filters.qiniuImage(User.info.avatar, { width: 80, height: 80 })} alt={User.info.name} />
            <span className={styles.accountName}>
              <span className={768 > window.innerWidth ? 'ant-hide' : ''}>{User.info.name}</span>
              <span className={`header-account-role ${User.info.role_name ? '' : 'ant-hide'}`}>
                &nbsp;&nbsp;
                ({ User.info.role_name })
              </span>
            </span>
            { this.state.visible ? null : <Badge count={unreadCount} /> }
            <span className={styles.headerDownIcon}><Icon type="down" /></span>
          </div>
        </Dropdown>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    unreadCount: state.sys_message.unreadCount,
  };
}

export default connect(mapStateToProps)(Component);
