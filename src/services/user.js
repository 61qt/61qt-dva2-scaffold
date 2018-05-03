import Factory, { http } from '../services/_factory';
import FactoryGraphql from '../services/_factory_graphql';

const namespace = 'user';

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

const Service = Factory({
  namespace,
  select,
});

const graphqlService = FactoryGraphql({
  Service,
  namespace,
  select,
});

graphqlService.fetch1 = (values) => {
  return http.post('graphql', {
    ...values,
    query: select.list,
  });
};

export default graphqlService;
