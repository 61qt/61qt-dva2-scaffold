import jQuery from 'jquery';
import _ from 'lodash';
import queryString from 'query-string';
import Cookies from 'js-cookie';

import CONSTANTS from '../constants';

jQuery(window).on(CONSTANTS.EVENT.CAS_JUMP_AUTH, () => {
  // eslint-disable-next-line no-console
  let callbackHref = window.location.href;
  callbackHref = callbackHref.replace(/#*?&*?ctrl_d=([\d-]+)/ig, '').replace(/#$/ig, '').replace(/\?$/ig, '');
  window.location.replace(`${CONSTANTS.SYSTEM_CONFIG.CONFIG.CAS.DOMAIN}?redirect_uri=${encodeURIComponent(callbackHref)}`);
});

jQuery(window).on(CONSTANTS.EVENT.CAS_CALLBACK, (e, options) => {
  // eslint-disable-next-line camelcase
  let redirect_uri = Cookies.get(CONSTANTS.SYSTEM_CONFIG.CONFIG.CAS.CALLBACK_URL) || '';
  // eslint-disable-next-line camelcase
  redirect_uri = redirect_uri.replace(/#.+/, '').replace(/\?$/, '');
  const parseUrl = queryString.parseUrl(redirect_uri);
  let redirectUriHasQuery = true;
  if (_.isEmpty(parseUrl.query)) {
    redirectUriHasQuery = false;
  }

  // eslint-disable-next-line camelcase
  window.location.replace(`${redirect_uri}${redirectUriHasQuery ? '&' : '?'}ticket=${options.ticket}`);
});
