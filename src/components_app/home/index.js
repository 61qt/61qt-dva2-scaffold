import React from 'react';
import { connect } from 'dva';
import styles from './index.less';

@connect((state) => {
  debugAdd('state', state);
  return {};
})
export default class Component extends React.Component {
  static defaultProps = {
  }
  constructor(props) {
    super(props);
    debugAdd('home', this);
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'breadcrumb/current',
      payload: [],
    });
  }
  render() {
    return (
      <div className={styles.normal}>
        <div>
          <div className={styles.welcome} />
          <ul className={styles.list}>
            <li>张掖教育云平台是新一代云端教育信息管理系统，将教师，家长与学生的信息通过系统的统一管理，终端用户可通过系统快速定位，操作具体的个人信息。人性化的系统设定，使终端用户零成本上手使用本系统。</li>
          </ul>
        </div>
      </div>
    );
  }
}
