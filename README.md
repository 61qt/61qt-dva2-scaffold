管理系统脚手架
===

# 框架架构
各个运行方法基本上在 `package.json` 的 script 中有定义，跑一跑就清楚啥作用。
主要使用采用 (dva2)[https://github.com/dvajs/dva] 和 [antd](https://ant.design/index-cn) 进行框架的搭建，结合 redux 和 dva/redux 的 model 进行数据的存储(内存存储)，路由器采用 dva/router ，打包工具采用 dva 默认采用的 roadhog 。
因此需要掌握整个框架的思想，需要了解的内容有 React / React Router 4 / dva 全套 + roadhog / redux / antd 。
网站入口， `index.js` ，为 dva 的规则编写的。主要就是定义 model 及引入 router （还有拦截器、插件之类的，需要了解的话自行深入 dva 进行探索），之后所有的页面都基本上根据 router 进行加载，各个页面解耦分离，定于在 components_* 中。
主路由器放在 `src/routes` 中。


# 项目说明

## 分支说明

- dev: 主开发分支

## tag 说明（下面按时间倒叙）

- 0.1.0 暂时没打标签。。。

---

# 开发指南

## clone
git cline git@gitlab.61qt.cn:edu/zhangye-smart-edu-pc.git

## 安装依赖

- `yarn`
- 自行安装 nginx
- node，自行测试，我的版本是 9.6.1

## 配置 nginx
配置里面的 ${devRoot} ， ${moduleName} ， ${modulePort}

- ${devRoot} 为 项目根目录
- ${moduleName} 为某个系统的模块名称，如目前的 [cas, app] 模块
- ${modulePort} 为开启指令之后的端口，开发时候有效。

1、 打开 nginx 文件夹，复制 `nginx.conf.example` 为 `${moduleName}.conf`，更改上面的三个变量直接替换。

2、 在 nginx 程序的配置(mac os 上的路径基本为`/usr/local/etc/nginx/nginx.conf`)上 include 这个文件。例如
```
http{
  ...
  include /${projectRoot}/nginx/*.conf;
  ...
}
```
3、 重启 nginx

## 运行
- yarn run startApp
- yarn run startCas

本地绑定 host (nginx 中定义的文件)
然后打开 nginx 中对应的域名即可。

注意：开发使用的是自签发的 ssl 证书，所以必须点击继续访问才能进行。

## 发布
yarn run release
这个时候 `prod_` 开头的文件夹就是对应不同模块的打包文件。
