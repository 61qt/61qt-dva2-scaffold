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
    loading: !!state.loading.models.user,
    userState: state.user,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('admin_city', this);
    this.columns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 100,
      },
      // {
      //   title: '名称',
      //   dataIndex: 'name',
      //   key: 'name',
      //   width: 130,
      // },
      {
        title: '账号',
        dataIndex: 'username',
        key: 'username',
        width: 130,
      },
      {
        title: '市',
        dataIndex: 'city_id',
        key: 'city_id',
        width: 100,
      },
      {
        title: '操作人',
        key: 'admin_id',
        dataIndex: 'admin_id',
        width: 130,
      },
      {
        title: '手机号码',
        key: 'phone',
        dataIndex: 'phone',
        minWidth: 100,
      },
      // {
      //   title: '状态',
      //   key: 'status',
      //   dataIndex: 'status',
      //   width: 100,
      //   render: (text) => {
      //     return Filters.dict(['user', 'status'], text);
      //   },
      // },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 140,
        render: (text, record) => {
          return (<span className={styles.operation}>
            <Access data-bak-auth="user.update">
              <NavLink to={Filters.path('admin_city_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
            </Access>
            <Access data-bak-auth="user.destroy">
              <a>删除</a>
            </Access>
            <Access data-bak-auth="user.update">
              <a>禁用</a>
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
          name: '市级管理员管理',
          url: Filters.path('admin_city', {}),
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
      type: 'user/reset',
    }).then(() => {
      this.props.history.push(Filters.path('loading', {}));
    });
  }

  pageChangeHandler = (page = this.props.userState.page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/list',
      payload: { page, filter: this.props.userState.listState.filter },
    });
  }

  handleSubmit = ({ filter, values, expand, loadOldPage }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/listState',
      payload: { filter, searchValues: values, expand },
    });
    dispatch({
      type: 'user/list',
      payload: { page: loadOldPage ? this.props.userState.page : 1, filter },
    });
  }

  title = () => {
    const { userState } = this.props;
    return (
      <div className="clearfix">
        <h3 className="table-title">
          市级管理员列表
          { userState.total ? <small>（共{userState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access data-bak-auth="user.store">
            <Upload onUploaded={this.onUploaded} size="small" path="user?upload">批量导入</Upload>
          </Access>
          <Access data-bak-auth="user.export">
            <Download confirm="true" selectRow={this.columns} size="small" path="user/export" query={{ filter: userState.listState.filter }}>批量导出</Download>
          </Access>
          <Access data-bak-auth="user.store">
            <NavLink to={Filters.path('admin_city_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增市级管理员</Button>
            </NavLink>
          </Access>
          <Download link="true" size="small" path="user/export/template">下载模板</Download>
        </div>
      </div>
    );
  }

  footer = () => {
    const { userState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{userState.start} - {userState.end}条记录，共 {userState.total} 条数据</div>
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={userState.total}
          current={userState.page}
          pageSize={userState.pageSize}
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
            dataSource={this.props.userState.list}
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
