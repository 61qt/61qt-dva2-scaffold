import _ from 'lodash';
import React from 'react';
import { connect } from 'dva';
import { Popconfirm, Form, Input, Col } from 'antd';
import { NavLink } from 'dva/router';

import Filters from '../../filters';
import Access from '../../components_atom/access';
import Area from '../../components_atom/area';
import { DICT } from '../../constants';
import PageList from '../../components_default/page_list';
import ComponentsForm from '../../components_form';
import { searchFormItemLayout } from '../../components_atom/search_form';

@Form.create()
@connect((state) => {
  return {
    areaState: state.area,
    loading: !!state.loading.models.admin_city,
    pageState: state.admin_city,
  };
})
export default class Component extends PageList {
  constructor(props) {
    super(props);
    debugAdd('admin_city', this);
    this.state = {
      searchCol: 12,
      filterTreeDeep: 1,
      model: 'admin_city',
      modeLabel: '市级管理员',
      defaultSearchValue: {},
    };
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

  getSearchColumn = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const children = [];

    children.push((
      <Col span={this.state.searchCol} key="city_id">
        <Form.Item {...searchFormItemLayout} label="城市">
          {
            getFieldDecorator('city_id')(<Input size="small" placeholder="选择城市" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="name">
        <Form.Item {...searchFormItemLayout} label="姓名">
          {
            getFieldDecorator('name')(<Input size="small" placeholder="姓名搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="school_id">
        <Form.Item {...searchFormItemLayout} label="$学校">
          {
            getFieldDecorator('school_id')(<ComponentsForm.ForeignSelectGraphql size="small" placeholder="$学校" table="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear numberFormat />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="operator">
        <Form.Item {...searchFormItemLayout} label="操作人">
          {
            getFieldDecorator('operator')(<Input size="small" placeholder="搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="phone">
        <Form.Item {...searchFormItemLayout} label="手机号码">
          {
            getFieldDecorator('phone')(<Input size="small" placeholder="手机号码" />)
          }
        </Form.Item>
      </Col>
    ));
    return children;
  }

  getTableColumns = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 100,
        render: (text, record) => {
          return (<span>
            <Access data-bak-auth="student.show">
              <NavLink to={Filters.path('student_detail', { id: record.id })} activeClassName="link-active">{record.id}</NavLink>
            </Access>
            {
              /*
                <Access data-bak-auth="!student.show">
                  <span>{record.id}</span>
                </Access>
              */
            }
          </span>);
        },
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
        render: (text, record) => {
          return (<span>
            <Access data-bak-auth="admin_city.show">
              <NavLink to={Filters.path('admin_city_detail', { id: record.id })} activeClassName="link-active">{record.username}</NavLink>
            </Access>

            {
              /*
                <Access data-bak-auth="!admin_city.show">
                  <span>{record.username}</span>
                </Access>
              */
            }
          </span>);
        },
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
          if (undefined === text) {
            return '';
          }
          return Filters.dict(['user', 'status'], text);
        },
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 140,
        render: (text, record) => {
          return (<span className="table-row-operation">
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
    return columns;
  }

  getSiderTree = () => {
    // todo add every node filter type
    const siderTree = _.get(this.props.areaState, 'key[620000].children');
    return siderTree;
  }
}
