import Factory, { http } from '../services/_factory';
import FactoryGraphql from '../services/_factory_graphql';

const namespace = 'user';

const schema = {
  list: [
    'id',
    // 'name',
    // 'city_id',
    'username',
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
