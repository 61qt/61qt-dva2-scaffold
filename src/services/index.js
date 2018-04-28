// eslint-disable-next-line camelcase
import admin_school from './admin_school';
import common from './common';
import post from './post';
import specialty from './specialty';
import student from './student';
// eslint-disable-next-line camelcase
import sys_message from './sys_message';
import teacher from './teacher';

import { http } from './_factory';
import {
  requestInterceptor,
  responseFailInterceptor,
  responseSuccessInterceptor,
} from './_intercept';


// Add a request interceptor
http.interceptors.request.use(requestInterceptor, (error) => {
  return Promise.reject(error);
});

// Add a response interceptor
http.interceptors.response.use(responseSuccessInterceptor, responseFailInterceptor);

export default {
  admin_school,
  common,
  post,
  specialty,
  student,
  sys_message,
  teacher,
};

