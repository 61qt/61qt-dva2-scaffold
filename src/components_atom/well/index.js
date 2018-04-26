import React from 'react';
import { Spin } from 'antd';

import styles from './index.less';

export default class Component extends React.Component {
  state = {}

  componentWillMount = () => {}

  render() {
    const { holderplace = false, loading = false, title = '', children = null, className = '', free } = this.props;

    return (
      <Spin spinning={loading}>
        <div className={`${holderplace ? 'well hidden-border' : ''} ${className}`}>
          <div className={styles.normal}>
            { title ? (<div className={`${styles.title} well-title`}>{title}</div>) : null }
            <div className={`${styles.content} well-content ${free ? styles.free : ''}`}>{children}</div>
          </div>
        </div>
      </Spin>
    );
  }
}
