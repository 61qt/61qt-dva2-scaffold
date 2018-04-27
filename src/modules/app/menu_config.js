// 以下所有的那些注释，都是未完成的未开放的功能，不要随便进行删除。

export default [
  {
    name: '管理员管理',
    key: 'admin',
    icon: 'admin',
    // resourceKey: '管理员管理',
    child: [
      {
        name: '市级管理员',
        key: 'admin_city',
        url: 'admin_city',
        // resourceKey: '市级管理员',
      },
      {
        name: '县级管理员',
        key: 'admin_county',
        url: 'admin_county',
        // resourceKey: '县级管理员',
      },
      {
        name: '学校管理员',
        key: 'admin_school',
        url: 'admin_school',
        // resourceKey: '学校管理员',
      },
    ],
  },
  {
    name: '组织架构管理',
    key: 'org_arch',
    icon: 'org_arch',
    // resourceKey: '组织架构管理',
    child: [
      {
        name: '部门管理',
        key: 'departant',
        url: 'departant',
        // resourceKey: '部门管理',
      },
      {
        name: '班级管理',
        key: 'grade',
        url: 'grade',
        // resourceKey: '班级管理',
      },
    ],
  },
  {
    name: '教师管理',
    key: 'teacher',
    url: 'teacher',
    // resourceKey: '教师管理',
  },
  {
    name: '学生管理',
    key: 'student',
    url: 'student',
    // resourceKey: '学生管理',
  },
  {
    name: '家长管理',
    key: 'parent',
    url: 'parent',
    // resourceKey: '家长管理',
  },
  {
    name: '用户管理',
    key: 'user_manage',
    url: 'user_manage',
    // resourceKey: '用户管理',
    child: [
      {
        name: '用户列表',
        key: 'user',
        url: 'user',
        // resourceKey: '用户列表',
      },
      {
        name: '用户组管理',
        key: 'user_group',
        url: 'user_group',
        // resourceKey: '用户组管理',
      },
      {
        name: '角色管理',
        key: 'user_role',
        url: 'user_role',
        // resourceKey: '角色管理',
      },
    ],
  },
  {
    name: '文章管理',
    key: 'news',
    icon: 'news',
    url: 'news',
    // resourceKey: '文章管理',
  },
  {
    name: '基础数据管理',
    key: 'base',
    icon: 'base',
    resourceKey: '基础数据管理',
    child: [
      {
        name: '组织信息',
        key: 'org',
        url: 'org',
        resourceKey: '组织信息',
      },
      {
        name: '学年信息',
        key: 'school_year',
        url: 'school_year',
        resourceKey: '学年信息',
      },
    ],
  },
  {
    name: '第三方应用认证',
    key: 'thirdparty',
    icon: 'thirdparty',
    resourceKey: '第三方应用认证',
    child: [
      {
        name: '第三方授权',
        key: 'thirdparty_auth',
        url: 'thirdparty_auth',
        resourceKey: '第三方授权',
      },
      {
        name: '认证接口',
        key: 'thirdparty_auth_api',
        url: 'thirdparty_auth_api',
        resourceKey: '认证接口',
      },
      {
        name: '认证日志',
        key: 'thirdparty_auth_log',
        url: 'thirdparty_auth_log',
        resourceKey: '认证日志',
      },
    ],
  },
];
