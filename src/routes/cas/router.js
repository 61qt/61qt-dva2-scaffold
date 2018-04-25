import React from 'react';

import _ from 'lodash';
import { connect } from 'dva';
import { Switch, Route } from 'dva/router';

const routeArr = [];
const routeObj = {};

const baseUrl = '/cas/';

/* eslint-disable import/first, import/newline-after-import */
routeArr.push({
  name: 'forget',
  path: 'forget',
  extra: true,
  component: require('../../components_cas/forget').default,
});
routeArr.push({
  name: 'reg',
  path: 'reg',
  extra: true,
  component: require('../../components_cas/reg').default,
});
routeArr.push({
  name: 'auto',
  path: 'auto',
  extra: true,
  component: require('../../components_cas/auto').default,
});
routeArr.push({
  name: 'login',
  path: '',
  component: require('../../components_cas/login').default,
});

routeArr.forEach((elem) => {
  // eslint-disable-next-line no-param-reassign
  elem.url = `${baseUrl}${elem.path}`;

  routeObj[elem.name] = elem;
});
window.casRouteObj = routeObj;
/* eslint-enable */

class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('cas_router', this);
  }

  render() {
    return (<Switch>
      {
        _.map(routeArr, (elem) => {
          return (<Route key={elem.path} path={`${elem.url}`} extra={elem.extra} component={elem.component} />);
        })
      }
    </Switch>);
  }
}

function mapStateToProps() {
  return {};
}

export {
  routeObj,
};

export default connect(mapStateToProps)(Component);
