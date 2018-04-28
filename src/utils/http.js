import axios from 'axios';
import _ from 'lodash';
import CONSTANTS from '../constants';

const buildModule = `${DEFINE_MODULE || 'app'}`.toUpperCase();
const apiBaseUrl = _.get(CONSTANTS, `SYSTEM_CONFIG.CONFIG.${buildModule}.API_BASE_URL`);

const http = axios.create({
  // eslint-disable-next-line no-dupe-keys
  baseURL: apiBaseUrl,
});

export {
  apiBaseUrl,
};

export default http;
