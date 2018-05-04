import React from 'react';
import _ from 'lodash';
import { Button, Form, Col, Row, Icon } from 'antd';
import buildListSearchFilter from '../../utils/build_list_search_filter';

const searchFormItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

function getFilter(values, options = {}) {
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
    ...options,
  });
}

export { getFilter, searchFormItemLayout };

export default class Component extends React.Component {
  static defaultProps = {
  };
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      showCount: 3,
    };
    this.triggerHandleSubmit = _.debounce(this.triggerHandleSubmit, 300);
  }

  componentWillMount = () => {}

  componentDidMount = () => {
    this.triggerHandleSubmit = _.debounce(this.triggerHandleSubmit, 300);
    this.props.form.setFieldsValue(this.props.listState.searchValues || {});
    this.triggerHandleSubmit(true);
  }

  getSearchCol = () => {
    return [];
  }

  triggerHandleSubmit = (loadOldPage = true) => {
    this.handleSubmit({ loadOldPage });
  }

  handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if ('function' === typeof this.props.handleSubmit) {
          this.props.handleSubmit({
            searchValues: values,
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
          {searchCol.slice(0, this.state.showCount)}
        </Row>
        <Row className={!expand ? 'ant-hide' : ''} gutter={40}>
          {searchCol.slice(this.state.showCount)}
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
