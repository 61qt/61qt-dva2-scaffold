import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { NavLink } from 'dva/router';
import DetailView from '../../components_atom/detail_view';
import styles from './index.less';
import Filters from '../../filters';
import Access from '../../components_atom/access';

const columns = [
  {
    title: '头像',
    dataIndex: 'avatar',
    rowSpan: 2,
    render: (text, dataSource) => {
      return (<img className="img-1-1-80" src={Filters.qiniuImage(text, { width: 160, height: 160 })} alt={dataSource.name} />);
    },
  },
  {
    title: '姓名',
    dataIndex: 'name',
  },
  {
    title: '学生编号',
    dataIndex: 'id',
  },
  {
    title: '出生日期',
    dataIndex: 'birthday',
    render: (text) => {
      return <span>{Filters.datetime(text)}</span>;
    },
  },
  {
    title: '性别',
    dataIndex: 'gender',
    render: (text) => {
      if (undefined === text) {
        return '';
      }
      const label = Filters.dict(['student', 'gender'], 1 * text);
      if (label * 1 === text * 1) {
        return '未设置';
      }
      return <span>{label}</span>;
    },
  },
  {
    title: '操作人',
    dataIndex: 'updated_by',
  },
  {
    title: '课程顾问',
    dataIndex: 'sng_admin.name',
  },
  {
    title: '所在学校',
    dataIndex: 'school',
  },
  {
    title: '学生手机',
    dataIndex: 'phone',
    render: (text) => {
      return text || '未填写';
    },
  },
  {
    title: '主要联系人',
    dataIndex: 'primary_name',
  },

  {
    title: '主要联系人电话',
    dataIndex: 'primary_phone',
  },

  {
    title: '次要联系人',
    dataIndex: 'secondary_name',
  },

  {
    title: '次要联系人电话',
    dataIndex: 'secondary_phone',
    render: (text) => {
      return text || '';
    },
  },
  {
    title: '来源',
    dataIndex: 'source',
    render: (text) => {
      if (undefined === text) {
        return '';
      }
      return Filters.dict(['student', 'source'], text);
    },
  },
  {
    title: '身高',
    dataIndex: 'height',
    render: (text) => {
      return text ? `${text}cm` : '未填写';
    },
  },

  {
    title: '体重',
    dataIndex: 'weight',
    render: (text) => {
      return text ? `${text}cm` : '未填写';
    },
  },

  {
    title: '鞋码',
    dataIndex: 'shoes',
    render: (text) => {
      return text ? `${text}码` : '未填写';
    },
  },

  {
    title: '民族',
    dataIndex: 'nation',
    render: (text) => {
      return text || '未填写';
    },
  },

  {
    title: '身份证号',
    dataIndex: 'id_number',
    render: (text) => {
      return text || '未填写';
    },
  },

  {
    title: '家庭住址',
    dataIndex: 'home_address',
    colSpan: 3,
    render: (text) => {
      return text || '未填写';
    },
  },

  {
    title: '邮箱地址',
    dataIndex: 'email',
    render: (text) => {
      return text || '未填写';
    },
  },
];

@connect((state) => {
  return {
    studentDetail: state.student.detail,
    loading: !!state.loading.models.student,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    debugAdd('student_detail', this);
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '学生管理',
          url: Filters.path('student', {}),
        },
        {
          name: '学生详情',
          url: Filters.path('student_detail', { id: _.get(this.props, 'match.params.id') }),
        },
      ],
    });

    dispatch({
      type: 'student/detail',
      payload: {
        id: _.get(this.props, 'match.params.id'),
      },
    });
  }

  render() {
    const { loading, studentDetail = {} } = this.props;
    const detailTitle = (<div>
      <span>{ `学生 （${studentDetail.name || ''}） 详情` }</span>
      <span className="float-right">
        <Access auth="student.update">
          <NavLink to={Filters.path('student_edit', { id: _.get(this.props, 'match.params.id') })} activeClassName="link-active">编辑</NavLink>
        </Access>
      </span>
    </div>);

    return (
      <div className={styles.normal}>
        <h2>{studentDetail.name || ''} - 学生信息详情</h2>

        <DetailView col={500 > window.innerWidth ? 1 : 2} labelWidth="10em" expand={4} data-comment-expand={13} loading={loading} dataSource={studentDetail} columns={columns} title={detailTitle} />
      </div>
    );
  }
}
