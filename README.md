# 前端调用摄像头并拍照上传。
封装了一个camera类。
可直接调用camera类下的getUserVideo方法来吊起媒体设备。该类需要配合layui使用。因为公司原因这里的js代码全是es5的语法。唯一的es6的语法就是使用了class。这是因为封装的时候便于维护。等后续有时间再重写一遍为es6语法。
## 使用方法.
1、引入js文件
<script src="./camera_class.js" />
2、
  const camera = new Camera();
  camera.addEvent(className);
  通过addEvent方法给按钮绑定点击事件，随后点击按钮就可以了。
