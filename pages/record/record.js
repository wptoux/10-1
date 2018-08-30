// pages/record/record.js
var timer;
var recordData;
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
  onLoad: function (options) {
    this.setData({
      isHintReady: true,
      hintImgSrc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535798551&di=2ef16e231335625e1a51e898fc6cc612&imgtype=jpg&er=1&src=http%3A%2F%2Fwww.wallcoo.com%2Fcartoon%2FKitsunenoir_Design_Illustration_V%2Fwallpapers%2F2560x1440%2Fkim-holtermand-reflections.jpg"
    })

    var that = this;
    //获取屏幕的宽度
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          phoneWidth: res.windowWidth,
          phoneHeight: res.windowHeight
        })
      }
    })
    this.openBarrage()

    var texts = ["123", "234", "345", "456", "678", "789"]
    for (var i = 0; i < texts.length; i++) {
      this.shoot(texts[i])
    }

    wx.getRecorderManager().onStop((res) => {
      recordData = res;
      wx.navigateTo({
        url: '../share/share?record_data=' + recordData,
      })

    })
  },

  onRecordPressed: function (e) {
    wx.getRecorderManager().start()
    var barrage_style_arr = this.data.barrage_style;
    var that = this;
    timer = setInterval(function () {
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
  onRecordReleased: function (e) {
    clearInterval(timer);
    wx.getRecorderManager().stop()
  },
  onRecordCancelled: function (e) {
    clearInterval(timer);
    wx.getRecorderManager().stop()
  },

  //是否打开弹幕... 
  openBarrage: function () {
    this.setData({
      barrageTextColor: "#04BE02",
      barrage_inputText: "flex",
      barragefly_display: "block",
    });
  },

  shoot: function (text) {
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