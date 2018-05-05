import React from 'react';
// import _ from 'lodash';
import { connect } from 'dva';
import { Col, Form, Input, Modal } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import Access from '../../components_atom/access';
import QRCode from '../../components_atom/qrcode';
import Filters from '../../filters';
import PageList from '../../components_default/page_list';
import { searchFormItemLayout } from '../../components_atom/search_form';

@Form.create()
@connect((state) => {
  return {
    loading: !!state.loading.models.post,
    pageState: state.post,
  };
})
export default class Component extends PageList {
  constructor(props) {
    super(props);
    debugAdd('news', this);

    Object.assign(this.state, {
      searchCol: 12,
      filterTreeDeep: 1,
      model: 'post',
      modeLabel: '文章列表',
      defaultSearchValue: {
      },
      modalVisible: false,
      modelText: '',
    });
  }

  componentDidMount = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'breadcrumb/current',
      payload: [
        {
          name: '文章管理',
          url: Filters.path('news', {}),
        },
      ],
    });
  }

  getSearchColumn = () => {
    const getFieldDecorator = this.props.form.getFieldDecorator;
    const children = [];

    children.push((
      <Col span={this.state.searchCol} key="title">
        <Form.Item {...searchFormItemLayout} label="文章标题">
          {
            getFieldDecorator('title')(<Input size="small" placeholder="文章标题搜索" />)
          }
        </Form.Item>
      </Col>
    ));
    children.push((
      <Col span={this.state.searchCol} key="source">
        <Form.Item {...searchFormItemLayout} label="文章来源">
          {
            getFieldDecorator('source')(<Input size="small" placeholder="文章来源搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    children.push((
      <Col span={this.state.searchCol} key="author">
        <Form.Item {...searchFormItemLayout} label="作者">
          {
            getFieldDecorator('author')(<Input size="small" placeholder="作者搜索" />)
          }
        </Form.Item>
      </Col>
    ));

    return children;
  }

  getTableColumns = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'id',
        key: 'id',
        fixed: 'left',
        width: 100,
      },
      {
        title: '文章标题',
        dataIndex: 'title',
        key: 'title',
        fixed: 'left',
        width: 140,
      },
      {
        title: '创建日期',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 140,
      },
      {
        title: '修改日期',
        dataIndex: 'updated_at',
        key: 'updated_at',
        width: 140,
      },
      {
        title: '阅读数量',
        dataIndex: 'view_count',
        key: 'view_count',
        width: 90,
      },
      {
        title: '链接',
        dataIndex: 'link',
        key: 'link',
        render: (text, record) => {
          return (<a href={`#id=${record.id}`} rel="noopener noreferrer" target="_blank">打开</a>);
        },
        width: 60,
      },
      {
        title: '二维码',
        dataIndex: 'qrcode',
        key: 'qrcode',
        render: (text, record) => {
          return (<a onClick={this.handleModelOpen.bind(this, { record })}>二维码</a>);
        },
        width: 70,
      },
      {
        title: '作者',
        key: 'author',
        dataIndex: 'author',
        minWidth: 100,
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 80,
        render: (text, record) => (
          <span className={styles.operation}>
            <Access auth="mobile.post.update">
              <NavLink to={Filters.path('news_edit', { id: record.id })} activeClassName="link-active">编辑</NavLink>
            </Access>
          </span>
        ),
      },
    ];

    return columns;
  }

  handleModelClose = () => {
    this.setState({
      modalVisible: false,
    });
  }

  handleModelOpen = ({ record }) => {
    this.setState({
      modalVisible: true,
      modelText: `/news/${record.id}`,
    });
  }

  getFooter = () => {
    return (
      <Modal visible={this.state.modalVisible} onCancel={this.handleModelClose} footer={null}>
        <div style={{ textAlign: 'center' }}>
          <p>链接： <a href={this.state.modelText} rel="noopener noreferrer" target="_blank">{this.state.modelText}</a></p>
          <br />
          <QRCode value={this.state.modelText} size={250} />
        </div>
      </Modal>
    );
  }
}
