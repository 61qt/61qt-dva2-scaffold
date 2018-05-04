import Factory from '../services/_factory';

const namespace = 'student';

const modelFields = [
  'id',
  'province_id',
  'city_id',
  'district_id',
  'department_id',
  'school_id',
  'class_id',
  'name',
  'id_number',
  'student_no',
  'grade',
  'entrance_year',
  'entrance_at',
  'gender',
  'qq',
  'avatar',
  'created_at',
  'updated_at',
];

const modelRelate = [
  `class {
    id
  }`,
  `school {
    id
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
  table: namespace,
  select,
  mutation: {
    update: {
      name: 'updateStudent',
    },
    create: {
      name: 'createStudent',
    },
    remove: {
      name: 'deleteStudent',
    },
    changeStatus: {
      name: 'changeStudentStatus',
    },
  },
});

export default Service;
