const models = [
  require('./all_resource').default,
  require('./area').default,
  require('./breadcrumb').default,
  require('./ctrl_d').default,
  require('./foreign_select').default,
  require('./foreign_select_graphql').default,
  // require('./menu_config').default,
  require('./post').default,
  require('./specialty').default,
  require('./student').default,
  require('./sys_message').default,
  require('./teacher').default,
  require('./user').default,
];

function modelReset(dispatch) {
  models.forEach((model) => {
    dispatch({
      type: `${model.namespace}/reset`,
    });
  });
}

export { modelReset };

export default models;
