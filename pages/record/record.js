// pages/record/record.js
var timer;
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginStatus: true,

    backImgSrc: "../../assets/background.jpg",

    shouldShowHint: false,
    hintImgSrc: "../../assets/文案库背景.png",
    hintText: "",

    barrageBackImgSrc: "../../assets/弹幕背景.png",
    barrageTextColor: "#D3D3D3",
    barrage_inputText: "none",
    barrage_shoottextColor: "black",
    bind_shootValue: "",
    barrage_style: [],
    barragefly_display: "none",

    btnImgSrc: "../../assets/语音话筒.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;

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

    this.getHint()

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
          for (let d of res.data.data){
            console.log(d)
            that.shoot(d.greeting.content, d.user.avatarUrl, d.id)
          }
        } else {
          texts = ["123", "234", "345", "456", "678", "789"]
          for (let i = 0; i < texts.length; i++) {
            that.shoot(texts[i], "")
          }
        }
      }
    })

    wx.getRecorderManager().onStop((res) => {
      console.info('Record result:')
      console.info(res)
      let recordFilePath = res.tempFilePath
      wx.navigateTo({
        url: '../share/share?recordFilePath=' + encodeURIComponent(recordFilePath),
      })

    })
  },

  onRecordPressed: function(e) {
    this.setData({
      shouldShowHint: true,
      btnImgSrc: "../../assets/话筒按下.png"
    })

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
    this.setData({
      btnImgSrc: "../../assets/语音话筒.png"
    })
    clearInterval(timer);
    wx.getRecorderManager().stop()
  },
  onRecordCancelled: function(e) {
    this.setData({
      btnImgSrc: "../../assets/语音话筒.png"
    })

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

  shoot: function(text, avatarURI, voiceId) {
    //字体颜色随机
    // var textColor = "rgb(" + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + ")";
    var top = (Math.random()) * this.data.phoneHeight * 0.65;
    var barrage_style_obj = {
      top: top,
      text: text,
      color: "#FFFFFF",
      left: (Math.random()) * this.data.phoneWidth,
      speed: Math.random() * 20 + 10,
      avatar: avatarURI,
      voiceId: voiceId
    };
    var barrage_style_arr = this.data.barrage_style;
    barrage_style_arr.push(barrage_style_obj);

    this.setData({
      barrage_style: barrage_style_arr
    })
  },

  getHint: function(){
    var that = this
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
        if (res.statusCode == 200 && res.data.code == 1) {
          if (res.data.data.content == that.data.hintText){
            that.getHint()
          }
          else{
            that.setData({
              hintText: res.data.data.content
            })
          }
        }
        else {
          that.setData({
            hintText: "祖国您好~"
          })
        }
      }
    })
  },

  onGotUserInfo: function (e) {
    var that = this;
    console.info("User Info:")
    console.log(e)
    // 登录
    wx.login({
      success: res => {
        console.info("WX Login status:")
        console.info(res)

        let params = e.detail.userInfo
        params['wxCode'] = res.code

        wx.request({
          url: app.globalData.baseUrl + '/user/login',
          data: params,
          method: 'POST',
          success: (resLogin) => {
            console.info("Server Login status:")
            console.info(resLogin)

            if (resLogin.statusCode == 200 && resLogin.data.code == 1) {
              app.globalData.cookie = resLogin.header['Set-Cookie']
              app.globalData.loginStatus = 1
              that.setData({
                loginStatus: true
              })
            }
            else {
              console.warn('Server login failed...')
              app.globalData.loginStatus = -1
            }
          },
          fail: () => {
            console.warn('Server login failed...')
            app.globalData.loginStatus = -1
          }
        })
      }
    })
  },
})