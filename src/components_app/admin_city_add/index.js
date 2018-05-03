// import moment from 'moment';
import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { message, Input, Spin, Button, Form } from 'antd';
// Select, Radio, DatePicker
import styles from './index.less';
import FormComponents from '../../components_form';
import Filters from '../../filters';
import formErrorMessageShow from '../../utils/form_error_message_show';
import buildColumnFormItem from '../../utils/build_column_form_item';
import formatFormValue from '../../utils/format_form_value';
import DetailView from '../../components_atom/detail_view';

@Form.create()
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('admin_city_add', this);
    const paramsId = _.get(props, 'match.params.id') * 1 || false;
    this.editInfo = {
      paramsId,
      text: false === paramsId ? '新增' : '编辑',
      method: false === paramsId ? 'create' : 'update',
    };
    this.state = {
      expand: !!paramsId,
      col: 24,
      formValidate: {},
      submitting: false,
      loading: true,
      dataSource: false,
      confirmDirty: false,
    };
    this.columns = [
      {
        title: '登录账号',
        dataIndex: 'username',
        rules: [{
          required: true, message: '必填',
        }],
      },
      {
        title: '省',
        dataIndex: 'province_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="请选择" url="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear />);
        },
      },
      {
        title: '市',
        dataIndex: 'city_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="请选择" url="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear />);
        },
      },
      {
        title: '县',
        dataIndex: 'district_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="请选择" url="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear />);
        },
      },
      {
        title: '学校',
        dataIndex: 'school_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="请选择" url="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear />);
        },
      },
      {
        title: '所属部门',
        dataIndex: 'department_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="请选择" url="department" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear />);
        },
      },
      {
        title: '操作人',
        dataIndex: 'operator',
        rules: [{
          required: true, message: '必填',
        }],
      },
      {
        title: '身份证号',
        dataIndex: 'id_number',
      },
      {
        title: '手机号码',
        dataIndex: 'phone',
        inputNumberOptions: {
          // className 带有 ant-input-number-row 代表长度为 100% 。
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        zeroEmptyFlag: true,
        rules: [{
          required: true, message: '必填',
        }],
      },
      {
        title: 'Email',
        dataIndex: 'email',
      },
      {
        title: '密码',
        dataIndex: 'password',
        rules: [{
          validator: (rule, value, callback) => {
            const form = this.props.form;
            if (value && this.state.confirmDirty) {
              form.validateFields(['password_confirmation'], { force: true });
            }
            callback();
          },
        }],
        render: () => {
          return (<Input placeholder="请输入密码" type="password" />);
        },
      },
      {
        title: '确认密码',
        dataIndex: 'password_confirmation',
        rules: [{
          validator: (rule, value, callback) => {
            const form = this.props.form;
            if (value && value !== form.getFieldValue('password')) {
              callback('Two passwords that you enter is inconsistent!');
            }
            else {
              callback();
            }
          },
        }],
        render: () => {
          const handleBlur = (e) => {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
          };

          return (<Input placeholder="请再次输入密码" type="password" onBlur={handleBlur} />);
        },
      },
    ];
  }

  componentDidMount = () => {
    const paramsId = this.editInfo.paramsId;
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '市级管理员管理',
          url: Filters.path('admin_city', {}),
        },
        {
          name: `${paramsId ? '编辑' : '新增'}市级管理员`,
          url: paramsId ? Filters.path('admin_city_edit', { id: paramsId }) : Filters.path('admin_city_add', {}),
        },
      ],
    });

    if (paramsId) {
      // 编辑状态
      dispatch({
        type: 'user/detail',
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

  resetFormValidate = () => {
    const formValidate = {};
    this.columns.forEach((elem) => {
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
        type: 'user/update',
        payload: {
          id: this.editInfo.paramsId,
          values: formData,
        },
      });
    }
    else {
      promise = this.props.dispatch({
        type: 'user/create',
        payload: {
          values: formData,
        },
      });
    }
    promise.then((res) => {
      window.res = res;
      message.success(`${this.editInfo.text}学生成功`);
      this.successCallback();
      const { location } = this.props;
      // eslint-disable-next-line camelcase
      const redirect_uri = _.get(location, 'query.redirect_uri');
      // eslint-disable-next-line camelcase
      if (redirect_uri) {
        this.props.history.replace(redirect_uri);
      }
      else {
        this.props.history.push(Filters.path('student', {}));
      }
    }).catch((rej) => {
      window.rej = rej;
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

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  renderForm = () => {
    const children = buildColumnFormItem({
      ...this.props,
      ...this.state,
      columns: this.columns,
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
          <DetailView titleClassName="text-align-right" className="small" col={1} labelWidth="10em" expand={99999} dataSource={{}} columns={children} renderTitle={renderTitle} title={`${this.editInfo.text}学生`} />

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
    return (
      <div className={styles.normal}>
        <Spin spinning={this.state.loading}>
          { this.state.dataSource && !this.state.loading ? this.renderForm() : <div>正在加载</div>}
        </Spin>
      </div>
    );
  }
}
