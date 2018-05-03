import Factory, { http } from '../services/_factory';
import FactoryGraphql from '../services/_factory_graphql';

const namespace = 'user';

const modelSelect = [
  'id',
  'username',
  'user_type',
];
const select = {
  list: [
    ...modelSelect,
    `userRoles{${
      [
        'id',
        'name',
        'city_id',
      ].join('\n')
    }}`,
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
