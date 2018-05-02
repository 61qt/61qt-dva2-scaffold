import React from 'react';
import _ from 'lodash';
// import moment from 'moment';
import { connect } from 'dva';
import { Form, Input, Col } from 'antd';
// Select
import CitySelect from '../../components_common/city_select';
import ComponentsForm from '../../components_form';
import ComponentSearchForm, { formItemLayout } from '../../components_default/search_form';
// import Filters from '../../filters';

@Form.create()
@connect((state) => {
  return {
    listState: _.get(state.admin_school, 'listState') || {},
  };
})
export default class Component extends ComponentSearchForm {
  constructor(props) {
    super(props);
    debugAdd('admin_school_search_from', this);

    this.state = {
      expand: props.listState.expand || false,
      showCount: 3,
    };
  }

  getSearchCol = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const col = 8;
    const children = [];

    children.push((
      <Col span={col} key="city_id">
        <Form.Item {...formItemLayout} label="城市">
          {
            getFieldDecorator('city_id')(<CitySelect />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="name">
        <Form.Item {...formItemLayout} label="姓名">
          {
            getFieldDecorator('name')(<Input size="small" placeholder="姓名搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="school_id">
        <Form.Item {...formItemLayout} label="学校">
          {
            getFieldDecorator('school_id')(<ComponentsForm.ForeignSelect size="small" placeholder="学校" url="admin" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear numberFormat />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="sng_admin_id">
        <Form.Item {...formItemLayout} label="操作人">
          {
            getFieldDecorator('sng_admin_id')(<ComponentsForm.ForeignSelect size="small" placeholder="操作人" url="admin" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear numberFormat />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="phone">
        <Form.Item {...formItemLayout} label="手机号码">
          {
            getFieldDecorator('phone')(<Input size="small" placeholder="手机号码" />)
          }
        </Form.Item>
      </Col>
    ));
    return children;
  }
}
