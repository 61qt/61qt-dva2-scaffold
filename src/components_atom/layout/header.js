import React from 'react';
import { connect } from 'dva';
import { Layout, Menu } from 'antd';
import HeaderAccount from './header_account';
import styles from './header.less';
import CONSTANTS from '../../constants';

@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    debugAdd('header', this);
  }

  render() {
    return (
      <Layout.Header className={`globalHeader ${styles.normal}`}>
        <div className={`mainLayoutHeaderLogoContainer ${styles.headerLogoContainer} clearfix`}>
          <div className={styles.headerCenter}>
            <img className={styles.headerLogoImg} src={CONSTANTS.LOGO.LOGO} alt="智慧教育云平台 logo" />
            <img className={styles.headerLogoImgText} src={CONSTANTS.LOGO.TEXT} alt="智慧教育云平台" />
            {
              /*
                <span className={styles.headerName}>管理系统</span>
              */
            }
          </div>
        </div>
        <div className={styles.headerRight}>
          <Menu mode="horizontal" className={styles.menu} selectedKeys={[]} defaultSelectedKeys={[]} openKeys={[]} defaultOpenKeys={[]}>
            {
              __DEV__ ? <Menu.Item style={{ color: '#ffffff' }} key="innerWidth" className={`${styles.menuItem} ${__DEV__ ? '' : 'ant-hide'}`}>
                [视窗: {this.props.innerWidth} * {this.props.innerHeight}]
              </Menu.Item> : null
            }
            <Menu.Item key="account" className={styles.menuItem}>
              <HeaderAccount {...this.props} />
            </Menu.Item>
          </Menu>
        </div>
      </Layout.Header>
    );
  }
}
