import React from 'react';
import { connect } from 'dva';
import { Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
import Download from '../../components_atom/download';
import Upload from '../../components_atom/upload';
import Access from '../../components_atom/access';
import Table from '../../components_atom/table';

@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    window.console.log('p props', props);
    super(props);
    debugAdd('page', this);
    this.state = {
      model: 'student',
      modeLabel: '管理员',
      columns: [],
      modelState: {},
      loading: false,
    };
  }

  componentDidMount = () => {}

  onUploaded = (info) => {
    if (__DEV__) {
      window.console.log('info', info);
    }
    this.resetPage();
  }

  resetPage = () => {
    this.props.dispatch({
      type: `${this.state.model}/reset`,
    }).then(() => {
      this.props.history.push(Filters.path('loading', {}));
    });
  }

  pageChangeHandler = (page = this.state.modelState.page) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.state.model}/list`,
      payload: { page, filter: this.state.modelState.listState.filter },
    });
  }

  handleSubmit = ({ filter, values, expand, loadOldPage }) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${this.state.model}/listState`,
      payload: { filter, searchValues: values, expand },
    });
    dispatch({
      type: `${this.state.model}/list`,
      payload: { page: loadOldPage ? this.state.modelState.page : 1, filter },
    });
  }

  title = () => {
    return (
      <div className="clearfix">
        <h3 className="table-title">
          {this.state.modeLabel}列表
          { this.state.modelState.total ? <small>（共{this.state.modelState.total}条）</small> : null }
        </h3>

        <div className="table-title-action">
          <Access auth={`${this.state.model}.store`}>
            <Upload onUploaded={this.onUploaded} size="small" path={`${this.state.model}?upload`}>批量导入</Upload>
          </Access>
          <Access auth={`${this.state.model}.export`}>
            <Download confirm="true" selectRow={this.columns} size="small" path={`${this.state.model}/export`} query={{ filter: this.state.modelState.listState.filter }}>批量导出</Download>
          </Access>
          <Access auth={`${this.state.model}.store`}>
            <NavLink to={Filters.path(`${this.state.model}_add`, {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增{this.state.modelState}</Button>
            </NavLink>
          </Access>
          <Download link="true" size="small" path={`${this.state.model}/export/template`}>下载模板</Download>
        </div>

      </div>
    );
  }

  footer = () => {
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{this.state.modelState.start} - {this.state.modelState.end}条记录，共 {this.state.modelState.total} 条数据</div>
        <Pagination
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={this.state.modelState.total}
          current={this.state.modelState.page}
          pageSize={this.state.modelState.pageSize}
          showQuickJumper={false}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }


  render() {
    const SearchForm = this.state.SearchForm;
    return (
      <div className={`${styles.normal}`}>
        <SearchForm handleSubmit={this.handleSubmit} />
        <div>
          <Table
            data-bak-size={768 > window.innerWidth ? 'small' : 'default'}
            size="small"
            bordered
            columns={this.state.columns}
            dataSource={this.state.modelState.list}
            loading={this.state.loading}
            scroll={{ x: this.state.columns.reduce((a, b) => (a.width || a.minWidth || a || 0) + (b.width || b.minWidth || 0), 0), y: 300 > window.innerHeight - 310 ? 300 : window.innerHeight - 310 }}
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
