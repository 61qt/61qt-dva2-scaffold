import React from 'react';
import _ from 'lodash';
import { Button, Form, Input, Col, Row, Icon } from 'antd';
import buildListSearchFilter from '../../utils/build_list_search_filter';

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
  return buildListSearchFilter({
    values,
    formFilterMethod: {
      name: 'like',
    },
    rebuildFormFilterName: [],
    rebuildFormValueFunc: {
    },
    formFilterName: {
    },
  });
}


export default class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      col: 8,
    };
  }

  componentWillMount = () => {}

  componentDidMount = () => {
    this.props.form.setFieldsValue(this.props.listState.searchValues || {});
    this.triggerHandleSubmit();
  }

  triggerHandleSubmit = () => {
    this.handleSubmit({ loadOldPage: true });
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
            expand: this.state.expand,
            loadOldPage: _.get(e, 'loadOldPage') || false,
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
      <Col span={this.state.col} key="name">
        <Form.Item {...formItemLayout} label="名称">
          {
            getFieldDecorator('city_id')(<Input size="small" placeholder="名称搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    const expand = this.state.expand;
    const shownCount = 3;
    return (
      <Form
        className={`ant-advanced-search-form ant-advanced-search-form-small ${expand ? '' : 'is-close'}`}
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
            <Button size="small" type="primary" ghost htmlType="submit">搜索</Button>
            <Button size="small" style={{ marginLeft: 8 }} onClick={this.handleReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
              { expand ? '收起' : '展开' } <Icon type={expand ? 'up' : 'down'} />
            </a>
          </Col>
        </Row>
      </Form>
    );
  }
}
