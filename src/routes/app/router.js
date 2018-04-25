import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Switch, Route } from 'dva/router';

const routeArr = [];
const routeObj = {};

const baseUrl = '/app/';

/* eslint-disable import/first, import/newline-after-import */
routeArr.push({
  name: 'news_edit',
  path: 'news/:id/edit',
  extra: true,
  component: require('../../components_app/news_add').default,
});
routeArr.push({
  name: 'news_add',
  path: 'news/add',
  extra: true,
  component: require('../../components_app/news_add').default,
});
routeArr.push({
  name: 'news',
  path: 'news',
  extra: true,
  component: require('../../components_app/news').default,
});

routeArr.push({
  name: 'student_edit',
  path: 'student/:id/edit',
  extra: true,
  component: require('../../components_app/student_add').default,
});
routeArr.push({
  name: 'student_detail',
  path: 'student/:id',
  extra: true,
  component: require('../../components_app/student_detail').default,
});
routeArr.push({
  name: 'student_add',
  path: 'student/add',
  extra: true,
  component: require('../../components_app/student_add').default,
});
routeArr.push({
  name: 'student',
  path: 'student',
  component: require('../../components_app/student').default,
});

routeArr.push({
  name: 'teacher_edit',
  path: 'teacher/:id/edit',
  extra: true,
  component: require('../../components_app/teacher_add').default,
});
routeArr.push({
  name: 'teacher_add',
  path: 'teacher/add',
  extra: true,
  component: require('../../components_app/teacher_add').default,
});
routeArr.push({
  name: 'teacher',
  path: 'teacher',
  component: require('../../components_app/teacher').default,
});

routeArr.push({
  name: 'home',
  path: '',
  extra: true,
  component: require('../../components_app/home').default,
});

routeArr.forEach((elem) => {
  // eslint-disable-next-line no-param-reassign
  elem.url = `${baseUrl}${elem.path}`;

  routeObj[elem.name] = elem;
});
/* eslint-enable */

class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('app_router', this);
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
