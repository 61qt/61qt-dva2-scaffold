const routeArr = [];
routeArr.push({
  name: '404',
  path: '/404',
  component: require('../../components_common/exception/404').default,
});
routeArr.push({
  name: '403',
  path: '/403',
  component: require('../../components_common/exception/403').default,
});
routeArr.push({
  name: '500',
  path: '/500',
  component: require('../../components_common/exception/500').default,
});
routeArr.push({
  name: '404',
  path: '',
  component: require('../../components_common/exception/404').default,
});

export default routeArr;
