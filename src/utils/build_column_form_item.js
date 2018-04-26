import _ from 'lodash';
import { InputNumber, Col, Input, Form } from 'antd';
// formItemOptions

function buildColumnFormItem({
  columns = [],
  formValidate = {},
  defaultValueSet = {},
  shouldInitialValue = false,
  form,
  formItemLayout,
  col = 24,
  warpCol = true,
  label = true,
  size = 'default',
}) {
  const children = [];
  columns.forEach((elem) => {
    // 获取 elem 的配置。

    // 获取初始值，如果有特定的初始值初始化方法，就调用。
    let defaultValue = _.get(defaultValueSet, elem.dataIndex);
    if (elem.initialValue) {
      defaultValue = elem.initialValue(defaultValue, defaultValueSet, { form, text: defaultValue, dataSource: defaultValueSet });
    }
    // 如果值为零，就是代表填写为空，后端存储的为 int 型造成
    else if (elem.zeroEmptyFlag && (0 === defaultValue || '0' === defaultValue)) {
      defaultValue = '';
    }

    // 判断是否应该移除
    let rowIsRemove = false;
    if ('boolean' === typeof elem.removeRule) {
      rowIsRemove = elem.removeRule;
    }
    else if ('function' === typeof elem.removeRule) {
      rowIsRemove = elem.removeRule(defaultValue, defaultValueSet, { form, dataSource: defaultValueSet, text: defaultValue });
    }

    if (rowIsRemove) {
      return null;
    }

    let elemTitle = elem.title;
    if ('function' === typeof elemTitle) {
      elemTitle = elemTitle(defaultValue, defaultValueSet, { form, dataSource: defaultValueSet, text: defaultValue });
    }

    // 判断是否为隐藏表单列。
    let rowIsHide = false;
    if ('boolean' === typeof elem.hiddenRule) {
      rowIsHide = elem.hiddenRule;
    }
    else if ('function' === typeof elem.hiddenRule) {
      rowIsHide = elem.hiddenRule(defaultValue, defaultValueSet, { form, dataSource: defaultValueSet, text: defaultValue });
    }
    // 生成 from 表单展示的内容，默认为 input ，如果配置了 render ，就调用 render(defaultValue); 如果没配置 render 但是配置了 inputNumberOptions ，就输出 InputNumber
    let elemRender = null;
    if (elem.render) {
      elemRender = elem.render(defaultValue, defaultValueSet, { form, text: defaultValue, dataSource: defaultValueSet });
    }
    else if (elem.inputNumberOptions) {
      elemRender = (<InputNumber size={size} autoComplete="true" {...elem.props} {...elem.inputNumberOptions} disabled={elem.hidden} hidden={elem.hidden} placeholder={elem.placeholder || `请输入${elemTitle}`} />);
    }
    else if (elem.isInputTexteara) {
      elemRender = (<Input.TextArea autoComplete="true" size={size} {...elem.props} disabled={elem.hidden} hidden={elem.hidden} placeholder={elem.placeholder || `请输入${elemTitle}`} />);
    }
    else {
      elemRender = (<Input autoComplete="true" size={size} {...elem.props} disabled={elem.hidden} hidden={elem.hidden} placeholder={elem.placeholder || `请输入${elemTitle}`} />);
    }

    // getFieldDecorator options
    const options = {
      initialValue: undefined,
    };
    // 单个原始不允许设置成初始化。
    if (false === elem.shouldInitialValue) {
      // window.console.log('elem.shouldInitialValue false');
      options.initialValue = undefined;
    }
    // 单个原始允许设置成初始化。或者全部允许设置成初始化。
    else if (elem.shouldInitialValue || shouldInitialValue) {
      // window.console.log('elem.shouldInitialValue || shouldInitialValue true', options.initialValue);
      options.initialValue = defaultValue;
    }
    if (elem.rules) {
      options.rules = elem.rules;
    }
    const elemValidate = formValidate[elem.key || elem.dataIndex] || {};

    const formItemOptions = {
      className: elem.className,
      style: elem.style,
    };
    if (elem.extra) {
      formItemOptions.extra = elem.extra;
      if ('function' === typeof elem.extra) {
        formItemOptions.extra = elem.extra(defaultValue, defaultValueSet, { form, text: defaultValue, dataSource: defaultValueSet });
      }
    }

    const buildElemFormItemLayout = elem.formItemLayout || {
      ...formItemLayout,
    };
    const formItem = (<Form.Item key={elem.key || elem.dataIndex} {...formItemOptions} {...buildElemFormItemLayout} label={label ? elemTitle : ''} {...elemValidate} className={`${elem.className} ${rowIsHide ? 'ant-hide' : ''}`}>
      { form.getFieldDecorator(elem.dataIndex, options)(elemRender) }
    </Form.Item>);

    if (warpCol) {
      // 表单结构化。
      children.push((
        <Col {...formItemOptions} md={col} span={col} sm={24} xs={24} key={elem.key || elem.dataIndex} className={`${elem.className} ${rowIsHide ? 'ant-hide' : ''}`}>
          { formItem }
        </Col>
      ));
    }
    else {
      // 返回原来数据，自行组装。
      children.push({
        ...elem,
        rowIsHide,
        rowIsRemove,
        render: () => {
          if (rowIsRemove) {
            return null;
          }
          return formItem;
        },
      });
    }
  });

  return children;
}

export default buildColumnFormItem;
