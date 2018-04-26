import React from 'react';
import { Spin } from 'antd';

import DetailRow from './detail_row';
import styles from './index.css';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentExpand: 1,
    };
    debugAdd('detail_view', this);
  }

  componentWillMount = () => {
    const { expand, columns, defaultExpand } = this.props;
    let currentExpand = expand * 1 || columns.length;
    if (defaultExpand) {
      currentExpand = columns.length;
    }
    this.setState({
      currentExpand,
    });
  }

  toggleShowMore = () => {
    const { columns, expand } = this.props;
    const currentExpand = this.state.currentExpand === columns.length
      ? expand : columns.length;
    this.setState({
      currentExpand,
    });
  }

  render() {
    const { loading = false, className } = this.props;

    return (
      <Spin spinning={loading}>
        <div className={styles.normal}>
          <div className={className}>
            <DetailRow {...this.props} currentExpand={this.state.currentExpand} toggleShowMore={this.toggleShowMore} />
          </div>
        </div>
      </Spin>
    );
  }
}
