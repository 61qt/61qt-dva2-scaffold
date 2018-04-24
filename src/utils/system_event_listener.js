import jQuery from 'jquery';
import _ from 'lodash';
import queryString from 'query-string';
import Cookies from 'js-cookie';

import CONSTANTS from '../constants';

jQuery(window).on(CONSTANTS.EVENT.CAS.JUMP_AUTH, () => {
  // eslint-disable-next-line no-console
  let callbackHref = window.location.href;
  callbackHref = callbackHref.replace(/#*?&*?ctrl_d=([\d-]+)/ig, '').replace(/#$/ig, '').replace(/\?$/ig, '');
  window.location.replace(`${CONSTANTS.URL_CONFIG.CAS}?dt=${encodeURIComponent(callbackHref)}`);
});

jQuery(window).on(CONSTANTS.EVENT.CAS.CALLBACK, (e, options) => {
  // eslint-disable-next-line no-console
  let dt = Cookies.get(CONSTANTS.CAS.CALLBACK_URL) || '';
  dt = dt.replace(/#.+/, '').replace(/\?$/, '');
  const parseUrl = queryString.parseUrl(dt);
  let dtHasQuery = true;
  if (_.isEmpty(parseUrl.query)) {
    dtHasQuery = false;
  }

  window.location.replace(`${dt}${dtHasQuery ? '&' : '?'}ticket=${options.ticket}`);
});
