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
    debugAdd('admin_city_detail', this);
    Object.assign(this.state, {
      model: 'admin_city',
      modeLabel: '市级管理员',
    });
  }

  componentDidMountExtend = () => {
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
