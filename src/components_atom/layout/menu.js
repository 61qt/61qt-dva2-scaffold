import _ from 'lodash';
import jQuery from 'jquery';
import { Menu } from 'antd';
// Icon
import { connect } from 'dva';
import { NavLink } from 'dva/router';
import pluralize from 'pluralize';
import { checkAuthIsShow } from '../../components_atom/access';
import accessStyles from '../../components_atom/access/index.less';
import styles from './menu.less';

// 所有的菜单项目的队列存储。用于查询打开的点击菜单。
function getAllMenuItem(menu, parent) {
  if (!menu) {
    return [];
  }

  const newMenu = menu;
  if (parent) {
    newMenu.parent = parent;
  }
  if (menu && menu.child) {
    return [menu].concat(...menu.child.map((elem) => {
      return getAllMenuItem(elem, menu);
    }));
  }

  return [menu];
}

@connect((state) => {
  return {
    resource: state.all_resource,
    menuConfig: state.menu_config.menu,
  };
})
export default class Component extends React.Component {
  static defaultProps = {
    collapsed: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      theme: 'dark',
      unListen: () => {},
      // 用来查询快速查询是哪一个当前的 menu
      // 所有的菜单项目的队列存储。用于查询打开的点击菜单。
      allMenuItem: [].concat(...props.menuConfig.map((elem) => {
        return getAllMenuItem(elem);
      })),
    };
    Object.assign(this.state, {
      ...this.stateChange(),
    });
    debugAdd('menu', this);
  }

  componentDidMount = () => {
    this.state.unListen = this.props.history.listen(() => {
      this.setState({
        ...this.stateChange(),
      });
    });
    jQuery('body').addClass('menuFirstInit');
  }

  componentWillUnmount = () => {
    this.state.unListen();
  }

  onOpenChange = (openKeys) => {
    const state = this.state;
    const latestOpenKey = openKeys.find(key => !(-1 < state.openKeys.indexOf(key)));
    const latestCloseKey = state.openKeys.find(key => !(-1 < openKeys.indexOf(key)));

    let nextOpenKeys = [];
    if (latestOpenKey) {
      nextOpenKeys = this.getAncestorKeys(latestOpenKey).concat(latestOpenKey);
    }
    if (latestCloseKey) {
      nextOpenKeys = this.getAncestorKeys(latestCloseKey);
    }
    this.setState({ openKeys: nextOpenKeys });
  }

  onSubMenuMouseEnter = () => {
    jQuery('body').removeClass('menuFirstInit');
  }

  // 获取二级菜单的一级菜单
  getAncestorKeys = (key) => {
    const keys = [];
    let item = _.find(this.state.allMenuItem, {
      key,
    });

    if (item && item.child) {
      keys.push(item.key);
    }

    while (item && item.parent && item.parent.key) {
      keys.unshift(item.parent.key);
      item = item.parent;
    }

    return keys;
  }

  // 处理初始化的时候，如何使用菜单初始化的问题。
  // 这种情况为非hash ，另外的情况，需要进行针对的更改。
  stateChange = () => {
    jQuery('.ant-layout').scrollTop(0);
    const match = (_.get(window, 'location.pathname') || '').match(/\/app\/([^/?]*)/);
    if (!match) {
      return {
        openKeys: ['/'],
        selectedKeys: '/',
      };
    }

    const pathname = match[1];
    const newPathname = (pathname || '').replace(/^\//, '').replace(/\/$/, '');
    let key = newPathname;

    // 判断路径的单复数
    if (_.find(this.state.allMenuItem, {
      // 直接传值模式
      key: newPathname,
    })) {
      key = newPathname;
    }
    else if (_.find(this.state.allMenuItem, {
      // 转换成单数模式
      key: pluralize.plural(newPathname),
    })) {
      key = pluralize.plural(newPathname);
    }
    else if (_.find(this.state.allMenuItem, {
      // 转换成单数模式
      key: pluralize.singular(newPathname),
    })) {
      key = pluralize.singular(newPathname);
    }
    else {
      key = newPathname;
    }

    return {
      openKeys: this.getAncestorKeys(key || '/'),
      selectedKeys: key || '/',
    };
  }

  handleTitleClick = (e) => {
    if (__PROD__ && window.console && window.console.log) {
      window.console.log(e);
    }
  }

  handleClick = (e) => {
    jQuery('.ant-menu-submenu-active').removeClass('ant-menu-submenu-active');
    jQuery('.ant-menu-submenu.ant-menu-submenu-popup.ant-menu-dark.ant-menu-submenu-placement-rightTop').addClass('ant-menu-submenu-hidden');
    jQuery('.ant-menu-submenu.ant-menu-submenu-popup.ant-menu-dark.ant-menu-submenu-placement-rightTop .ant-menu').addClass('ant-menu-hidden');
    this.setState({ selectedKeys: e.key }, () => {
      jQuery('.ant-menu-submenu-active').removeClass('ant-menu-submenu-active');
      jQuery('.ant-menu-submenu.ant-menu-submenu-popup.ant-menu-dark.ant-menu-submenu-placement-rightTop').addClass('ant-menu-submenu-hidden');
      jQuery('.ant-menu-submenu.ant-menu-submenu-popup.ant-menu-dark.ant-menu-submenu-placement-rightTop .ant-menu').addClass('ant-menu-hidden');
    });
  }

  render() {
    const { resource, collapsed } = this.props;
    const menu = this.props.menuConfig.map((elem) => {
      let elemIsShow;
      if (!elem.resourceKey) {
        elemIsShow = true;
      }
      else {
        elemIsShow = checkAuthIsShow({
          auth: elem.resourceKey,
          resource,
        });
      }

      let child = '';
      if (elem && elem.child && elem.child.length) {
        child = elem.child.map((childElem) => {
          let childElemIsShow;
          if (!childElem.resourceKey) {
            childElemIsShow = true;
          }
          else {
            childElemIsShow = checkAuthIsShow({
              auth: childElem.resourceKey,
              resource,
            });
          }
          return (
            <Menu.Item className={`${childElemIsShow ? '' : accessStyles.accessHidden}`} key={childElem.key}>
              <NavLink to={`/app/${childElem.url}`} className="" title={childElem.name}>{childElem.name}</NavLink>
            </Menu.Item>
          );
        });

        // <Icon type={elem.icon} />
        return (
          <Menu.SubMenu onMouseEnter={this.onSubMenuMouseEnter} onTitleClick={this.handleTitleClick} className={`${elemIsShow ? '' : accessStyles.accessHidden}`} key={elem.key} title={<span><span className="" title={elem.name}>{elem.name}</span></span>}>
            {child}
          </Menu.SubMenu>
        );
      }
      // <Icon type={elem.icon} />
      return (
        <Menu.Item key={elem.key} className={`${elemIsShow ? '' : accessStyles.accessHidden}`}>
          <NavLink to={`/app/${elem.url}`} title={elem.name}>
            <span className="">{elem.name}</span>
          </NavLink>
        </Menu.Item>
      );
    });

    let height = window.innerHeight;
    height -= jQuery('.mainLayoutHeaderLogoContainer').outerHeight() || 0;
    height -= jQuery('.ant-layout-sider-trigger').outerHeight() || 0;
    const menuContainerStyle = {};
    const menuStyle = {};
    menuContainerStyle.height = height;
    menuContainerStyle.overflow = 'auto';
    if (collapsed) {
      const paddingBottom = 100;
      menuStyle.paddingBottom = paddingBottom;
    }

    return (<div className="mainLayoutMenuContainer" style={menuContainerStyle}>
      <Menu
        key={`menu_${JSON.stringify(collapsed)}`}
        inlineIndent={collapsed ? 0 : 24}
        theme={this.state.theme}
        mode={collapsed ? 'vertical' : 'inline'}
        openKeys={this.state.openKeys}
        selectedKeys={[this.state.selectedKeys]}
        onOpenChange={this.onOpenChange}
        onClick={this.handleClick}
        className={`${styles.normal || ''}`}
        style={menuStyle} >
        { menu }
      </Menu>
    </div>);
  }
}
