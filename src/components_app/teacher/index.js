import React from 'react';
import { connect } from 'dva';
import { Col, Form, Input, Select } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
import Access from '../../components_atom/access';
import PageList from '../../components_default/page_list';
import { searchFormItemLayout } from '../../components_atom/search_form';
import ComponentsForm from '../../components_form';

@Form.create()
@connect((state) => {
  return {
    loading: !!state.loading.models.teacher,
    pageState: state.teacher,
  };
})
export default class Component extends PageList {
  constructor(props) {
    super(props);

    debugAdd('teacher', this);
    Object.assign(this.state, {
      searchCol: 12,
      model: 'teacher',
      modeLabel: '教师管理',
      defaultSearchValue: {},
    });
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
  }

  getSearchColumn = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const children = [];

    children.push((
      <Col span={this.state.searchCol} key="name">
        <Form.Item {...searchFormItemLayout} label="教师姓名">
          {getFieldDecorator('name')(<Input size="small" placeholder="姓名搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="alias">
        <Form.Item {...searchFormItemLayout} label="对外尊称">
          {getFieldDecorator('alias')(<Input size="small" placeholder="对外尊称搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="phone">
        <Form.Item {...searchFormItemLayout} label="联系电话">
          {getFieldDecorator('phone')(<Input size="small" placeholder="联系电话" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="department_id">
        <Form.Item {...searchFormItemLayout} label="所属部门">
          {
            getFieldDecorator('department_id')(<ComponentsForm.ForeignSelect
              size="small"
              placeholder="所属部门"
              url="department"
              search={{ format: 'filter', name: 'name', method: 'like' }}
              allowClear
              numberFormat
              />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="gender">
        <Form.Item {...searchFormItemLayout} label="性别">
          {
            getFieldDecorator('gender')(<Select
              size="small"
              allowClear
              placeholder="选择">
              {Filters.dict(['teacher', 'gender']).map((elem) => {
                return (
                  <Select.Option
                    value={`${elem.value}`}
                    key={`gender_${elem.value}`}
                  >
                    {elem.label}
                  </Select.Option>
                );
              })}
            </Select>)
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

    return columns;
  }
}
