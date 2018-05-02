import Factory, { http } from '../services/_factory';

const namespace = 'student';

const schema = {
  list: `{
    user {
      id
      name
    }
  }`,
};

const Service = Factory({
  namespace,
  schema,
});

Service.list = (values) => {
  return http.post('/graphql', {
    ...values,
    query: schema.list,
  });
};

export default Service;
