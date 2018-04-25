import React from 'react';
import { connect } from 'dva';
import { Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
// import EditModal from './modal';
import SearchForm from './search_form';
import Download from '../../components_atom/download';
import Access from '../../components_atom/access';
import Table from '../../components_atom/table';

class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('student', this);
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
        width: 130,
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
    dispatch({
      type: 'student/listState',
      payload: { },
    });
    dispatch({
      type: 'student/list',
      payload: { page: 1, filters: '' },
    });
  }

  pageChangeHandler = (page = this.props.page) => {
    const { dispatch, listState } = this.props;
    dispatch({
      type: 'student/list',
      payload: { page, filters: listState.filters },
    });
  }

  handleSubmit = ({ filters, values }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'student/listState',
      payload: { filters, searchValues: values },
    });
    dispatch({
      type: 'student/list',
      payload: { page: 1, filters },
    });
  }

  title = () => {
    const { total, listState } = this.props;
    return (
      <div className="clearfix">
        <h3 className={styles.tableTitle} >
          学生列表
          { total ? <small>（共{total}条）</small> : null }
        </h3>

        <div className={styles.tableTitleAction}>
          <Access auth="student.export">
            <Download selectRow={this.columns} size="small" path="student/export" query={{ filter: listState.filters }}>导出列表</Download>
          </Access>
          <Access auth="student.store">
            <NavLink to={Filters.path('student_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增学生</Button>
            </NavLink>
          </Access>
        </div>

      </div>
    );
  }

  footer = () => {
    const { total, page: current, pageSize } = this.props;
    return (
      <div className="clearfix">
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={total}
          current={current}
          pageSize={pageSize}
          showQuickJumper={false}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }

  render() {
    const {
      list: dataSource,
      loading,
    } = this.props;

    return (
      <div className={styles.normal}>
        <SearchForm handleSubmit={this.handleSubmit} />
        <br />
        <div>
          <Table
            data-bak-size={768 > window.innerWidth ? 'small' : 'default'}
            size="small"
            bordered
            columns={this.columns}
            dataSource={dataSource}
            loading={loading}
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

function mapStateToProps(state) {
  const { list, total, page, listState, pageSize } = state.student;
  return {
    loading: !!state.loading.models.student,
    list,
    listState,
    pageSize,
    total,
    page,
  };
}

export default connect(mapStateToProps)(Component);
