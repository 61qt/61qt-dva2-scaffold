import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Form, Input, Col, Select } from 'antd';
import ComponentsForm from '../../components_form';
import ComponentSearchForm, {
  formItemLayout,
} from '../../components_default/search_form';
import Filters from '../../filters';

@Form.create()
@connect((state) => {
  return {
    listState: _.get(state.student, 'listState') || {},
  };
})
export default class Component extends ComponentSearchForm {
  constructor(props) {
    super(props);
    debugAdd('student_search_from', this);
    this.state = {
      expand: props.listState.expand || false,
      showCount: 2,
    };
  }

  getSearchCol = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const children = [];
    const col = 12;
    children.push((
      <Col span={col} key="name">
        <Form.Item {...formItemLayout} label="姓名">
          {getFieldDecorator('name')(<Input size="small" placeholder="姓名搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="id">
        <Form.Item {...formItemLayout} label="学号">
          {getFieldDecorator('id')(<Input size="small" placeholder="学号搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="sng_admin_id">
        <Form.Item {...formItemLayout} label="课程顾问">
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
      <Col span={col} key="gender">
        <Form.Item {...formItemLayout} label="选择性别">
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
      <Col span={col} key="primary_name">
        <Form.Item {...formItemLayout} label="主要联系人姓名">
          {getFieldDecorator('primary_name')(<Input size="small" placeholder="主要联系人姓名" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="primary_phone">
        <Form.Item {...formItemLayout} label="主要联系人电话">
          {getFieldDecorator('primary_phone')(<Input size="small" placeholder="主要联系人电话" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="secondary_name">
        <Form.Item {...formItemLayout} label="次要联系人姓名">
          {getFieldDecorator('secondary_name')(<Input size="small" placeholder="次要联系人姓名" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="secondary_phone">
        <Form.Item {...formItemLayout} label="次要联系人手机">
          {getFieldDecorator('secondary_phone')(<Input size="small" placeholder="次要联系人手机" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="phone">
        <Form.Item {...formItemLayout} label="学生手机">
          {getFieldDecorator('phone')(<Input size="small" placeholder="学生手机" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="start_end_time">
        <Form.Item {...formItemLayout} label="出生日期">
          {getFieldDecorator('start_end_time')(<ComponentsForm.DateRange size="small" format="YYYY-MM-DD" />)}
        </Form.Item>
      </Col>
    ));

    return children;
  };
}
