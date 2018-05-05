import React from 'react';
import _ from 'lodash';
import { connect } from 'dva';
import Filters from '../../filters';
import Area from '../../components_atom/area';
import PageDetail from '../../components_default/page_detail';

@connect((state) => {
  return {
    loading: !!state.loading.models.admin_city,
    pageDetail: state.admin_city.detail,
  };
})
export default class Component extends PageDetail {
  constructor(props) {
    super(props);
    this.state = {
      // detailView 展示的多少列
      detailViewCol: 1,
      // detail view 中的 label 宽度
      detailViewLabelWidth: '10em',
      // detail view 中的 展示行数
      detailViewExpand: 9999,
      // 当前页面的展示的表(service 或者是 schema)的名称。
      model: 'admin_city',
      // 当前页面的展示的表(service 或者是 schema)的中文可读名称。
      modeLabel: '市级管理员',
    };
    debugAdd('admin_city_detail', this);
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '市级管理员',
          url: Filters.path('admin_city', {}),
        },
        {
          name: '市级管理员详情',
          url: Filters.path('admin_city_detail', { id: _.get(this.props, 'match.params.id') }),
        },
      ],
    });

    dispatch({
      type: 'admin_city/detail',
      payload: {
        id: _.get(this.props, 'match.params.id'),
      },
    });
  }

  getDetailColumn = () => {
    const columns = [
      {
        title: '账号名称',
        dataIndex: 'username',
      },
      {
        title: '市',
        dataIndex: 'city_id',
        render: (text) => {
          return (<Area areaId={text} />);
        },
      },
      {
        title: '县',
        dataIndex: 'district_id',
        render: (text) => {
          return (<Area areaId={text} />);
        },
      },
      {
        title: '学校',
        dataIndex: 'school_id',
      },
      {
        title: '所属部门',
        dataIndex: 'department_id',
      },
      {
        title: '操作人',
        dataIndex: 'operator',
      },
      {
        title: '身份证号',
        dataIndex: 'id_number',
      },
      {
        title: '手机号码',
        dataIndex: 'phone',
        render: (text) => {
          return text || '';
        },
      },
      {
        title: 'Email',
        dataIndex: 'email',
      },
    ];
    return columns;
  }
}
