import React from 'react';
import _ from 'lodash';
import { Breadcrumb } from 'antd';
import { NavLink } from 'dva/router';
import { connect } from 'dva';

import styles from './index.less';
import Filters from '../../filters';

@connect((state) => {
  return {
    breadcrumb: state.breadcrumb,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('page_layout', this);
  }

  render() {
    const pathname = _.get(window, 'location.pathname') || '';
    const isHome = -1 < ['/app/', '/app'].indexOf(pathname);
    const breadcrumbCurrent = _.get(this, 'props.breadcrumb.current') || [];

    return (
      <div className={`page-layout ${this.props.Sider ? 'page-layput-has-sider' : ''} ${this.props.className || ''} ${styles.normal || ''}`} style={{ height: window.innerHeight - 60 }}>
        <div className={`breadcrumb-container ${isHome ? 'ant-hide' : ''}`}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <NavLink to={Filters.path('home', {})} activeClassName="link-active">首页</NavLink>
            </Breadcrumb.Item>
            {
              _.map(breadcrumbCurrent || [], (elem) => {
                const url = elem.url.replace(/\/+$/, '');
                return (<Breadcrumb.Item key={url}>
                  <NavLink to={`${url}`} activeClassName="link-active">{elem.name}</NavLink>
                </Breadcrumb.Item>);
              })
            }
          </Breadcrumb>
        </div>
        {
          this.props.Sider ? (
            <div className="page-layout-sider">
              {this.props.Sider}
            </div>
          ) : null
        }
        <div className="page-layout-content">
          {this.props.children}
        </div>
      </div>
    );
  }
}
