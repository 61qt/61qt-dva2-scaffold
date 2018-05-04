import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { message, Spin, Select, Cascader, Radio, Button, Form, Col, Row, Icon, Input } from 'antd';
import { DICT } from '../../constants';
import Well from '../../components_atom/well';
import PageLayout from '../../components_atom/page-layout';
import buildColumnFormItem from '../../utils/build_column_form_item';
import Filters from '../../filters';
import FormComponents from '../../components_form';
import styles from './index.less';
import Services from '../../services';
import formatFormValue from '../../utils/format_form_value';
import formErrorMessageShow from '../../utils/form_error_message_show';

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

const formTailItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 14, offset: 6 },
  },
};

@Form.create()
@connect((state) => {
  return {
    areaState: state.area,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('teacher_add', this);
    const paramsId = _.get(props, 'match.params.id') * 1 || false;
    this.editInfo = {
      paramsId,
      text: false === paramsId ? '新增' : '编辑',
      method: false === paramsId ? 'create' : 'update',
    };

    this.state = {
      expand: paramsId,
      col: 24,
      formValidate: {},
      submitting: false,

      loading: true,
      dataSource: false,
    };

    this.columns = [
      {
        title: '教师照片',
        dataIndex: 'avatar',
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
        rules: [{
          required: true, message: '请上传教师照片',
        }],
        initialValue: (text, dataSource) => {
          return dataSource.avatar || '';
        },
        shouldInitialValue: true,
      },
      {
        title: '教师姓名',
        dataIndex: 'name',
        render: () => {
          const { form } = this.props;
          const onBlur = () => {
            const name = form.getFieldValue('name');
            if (_.isEmpty(name)) {
              return;
            }

            const alias = `${name[0]}老师`;
            if (alias !== form.getFieldValue('alias')) {
              form.setFieldsValue({ alias });
            }
          };
          return (<Input placeholder="请输入教师姓名" onBlur={onBlur} />);
        },
        rules: [{
          required: true, message: '教师姓名必填',
        }],
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        inputNumberOptions: {
          className: 'ant-input-number-row',
          min: 13000000000,
          max: 19999999999,
        },
        zeroEmptyFlag: true,
        rules: [{
          required: true, message: '手机号必填',
        }],
      },
      {
        title: '对外尊称',
        dataIndex: 'alias',
        rules: [{
          required: true, message: '对外尊称必填',
        }],
      },
      {
        title: '所属部门',
        dataIndex: 'department_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="所属部门" url="department" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear numberFormat />);
        },
        zeroEmptyFlag: true,
        initialValue: (text) => {
          return text * 1 || undefined;
        },
      },
      {
        title: '所属专业',
        dataIndex: 'specialty_id',
        render: () => {
          return (<FormComponents.SpecialtyTreeSelect allowClear numberFormat />);
        },
        zeroEmptyFlag: true,
      },
      {
        title: '性别',
        dataIndex: 'gender',
        render: () => {
          return (<Radio.Group options={Filters.dict(['teacher', 'gender'])} />);
        },
        rules: [{
          required: true, message: '必须选择性别',
        }],
      },
      {
        title: '工作方式',
        dataIndex: 'work_type',
        render: () => {
          return (<Radio.Group options={Filters.dict(['teacher', 'work_type'])} />);
        },
        rules: [{
          required: true, message: '必须选择工作方式',
        }],
        zeroEmptyFlag: true,
      },
      {
        title: '是否可以承接班级',
        dataIndex: 'is_available',
        render: () => {
          return (<Radio.Group options={Filters.dict(['teacher', 'is_available'])} />);
        },
        rules: [{
          required: true, message: '必须选择是否可以承接班级',
        }],
      },
      {
        title: '是否本校教师',
        dataIndex: 'is_belong',
        render: () => {
          const disabled = 'update' === this.editInfo.method;
          const options = Filters.dict(['teacher', 'is_belong']).map((elem) => {
            return {
              ...elem,
              disabled,
            };
          });
          return (<Radio.Group options={options} />);
        },
        rules: [{
          required: true, message: '必须选择是否本校教师',
        }],
        extra: () => {
          return '新增教师时候才能设置';
        },
      },
      {
        title: '所属机构',
        dataIndex: 'institution_id',
        render: () => {
          const disabled = 'update' === this.editInfo.method;
          return (<FormComponents.ForeignSelect placeholder="所属机构" url="institution" disabled={disabled} search={{ format: 'filter', name: 'name', method: 'like' }} allowClear numberFormat />);
        },
        rules: [{
          required: true, message: '必须选择所属机构',
        }],
        removeRule: (text, dataSource, { form }) => {
          if (DICT.TEACHER.IS_BELONG.NO === form.getFieldValue('is_belong')) {
            return false;
          }

          return true;
        },
        extra: () => {
          return '新增教师时候才能设置';
        },
      },
      {
        title: '是否网上展示',
        dataIndex: 'is_display',
        render: () => {
          return (<Radio.Group options={Filters.dict(['teacher', 'is_display'])} />);
        },
        rules: [{
          required: true, message: '必须选择是否网上展示',
        }],
      },
      {
        title: '通讯住址',
        dataIndex: 'address',
      },
      {
        title: '籍贯省',
        dataIndex: 'native_province_id',
        hiddenRule: true,
      },
      {
        title: '籍贯市',
        dataIndex: 'native_city_id',
        hiddenRule: true,
      },
      {
        // 这个应该没有的。
        title: '籍贯区',
        dataIndex: 'native_district_id',
        hiddenRule: true,
      },
      {
        title: '籍贯',
        dataIndex: '____area',
        render: () => {
          const { form } = props;
          const onChange = (value) => {
            const options = {
              native_province_id: 0,
              native_city_id: 0,
              native_district_id: 0,
            };
            if (value && value.length) {
              Object.assign(options, {
                native_province_id: value[0],
                native_city_id: value[1],
                native_district_id: value[2],
              });
            }
            form.setFieldsValue(options);
          };
          return (<Cascader options={this.props.areaState.tree} onChange={onChange} />);
        },
        initialValue: (text, dataSource) => {
          const newValue = [dataSource.native_province_id, dataSource.native_city_id];
          return newValue;
        },
      },
      {
        title: '身份证号',
        dataIndex: 'id_card',
      },
      {
        title: '教育年资(年)',
        dataIndex: 'seniority',
        inputNumberOptions: {
          min: 0,
          max: 100,
        },
      },
      {
        title: '最高学历',
        dataIndex: 'edu_qualification',
        render: () => {
          return (<Select allowClear placeholder="选择">
            {
              Filters.dict(['teacher', 'edu_qualification']).map((elem) => {
                return (<Select.Option value={`${elem.value}`} key={`edu_qualification_${elem.value}`}>{elem.label}</Select.Option>);
              })
            }
          </Select>);
        },
        initialValue: (text) => {
          let newValue;
          if (undefined !== text && 0 !== text) {
            newValue = `${text}`;
          }
          return newValue;
        },
      },
      {
        title: 'tags',
        dataIndex: 'tags',
        hiddenRule: true,
      },
      {
        title: '标签',
        dataIndex: '____tags',
        render: () => {
          const handleChange = (value) => {
            this.props.form.setFieldsValue({
              tags: value.map((elem) => {
                return elem.trim();
              }).join(','),
            });
          };
          return (<Select
            mode="tags"
            style={{ width: '100%' }}
            searchPlaceholder="输入后按回车添加标签(1-5个字)"
            notFoundContent="输入后按回车添加标签(1-5个字)"
            onChange={handleChange}
          />);
        },
        initialValue: (text, dataSource) => {
          if (!dataSource) {
            return [];
          }
          else if (dataSource.tags) {
            return _.uniq(dataSource.tags.split(','), '');
          }
          else {
            return [];
          }
        },
      },
      {
        title: '政治面貌',
        dataIndex: 'political_face',
        render: () => {
          return (<Select allowClear placeholder="选择">
            {
              Filters.dict(['teacher', 'political_face']).map((elem) => {
                return (<Select.Option value={`${elem.value}`} key={`political_face_${elem.value}`}>{elem.label}</Select.Option>);
              })
            }
          </Select>);
        },
        initialValue: (text) => {
          let newValue;
          if (undefined !== text && 0 !== text) {
            newValue = `${text}`;
          }
          return newValue;
        },
      },
      {
        title: '邮箱',
        dataIndex: 'email',
      },
      {
        title: '工作经历',
        dataIndex: 'work_experience',
        render: () => {
          return (<Input.TextArea placeholder="请输入工作经历" />);
        },
      },
      {
        title: '获奖事迹',
        dataIndex: 'awards',
        render: () => {
          return (<Input.TextArea placeholder="请输入获奖事迹" />);
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: () => {
          return (<Input.TextArea placeholder="请输入备注" />);
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
          name: '教师管理',
          url: Filters.path('teacher', {}),
        },
        {
          name: `${paramsId ? '编辑' : '新增'}教师`,
          url: paramsId ? Filters.path('teacher_edit', { id: paramsId }) : Filters.path('teacher_add', { id: paramsId }),
        },
      ],
    });

    if (paramsId) {
      // 编辑状态
      dispatch({
        type: 'teacher/detail',
        payload: { id: paramsId },
      }).then((res) => {
        this.setState({
          loading: false,
          dataSource: res.data,
        });
      }).catch((rej) => {
        message.error(rej.msg || '找不到该教师');
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
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return formErrorMessageShow(err);
      }
      if (!err) {
        const formattedValues = {
          ...values,
        };
        for (const [key, value] of Object.entries(values)) {
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

  handleReset = () => {
    this.props.form.resetFields();
  }

  toggle = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  }

  handleSubmitRun = ({ values }) => {
    const formData = {
      ...values,
    };
    let promise;
    if ('update' === this.editInfo.method) {
      promise = Services.teacher.update(this.editInfo.paramsId, formData);
    }
    else {
      promise = Services.teacher.create(formData);
    }
    promise.then(() => {
      message.success(`${this.editInfo.text}教师成功`);
      this.successCallback();
      this.props.history.push(Filters.path('teacher', {}));
    }).catch((rej) => {
      formErrorMessageShow(rej);
      this.errorCallback(rej.data);
    });
  }

  renderForm = () => {
    const children = buildColumnFormItem({
      ...this.props,
      ...this.state,
      columns: this.columns,
      shouldInitialValue: this.editInfo.paramsId,
      defaultValueSet: this.state.dataSource,
      formItemLayout,
      formValidate: this.state.formValidate,
      col: this.state.col,
    });

    const expand = this.state.expand;
    const showCount = DICT.TEACHER.IS_BELONG.NO === this.props.form.getFieldValue('is_belong') ? 12 : 11;

    return (
      <Spin spinning={this.state.submitting}>
        <Form
          className={`app-edit-form ${expand ? '' : 'is-close'}`}
          onSubmit={this.handleSubmit}>
          <Well title={`${this.editInfo.text}教师`}>
            <Row gutter={40}>
              {children.slice(0, showCount)}
            </Row>
            <Row
              className={`${expand ? '' : 'ant-hide'}`}
              gutter={40}>
              {children.slice(showCount)}
            </Row>
          </Well>
          <Well holderplace>
            <Row gutter={40}>
              <Col span={this.state.col}>
                <Form.Item {...formTailItemLayout}>
                  <Button size="default" type="primary" htmlType="submit" disabled={this.state.submitting} loading={this.state.submitting}>保存</Button>
                  <Button size="default" style={{ marginLeft: 8 }} onClick={this.handleReset}>
                    重置
                  </Button>

                  <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                    { expand ? '收起' : '展开' } <Icon type={expand ? 'up' : 'down'} />
                  </a>
                </Form.Item>
              </Col>
            </Row>
          </Well>
        </Form>
      </Spin>
    );
  }

  render() {
    return (<PageLayout>
      <div className={styles.normal}>
        <Spin spinning={this.state.loading}>
          { this.state.dataSource && !this.state.loading ? this.renderForm() : <div>正在加载</div> }
        </Spin>
      </div>
    </PageLayout>
    );
  }
}
