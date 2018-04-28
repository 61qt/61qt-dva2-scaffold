// import _ from 'lodash';
import React from 'react';
import { connect } from 'dva';
import { Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
import SearchForm from './search_form';
import Download from '../../components_atom/download';
import Upload from '../../components_atom/upload';
import Access from '../../components_atom/access';
import Table from '../../components_atom/table';

@connect((state) => {
  return {
    loading: !!state.loading.models.admin_school,
    adminSchoolState: state.admin_school,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('admin_school', this);
    this.columns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 100,
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 130,
      },
      {
        title: '登录账号',
        key: 'username',
        dataIndex: 'username',
        width: 130,
      },
      {
        title: '所属部门',
        key: 'department.name',
        dataIndex: 'department.name',
        width: 100,
      },
      {
        title: '角色',
        key: 'sng_role.name',
        dataIndex: 'sng_role.name',
        width: 100,
        render: (text) => {
          return text;
        },
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        width: 100,
        render: (text) => {
          return Filters.dict(['admin', 'status'], text);
        },
      },
      {
        title: '联系电话',
        key: 'phone',
        dataIndex: 'phone',
        minWidth: 110,
        render: (text) => {
          return text || '';
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 80,
        render: (text, record) => {
          return (<span className={styles.operation}>
            <Access data-bak-auth="admin_school.update">
              <NavLink to={Filters.path('admin_school_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
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
          name: '学校管理员管理',
          url: Filters.path('admin_school', {}),
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
      type: 'admin_school/reset',
    }).then(() => {
      this.props.history.push(Filters.path('loading', {}));
    });
  }

  pageChangeHandler = (page = this.props.adminSchoolState.page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'admin_school/list',
      payload: { page, filter: this.props.adminSchoolState.listState.filter },
    });
  }

  handleSubmit = ({ filter, values, expand, loadOldPage }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'admin_school/listState',
      payload: { filter, searchValues: values, expand },
    });
    dispatch({
      type: 'admin_school/list',
      payload: { page: loadOldPage ? this.props.adminSchoolState.page : 1, filter },
    });
  }

  title = () => {
    const { adminSchoolState } = this.props;
    return (
      <div className="clearfix">
        <h3 className={styles.tableTitle} >
          学校管理员列表
          { adminSchoolState.total ? <small>（共{adminSchoolState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access data-bak-auth="admin_school.store">
            <Upload onUploaded={this.onUploaded} size="small" path="admin_school?upload">批量导入</Upload>
          </Access>
          <Access data-bak-auth="admin_school.export">
            <Download confirm="true" selectRow={this.columns} size="small" path="admin_school/export" query={{ filter: adminSchoolState.listState.filter }}>批量导出</Download>
          </Access>
          <Access data-bak-auth="admin_school.store">
            <NavLink to={Filters.path('admin_school_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增学校管理员</Button>
            </NavLink>
          </Access>
          <Download link="true" size="small" path="admin_school/export/template">下载模板</Download>
        </div>
      </div>
    );
  }

  footer = () => {
    const { adminSchoolState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{adminSchoolState.start} - {adminSchoolState.end}条记录，共 {adminSchoolState.total} 条数据</div>
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={adminSchoolState.total}
          current={adminSchoolState.page}
          pageSize={adminSchoolState.pageSize}
          showQuickJumper={false}
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
            data-bak-size={768 > window.innerWidth ? 'small' : 'default'}
            size="small"
            bordered
            columns={this.columns}
            dataSource={this.props.adminSchoolState.list}
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
