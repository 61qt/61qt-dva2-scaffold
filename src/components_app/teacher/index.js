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

class Component extends React.Component {
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
    dispatch({
      type: 'teacher/listState',
      payload: { },
    });
    dispatch({
      type: 'teacher/list',
      payload: { page: 1, filters: '' },
    });
  }

  pageChangeHandler = (page = this.props.page) => {
    const {
      dispatch,
      listState,
    } = this.props;
    dispatch({
      type: 'teacher/list',
      payload: { page, filters: listState.filters },
    });
  }

  handleSubmit = ({ filters, values }) => {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: 'teacher/listState',
      payload: { filters, searchValues: values },
    });
    dispatch({
      type: 'teacher/list',
      payload: { page: 1, filters },
    });
  }

  title = () => {
    const {
      total,
      listState,
    } = this.props;
    return (
      <div className="clearfix">
        <h3 className={styles.tableTitle} >
          教师列表
          { total ? <small>（共{total}条）</small> : null }
        </h3>

        <div className={styles.tableTitleAction}>
          <Access auth="teacher.store">
            <NavLink to={Filters.path('teacher_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增教师</Button>
            </NavLink>
          </Access>
          <span>
            <Access auth="teacher.export">
              <Download size="small" path="teacher/export" query={{ filter: listState.filters }}>导出列表</Download>
            </Access>
          </span>
        </div>

      </div>
    );
  }

  footer = () => {
    const {
      total,
      page: current,
      pageSize,
    } = this.props;
    return (
      <div className="clearfix">
        <Pagination
          showQuickJumper
          className="ant-table-pagination"
          total={total}
          current={current}
          pageSize={pageSize}
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
            size={768 > window.innerWidth ? 'small' : 'default'}
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
  const { list, total, page, listState, pageSize } = state.teacher;
  return {
    loading: !!state.loading.models.teacher,
    list,
    listState,
    pageSize,
    total,
    page,
  };
}

export default connect(mapStateToProps)(Component);
