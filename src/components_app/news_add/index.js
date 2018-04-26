import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import { Spin, Form, message, Row, Col, Button, Modal } from 'antd';
import styles from './index.less';
import Well from '../../components_atom/well';
import FormComponents from '../../components_form';
import formatFormValue from '../../utils/format_form_value';
import QRCode from '../../components_atom/qrcode';
import buildColumnFormItem from '../../utils/build_column_form_item';
import Services from '../../services';
import formErrorMessageShow from '../../utils/form_error_message_show';
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
@connect(() => {
  return {};
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('news_add', this);
    const paramsId = _.get(props, 'match.params.id') * 1 || false;
    this.editInfo = {
      paramsId,
      text: false === paramsId ? '新增' : '编辑',
      method: false === paramsId ? 'create' : 'update',
    };

    this.state = {
      col: 24,
      formValidate: {},
      submitting: false,
      modalVisible: false,

      loading: true,
      dataSource: false,
    };

    this.columns = [
      {
        title: '封面图片',
        dataIndex: 'front_cover',
        render: (defaultValue) => {
          const uploaderProps = {
            initValue: defaultValue,
            options: {
              width: 300,
              height: 168,
            },
          };

          return (
            <FormComponents.ImageUploader {...uploaderProps} />
          );
        },
        rules: [{
          required: true, message: '必须上传封面图片',
        }],
      },
      {
        title: '文章标题',
        dataIndex: 'title',
        rules: [{
          required: true, message: '文章标题必填',
        }],
      },
      {
        title: '文章来源',
        dataIndex: 'source',
        rules: [{
          required: true, message: '文章来源必填',
        }],
      },
      {
        title: '作者',
        dataIndex: 'author',
        rules: [{
          required: true, message: '作者必填',
        }],
      },
    ];

    this.contentColumns = [
      {
        title: '',
        dataIndex: 'html_content',
        rules: [{
          required: true, message: '文章内容必填',
        }],
        style: {
          marginBottom: 0,
        },
        className: 'html_content',
        render: (text) => {
          return (<FormComponents.HtmlBraftEditor className="html_content_editor" content={text} />);
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
          name: '文章管理',
          url: Filters.path('news', {}),
        },
        {
          name: `${paramsId ? '编辑' : '新增'}文章`,
          url: paramsId ? Filters.path('news_edit', { id: paramsId }) : Filters.path('news_add', {}),
        },
      ],
    });

    if (paramsId) {
      // 编辑状态
      dispatch({
        type: 'post/detail',
        payload: { id: paramsId },
      }).then((res) => {
        this.setState({
          loading: false,
          dataSource: res.data,
        });
      }).catch((rej) => {
        message.error(rej.msg || '找不到该文章');
        this.setState({
          loading: false,
        });
      });
    }
    else {
      // 新增状态
      this.setState({
        loading: false,
        dataSource: {
          html_content: '',
        },
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
  successCallback = ({ preview, data }) => {
    let newOptions = {};
    if (preview) {
      newOptions = {
        modalVisible: true,
        modelText: `/news/preview/${data.preview_id}/`,
      };
    }
    else {
      newOptions = {
        modalVisible: false,
        modelText: '',
      };
    }
    this.setState({
      submitting: false,
      ...newOptions,
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

  handleModelClose = () => {
    this.setState({
      modalVisible: false,
    });
  }

  handleSubmit = (e, preview) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
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
        for (const [key, value] of Object.entries(values)) {
          formattedValues[key] = formatFormValue(value);
        }
        this.state.submitting = true;
        this.state.preview = preview;
        this.setState({
          submitting: true,
          preview,
        });
        this.handleSubmitRun({
          values: formattedValues,
          preview,
        });
      }
    });
  }

  handleSubmitRun = ({ values, preview }) => {
    const formData = {
      ...values,
    };
    let promise;
    if (preview) {
      promise = Services.post.preview(formData);
    }
    else if ('update' === this.editInfo.method) {
      promise = Services.post.update(this.editInfo.paramsId, formData);
    }
    else {
      promise = Services.post.create(formData);
    }
    promise.then((res) => {
      message.success(`${this.editInfo.text}文章成功`);
      this.successCallback({
        preview,
        data: {
          ...res.data,
        },
      });
      if (!preview) {
        this.props.history.push(Filters.path('news', {}));
      }
    }).catch((rej) => {
      const data = rej.data;
      if (data && data.html_content && data.html_content[0] && 'html content 不能大于 10000 个字符。' === data.html_content[0]) {
        // eslint-disable-next-line no-param-reassign
        data.html_content[0] = '文章内容不能大于10000个字符(包括样式)';
      }

      formErrorMessageShow(rej);
      this.errorCallback(data);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  renderForm() {
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

    const content = buildColumnFormItem({
      ...this.props,
      ...this.state,
      columns: this.contentColumns,
      shouldInitialValue: this.editInfo.paramsId,
      defaultValueSet: this.state.dataSource,
      formItemLayout: {},
      formValidate: this.state.formValidate,
      col: this.state.col,
      warpCol: false,
    });

    return (
      <Spin spinning={this.state.submitting}>
        <Form
          className="app-edit-form"
          onSubmit={this.handleSubmit}
        >
          <Well title={`${this.editInfo.text}文章`}>
            <Row gutter={40}>
              {children}
            </Row>
          </Well>
          <Well title="文章内容" free>
            {
              content.map((elem) => {
                return elem.render();
              })
            }
          </Well>
          <Well holderplace>
            <Row gutter={40}>
              <Col span={this.state.col}>
                <Form.Item {...formTailItemLayout}>
                  <Button size="default" type="primary" htmlType="submit" disabled={this.state.submitting} loading={this.state.submitting}>保存</Button>
                  &nbsp;&nbsp;
                  <Button onClick={this.handleSubmit.bind(this, {}, true)} size="default" htmlType="button" disabled={this.state.submitting} loading={this.state.submitting}>预览</Button>
                </Form.Item>
              </Col>
            </Row>
          </Well>
        </Form>

        <Modal visible={this.state.modalVisible} onCancel={this.handleModelClose} footer={null}>
          <div style={{ textAlign: 'center' }}>
            <p>链接： <a href={this.state.modelText} rel="noopener noreferrer" target="_blank">{this.state.modelText}</a></p>
            <br />
            <QRCode value={this.state.modelText} size={250} />
          </div>
        </Modal>
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
