import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
// import EditModal from './modal';
import SearchForm from './search_form';
import Download from '../../components_atom/download';
import Upload from '../../components_atom/upload';
import Access from '../../components_atom/access';
import Table from '../../components_atom/table';
import PageLayout from '../../components_atom/page-layout';
import {
  getFilter,
} from '../../components_default/search_form';

@connect((state) => {
  return {
    loading: !!state.loading.models.student,
    studentState: state.student,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('student', this);
    this.state = {
      defaultSearchValue: {},
    };
    this.columns = [
      {
        title: '学号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 100,
      },
      {
        title: '学生姓名',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 100,
        render: (text, record) => {
          return (<span>
            <Access auth="student.show">
              <NavLink to={Filters.path('student_detail', { id: record.id })} activeClassName="link-active">{text}</NavLink>
            </Access>
            <Access auth="!student.show">
              <span>{text}</span>
            </Access>
          </span>);
        },
      },
      {
        title: '性别',
        dataIndex: 'gender',
        key: 'gender',
        render: (text) => {
          if (undefined === text) {
            return null;
          }
          return Filters.dict(['student', 'gender'], text);
        },
        width: 100,
      },
      {
        title: '年龄',
        key: 'birthday',
        dataIndex: 'birthday',
        width: 100,
        render: (text) => {
          return Filters.age(text);
        },
      },
      {
        title: '操作人',
        key: 'updated_by',
        dataIndex: 'updated_by',
        width: 100,
      },
      {
        title: '创建时间',
        key: 'created_at',
        dataIndex: 'created_at',
        width: 150,
        render: (text) => {
          return Filters.datetime(text, { type: 'TIMESTAMP', format: 'YYYY-MM-DD HH:mm:ss' });
        },
      },
      {
        title: '最后更新时间',
        key: 'updated_at',
        dataIndex: 'updated_at',
        minWidth: 150,
        render: (text) => {
          return Filters.datetime(text, { type: 'TIMESTAMP', format: 'YYYY-MM-DD HH:mm:ss' });
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 60,
        render: (text, record) => {
          return (<span className={styles.operation}>
            <Access auth="student.update">
              <NavLink to={Filters.path('student_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
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
          name: '学生管理',
          url: Filters.path('student', {}),
        },
      ],
    });
  }

  onUploaded = (info) => {
    if (__DEV__) {
      window.console.log('info', info);
    }
    this.resetPage();
  }

  resetPage = () => {
    this.props.dispatch({
      type: 'student/reset',
    }).then(() => {
      this.props.history.push(Filters.path('loading', {}));
    });
  }

  pageChangeHandler = (page = this.props.studentState.page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'student/list',
      payload: { page, filter: this.props.studentState.listState.filter },
    });
  }

  handleSubmit = ({
    searchValues = _.get(this.props.studentState, 'listState.searchValues') || {},
    siderValues = _.get(this.props.studentState, 'listState.siderValues') || {},
    expand = _.get(this.props.studentState, 'listState.expand') || false,
    loadOldPage = false,
  }) => {
    const filter = getFilter({
      ...searchValues,
      ...siderValues,
      ...this.state.defaultSearchValue,
    });

    const { dispatch } = this.props;
    dispatch({
      type: 'student/listState',
      payload: { filter, siderValues, searchValues, expand },
    });
    dispatch({
      type: 'student/list',
      payload: { page: loadOldPage ? this.props.studentState.page : 1, filter },
    });
  }

  title = () => {
    const { studentState } = this.props;
    return (
      <div className="clearfix">
        <h3 className="table-title">
          学生列表
          { studentState.total ? <small>（共{studentState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access auth="student.store">
            <Upload onUploaded={this.onUploaded} size="small" path="student?upload">批量导入</Upload>
          </Access>
          <Access auth="student.export">
            <Download confirm="true" selectRow={this.columns} size="small" path="student/export" query={{ filter: studentState.listState.filter }}>批量导出</Download>
          </Access>
          <Access auth="student.store">
            <NavLink to={Filters.path('student_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增学生</Button>
            </NavLink>
          </Access>
          <Download link="true" size="small" path="student/export/template">下载模板</Download>
        </div>
      </div>
    );
  }

  footer = () => {
    const { studentState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{studentState.start} - {studentState.end}条记录，共 {studentState.total} 条数据</div>
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={studentState.total}
          current={studentState.page}
          pageSize={studentState.pageSize}
          showQuickJumper={false}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }

  render() {
    return (
      <PageLayout>
        <SearchForm handleSubmit={this.handleSubmit} />
        <div>
          <Table
            data-bak-size={768 > window.innerWidth ? 'small' : 'default'}
            size="small"
            bordered
            columns={this.columns}
            dataSource={this.props.studentState.list}
            loading={this.props.loading}
            scroll={{ x: this.columns.reduce((a, b) => (a.width || a.minWidth || a || 0) + (b.width || b.minWidth || 0), 0), y: 300 > window.innerHeight - 310 ? 300 : window.innerHeight - 310 }}
            rowKey={record => record.id}
            pagination={false}
            title={this.title}
            footer={this.footer}
          />
        </div>
      </PageLayout>
    );
  }
}
