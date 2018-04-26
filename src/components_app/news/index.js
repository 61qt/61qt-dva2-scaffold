import React from 'react';
// import _ from 'lodash';
import { connect } from 'dva';
import { Modal, Pagination, Button } from 'antd';
import { NavLink } from 'dva/router';
import styles from './index.less';
import SearchForm from './search_form';
import Access from '../../components_atom/access';
import QRCode from '../../components_atom/qrcode';
import Table from '../../components_atom/table';
import Filters from '../../filters';

@connect((state) => {
  return {
    postState: state.post,
  };
})
export default class Component extends React.Component {
  constructor(props) {
    super(props);
    debugAdd('news', this);
    this.columns = [
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
    this.state = {
      modalVisible: false,
      modelText: '',
    };
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

  pageChangeHandler = (page = this.props.page) => {
    const { dispatch, postState } = this.props;
    dispatch({
      type: 'post/list',
      payload: { page, filter: postState.listState.filter },
    });
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

  handleSubmit = ({ filter, values }) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'post/listState',
      payload: { filter, searchValues: values },
    });
    dispatch({
      type: 'post/list',
      payload: { page: 1, filter },
    });
  }

  title = () => {
    const { postState } = this.props;
    return (
      <div className="clearfix">
        <h3 className={styles.tableTitle} >
          文章列表
          { postState.total ? <small>（共{postState.total}条）</small> : null }
        </h3>

        <div className={styles.tableTitleAction}>
          <Access auth="mobile.post.store">
            <NavLink to={Filters.path('news_add', {})} activeClassName="link-active">
              <Button size="small" type="primary" ghost>新增文章</Button>
            </NavLink>
          </Access>
        </div>

      </div>
    );
  }

  footer = () => {
    const { postState } = this.props;
    return (
      <div className="clearfix">
        <div className="ant-table-pagination-info">当前显示{postState.start} - {postState.end}条记录，共 {postState.total} 条数据</div>
        <Pagination
          showQuickJumper={false}
          className="ant-table-pagination ant-table-pagination-hide-last"
          total={postState.total}
          current={postState.page}
          pageSize={postState.pageSize}
          size="small"
          onChange={this.pageChangeHandler}
        />
      </div>
    );
  }

  render() {
    return (
      <div className={styles.normal}>
        <SearchForm handleSubmit={this.handleSubmit} />
        <br />
        <div>
          <Table
            size={768 > window.innerWidth ? 'small' : 'default'}
            bordered
            columns={this.columns}
            dataSource={this.props.postState.list}
            loading={this.props.loading}
            scroll={{ x: this.columns.reduce((a, b) => (a.width || a.minWidth || a || 0) + (b.width || b.minWidth || 0), 0), y: 300 > window.innerHeight - 310 ? 300 : window.innerHeight - 310 }}
            rowKey={record => record.id}
            pagination={false}
            title={this.title}
            footer={this.footer}
          />
        </div>

        <Modal visible={this.state.modalVisible} onCancel={this.handleModelClose} footer={null}>
          <div style={{ textAlign: 'center' }}>
            <p>链接： <a href={this.state.modelText} rel="noopener noreferrer" target="_blank">{this.state.modelText}</a></p>
            <br />
            <QRCode value={this.state.modelText} size={250} />
          </div>
        </Modal>
      </div>
    );
  }
}
