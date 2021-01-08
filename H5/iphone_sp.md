## iphone 适配

1. 要显示一个元素，display不能为空字符串，要给明确的值如block, inline 等
1. 关于transform:rotate()在ios上不生效的坑：要旋转一个元素，给@keyframes和transform增加上-webkit-前缀来做兼容。必须在旋转的父元素上面增加transform: perspective(400);
1. 在ios 13.4中，微信浏览器使用html2canvas无任何反馈
    1. https://developers.weixin.qq.com/community/develop/doc/00006eee95488060bb1ac5bd85b000?page=2#comment-list
    1. https://github.com/niklasvh/html2canvas/issues/2191
    1. 解决办法 https://github.com/FEA-Dven/html2Canvas
