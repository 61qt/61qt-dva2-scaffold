import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Form, Input, Col } from 'antd';
import ComponentSearchForm, { searchFormItemLayout } from '../../components_default/search_form';

@Form.create()
@connect((state) => {
  return {
    listState: _.get(state.post, 'listState') || {},
  };
})
export default class Component extends ComponentSearchForm {
  constructor(props) {
    super(props);
    debugAdd('news_search_from', this);
    this.state = {
      expand: props.listState.expand || false,
      showCount: 2,
    };
  }

  getSearchCol = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const children = [];
    const col = 8;

    children.push((
      <Col span={col} key="title">
        <Form.Item {...searchFormItemLayout} label="文章标题">
          {
            getFieldDecorator('title')(<Input size="small" placeholder="文章标题搜索" />)
          }
        </Form.Item>
      </Col>
    ));
    children.push((
      <Col span={col} key="source">
        <Form.Item {...searchFormItemLayout} label="文章来源">
          {
            getFieldDecorator('source')(<Input size="small" placeholder="文章来源搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={col} key="author">
        <Form.Item {...searchFormItemLayout} label="作者">
          {
            getFieldDecorator('author')(<Input size="small" placeholder="作者搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    return children;
  }
}
