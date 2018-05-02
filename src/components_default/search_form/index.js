import React from 'react';
import _ from 'lodash';
import { Button, Form, Col, Row, Icon } from 'antd';
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

export { formItemLayout };

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
      shownCount: 3,
    };
  }

  componentWillMount = () => {}

  componentDidMount = () => {
    this.props.form.setFieldsValue(this.props.listState.searchValues || {});
    this.triggerHandleSubmit();
  }

  getSearchCol = () => {
    return [];
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
    const expand = this.state.expand;
    const searchCol = this.getSearchCol();
    return (
      <Form
        className={`ant-advanced-search-form ant-advanced-search-form-small ${expand ? '' : 'is-close'}`}
        onSubmit={this.handleSubmit}
      >
        <Row gutter={40}>
          {searchCol.slice(0, this.state.shownCount)}
        </Row>
        <Row className={!expand ? 'ant-hide' : ''} gutter={40}>
          {searchCol.slice(this.state.shownCount)}
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
