//index.js
//获取应用实例
var timer
const app = getApp()

Page({
  data: {
    isImageReady: false,
    imageSrc: "",
    backImage: "../../assets/background.jpg",

    barrageBackImgSrc: "../../assets/barrage_back.png",
    barrageStyle: [],
    barrageflyDisplay: "none",
  },

  onLoad: function () {
    var that = this

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
  },

  onShow: function() {
    if (this.data.barrageStyle.length > 0){
      this.setData({
        barrageStyle: []
      })
    }

    var that = this
    //获取弹幕
    let texts = null

    wx.request({
      url: app.globalData.baseUrl + '/voice/list?page=0',
      method: 'GET',
      header: {
        'cookie': app.globalData.cookie
      },
      success: function (res) {
        console.info('Get barrage list status:')
        console.info(res)
        if (res.statusCode == 200 && res.data.code == 1 && res.data.data.length > 0) {
          for (let d of res.data.data) {
            console.log(d)
            that.shoot(d.greeting.content, d.user.avatarUrl, d.id)
          }
        } else {
          texts = ["123", "234", "345", "456", "678", "一二三四五六七八九十一二三四"]
          for (let i = 0; i < texts.length; i++) {
            that.shoot(texts[i], "", "")
          }
        }

        var barrageStyleArr = that.data.barrageStyle
        timer = setInterval(function () {
          for (var i = 0; i < barrageStyleArr.length; i++) {
            barrageStyleArr[i].left += barrageStyleArr[i].speed
            if (barrageStyleArr[i].left > that.data.phoneWidth) {
              barrageStyleArr[i].top = (Math.random()) * that.data.phoneHeight * 0.65
              barrageStyleArr[i].left = 0
              barrageStyleArr[i].speed = Math.random() * 20 + 10
            }
          }
          that.setData({
            barrageStyle: barrageStyleArr
          })

        }, 100);
      }
    })
  },

  onGotUserInfo: function (e) {
    clearInterval(timer)
    
    var that = this
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
              
              app.globalData.barrageStatus = that.data.barrageStyle
              wx.navigateTo({
                url: '../record/record'
              })
            }
            else{
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

  //是否打开弹幕... 
  openBarrage: function () {
    this.setData({
      barrageflyDisplay: "block",
    });
  },

  shoot: function (text, avatarURI, voiceId) {
    if (text.length > 10) {
      {
        text = text.slice(0, 9) + "..."
      }
    }

    //字体颜色随机
    // var textColor = "rgb(" + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + ")";
    var top = (Math.random()) * this.data.phoneHeight * 0.65;
    var barrageStyleObj = {
      top: top,
      text: text,
      color: "#FFFFFF",
      left: (Math.random()) * this.data.phoneWidth,
      speed: Math.random() * 3 + 8,
      avatar: avatarURI,
      voiceId: voiceId
    };
    var barrageStyleArr = this.data.barrageStyle;
    barrageStyleArr.push(barrageStyleObj);

    this.setData({
      barrageStyle: barrageStyleArr
    })
  },
})
