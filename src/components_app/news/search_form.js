import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Button, Form, Input, Col, Row, Icon } from 'antd';
import buildListSearchFilters from '../../utils/build_list_search_filters';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};


function getFilter(values) {
  return buildListSearchFilters({
    values,
    formFilterMethod: {
      title: 'like',
      source: 'like',
      author: 'like',
    },
    rebuildFormFilterName: [],
    rebuildFormValueFunc: {},
    formFilterName: {},
  });
}

@Form.create()
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('news_search_from', this);
    this.state = {
      expand: false,
      col: 8,
    };
    this.triggerHandleSubmit = _.debounce(this.triggerHandleSubmit, 200);
  }

  componentWillMount = () => {}

  componentDidMount = () => {
    this.triggerHandleSubmit();
  }

  triggerHandleSubmit = () => {
    this.handleSubmit();
  }

  handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if ('function' === typeof this.props.handleSubmit) {
          this.props.handleSubmit({
            values,
            form: this.props.form,
            filter: getFilter(values),
            e,
          });
        }
      }
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  render() {
    const { getFieldDecorator } = this.props.form;

    // To generate mock Form.Item
    const children = [];
    children.push((
      <Col span={this.state.col} key="title">
        <Form.Item {...formItemLayout} label="文章标题">
          {
            getFieldDecorator('title')(<Input placeholder="文章标题搜索" />)
          }
        </Form.Item>
      </Col>
    ));
    children.push((
      <Col span={this.state.col} key="source">
        <Form.Item {...formItemLayout} label="文章来源">
          {
            getFieldDecorator('source')(<Input placeholder="文章来源搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.col} key="author">
        <Form.Item {...formItemLayout} label="作者">
          {
            getFieldDecorator('author')(<Input placeholder="作者搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    const expand = this.state.expand;
    const shownCount = 3;
    return (
      <Form
        className={`ant-advanced-search-form ${expand ? '' : 'is-close'}`}
        onSubmit={this.handleSubmit}
      >
        <Row gutter={40}>
          {children.slice(0, shownCount)}
        </Row>
        <Row className={!expand ? 'ant-hide' : ''} gutter={40}>
          {children.slice(shownCount)}
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Button type="primary" ghost htmlType="submit">搜索</Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
              重置
            </Button>
            <a className="ant-hide" style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
              { expand ? '收起' : '展开' } <Icon type={expand ? 'up' : 'down'} />
            </a>
          </Col>
        </Row>
      </Form>
    );
  }
}
