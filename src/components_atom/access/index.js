import React from 'react';
import { connect } from 'dva';
import styles from './index.less';

function checkAuthIsShow({ auth = '', resource }) {
  const replacedAuth = `${auth || ''}`.replace('!', '');
  // 是否取反，不是的话就设置成 true。
  let positiveAuth = true;
  if (0 <= auth.indexOf('!')) {
    positiveAuth = false;
  }
  const hasAccess = resource[replacedAuth] || false;

  if ((hasAccess && positiveAuth) || (!hasAccess && !positiveAuth)) {
    // 情况一， 存在权限，而且是正权限。
    // 情况二，不存在权限，而且是反权限。
    return true;
  }

  // 非上面的情况，就是隐藏。
  return false;
}
export {
  checkAuthIsShow,
};

@connect((state) => {
  return {
    resource: state.all_resource.resource,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    debugAdd('access', this);
  }

  render() {
    const { children, resource, auth = '' } = this.props;
    if ('!' !== auth && (!auth || checkAuthIsShow({ auth, resource }))) {
      if (React.isValidElement(children)) {
        return children;
      }
      return <span>{ children }</span>;
    }

    return (<span className={styles.accessHidden} data-auth={auth}>{children}</span>);
  }
}
