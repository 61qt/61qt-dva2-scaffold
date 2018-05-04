import Factory from '../services/_factory';

const namespace = 'school';

const modelFields = [
  'id',
  'name',
];

const modelRelate = [
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
  table: namespace,
  select,
  mutation: {
    update: {
      name: 'updateSchool',
    },
    create: {
      name: 'createSchool',
    },
    remove: {
      name: 'deleteSchool',
    },
    changeStatus: {
      name: 'changeSchoolStatus',
    },
  },
});

export default Service;
