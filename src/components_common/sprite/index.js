import React from 'react';
import { Icon } from 'antd';
import styles from './index.less';
import Svg from '../../components_atom/svg';

export default class component extends React.Component {
  constructor(props) {
    super(props);

    debugAdd('sprite', this);

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

  render() {
    return (
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
    );
  }
}
