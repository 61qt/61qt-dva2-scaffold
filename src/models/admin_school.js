import modelFactory from './_factory';
import Services from '../services';

const modelExtend = {};

const modelName = 'admin_school';
export default modelFactory({
  modelName,
  Service: Services[modelName],
  modelExtend,
});
