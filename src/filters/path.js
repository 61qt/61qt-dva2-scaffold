import _ from 'lodash';
import pathToRegexp from 'path-to-regexp';

import { routeObj as appRouteObj } from '../routes/app/router';
import { routeObj as casRouteObj } from '../routes/cas/router';

const routeObj = {
  app: appRouteObj,
  cas: casRouteObj,
};

const buildModule = `${DEFINE_MODULE || 'app'}`;

// eslint-disable-next-line no-param-reassign
const buildUrl = (elem, options = {}) => {
  return pathToRegexp.compile(elem.url)(options);
};

export default function (name, options, module = buildModule) {
  const elem = _.get(routeObj[module], `${name}`);
  if (elem && 'string' === typeof elem.url) {
    return buildUrl(elem, options);
  }
  else {
    if (window.console && window.console.error) {
      window.console.error(`[filters path] build path error, please check name: ${name}, options: ${options}, module: ${module}`);
    }
    return '';
  }
}