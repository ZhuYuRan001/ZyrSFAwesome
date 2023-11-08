/**@class Camera 相机类 **/
class Camera {
    /**
     * @param {Element} video video dom
     * @param {Element} canvas canvas dom
     * @param {window} stream 媒体设备API
     * **/
    constructor() {
        this.video = null;
        this.canvas = null;
        this.stream = null;
    }
    getUserVideo(func) {
        var callback = func
        var that = this
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        if (navigator.getUserMedia) {
            navigator.getUserMedia({
                audio: false,
                video: {
                    width: 700,
                    height: 700
                }
            }, function (res) {
                if (document.querySelector('.Photo_video')) {
                    that.video = document.querySelector('.Photo_video')
                    video.style.display = 'block'
                } else {
                    that.video = document.createElement('video')
                    // document.querySelector('body').appendChild(video)
                }
                if (document.querySelector('.Photo_canvas')) {
                    that.canvas = document.querySelector('.Photo_canvas')
                } else {
                    that.canvas = document.createElement('canvas')
                }
                layer.open({
                    type: 1, // page 层类型
                    area: ['770px', '650px'],
                    title: '拍摄',
                    shade: 0.6, // 遮罩透明度
                    shadeClose: true, // 点击遮罩区域，关闭弹层
                    maxmin: true, // 允许全屏最小化
                    anim: 0, // 0-6 的动画形式，-1 不开启
                    content: `<div class="photo_box" style="padding:0 32px"></div>`,
                    btn: ['拍摄'],
                    btn1: function (index, layero) {
                        var event = window.event || arguments.callee.caller.arguments[0]
                        that.takePhoto(event, function (error, data) {
                            if (error) {

                            } else {
                                callback(data)
                            }
                        })
                        // layer.closeAll()
                    },
                    //关闭摄像头.并停止在video上继续播放媒体信息
                    end: function () {
                        if (that.stream && that.video) {
                            that.stream.getTracks().forEach(item => {
                                item.stop()
                            })
                            that.video.srcObject = null
                        }
                    }
                });
                that.canvas.style.display = 'none'
                var element = document.querySelector('.photo_box');
                element.appendChild(that.video)
                element.appendChild(that.canvas)
                that.stream = res
                that.video.srcObject = res
                that.video.className = 'Photo_video'
                that.canvas.className = 'Photo_canvas'
                that.video.play()
            }, function (err) {
                if (err.name == "NotReadableError" || err.name == "TrackStartError") {
                    layer.msg('媒体设备正在被占用，请关闭其他正在使用媒体设备的程序')
                } else if (err.name === 'NotAllowedError' || err.name == "PermissionDeniedError") {
                    layer.msg('获取授权失败！请授权')
                } else if (err.name === 'NotFoundError' || err.name === "DevicesNotFoundError") {
                    layer.name('无法找到媒体设备信息')
                }
            })
        } else {
            layer.msg('您的设备暂无或不支持媒体设备')
        }
        // var device =  window.navigator.mediaDevices
        // var promise = device ({
        //     audio:false,
        //     video:{
        //         width:500,
        //         height:500
        //     }
        // })    
        // promise.then(function (res) {
        //     var video = document.createElement('video')
        //     video.srcObject = res
        //     video.className = 'video'
        //     video.play()
        //     document.querySelector('body').appendChild(video)
        // }).catch(function (err) {
        // })
    }
    /**
     * @name 拍照。创建canvas元素并获取上下文环境。将video当前帧绘制到canvas元素内。使用canvas的toDataURL方法将canvas内容转为base64编码。转成form-data对象进行上传。
     * @method getContext 获取canvas上下文
     * @method drawImage 绘制canvas
     * @method toDataURL canvas内容转为base64编码
     * @method dataURLtoBlob base64转为blob对象
     * @name 如果在上传之前需要将拍摄后的照片进行预览可将创建好的canvas元素插入到指定dom下 document.querySelector('body').appendChild(canvas)
     *  **/
    takePhoto(event, callback) {
        var that= this
        this.video = document.querySelector('.Photo_video')
        this.canvas = document.querySelector('.Photo_canvas')
        var btn = document.querySelectorAll('.layui-layer-btn0')
        this.setStartStyle(btn)
        this.canvas.width = 700
        this.canvas.height = 700
        var ctx = this.canvas.getContext('2d')
        ctx.drawImage(this.video, 0, 0, 700, 700)
        var dataUrl = this.dataURLtoBlob(this.canvas.toDataURL('image/jpeg', 1))
        var formData = new FormData()
        formData.append('fileDocuments', dataUrl, 'camera.jpeg')
        var index = layer.load(0, { shade: false });
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://zyr-dev.wiki361.com/common/image/uploads?privateToken=HdDJ8FInWlAmB1NaVGVgVTA0ZWQ1ZTQ4MzRhMDM2MDBhOWQ3ZDEwNzRlYzkxOWJlNTJjYjYzOTRiOWY0NjI1NGE1YzJjMTMzYjkzNjRjOTZVXS+Od/PRJHsMyWFzcAsOFfGaGaRX8Qa/3J4X1ayOAoXWhLAoYYzuBW002J2gC8aBsb+npRNjujJEMIo4OXlm', true);
        xhr.send(formData);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                var data = JSON.parse(xhr.responseText);
                callback(null, data);
                if (data.code == '-1') {
                    layer.msg('上传成功')
                } else {
                    layer.msg(data.message)
                }
                layer.close(index)
                that.setEndStyle(btn)
            } else {
                callback(new Error('Network error: ' + xhr.status), null);
                that.setEndStyle(btn)
            }
        };
        xhr.onerror = function () {
            callback(new Error('Request failed'), null);
            that.setEndStyle(btn)
        };
    }

    /**
     * @name base64转blob对象.先将url转为二进制数据。
     * @name 再获取url中的源数据文件类型。
     * @name 使用Uint8Array创建一个与解码后的二进制数据长度一致的数组。
     * @name 循环数据。使用String.charCodeAt方法获取字符串对应索引下的字符Unicode值赋值给对应的数组元素中。
     * @name 最后返回一个blob对象
     * @method atob 将base64编码数据转为二进制数据
     * @method Uint8Array 传入数值制作一个相对应长度的Uint8Array数组
     * @method String.charCodeAt 传入数值获取字符串对应索引下的字符Unicode值
     * @method Blob 构造函数传入存储二进制数据的数组缓冲区和文件类型
     *  **/
    dataURLtoBlob(dataURL) {
        var byteString;
        if (dataURL.split(',')[0].indexOf('base64') >= 0) {
            byteString = atob(dataURL.split(',')[1]);
        } else {
            byteString = unescape(dataURL.split(',')[1]);
        }
        var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia.buffer], { type: mimeString });
    };
    setEndStyle(btn) {
        this.video.style.display = 'block'
        this.canvas.style.display = 'none'
        btn.forEach(function (item) {
            item.style.opacity = '1'
            item.style.pointerEvents = ''
        })
    }
    setStartStyle(btn) {
        this.video.style.display = 'none'
        this.canvas.style.display = 'block'
        btn.forEach(function (item) {
            item.style.opacity = '0.5'
            item.style.pointerEvents = 'none'
        })
    }
    addEvent(name) {
        var that = this
        document.querySelector('.' + name).addEventListener('click', function () {
            that.getUserVideo(function (data) {
                console.log(data);
            })
        })
    }
}