import React from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';

import Filters from '../../filters';
import styles from './index.less';

@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('loading', this);
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '跳转中',
          url: Filters.path('loading', {}),
        },
      ],
    });
    setTimeout(() => {
      this.props.history.goBack();
    }, 100);
  }

  render() {
    const loading = true;
    return (<Spin spinning={loading}>
      <div className={styles.normal} />
    </Spin>);
  }
}
