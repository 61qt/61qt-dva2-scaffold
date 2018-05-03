import FactoryGraphql from '../services/_factory_graphql';

const namespace = 'user';
// admin city 是对应 user 里面的某个类型的数据，故在同一个表。

const modelFields = [
  'id',
  'province_id',
  'city_id',
  'district_id',
  'school_id',
  'department_id',
  'user_type',
  'username',
  'name',
  'phone',
  'email',
  // 'password',
  'operator',
  'id_number',
  'status',
  'last_login_at',
  'created_at',
  // 'updated_at',
];

const modelRelate = [
  `userRoles {
    id
    name
    city_id
  }`,
];

const select = {
  list: [
    ...modelFields,
    ...modelRelate,
  ].join('\n'),
  detail: [
    ...modelFields,
  ].join('\n'),
};

const Service = FactoryGraphql({
  namespace,
  table: namespace,
  select,
  mutation: {
    update: {
      name: 'updateCityAdmin',
    },
    create: {
      name: 'createCityAdmin',
    },
    remove: {
      name: 'deleteCityAdmin',
    },
  },
});

export default Service;
