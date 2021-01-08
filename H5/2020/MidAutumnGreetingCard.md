# 中秋贺卡H5

地址外网

[http://media.perfect99.com/H5/2020/MidAutumnGreetingCard2020/](http://media.perfect99.com/H5/2020/MidAutumnGreetingCard2020/)

1. 初次打开没有参数，是发给店主的链接，之后会先生成默认参数，默认名称是`完美（中国）有限公司`，模板随机
1. 主要参数
    1. full，用HEX加密，可以生成字母和数字的组合，适合在url传播。这个参数包含
    ```javascript
       var data = {
           name: name,
           template: template,
       };
   // JSON.stringify后用HEX加密
    ```
1. 有full参数后会跳转到微信登录链接， 登录成功后会跳转回[www.perfect99.com上的链接](http://www.perfect99.com/weixinH5/2020/MidAutumnGreetingCard2020/)
1. 微信登录会有`nickname`和`avatar`（昵称和头像）两个参数，最后从`www.perfect99.com`上的链接带参数跳转到正式地址


![img](http://media.perfect99.com/H5/2020/MidAutumnGreetingCard2020/images/wxPreview/preview1.jpg)
