// import _ from 'lodash';
import React from 'react';
import { connect } from 'dva';
import { Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
import SearchForm from './search_form';
import Access from '../../components_atom/access';
import Table from '../../components_atom/table';
import Download from '../../components_atom/download';

@connect((state) => {
  return {
    loading: !!state.loading.models.teacher,
    teacherState: state.teacher,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('teacher', this);

    this.columns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 84,
      },
      {
        title: '教师姓名',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 90,
        render: (text, record) => {
          return (<span>
            <Access auth="teacher.show">
              <NavLink to={`#id=${record.id}`} activeClassName="link-active">{text}</NavLink>
            </Access>
            <Access auth="!teacher.show">
              <span>{text}</span>
            </Access>
          </span>);
        },
      },
      {
        title: 'IC卡卡号',
        dataIndex: 'ic_card',
        key: 'ic_card',
        width: 130,
      },
      {
        title: '对外尊称',
        dataIndex: 'alias',
        key: 'alias',
        width: 90,
      },
      {
        title: '所属部门',
        dataIndex: 'department.name',
        key: 'department.name',
        minWidth: 198,
      },
      {
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
        render: (text) => {
          return Filters.dict(['teacher', 'gender'], text);
        },
        width: 60,
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 130,
        render: (text, record) => {
          return (<span className={styles.operation}>
            <Access auth="teacher.update">
              <NavLink to={Filters.path('teacher_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
            </Access>
          </span>);
        },
      },
    ];
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '教师管理',
          url: Filters.path('teacher', {}),
        },
      ],
    });
  }

  pageChangeHandler = (page = this.props.teacherState.page) => {
    const {
      dispatch,
      teacherState,
    } = this.props;
    dispatch({
      type: 'teacher/list',
      payload: { page, filter: teacherState.listState.filter },
    });
  }

  handleSubmit = ({ filter, values, expand, loadOldPage }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'teacher/listState',
      payload: { filter, searchValues: values, expand },
    });
    dispatch({
      type: 'teacher/list',
      payload: { page: loadOldPage ? this.props.teacherState.page : 1, filter },

    });
  }

  title = () => {
    const { teacherState } = this.props;
    return (
      <div className="clearfix">
        <h3 className="table-title">
          教师列表
          { teacherState.total ? <small>（共{teacherState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access auth="teacher.store">
            <NavLink to={Filters.path('teacher_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增教师</Button>
            </NavLink>
          </Access>
          <Access auth="teacher.export">
            <Download confirm="true" size="small" path="teacher/export" query={{ filter: teacherState.listState.filter }}>批量导出</Download>
          </Access>
        </div>

      </div>
    );
  }

  footer = () => {
    const { teacherState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{teacherState.start} - {teacherState.end}条记录，共 {teacherState.total} 条数据</div>
        <Pagination
          showQuickJumper={false}
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={teacherState.total}
          current={teacherState.page}
          pageSize={teacherState.pageSize}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }

  render() {
    return (
      <div className={`${styles.normal}`}>
        <SearchForm handleSubmit={this.handleSubmit} />
        <div>
          <Table
            size={768 > window.innerWidth ? 'small' : 'default'}
            bordered
            columns={this.columns}
            dataSource={this.props.teacherState.list}
            loading={this.props.loading}
            scroll={{ x: this.columns.reduce((a, b) => (a.width || a.minWidth || a || 0) + (b.width || b.minWidth || 0), 0), y: 300 > window.innerHeight - 310 ? 300 : window.innerHeight - 310 }}
            rowKey={record => record.id}
            pagination={false}
            title={this.title}
            footer={this.footer}
          />
        </div>
      </div>
    );
  }
}
