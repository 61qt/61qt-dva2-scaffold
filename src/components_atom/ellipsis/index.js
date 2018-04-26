import React from 'react';
import styles from './index.less';

export default class Component extends React.Component {
  render() {
    const { style, children, width = '100%', line = 1, height = '1rem' } = this.props;
    return (<div
      {...this.props}
      className={`${styles.ellipsis} ${this.props.className}`}
      style={{ ...style, lineClamp: line, WebkitLineClamp: line, '-webkit-line-clamp': line, width, height, WebkitBoxOrient: 'vertical' }}
    >{ children }</div>);
  }
}
