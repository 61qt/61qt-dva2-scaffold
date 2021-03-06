import React from 'react';

import _ from 'lodash';
import { connect } from 'dva';
import { Switch, Route } from 'dva/router';

const routeArr = [];
const routeObj = {};

const baseUrl = '/cas/';

/* eslint-disable import/first, import/newline-after-import */
routeArr.push({
  name: 'loading',
  path: '/loading',
  exact: true,
  component: require('../../components_common/loading').default,
});
routeArr.push({
  name: 'forget',
  path: 'forget',
  exact: true,
  component: require('../../components_cas/forget').default,
});
routeArr.push({
  name: 'reg',
  path: 'reg',
  exact: true,
  component: require('../../components_cas/reg').default,
});
routeArr.push({
  name: 'auto',
  path: 'auto',
  exact: true,
  component: require('../../components_cas/auto').default,
});
routeArr.push({
  name: 'login',
  path: '',
  component: require('../../components_cas/login').default,
});
routeArr.push({
  name: 'home',
  path: '',
  component: require('../../components_cas/login').default,
});

routeArr.forEach((elem) => {
  // eslint-disable-next-line no-param-reassign
  elem.url = `${baseUrl}${elem.path}`;
  routeObj[elem.name] = elem;
});

export {
  routeObj,
};

/* eslint-enable */

@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('cas_router', this);
  }

  render() {
    return (<Switch>
      {
        _.map(routeArr, (elem) => {
          return (<Route key={elem.path} path={`${elem.url}`} exact={elem.exact} component={elem.component} />);
        })
      }
    </Switch>);
  }
}
