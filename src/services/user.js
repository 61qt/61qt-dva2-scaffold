import Factory, { http } from '../services/_factory';
import FactoryGraphql from '../services/_factory_graphql';

const namespace = 'user';

const modelSchema = [
  'id',
  'username',
  'user_type',
];
const schema = {
  list: [
    ...modelSchema,
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
  schema,
});

const graphqlService = FactoryGraphql({
  Service,
  namespace,
  schema,
});

graphqlService.fetch1 = (values) => {
  return http.post('graphql', {
    ...values,
    query: schema.list,
  });
};

export default graphqlService;
