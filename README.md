# webapp
---------------

Single Page Application (单页应用) 前端页面控制程序。

需要 jQuery 1.7+ 支持。

可开发在 PC 和移动端，提高操作体验。

开发手册
---------------

### 配置

配置文字提示，默认是英文。
```js
$app.configText(function (text) {
    text.confirm = "确定";
    text.cancel = "取消";
    text.loading = "加载中";
});
```

配置设置，下面是连接超时时间（毫秒）。
```js
$app.configSetting(function (setting) {
    setting.timeover = 180000;
});

```

### 初始化

初始化需要指定加载内容的主视图区域和默认加载地址。
```js
var option = $app.init($("#ViewArea"), "/path");
```

初始化后返回的对象可以进一下更改初始化选项。

#### 认证选项
当加载的地址需要认证时，会触发此方法。
```js
option.unauthorized(function () {
    alert(encodeURIComponent(document.location.pathname + document.location.hash));
    return true;
})
```

#### 主视图区域
更改或获取主视图区域。
```js
option.viewNode($("#ViewArea"));
```

#### 默认加载地址
更改或获取加载地址。
```js
option.defaultLink("/path");
```

#### 处理默认的链接目标
默认值为真。
```js
option.dealLinkEmptyTarget(true);
```

#### 替换 PC 浏览器的滚动条
默认值为真。
```js
option.replacePCScrollBar(true);
```

### 链接目标

指定不同的 target，可实现叠加视图，视图关闭时，可以直接从缓存中显示出来。

#### 空值
等同 _base

#### _base
加载内容替换主视图。
```html
<a href="/path" target="_base">other</a>
```

#### _add
加载内容叠加到主视图区，主视图区的视图会被隐藏。
```html
<a href="/path" target="_add">add</a>
```

#### _same
替换同一层的视图。
```html
<a href="/path" target="_same">same</a>
```

#### _open
打开新的窗体视图。
```html
<a href="/path" target="_open">open</a>
```

### 功能样式

#### webapp-close
用于关闭弹出的视图或主视图的叠加视图。
```html
<a class="webapp-close">关闭</a>
```

#### webapp-loading
当滚动到此区域时，加载指定的网址内容替换此区域。
```html
<div class="webapp-loading" data-src="/path">加载中...</div>
```

### 对话框

不需要初始化可以使用的功能。

#### 警告框
替换 window.alert，支持标题和确认回调。
```js
$app.alert("text", function () { alert("other"); });
$app.alert("text", "title", function () { alert("other"); });
```

#### 确认框
支持标题，确认回调和取消回调。
```js
$app.confirm("text", function () { alert("confirm"); });
$app.confirm("text", function () { alert("confirm"); }, function () { alert("cancel"); });
$app.confirm("text", "title", function () { alert("confirm"); }, function () { alert("cancel"); });
```

#### 消息框
消息框不能手动关闭，需要脚本关闭，并支持更改内容。
```js
var message = $app.message("text");
message.change("other");
message.close();
```

### 视图事件

视图有加载，激活，失效和卸载事件，并提供视图 view，目标 target(有 main 和 open 两个值)和层级参数 level。

#### 加载事件
当加载地址到视图区时，触发加载事件。
```js
$app.event().onLoad(function (view, target, level) { });
```

#### 激活事件
当加载事件后或重新显示视图，触发激活事件。
```js
$app.event().onActive(function (view, target, level) { });
```

#### 失效事件
当视图被隐藏时，触发失效事件。
```js
$app.event().onInactive(function (view, target, level) { });
```

#### 卸载事件
当视图被关闭或替换时，触发卸载事件。
```js
$app.event().onUnload(function (view, target, level) { });
```

### 其它脚本方法

#### 链接方法

##### 更换地址
相当于链接的目标 _base。
```js
$app.hash("/path");
$app.baseHash("/path");
```

##### 叠加地址
相当于链接的目标 _add。
```js
$app.addHash("/path");
```

##### 替换当前地址
相当于链接的目标 _same。
```js
$app.sameHash("/path");
```

##### 重载当前主视图
```js
$app.reload();
```

##### 打开新的窗体视图
相当于链接的目标 _open。
```js
$app.open("/path");
```

##### 关闭或返回地址
```js
$app.close();
```

##### 加载提示
此方法显示的提示，需要手动隐藏。
```js
var loading = $app.loading();
loading.hide();
```

##### 判断脚本加载后执行
支持多个脚本地址。
```js
$app.loadScript("/path").done(function () { });
```