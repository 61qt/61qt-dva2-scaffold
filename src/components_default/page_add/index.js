// import moment from 'moment';
import React from 'react';
import _ from 'lodash';
import { message, Spin, Button, Form } from 'antd';
import Filters from '../../filters';
import formErrorMessageShow from '../../utils/form_error_message_show';
import buildColumnFormItem from '../../utils/build_column_form_item';
import formatFormValue from '../../utils/format_form_value';
import DetailView from '../../components_atom/detail_view';
import PageLayout from '../../components_atom/page-layout';

import './index.less';

export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('page_add', this);
    const paramsId = _.get(props, 'match.params.id') * 1 || false;
    this.editInfo = {
      paramsId,
      text: false === paramsId ? '新增' : '编辑',
      method: false === paramsId ? 'create' : 'update',
    };
    this.state = {
      // 当前页面的展示的表(service 或者是 schema)的名称。
      model: 'admin_city',
      // 当前页面的展示的表(service 或者是 schema)的中文可读名称。
      modeLabel: '市级管理员',
      col: 24,
      formValidate: {},
      submitting: false,
      loading: true,
      dataSource: false,
    };

    this.constructorExtend(props);
  }

  componentDidMount = () => {
    const paramsId = this.editInfo.paramsId;

    if (paramsId) {
      // 编辑状态
      this.props.dispatch({
        type: `${this.state.model}/detail`,
        payload: { id: paramsId },
      }).then((data) => {
        this.setState({
          loading: false,
          dataSource: data,
        });
      }).catch((rej) => {
        message.error(rej.msg || '找不到该数据');
        this.setState({
          loading: false,
        });
      });
    }
    else {
      // 新增状态
      this.setState({
        loading: false,
        dataSource: {},
      });
    }
  }

  getFormColumn = () => {
    if (__DEV__) {
      window.console.log('[getFormColumn] 如果需要配置表单列，需要在子类重新定义该方法');
    }
    return [];
  }

  componentDidMountExtend = () => {
    if (__DEV__) {
      window.console.log('[constructorExtend] 如果需要配置导航条，需要在子类重新定义该方法');
      window.console.log('[constructorExtend] 如果需要获取页面详情，需要在子类重新定义该方法');
    }
  }

  constructorExtend = () => {
    // constructor 的拓展
  }

  resetFormValidate = () => {
    const formValidate = {};
    this.getFormColumn().forEach((elem) => {
      const dataIndex = elem.key || elem.dataIndex;
      formValidate[dataIndex] = {};
    });

    this.setState({
      formValidate,
    });
  }

  // 提交表单正确时候的处理。
  successCallback = () => {
    this.setState({
      submitting: false,
    });
  }

  // 提交表单错误时候的处理。
  errorCallback = (value) => {
    window.console.log('value', value);
    const formValidate = this.state.formValidate;
    for (const [k] of Object.entries(formValidate)) {
      formValidate[k] = {};
    }

    for (const [k, v] of Object.entries(value)) {
      formValidate[k] = {
        validateStatus: 'error',
        help: _.get(v, '[0]') || v,
      };
    }
    this.setState({
      formValidate,
    });
    this.setState({
      submitting: false,
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.submitting) {
      message.info('正在提交');
      return;
    }
    this.resetFormValidate();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return formErrorMessageShow(err);
      }
      if (!err) {
        const formattedValues = {
          ...values,
        };
        if (values.birthday) {
          formattedValues.birthday = values.birthday
            .clone()
            .hour(0)
            .minute(0)
            .second(0)
            .unix();
        }
        for (const [key, value] of Object.entries(formattedValues)) {
          formattedValues[key] = formatFormValue(value);
        }
        this.state.submitting = true;
        this.setState({
          submitting: true,
        });
        this.handleSubmitRun({
          values: formattedValues,
        });
      }
    });
  }

  handleSubmitRun = ({ values }) => {
    const formData = {
      ...values,
    };
    let promise;
    if ('update' === this.editInfo.method) {
      promise = this.props.dispatch({
        type: `${this.state.model}/update`,
        payload: {
          id: this.editInfo.paramsId,
          values: formData,
        },
      });
    }
    else {
      promise = this.props.dispatch({
        type: `${this.state.model}/create`,
        payload: {
          values: formData,
        },
      });
    }
    promise.then(() => {
      message.success(`${this.editInfo.text}成功`);
      this.successCallback();
      this.props.history.push(Filters.path(`${this.state.model}`, {}));
    }).catch((rej) => {
      formErrorMessageShow(rej);
      let rejData = {};
      try {
        rejData = JSON.parse(_.get(rej, 'data.errors[0].debugMessage'));
      }
      catch (e) {
        // do nothing
      }

      this.errorCallback(rejData);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  renderForm = () => {
    const children = buildColumnFormItem({
      ...this.props,
      ...this.state,
      columns: this.getFormColumn(),
      shouldInitialValue: this.editInfo.paramsId,
      defaultValueSet: this.state.dataSource,
      formItemLayout: {},
      formValidate: this.state.formValidate,
      col: this.state.col,
      warpCol: false,
      label: false,
    });

    const renderTitle = (elem) => {
      const isRequired = _.find(elem.rules, {
        required: true,
      });
      return (<label htmlFor={elem.dataIndex} className={`${isRequired ? 'ant-form-item-required' : ''}`} title={elem.title}>{elem.title}</label>);
    };

    return (
      <Spin spinning={this.state.submitting}>
        <Form
          className="app-edit-form"
          onSubmit={this.handleSubmit}
        >
          <DetailView
            titleClassName="text-align-right"
            className="small"
            col={1}
            labelWidth="10em"
            dataSource={{}}
            columns={children}
            renderTitle={renderTitle}
            title={`${this.editInfo.text}资料`} />

          <br />
          <div>
            <Button size="default" type="primary" htmlType="submit" disabled={this.state.submitting} loading={this.state.submitting}>保存</Button>
            <Button size="default" style={{ marginLeft: 8 }} onClick={this.handleReset}>
              重置
            </Button>
          </div>
        </Form>
      </Spin>
    );
  }

  render() {
    return (<PageLayout>
      <div className="page-add-content">
        <Spin spinning={this.state.loading}>
          { this.state.dataSource && !this.state.loading ? this.renderForm() : <div>正在加载</div>}
        </Spin>
      </div>
    </PageLayout>);
  }
}
