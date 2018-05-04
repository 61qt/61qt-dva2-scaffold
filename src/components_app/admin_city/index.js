import _ from 'lodash';
import React from 'react';
import { connect } from 'dva';
import { message, Pagination, Popconfirm, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
import SearchForm from './search_form';
import Download from '../../components_atom/download';
import Upload from '../../components_atom/upload';
import Access from '../../components_atom/access';
import Area from '../../components_atom/area';
import Table from '../../components_atom/table';
import Services from '../../services';
import { DICT } from '../../constants';
import PageLayout from '../../components_atom/page-layout';
import FilterTree from '../../components_atom/filter_tree';
import {
  getFilter,
} from '../../components_default/search_form';

@connect((state) => {
  return {
    areaState: state.area,
    loading: !!state.loading.models.admin_city,
    adminCityState: state.admin_city,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('admin_city', this);
    this.state = {
      defaultSearchValue: {
        user_type: DICT.USER.USER_TYPE.CITY,
      },
    };
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
        render: (text) => {
          return (<Area areaId={text} />);
        },
      },
      {
        title: '操作人',
        key: 'operator',
        dataIndex: 'operator',
        width: 130,
      },
      {
        title: '手机号码',
        key: 'phone',
        dataIndex: 'phone',
        minWidth: 100,
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        width: 100,
        render: (text) => {
          return Filters.dict(['user', 'status'], text);
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 140,
        render: (text, record) => {
          return (<span className={styles.operation}>
            <Access data-bak-auth="admin_city.update">
              <NavLink to={Filters.path('admin_city_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
            </Access>
            <Access data-bak-auth="admin_city.destroy">
              <Popconfirm placement="left" title="确认要删除？" onConfirm={this.handleRemove.bind(this, { record })}>
                <a>删除</a>
              </Popconfirm>
            </Access>
            <Access data-bak-auth="admin_city.update">
              <span>
                <span className={DICT.USER.STATUS.BAN === record.status ? 'ant-hide' : ''}>
                  <Popconfirm placement="left" title="确认要禁用？" onConfirm={this.handleStatusChange.bind(this, { record, values: { status: DICT.USER.STATUS.BAN } })}>
                    <a>禁用</a>
                  </Popconfirm>
                </span>
                <span className={DICT.USER.STATUS.NORMAL === record.status ? 'ant-hide' : ''}>
                  <Popconfirm placement="left" title="确认要启用？" onConfirm={this.handleStatusChange.bind(this, { record, values: { status: DICT.USER.STATUS.NORMAL } })}>
                    <a>启用</a>
                  </Popconfirm>
                </span>
              </span>
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

  onSiderSelect = (selected) => {
    this.handleSubmit({
      siderValues: {
        city_id: selected[0] || selected,
      },
    });
  }

  onSiderCheck = (selected) => {
    window.console.log('onCheck', selected);
  }

  resetPage = () => {
    this.props.dispatch({
      type: 'admin_city/reset',
    }).then(() => {
      this.props.history.push(Filters.path('loading', {}));
    });
  }

  pageChangeHandler = (page = this.props.adminCityState.page) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'admin_city/list',
      payload: { page, filter: this.props.adminCityState.listState.filter },
    });
  }

  handleRemove = ({ record }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'admin_city/remove',
      payload: {
        id: record.id,
      },
    }).then(() => {
      message.success('删除成功');
      this.pageChangeHandler();
    }).catch(() => {
      message.success('删除成功');
      this.pageChangeHandler();
    });
  }

  handleStatusChange = ({ record, values }) => {
    Services.admin_city.graphqlPatchUpdate('changeStatus', record.id, values).then(() => {
      message.success('设置成功');
      this.pageChangeHandler();
    }).catch(() => {
      message.success('设置成功');
      this.pageChangeHandler();
    });
  }

  handleSubmit = ({
    searchValues = _.get(this.props.adminCityState, 'listState.searchValues') || {},
    siderValues = _.get(this.props.adminCityState, 'listState.siderValues') || {},
    expand = _.get(this.props.adminCityState, 'listState.expand') || false,
    loadOldPage = false,
  }) => {
    const filter = getFilter({
      ...searchValues,
      ...siderValues,
      ...this.state.defaultSearchValue,
    });

    const { dispatch } = this.props;
    dispatch({
      type: 'admin_city/listState',
      payload: { filter, siderValues, searchValues, expand },
    });
    dispatch({
      type: 'admin_city/list',
      payload: { page: loadOldPage ? this.props.adminCityState.page : 1, filter },
    });
  }

  title = () => {
    const { adminCityState } = this.props;
    return (
      <div className="clearfix">
        <h3 className="table-title">
          市级管理员列表
          { adminCityState.total ? <small>（共{adminCityState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access data-bak-auth="admin_city.store">
            <Upload onUploaded={this.onUploaded} size="small" path="admin_city?upload">批量导入</Upload>
          </Access>
          <Access data-bak-auth="admin_city.export">
            <Download confirm="true" selectRow={this.columns} size="small" path="admin_city/export" query={{ filter: adminCityState.listState.filter }}>批量导出</Download>
          </Access>
          <Access data-bak-auth="admin_city.store">
            <NavLink to={Filters.path('admin_city_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增市级管理员</Button>
            </NavLink>
          </Access>
          <Download link="true" size="small" path="admin_city/export/template">下载模板</Download>
        </div>
      </div>
    );
  }

  footer = () => {
    const { adminCityState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{adminCityState.start} - {adminCityState.end}条记录，共 {adminCityState.total} 条数据</div>
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={adminCityState.total}
          current={adminCityState.page}
          pageSize={adminCityState.pageSize}
          showQuickJumper={false}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }

  render() {
    const cityArr = _.get(this.props.areaState, 'key[620000].children');
    const Sider = (<FilterTree
      tree={cityArr}
      deep="1"
      onSelect={this.onSiderSelect}
      onCheck={this.onSiderCheck}
      checkable={false}
      multiple={false}
      defaultValue={_.get(this.props, 'adminCityState.listState.sideSelected') || []}
    />);

    return (<PageLayout Sider={Sider}>
      <div className={`${styles.normal}`}>
        <SearchForm handleSubmit={this.handleSubmit} />
        <div>
          <Table
            data-bak-size={768 > window.innerWidth ? 'small' : 'default'}
            size="small"
            bordered
            columns={this.columns}
            dataSource={this.props.adminCityState.list}
            loading={this.props.loading}
            scroll={{ x: this.columns.reduce((a, b) => (a.width || a.minWidth || a || 0) + (b.width || b.minWidth || 0), 0), y: 300 > window.innerHeight - 310 ? 300 : window.innerHeight - 310 }}
            rowKey={record => record.id}
            pagination={false}
            title={this.title}
            footer={this.footer}
          />
        </div>
      </div>
    </PageLayout>);
  }
}
