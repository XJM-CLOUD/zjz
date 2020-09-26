//https://developers.weixin.qq.com/miniprogram/dev/devtools/sandbox.html
//获取应用实例 
let app = getApp();
let wechat = require("../utils/wechat");
let strIp = "http://2099.ink:8013";    
Page({
  data: {
    device: true,
    tempImagePath: "", // 拍照的临时图片
    camera: false,
    ctx: {},
    type: "takePhoto",
    startRecord: false,
    time: 0,
    timeLoop: "",
    loadingHidden: true
  },
  onLoad(option) {
    console.log("onLoad")
    console.log(option.orgPage);
    self = this;
    //选择相册导入进入
    if (option.orgPage=="photo"){
      console.log("选择相册导入进入")
      var tempImagePath="";
      const eventChannel = this.getOpenerEventChannel();
      eventChannel.on('acceptDataFromOpenerPage', function (data) {
        console.log(data.imagePath)
        tempImagePath = data.imagePath[0];
        console.log(tempImagePath)

  
        wechat.uploadFile(strIp + "/eam/fileLocal/upload", tempImagePath, "file")
          .then(d => {
            console.log(d);
            console.log(d.data);
            self.setData({
              tempImagePath: strIp + "/" + d.data,//res.tempImagePath,
              camera: false,
              loadingHidden: true
            });

          })
          .catch(e => {
            console.log(e);
          })
      })

      this.setData({
        camera: false,
        loadingHidden: false
      });
    }else{
      this.setData({
        ctx: wx.createCameraContext(),
        camera: true,
        type: 'takePhoto'
      })
    }
  },
  // 切换相机前后置摄像头  
  devicePosition() {
    this.setData({
      device: !this.data.device,
    })
    console.log("当前相机摄像头为:", this.data.device ? "后置" : "前置");
  },
  camera() {
    let { ctx, type, startRecord } = this.data;
    // 拍照  
    if (type == "takePhoto") {
      console.log("拍照");
      ctx.takePhoto({
        quality: "normal",
        success: (res) => {
          this.setData({
            camera: false,
            loadingHidden:false
          });
          wechat.uploadFile(strIp + "/eam/fileLocal/upload", res.tempImagePath, "file")
            .then(d => {
              console.log(d);
              console.log(d.data);
              var jsonstr = d.data
              console.log(d.data);
                  this.setData({
                    tempImagePath: strIp + "/" + d.data,//res.tempImagePath,
                    camera: false,
                    loadingHidden: true
                  });
              
            })
            .catch(e => {
              console.log(e);
            })
        },
        fail: (e) => {
          console.log(e);
        }
      })
    }
  },
  // 打开模拟的相机界面  
  open(e) {
    let { type } = e.target.dataset;
    console.log("开启相机准备", type == "takePhoto" ? "拍照" : "录视频");
    this.setData({
      camera: true,
      type:'takePhoto'
    })
  },
  // 关闭模拟的相机界面  
  close() {
    wx.redirectTo({
      url: '/photo/photo?id=1'
    })
    console.log("关闭相机");
    this.setData({
      camera: false
    })
  },
  onUnload: function () {
    console.log('返回------');
    wx.navigateBack({
      delta: 1
    })
  },
  saveImage: function(){
    console.log('保存------');
    var _this = this;
    wx.downloadFile({
      url: this.data.tempImagePath, //仅为示例，并非真实的资源
      success: function (res) {
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        console.log(res);
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function (data) {
              console.log(data);
            },
            fail: function (err) {
              console.log(err);
              if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
                console.log("用户一开始拒绝了，我们想再次发起授权")
                alert('打开设置窗口')
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
                    if (settingdata.authSetting['scope.writePhotosAlbum']) {
                      console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                    } else {
                      console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                    }
                  }
                })
              }
            }
          })
        }
      }
    })
  }
})  