import React from 'react';
import _ from 'lodash';
import { message, Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
import Download from '../../components_atom/download';
import Upload from '../../components_atom/upload';
import Access from '../../components_atom/access';
import Table from '../../components_atom/table';
import Services from '../../services';
import SearchForm, {
  getFilter,
} from '../../components_atom/search_form';
import FilterTree from '../../components_atom/filter_tree';
import PageLayout from '../../components_atom/page-layout';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('page', this);
    this.state = {
      // 搜索框的那个每一列的 col 长度，参考 grid
      searchCol: 12,
      // filter tree 的展开深度
      filterTreeDeep: 99999999,
      // 当前页面的展示的表(service 或者是 schema)的名称。
      model: 'admin_city',
      // 当前页面的展示的表(service 或者是 schema)的中文可读名称。
      modeLabel: '管理员',
      // 当前初始化就要使用到的查询条件。
      defaultSearchValue: {},
    };
  }

  componentDidMount = () => {
    if (__DEV__) {
      window.console.log('[componentDidMount] 如果需要配置导航条，需要在子类重新定义该方法');
    }
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

  getTableColumns = () => {
    if (__DEV__) {
      window.console.log('[getTableColumns] 如果需要配置页面 table，需要在子类重新定义该方法');
    }
    return null;
  }

  getTable = () => {
    const columns = this.getTableColumns();
    if (columns && columns.length) {
      return (<div>
        <Table
          data-bak-size={768 > window.innerWidth ? 'small' : 'default'}
          size="small"
          bordered
          columns={columns}
          dataSource={this.props.pageState.list}
          loading={this.props.loading}
          scroll={{ x: columns.reduce((a, b) => (a.width || a.minWidth || a || 0) + (b.width || b.minWidth || 0), 0), y: 300 > window.innerHeight - 310 ? 300 : window.innerHeight - 310 }}
          rowKey={record => record.id}
          pagination={false}
          title={this.title}
          footer={this.footer}
        />
      </div>);
    }
    return null;
  }

  getSearchColumn = () => {
    if (__DEV__) {
      window.console.log('[getSearchColumn] 如果需要配置搜索框，需要在子类重新定义该方法');
    }
    return null;
  }

  getSearchForm = () => {
    let showCount = 3;
    if (12 < this.state.searchCol * 1) {
      showCount = 1;
    }
    else if (12 === this.state.searchCol * 1) {
      showCount = 2;
    }
    else if (8 === this.state.searchCol * 1) {
      showCount = 3;
    }

    if (this.getSearchColumn) {
      return (<SearchForm
        handleSubmit={this.handleSubmit}
        form={this.props.form}
        defaultExpand={_.get(this.props.pageState, 'listState.expand') || false}
        defaultSearchValues={_.get(this.props.pageState, 'listState.searchValues') || {}}
        searchColumn={this.getSearchColumn()}
        showCount={showCount} />);
    }
    return null;
  }

  getSiderTree = () => {
    if (__DEV__) {
      window.console.log('[getSiderTree] 如果需要配置左侧搜索树，需要在子类重新定义该方法');
    }
    return null;
  }

  getSider = () => {
    if (this.getSiderTree()) {
      return (<FilterTree
        tree={this.getSiderTree()}
        deep={this.state.filterTreeDeep}
        onSelect={this.onSiderSelect}
        onCheck={this.onSiderCheck}
        checkable={false}
        multiple={false}
        defaultValue={_.get(this.props, 'pageState.listState.sideSelected') || []}
      />);
    }
    return null;
  }

  resetPage = () => {
    this.props.dispatch({
      type: `${this.state.model}/reset`,
    }).then(() => {
      this.props.history.push(Filters.path('loading', {}));
    });
  }

  pageChangeHandler = (page = this.props.pageState.page) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.state.model}/list`,
      payload: { page, filter: this.props.pageState.listState.filter },
    });
  }

  handleRemove = ({ record }) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.state.model}/remove`,
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
    Services[this.state.model].graphqlPatchUpdate('changeStatus', record.id, values).then(() => {
      message.success('设置成功');
      this.pageChangeHandler();
    }).catch(() => {
      message.success('设置成功');
      this.pageChangeHandler();
    });
  }

  handleSubmit = ({
    searchValues = _.get(this.props.pageState, 'listState.searchValues') || {},
    siderValues = _.get(this.props.pageState, 'listState.siderValues') || {},
    expand = _.get(this.props.pageState, 'listState.expand') || false,
    loadOldPage = false,
  }) => {
    const filter = getFilter({
      ...searchValues,
      ...siderValues,
      ...this.state.defaultSearchValue,
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${this.state.model}/listState`,
      payload: { filter, siderValues, searchValues, expand },
    });
    dispatch({
      type: `${this.state.model}/list`,
      payload: { page: loadOldPage ? this.props.pageState.page : 1, filter },
    });
  }

  title = () => {
    const { pageState = {} } = this.props;

    return (
      <div className="clearfix">
        <h3 className="table-title">
          {this.state.modeLabel}列表
          { pageState.total ? <small>（共{pageState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access data-bak-auth={`${this.state.model}.store`}>
            <Upload onUploaded={this.onUploaded} size="small" path={`${this.state.model}?upload`}>批量导入</Upload>
          </Access>
          <Access data-bak-auth={`${this.state.model}.export`}>
            <Download confirm="true" selectRow={this.columns} size="small" path={`${this.state.model}/export`} query={{ filter: _.get(pageState, 'listState.filter') }}>批量导出</Download>
          </Access>
          <Access data-bak-auth={`${this.state.model}.store`}>
            <NavLink to={Filters.path(`${this.state.model}_add`, {})}>
              <Button size="small" type="primary" ghost>新增</Button>
            </NavLink>
          </Access>
          <Download link="true" size="small" path={`${this.state.model}/export/template`}>下载模板</Download>
        </div>

      </div>
    );
  }

  footer = () => {
    const { pageState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{pageState.start} - {pageState.end}条记录，共 {pageState.total} 条数据</div>
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={pageState.total}
          current={pageState.page}
          pageSize={pageState.pageSize}
          showQuickJumper={false}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }

  render() {
    return (<PageLayout Sider={this.getSider()}>
      <div className={`${styles.normal}`}>
        { this.getSearchForm() }
        { this.getTable() }
      </div>
    </PageLayout>);
  }
}
