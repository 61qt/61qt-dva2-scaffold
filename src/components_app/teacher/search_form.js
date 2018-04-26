import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Button, Form, Input, Col, Row, Icon, Select } from 'antd';
import ComponentsForm from '../../components_form';
import buildListSearchFilter from '../../utils/build_list_search_filter';
import Filters from '../../filters';

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
      alias: 'like',
      tags: 'like',
    },
  });
}

@Form.create()
@connect((state) => {
  return {
    listState: _.get(state.teacher, 'listState') || {},
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('teacher_search_from', this);
    this.state = {
      expand: props.listState.expand || false,
      col: 12,
    };
    this.triggerHandleSubmit = _.debounce(this.triggerHandleSubmit, 200);
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
        <Form.Item {...formItemLayout} label="教师姓名">
          {
            getFieldDecorator('name')(<Input placeholder="姓名搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.col} key="alias">
        <Form.Item {...formItemLayout} label="对外尊称">
          {
            getFieldDecorator('alias')(<Input placeholder="对外尊称搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.col} key="phone">
        <Form.Item {...formItemLayout} label="联系电话">
          {
            getFieldDecorator('phone')(<Input placeholder="联系电话" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.col} key="department_id">
        <Form.Item {...formItemLayout} label="所属部门">
          {
            getFieldDecorator('department_id')(<ComponentsForm.ForeignSelect placeholder="所属部门" url="department" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear numberFormat />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.col} key="gender">
        <Form.Item {...formItemLayout} label="性别">
          {
            getFieldDecorator('gender')(<Select allowClear placeholder="选择">
              {
                Filters.dict(['teacher', 'gender']).map((elem) => {
                  return (<Select.Option value={`${elem.value}`} key={`gender_${elem.value}`}>{elem.label}</Select.Option>);
                })
              }
            </Select>)
          }
        </Form.Item>
      </Col>
    ));

    const expand = this.state.expand;
    const shownCount = 2;
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
            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
              { expand ? '收起' : '展开' } <Icon type={expand ? 'up' : 'down'} />
            </a>
          </Col>
        </Row>
      </Form>
    );
  }
}
