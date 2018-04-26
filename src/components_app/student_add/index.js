import moment from 'moment';
import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { message, Spin, Select, DatePicker, Radio, Button, Form } from 'antd';
import styles from './index.less';
import Services from '../../services';
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
    debugAdd('student_add', this);
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
    };
    this.columns = [
      {
        title: '学生头像',
        dataIndex: 'avatar',
        rowSpan: 4,
        render: (defaultValue) => {
          const newOptions = {
            initValue: defaultValue,
            options: {
              width: 150,
              height: 150,
            },
          };

          return (
            <FormComponents.ImageUploader {...newOptions} />
          );
        },
        initialValue: (text, dataSource) => {
          return dataSource.avatar || '';
        },
        shouldInitialValue: true,
        rules: [{
          required: true, message: '必须上传学生头像',
        }],
      },
      {
        title: '学生姓名',
        dataIndex: 'name',
        rules: [{
          required: true, message: '学生姓名必填',
        }],
      },
      {
        title: '出生日期',
        dataIndex: 'birthday',
        render: () => {
          return <DatePicker />;
        },
        initialValue: (text = moment().add(-10, 'year').unix()) => {
          return moment.unix(text);
        },
        rules: [{
          required: true, message: '必须选择出生日期',
        }],
      },
      {
        title: '性别',
        dataIndex: 'gender',
        render: () => {
          return (<Radio.Group options={Filters.dict(['student', 'gender'])} />);
        },
        rules: [{
          required: true, message: '必须选择性别',
        }],
      },
      {
        title: '学生手机',
        dataIndex: 'phone',
        inputNumberOptions: {
          // className 带有 ant-input-number-row 代表长度为 100% 。
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        zeroEmptyFlag: true,
      },
      {
        title: '主要联系人姓名',
        dataIndex: 'primary_name',
        rules: [{
          required: true, message: '必须填写主要联系人姓名',
        }],
      },

      {
        title: '主要联系人电话',
        dataIndex: 'primary_phone',
        inputNumberOptions: {
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        zeroEmptyFlag: true,
        rules: [{
          required: true, message: '必须填写主要联系人电话',
        }, {
          validator: (rule, value, callback) => {
            if (value && (13000000000 > value || 19999999999 < value)) {
              callback('手机号格式不正确');
            }
            callback();
          },
        }],
      },
      {
        title: '身份证号',
        dataIndex: 'id_number',
      },
      {
        title: '所在学校',
        dataIndex: 'school',
        render: () => {
          const options = {
            valueName: 'name', // 用于 options 的 value dataIndex ， 默认不传输为 id 。
            textName: 'name', // 用于 options 的 label dataIndex ， 默认不传输为 name 。
          };
          return (<FormComponents.ForeignSelect placeholder="所在学校" url="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear options={options} mode="combobox" />);
        },
      },
      {
        title: '次要联系人姓名',
        dataIndex: 'secondary_name',
        rules: [{
          validator: (rule, value, callback) => {
            props.form.validateFields(['secondary_phone'], { force: true });
            callback();
          },
        }],
      },
      {
        title: '次要联系人电话',
        dataIndex: 'secondary_phone',
        inputNumberOptions: {
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        zeroEmptyFlag: true,
        rules: [{
          validator: (rule, value, callback) => {
            if (value && (13000000000 > value || 19999999999 < value)) {
              callback('手机号格式不正确');
            }
            const secondaryName = props.form.getFieldValue('secondary_name');
            if ((!value && secondaryName) || (value && !secondaryName)) {
              callback('次要联系人姓名和次要联系人电话需要同时填写');
            }
            else {
              callback();
            }
          },
        }],
      },
      {
        title: '家庭住址',
        dataIndex: 'home_address',
        colSpan: 3,
      },
      {
        title: '邮箱地址',
        dataIndex: 'email',
      },
      {
        title: '来源',
        dataIndex: 'source',
        render: () => {
          return (<Select allowClear>
            {
              Filters.dict(['student', 'source']).map((elem) => {
                return (<Select.Option key={elem.value} value={elem.value}>{elem.label}</Select.Option>);
              })
            }
          </Select>);
        },
      },
      {
        title: '身高(cm)',
        dataIndex: 'height',
        inputNumberOptions: {
          min: 1,
          max: 300,
        },
        zeroEmptyFlag: true,
      },
      {
        title: '体重(kg)',
        dataIndex: 'weight',
        inputNumberOptions: {
          min: 1,
          max: 999,
        },
        zeroEmptyFlag: true,
      },

      {
        title: '鞋码',
        dataIndex: 'shoes',
        inputNumberOptions: {
          min: 1,
          max: 999,
        },
        zeroEmptyFlag: true,
      },

      {
        title: '民族',
        dataIndex: 'nation',
        render: () => {
          return (<Select allowClear>
            {
              Filters.dict(['nation']).map((elem) => {
                return (<Select.Option key={elem.value} value={elem.value}>{elem.label}</Select.Option>);
              })
            }
          </Select>);
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
          name: '学生管理',
          url: Filters.path('news', {}),
        },
        {
          name: `${paramsId ? '编辑' : '新增'}学生`,
          url: paramsId ? Filters.path('student_edit', { id: paramsId }) : Filters.path('student_add', {}),
        },
      ],
    });

    if (paramsId) {
      // 编辑状态
      dispatch({
        type: 'student/detail',
        payload: { id: paramsId },
      }).then((res) => {
        this.setState({
          loading: false,
          dataSource: res.data,
        });
      }).catch((rej) => {
        message.error(rej.msg || '找不到该学生');
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
    const form = this.props.form;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        formErrorMessageShow(err);
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
      promise = Services.student.update(this.editInfo.paramsId, formData);
    }
    else {
      promise = Services.student.create(formData);
    }
    promise.then(() => {
      message.success(`${this.editInfo.text}学生成功`);
      this.successCallback();
      const { location } = this.props;
      const dt = _.get(location, 'query.dt');
      if (dt) {
        this.props.history.replace(dt);
      }
      else {
        this.props.history.push(Filters.path('student', {}));
      }
    }).catch((rej) => {
      formErrorMessageShow(rej);
      this.errorCallback(rej.data);
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
          <DetailView titleClassName="text-align-right" className="small" col={500 > window.innerWidth ? 1 : 2} labelWidth="10em" expand={99999} dataSource={{}} columns={children} renderTitle={renderTitle} title={`${this.editInfo.text}学生`} />

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
