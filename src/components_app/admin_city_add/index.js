// import moment from 'moment';
// import _ from 'lodash';
import React from 'react';
import { connect } from 'dva';
import { Input, Form } from 'antd';
// Select, Radio, DatePicker
import FormComponents from '../../components_form';
import Filters from '../../filters';
import PageAdd from '../../components_default/page_add';


@Form.create()
@connect(() => {
  return {};
})
export default class Component extends PageAdd {
  constructorExtend = () => {
    debugAdd('admin_city_add', this);
    Object.assign(this.state, {
      confirmDirty: false,
      // 当前页面的展示的表(service 或者是 schema)的名称。
      model: 'admin_city',
      // 当前页面的展示的表(service 或者是 schema)的中文可读名称。
      modeLabel: '市级管理员',
    });
  }

  componentDidMountExtend = () => {
    const paramsId = this.editInfo.paramsId;
    this.props.dispatch({
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
  }

  getFormColumn = () => {
    const columns = [
      {
        title: '登录账号',
        dataIndex: 'username',
        rules: [{
          required: true, message: '必填',
        }],
      },
      {
        title: '省',
        dataIndex: '____province_id',
        render: () => {
          return (<FormComponents.AreaSelect areaParentId="1" placeholder="请选择" disabled />);
        },
        initialValue: () => {
          return 620000;
        },
        shouldInitialValue: true,
      },
      {
        title: '市',
        dataIndex: '____city_id',
        render: () => {
          return (<FormComponents.AreaSelect areaParentId="620000" placeholder="请选择" disabled />);
        },
        initialValue: () => {
          return 620700;
        },
        shouldInitialValue: true,
      },
      {
        title: '县',
        dataIndex: '____district_id',
        render: () => {
          return (<FormComponents.AreaSelect areaParentId="620700" placeholder="请选择" allowClear />);
        },
        hiddenRule: true,
      },
      {
        title: '学校',
        dataIndex: '____school_id',
        render: () => {
          return (<FormComponents.ForeignSelect placeholder="请选择" url="school" search={{ format: 'filter', name: 'name', method: 'like' }} allowClear />);
        },
        hiddenRule: true,
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
        rules: [{
          required: true, message: '必填',
        }],
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
          required: !this.editInfo.paramsId, message: this.editInfo.paramsId ? '' : '必填',
        }, {
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
          required: !this.editInfo.paramsId, message: this.editInfo.paramsId ? '' : '必填',
        }, {
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
        render: () => {
          const handleBlur = (e) => {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
          };

          return (<Input placeholder="请再次输入密码" type="password" onBlur={handleBlur} />);
        },
      },
    ];
    return columns;
  }
}
