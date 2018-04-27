import React from 'react';
import _ from 'lodash';
import { Router, Switch, Route, Redirect } from 'dva/router';
import { locales, LocaleProvider } from 'antd';

// 已经授权的模块，非精确匹配
import Component from './component';

const zhCN = _.get(locales, 'zh_CN');

function router({ history }) {
  return (<LocaleProvider locale={zhCN}>
    <Router history={history}>
      <Switch>
        <Route path="/app" component={Component} />
        <Redirect to="/app" />
      </Switch>
    </Router>
  </LocaleProvider>);
}

export default router;
