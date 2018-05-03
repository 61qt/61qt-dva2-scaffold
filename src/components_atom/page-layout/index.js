import React from 'react';
import styles from './index.less';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('page_layout', this);
  }

  render() {
    return (
      <div className={`page-layout ${this.props.Sider ? 'page-layput-has-sider' : ''} ${this.props.className || ''} ${styles.normal || ''}`} style={{ height: window.innerHeight - 110 }}>
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
