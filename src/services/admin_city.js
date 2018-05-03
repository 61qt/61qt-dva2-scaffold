import FactoryGraphql, { http, buildFormDataArr } from '../services/_factory_graphql';

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

Service.graphqlChangeStatus = (id, values = {}, options = {}) => {
  const valueArr = buildFormDataArr(values);
  const schemaArr = [
    `mutation changeStatusMutation($id: ID) {
      changeCityAdminStatus (id: $id, ${valueArr.join(',')}) {
        id
      }
    }`,
  ];
  return http.post('/graphql?c=admin_city', {
    query: schemaArr.join('\n'),
    variables: {
      id: id * 1,
    },
  }, options.config || {});
};

export default Service;
