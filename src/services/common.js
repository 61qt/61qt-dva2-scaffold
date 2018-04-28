import Factory, { http } from '../services/_factory';

const namespace = 'common';

const Service = Factory({
  namespace,
});

Service.loginToken = () => {
  return http.get('/login_token');
};

Service.qiniuToken = (values = {}, options = {}) => {
  return http.get('/common/qiniu_token', values, options);
};

Service.qiniuUpload = (values, options = {}) => {
  return http.post('https://up.qbox.me', values, {
    skipAuthorization: true,
    ...options,
  });
};

// 全部地区
Service.allArea = () => {
  return http.get('/common/all_area');
};

Service.login = (values) => {
  // 登录，不需要带 token
  return http.post('/login', values, {
    skipAuthorization: true,
  });
};

Service.refreshToken = () => {
  // 进行 token 的更新。不需要验证 token 是不是失效。
  return http.post('/refresh_token', {}, {
    skipExpireCheck: true,
  });
};

Service.ticketToken = (ticket) => {
  // ticket 登录，不需要带 token
  return http.get(`/token/${ticket}`, {
    skipAuthorization: true,
  });
};

Service.allResources = () => {
  return http.get('/all_resources');
};

export default Service;
