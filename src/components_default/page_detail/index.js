import React from 'react';
import _ from 'lodash';
import { NavLink } from 'dva/router';
import DetailView from '../../components_atom/detail_view';
import Filters from '../../filters';
import Access from '../../components_atom/access';
import PageLayout from '../../components_atom/page-layout';

import './index.less';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // detailView 展示的多少列
      detailViewCol: undefined,
      // detail view 中的 label 宽度
      detailViewLabelWidth: '10em',
      // detail view 中的 展示行数
      detailViewExpand: 9999,
      // 当前页面的展示的表(service 或者是 schema)的名称。
      model: 'admin_city',
      // 当前页面的展示的表(service 或者是 schema)的中文可读名称。
      modeLabel: '市级管理员',
    };
    debugAdd('page_detail', this);
  }

  componentDidMount = () => {
    if (__DEV__) {
      window.console.log('[componentDidMount] 如果需要配置导航条，需要在子类重新定义该方法');
      window.console.log('[componentDidMount] 如果需要获取页面详情，需要在子类重新定义该方法');
    }
  }

  getPageTitle = () => {
    if (__DEV__) {
      window.console.log('[getPageTitle] 如果需要配置页面标题，需要在子类重新定义该方法');
    }
    return (<h2>{_.get(this.props, 'pageDetail.name' || '')} - {this.state.modeLabel}信息详情</h2>);
  }

  getDetailViewTitle = () => {
    return (<div>
      <span>{ `${this.state.modeLabel}（${_.get(this.props, 'pageDetail.name' || '')}） 详情` }</span>
      <span className="float-right">
        <Access data-bak-auth={`${this.state.model}.update`}>
          <NavLink to={Filters.path(`${this.state.model}_edit`, { id: _.get(this.props, 'match.params.id') })} activeClassName="link-active">编辑</NavLink>
        </Access>
      </span>
    </div>);
  }

  getDetailColumn = () => {
    if (__DEV__) {
      window.console.log('[getDetailColumn] 如果需要配置页面详情列，需要在子类重新定义该方法');
    }
    return [];
  }

  getDataSource = () => {
    return this.props.pageDetail;
  }

  renderFooter = () => {
    return null;
  }

  render() {
    return (<PageLayout>
      <div className="page-detail-content">
        { this.getPageTitle() }
        <DetailView
          col={this.state.detailViewCol || 500 > window.innerWidth ? 1 : 2}
          labelWidth={this.state.detailViewLabelWidth || '10em'}
          expand={this.state.detailViewExpand || 99999}
          loading={this.props.loading || false}
          dataSource={this.getDataSource()}
          columns={this.getDetailColumn()}
          title={this.getDetailViewTitle()} />
        { this.renderFooter() }
      </div>
    </PageLayout>
    );
  }
}
