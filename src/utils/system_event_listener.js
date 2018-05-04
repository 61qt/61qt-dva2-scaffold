import jQuery from 'jquery';

import CONSTANTS from '../constants';
import { apiBaseUrl } from '../services/_factory';

jQuery(window).on(CONSTANTS.EVENT.CAS_JUMP_AUTH, () => {
  let callbackHref = window.location.href;
  callbackHref = callbackHref.replace(/#*?&*?ctrl_d=([\d-]+)/ig, '').replace(/#$/ig, '').replace(/\?$/ig, '');
  // eslint-disable-next-line camelcase
  const redirect_uri = encodeURIComponent(callbackHref);
  // eslint-disable-next-line camelcase
  return window.location.replace(`${apiBaseUrl}/redirect?redirect_uri=${redirect_uri}`);
});

jQuery(window).on(CONSTANTS.EVENT.CAS_CALLBACK, () => {
  return window.location.replace(`${apiBaseUrl}${/\/$/.test(apiBaseUrl) ? '' : '/'}authorize?${window.location.search.replace(/\?/, '')}`);
});
