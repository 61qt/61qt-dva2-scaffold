import axios from 'axios';
import _ from 'lodash';
import CONSTANTS from '../constants';

const module = `${DEFINE_MODULE || 'app'}`.toUpperCase();
const apiBaseUrl = _.get(CONSTANTS, `SYSTEM_CONFIG.CONFIG.${module}.API_BASE_URL`);

window.console.log('module', module, 'apiBaseUrl', apiBaseUrl);

const http = axios.create({
  // eslint-disable-next-line no-dupe-keys
  baseURL: apiBaseUrl,
});

export default http;
