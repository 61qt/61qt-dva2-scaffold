import moment from 'moment';
import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { message, Spin, Input, DatePicker, Radio, Button, Form } from 'antd';
// Select
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
      confirmDirty: false,
      parentsLength: 1,
    };
    this.columns = [];
  }

  componentDidMount = () => {
    const paramsId = this.editInfo.paramsId;
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '学生管理',
          url: Filters.path('student', {}),
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

  getFormColumns = () => {
    let columns = [
      {
        title: '头像',
        dataIndex: 'avatar',
        rowSpan: 5,
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
        // rules: [{
        //   required: true, message: '必须上传头像',
        // }],
      },
      {
        title: '姓名',
        dataIndex: 'name',
        rules: [{
          required: true, message: '姓名必填',
        }],
      },
      {
        title: '登录账号',
        dataIndex: 'username',
        rules: [{
          required: true, message: '姓名必填',
        }],
      },
      {
        title: '手机号',
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
        title: '身份证号',
        dataIndex: 'id_number',
      },
      {
        title: '学籍号',
        dataIndex: 'student_no',
      },
      {
        title: '所属机构',
        dataIndex: 'department_id',
        // colSpan: 2,
      },
      {
        title: '所属学校',
        dataIndex: 'school_id',
      },
      {
        title: '年级',
        dataIndex: 'grade',
      },
      {
        title: '班级',
        dataIndex: 'class_id',
      },
      // {
      //   title: '____入学年月',
      //   dataIndex: 'entrance_at',
      //   hiddenRule: true,
      // },
      {
        title: '入学年月',
        dataIndex: 'entrance_at',
        // colSpan: 2,
        render: () => {
          const format = 'YYYY-MM';
          const onChange = (date) => {
            let unix = 0;
            if (date && date.unix) {
              unix = moment(date.format(format), format).unix();
            }
            this.props.form.setFieldsValue({ entrance_at: unix });
          };

          return (<DatePicker.MonthPicker onChange={onChange} format={format} />);
        },
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
        title: '邮箱地址',
        dataIndex: 'email',
      },
      {
        title: 'QQ号',
        dataIndex: 'qq',
      },
    ];

    // 组装家长联系方式。
    _.each(_.range(0, this.state.parentsLength), (index) => {
      const readIndex = 1 + index;
      columns.push({
        title: `家长${1 === this.state.parentsLength ? '' : readIndex}姓名`,
        dataIndex: `parents[${index}].name`,
        colSpan: 2,
      });
      columns.push({

        title: `${1 === this.state.parentsLength ? '' : '家长'}${1 === this.state.parentsLength ? '' : readIndex} 联系方式`,
        dataIndex: `parents[${index}].phone`,
        colSpan: 2,
        inputNumberOptions: {
          // className 带有 ant-input-number-row 代表长度为 100% 。
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        zeroEmptyFlag: true,
      });
    });
    columns.push({
      title: null,
      dataIndex: '____parent_add',
      colSpan: 1,
      render: () => {
        const onAddClick = () => {
          const parentsLength = this.state.parentsLength * 1 || 0;
          this.setState({
            parentsLength: parentsLength + 1,
          });
        };

        const onRemoveClick = () => {
          let parentsLength = this.state.parentsLength * 1 || 0;
          if (2 > parentsLength) {
            parentsLength = 2;
          }

          this.setState({
            parentsLength: parentsLength - 1,
          });
        };

        return (<span>
          <Button type="primary" size="small" onClick={onAddClick}>增加一名家长</Button>
          &nbsp;&nbsp;
          {
            1 !== this.state.parentsLength ? (<Button type="danger" ghost size="small" onClick={onRemoveClick}>删除最后一名家长</Button>) : null
          }
        </span>);
      },
    });

    columns = columns.concat([
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
        colSpan: 2,
        extra: () => {
          return this.editInfo.paramsId ? '' : '如不填写密码则默认身份证后6位为初始密码';
        },
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
              callback('两次密码不一致');
            }
            else {
              callback();
            }
          },
        }],
        colSpan: 2,
        render: () => {
          const handleBlur = (e) => {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
          };

          return (<Input placeholder="请再次输入密码" type="password" onBlur={handleBlur} />);
        },
      },
    ]);

    this.columns = columns;
    return columns;
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
        if (values.entrance_at && values.entrance_at.unix) {
          const format = 'YYYY-MM';
          formattedValues.entrance_at = moment(values.entrance_at.format(format), format).unix();
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
        type: 'student/update',
        payload: {
          id: this.editInfo.paramsId,
          values: formData,
        },
      });
    }
    else {
      promise = this.props.dispatch({
        type: 'student/create',
        payload: {
          values: formData,
        },
      });
    }
    promise.then(() => {
      message.success(`${this.editInfo.text}学生成功`);
      this.successCallback();
      this.props.history.push(Filters.path('student', {}));
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
      columns: this.getFormColumns(),
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
