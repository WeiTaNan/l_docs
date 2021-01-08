# docsify系统相关 

[https://github.com/docsifyjs/docsify](https://github.com/docsifyjs/docsify)

> 本文档平台所使用的技术一览

## 修改

### docsify.js的sidebar会自动设置scrolltop，这部分代码需要注释，否则会和自动折叠插件相互冲突
```javascript
//在 docsify.js找到以下代码

// Scroll into view
if (!hoverOver && body.classList.contains('sticky')) {
  var height = sidebar.clientHeight;
  var curOffset = 0;
  var cur = active.offsetTop + active.clientHeight + 40;
  var isInView =
    active.offsetTop >= wrap.scrollTop && cur <= wrap.scrollTop + height;
  var notThan = cur - curOffset < height;
  var top$1 = isInView ? wrap.scrollTop : notThan ? curOffset : cur - height;

  sidebar.scrollTop = top$1;
}

```

## 插件

### 侧边栏折叠

- 目前使用插件使用
- https://github.com/iPeng6/docsify-sidebar-collapse

### 黑色主题/关灯模式等


#### 相关issue

- 有办法能将左边的文档目录配置成可折叠的吗？
- https://github.com/docsifyjs/docsify/issues/621

## 部署

### iis

- 在80端口的网站可以右键添加虚拟目录
- 添加markdown的mime

添加文件扩展名为 `.md`

添加MIME类型为 `text/x-markdown`
