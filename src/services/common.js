import Factory, { http } from '../services/_factory';

const namespace = 'common';

const Service = Factory({
  namespace,
});

Service.loginToken = (config = {}) => {
  return http.get('/login_token', config);
};

Service.qiniuToken = (config = {}) => {
  return http.get('/common/qiniu_token', config);
};

Service.qiniuUpload = (values, config = {}) => {
  return http.post('https://up.qbox.me', values, {
    skipAuthorization: true,
    skipExpireCheck: true,
    ...config,
  });
};

// 全部地区
Service.allArea = (config = {}) => {
  return http.get('/common/all_area', {
    skipAuthorization: true,
    skipExpireCheck: true,
    ...config,
  });
};

Service.login = (values, config = {}) => {
  // 登录，不需要带 token
  return http.post('/login', values, {
    skipAuthorization: true,
    skipExpireCheck: true,
    ...config,
  });
};

Service.redirect = (config = {}) => {
  let callbackHref = window.location.href;
  callbackHref = callbackHref.replace(/#*?&*?ctrl_d=([\d-]+)/ig, '').replace(/#$/ig, '').replace(/\?$/ig, '');
  // eslint-disable-next-line camelcase
  const redirect_uri = encodeURIComponent(callbackHref);
  // eslint-disable-next-line camelcase
  return http.get(`/redirect?redirect_uri=${redirect_uri}`, {
    skipExpireCheck: true,
    skipAuthorization: true,
    ...config,
  });
};

Service.refreshToken = (values = {}, config = {}) => {
  // 进行 token 的更新。不需要验证 token 是不是失效。
  return http.post('/refresh_token', values, {
    skipExpireCheck: true,
    ...config,
  });
};

Service.ticketToken = (ticket, config = {}) => {
  // ticket 登录，不需要带 token
  return http.get(`/token/${ticket}`, {
    skipAuthorization: true,
    skipExpireCheck: true,
    ...config,
  });
};

Service.allResources = (config = {}) => {
  return http.get('/all_resources', {
    ...config,
  });
};

export default Service;
