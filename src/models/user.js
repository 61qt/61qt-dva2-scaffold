import graphqlModelFactory from './_factory_graphql';
import Services from '../services';

const modelExtend = {};

const modelName = 'user';
export default graphqlModelFactory({
  modelName,
  Service: Services[modelName],
  modelExtend,
});
