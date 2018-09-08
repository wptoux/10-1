// pages/record/record.js
var timer;
var recordData;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hintImgSrc: "",
    hintText: "",
    isHintReady: false,

    barrageTextColor: "#D3D3D3",
    barrage_inputText: "none",
    barrage_shoottextColor: "black",
    bind_shootValue: "",
    barrage_style: [],
    barragefly_display: "none",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

    while(app.globalData.loginStatus === 0){
      setTimeout(() => {}, 30)
    }

    if (app.globalData.loginStatus === -1){
      return
    }

    //获取屏幕的宽度
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          phoneWidth: res.windowWidth,
          phoneHeight: res.windowHeight
        })
      }
    })
    this.openBarrage()

    //获取Hint
    wx.request({
      url: app.globalData.baseUrl + '/greeting/random',
      method: 'GET',
      header: {
        'cookie': app.globalData.cookie
      },
      success: (res) => {
        console.info('Get hint status:')
        console.info(res)
        if (res.statusCode == 200 && res.data.code == 1){
          that.setData({
            isHintReady: true,
            hintImgSrc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535798551&di=2ef16e231335625e1a51e898fc6cc612&imgtype=jpg&er=1&src=http%3A%2F%2Fwww.wallcoo.com%2Fcartoon%2FKitsunenoir_Design_Illustration_V%2Fwallpapers%2F2560x1440%2Fkim-holtermand-reflections.jpg",
            hintText: res.data.data.content
          })
        }
        else{
          that.setData({
            isHintReady: true,
            hintImgSrc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535798551&di=2ef16e231335625e1a51e898fc6cc612&imgtype=jpg&er=1&src=http%3A%2F%2Fwww.wallcoo.com%2Fcartoon%2FKitsunenoir_Design_Illustration_V%2Fwallpapers%2F2560x1440%2Fkim-holtermand-reflections.jpg",
            hintText: "祖国您好~"
          })
        }
      }
    })

    //获取弹幕
    let texts = null;

    wx.request({
      url: app.globalData.baseUrl + '/voice/list?page=0',
      method: 'GET',
      header: {
        'cookie': app.globalData.cookie
      },
      success: function(res) {
        console.info('Get list status:')
        console.info(res)
        if (res.statusCode == 200 && res.data.code == 1 && res.data.data.length > 0) {
          texts = res.data.data
        } else {
          texts = ["123", "234", "345", "456", "678", "789"]
        }

        for (var i = 0; i < texts.length; i++) {
          that.shoot(texts[i])
        }
      }
    })

    wx.getRecorderManager().onStop((res) => {
      console.info('Record result:')
      console.info(res)
      recordData = res.tempFilePath
      wx.navigateTo({
        url: '../share/share?record_data=' + encodeURI(recordData),
      })

    })
  },

  onRecordPressed: function(e) {
    const options = {
      // duration: 10000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3',
      frameSize: 50
    }
    wx.getRecorderManager().start(options)

    var barrage_style_arr = this.data.barrage_style;
    var that = this;
    timer = setInterval(function() {
      for (var i = 0; i < barrage_style_arr.length; i++) {
        barrage_style_arr[i].left += barrage_style_arr[i].speed;
        if (barrage_style_arr[i].left > that.data.phoneWidth) {
          barrage_style_arr[i].top = (Math.random()) * that.data.phoneHeight * 0.65;
          barrage_style_arr[i].left = 0;
          barrage_style_arr[i].speed = Math.random() * 20 + 10;
        }
      }
      that.setData({
        barrage_style: barrage_style_arr
      })

    }, 100);
  },
  onRecordReleased: function(e) {
    clearInterval(timer);
    wx.getRecorderManager().stop()
  },
  onRecordCancelled: function(e) {
    clearInterval(timer);
    wx.getRecorderManager().stop()
  },

  //是否打开弹幕... 
  openBarrage: function() {
    this.setData({
      barrageTextColor: "#04BE02",
      barrage_inputText: "flex",
      barragefly_display: "block",
    });
  },

  shoot: function(text) {
    //字体颜色随机
    var textColor = "rgb(" + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + ")";
    var top = (Math.random()) * this.data.phoneHeight * 0.65;
    var barrage_style_obj = {
      top: top,
      text: text,
      color: textColor,
      left: (Math.random()) * this.data.phoneWidth,
      speed: Math.random() * 20 + 10
    };
    var barrage_style_arr = this.data.barrage_style;
    barrage_style_arr.push(barrage_style_obj);

    this.setData({
      barrage_style: barrage_style_arr
    })
  },
})