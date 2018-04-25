// 以下所有的那些注释，都是未完成的未开放的功能，不要随便进行删除。

export default [
  {
    name: '首页',
    key: '/',
    icon: 'home',
    url: '',
    // resourceKey: '首页',
  },
  {
    name: '前台操作',
    key: 'reception_operate',
    icon: 'setting',
    resourceKey: '前台操作',
    child: [
      {
        name: '招生',
        key: 'enrollment',
        url: 'enrollment',
        // resourceKey: '招生',
      },
      {
        name: '打印花名册',
        key: 'roster',
        url: 'roster',
        // resourceKey: '打印花名册',
      },
    ],
  },
  {
    name: '学校资料',
    key: 'base_info',
    icon: 'database',
    // resourceKey: '学校资料',
    child: [
      {
        name: '学期管理',
        key: 'term',
        url: 'term',
        // resourceKey: '学期管理',
      },
      {
        name: '班级管理',
        key: 'grade',
        url: 'grade',
        // resourceKey: '班级管理',
      },
      {
        name: '学生管理',
        key: 'student',
        url: 'student',
        // resourceKey: '学生管理',
      },
      {
        name: '部门管理',
        key: 'department',
        url: 'department',
        // resourceKey: '部门管理',
      },
      {
        name: '教室管理',
        key: 'classroom',
        url: 'classroom',
        // resourceKey: '教室管理',
      },
      {
        name: '专业管理',
        key: 'specialty',
        url: 'specialty',
        // resourceKey: '专业管理',
      },
      {
        name: '教师管理',
        key: 'teacher',
        url: 'teacher',
        // resourceKey: '教师管理',
      },
    ],
  },
  {
    name: '统计报表',
    key: 'statistis',
    icon: 'pie-chart',
    // resourceKey: '统计报表',
    child: [
      {
        name: '招生统计',
        key: 's_enrollment',
        url: 's_enrollment',
        // resourceKey: '招生统计',
      },
      {
        name: '学费统计',
        key: 's_class',
        url: 's_class',
        // resourceKey: '学费统计',
      },
      {
        name: '学生就读统计',
        key: 's_student',
        url: 's_student',
        // resourceKey: '学生就读统计',
      },
    ],
  },
  {
    name: '对外网站配置',
    key: 'front',
    icon: 'mobile',
    // resourceKey: '对外网站配置',
    child: [
      {
        name: '网站配置',
        key: 'website_config',
        url: 'website_config',
        // resourceKey: '网站配置',
      },
      {
        name: '文章管理',
        key: 'news',
        url: 'news',
        // resourceKey: '文章管理',
      },
      {
        name: '报读须知',
        key: 'agreement',
        url: 'agreement',
        // resourceKey: '报读须知',
      },
      {
        name: '学校介绍',
        key: 'intro',
        url: 'intro',
        // resourceKey: '学校介绍',
      },
    ],
  },
  {
    name: '权限管理',
    key: 'auth',
    icon: 'lock',
    // resourceKey: '权限管理',
    child: [
      {
        name: '人员管理',
        key: 'admin',
        url: 'admin',
        // resourceKey: '人员管理',
      },
      // {
      //   name: '角色管理',
      //   key: 'role',
      //   url: 'role',
      //   // resourceKey: '角色管理',
      // },
    ],
  },
];
