import React from 'react';
// import _ from 'lodash';
import { connect } from 'dva';
import { Col, Form, Input, Select } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Filters from '../../filters';
// import EditModal from './modal';
import Access from '../../components_atom/access';
import PageList from '../../components_default/page_list';
import ComponentsForm from '../../components_form';
import { searchFormItemLayout } from '../../components_atom/search_form';

@Form.create()
@connect((state) => {
  return {
    loading: !!state.loading.models.student,
    pageState: state.student,
  };
})
export default class Component extends PageList {
  constructor(props) {
    super(props);
    debugAdd('student', this);
    Object.assign(this.state, {
      searchCol: 12,
      filterTreeDeep: 1,
      model: 'student',
      modeLabel: '学生管理',
      defaultSearchValue: {
      },
    });
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
  }

  getSearchColumn = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const children = [];

    children.push((
      <Col span={this.state.searchCol} key="name">
        <Form.Item {...searchFormItemLayout} label="姓名">
          {getFieldDecorator('name')(<Input size="small" placeholder="姓名搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="id">
        <Form.Item {...searchFormItemLayout} label="学号">
          {getFieldDecorator('id')(<Input size="small" placeholder="学号搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="sng_admin_id">
        <Form.Item {...searchFormItemLayout} label="课程顾问">
          {
            getFieldDecorator('sng_admin_id')(<ComponentsForm.ForeignSelect
              size="small"
              placeholder="课程顾问"
              url="admin"
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
        <Form.Item {...searchFormItemLayout} label="选择性别">
          {
            getFieldDecorator('gender')(<Select size="small" allowClear placeholder="选择">
              {Filters.dict(['student', 'gender']).map((elem) => {
                return (
                  <Select.Option
                    value={`${elem.value}`}
                    key={`gender_${elem.value}`}
                  >
                    {elem.label}
                  </Select.Option>
                );
              })}
            </Select>)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="primary_name">
        <Form.Item {...searchFormItemLayout} label="主要联系人姓名">
          {getFieldDecorator('primary_name')(<Input size="small" placeholder="主要联系人姓名" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="primary_phone">
        <Form.Item {...searchFormItemLayout} label="主要联系人电话">
          {getFieldDecorator('primary_phone')(<Input size="small" placeholder="主要联系人电话" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="secondary_name">
        <Form.Item {...searchFormItemLayout} label="次要联系人姓名">
          {getFieldDecorator('secondary_name')(<Input size="small" placeholder="次要联系人姓名" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="secondary_phone">
        <Form.Item {...searchFormItemLayout} label="次要联系人手机">
          {getFieldDecorator('secondary_phone')(<Input size="small" placeholder="次要联系人手机" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="phone">
        <Form.Item {...searchFormItemLayout} label="学生手机">
          {getFieldDecorator('phone')(<Input size="small" placeholder="学生手机" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="start_end_time">
        <Form.Item {...searchFormItemLayout} label="出生日期">
          {getFieldDecorator('start_end_time')(<ComponentsForm.DateRange size="small" format="YYYY-MM-DD" />)}
        </Form.Item>
      </Col>
    ));

    return children;
  }

  getTableColumns = () => {
    const columns = [
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
          if (undefined === text) {
            return null;
          }
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
        width: 60,
        render: (text, record) => {
          return (<span className={styles.operation}>
            <Access auth="student.update">
              <NavLink to={Filters.path('student_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
            </Access>
          </span>);
        },
      },
    ];

    return columns;
  }
}
