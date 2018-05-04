import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Form, Input, Col, Select } from 'antd';
import ComponentsForm from '../../components_form';
import ComponentSearchForm, {
  searchFormItemLayout,
} from '../../components_default/search_form';
import Filters from '../../filters';

@Form.create()
@connect((state) => {
  return {
    listState: _.get(state.teacher, 'listState') || {},
  };
})
export default class Component extends ComponentSearchForm {
  constructor(props) {
    super(props);
    debugAdd('teacher_search_from', this);
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
        <Form.Item {...searchFormItemLayout} label="教师姓名">
          {getFieldDecorator('name')(<Input size="small" placeholder="姓名搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="alias">
        <Form.Item {...searchFormItemLayout} label="对外尊称">
          {getFieldDecorator('alias')(<Input size="small" placeholder="对外尊称搜索" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="phone">
        <Form.Item {...searchFormItemLayout} label="联系电话">
          {getFieldDecorator('phone')(<Input size="small" placeholder="联系电话" />)}
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="department_id">
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
      <Col span={col} key="gender">
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
  };
}
