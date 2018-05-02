import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Switch, Route } from 'dva/router';

let routeArr = [];
const routeObj = {};

const baseUrl = '/app';

/* eslint-disable import/first, import/newline-after-import */
routeArr.push({
  name: 'loading',
  path: '/loading',
  exact: true,
  component: require('../../components_common/loading').default,
});
routeArr.push({
  name: 'news_edit',
  path: '/news/:id/edit',
  exact: true,
  component: require('../../components_app/news_add').default,
});
routeArr.push({
  name: 'news_add',
  path: '/news/add',
  exact: true,
  component: require('../../components_app/news_add').default,
});
routeArr.push({
  name: 'news',
  path: '/news',
  exact: true,
  component: require('../../components_app/news').default,
});

// 需要重新写。 begin
routeArr.push({
  name: 'admin_city_edit',
  path: '/admin_city/:id/edit',
  exact: true,
  component: require('../../components_app/student_add').default,
});
routeArr.push({
  name: 'admin_city_add',
  path: '/admin_city/add',
  exact: true,
  component: require('../../components_app/student_add').default,
});
routeArr.push({
  name: 'admin_city_detail',
  path: '/admin_city/:id',
  exact: true,
  component: require('../../components_app/student_detail').default,
});
// 需要重新写。 end
routeArr.push({
  name: 'admin_city',
  path: '/admin_city',
  exact: true,
  component: require('../../components_app/admin_city').default,
});

routeArr.push({
  name: 'student_edit',
  path: '/student/:id/edit',
  exact: true,
  component: require('../../components_app/student_add').default,
});
routeArr.push({
  name: 'student_add',
  path: '/student/add',
  exact: true,
  component: require('../../components_app/student_add').default,
});
routeArr.push({
  name: 'student_detail',
  path: '/student/:id',
  exact: true,
  component: require('../../components_app/student_detail').default,
});
routeArr.push({
  name: 'student',
  path: '/student',
  component: require('../../components_app/student').default,
});

routeArr.push({
  name: 'teacher_edit',
  path: '/teacher/:id/edit',
  exact: true,
  component: require('../../components_app/teacher_add').default,
});
routeArr.push({
  name: 'teacher_add',
  path: '/teacher/add',
  exact: true,
  component: require('../../components_app/teacher_add').default,
});
routeArr.push({
  name: 'teacher',
  path: '/teacher',
  component: require('../../components_app/teacher').default,
});

routeArr.push({
  name: 'home',
  path: '/',
  exact: true,
  component: require('../../components_app/home').default,
});

import exceptionRouteArr from '../../components_common/exception/route';
routeArr = [].concat(routeArr).concat(exceptionRouteArr);

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
    debugAdd('app_router', this);
  }

  render() {
    return (<Switch>
      {
        _.map(routeArr, (elem) => {
          const props = {
            key: elem.path,
            exact: elem.exact || false,
            strict: elem.strict || false,
            component: elem.component,
          };
          if (404 !== elem.name) {
            props.path = elem.url;
          }
          return (<Route {...props} />);
        })
      }
    </Switch>);
  }
}
