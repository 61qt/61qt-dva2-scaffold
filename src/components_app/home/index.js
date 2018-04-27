import React from 'react';
import { connect } from 'dva';
import { Icon } from 'antd';

import styles from './index.less';
import Svg from '../../components_atom/svg';

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
    this.iconArr = [
      {
        url: require('../../sprites/svg/search.svg'),
        type: 'search',
      },
      {
        url: require('../../sprites/svg/mail.svg'),
        type: 'mail',
      },
    ];
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
        <h1 className={styles.title}>欢迎来到智慧教育云平台</h1>
        <div className={styles.welcome} />
        <ul className={styles.list}>
          <li>这里是管理系统。</li>
          <li>主要管理智慧教育方面的信息。</li>
        </ul>

        <div className={styles.iconList}>
          {
            this.iconArr.map((icon) => {
              return (<Icon key={icon.type} type={icon.type} style={{ fontSize: '40px', color: '#000000' }} />);
            })
          }
          <br />
          <div>
            <span className="sp sp-search" />
            <span className="sp sp-mail" />
          </div>
          {
            this.iconArr.map((icon) => {
              return (<Svg key={icon.type} link={icon.url} style={{ fontSize: '40px', color: '#000000' }} />);
            })
          }
        </div>

      </div>
    );
  }
}
