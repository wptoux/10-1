//index.js
//获取应用实例
var timer
const app = getApp()

var barrageStyle = []

Page({
  data: {
    isImageReady: false,
    imageSrc: "",
    backImage: "../../assets/background.jpg",

    barrageBackImgSrc: "../../assets/barrage_back.png",
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
  },

  onShow: function () {
    if (barrageStyle.length > 0) {
      barrageStyle = []
    }

    var that = this
    //获取弹幕
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
          let arr = that.shuffle(res.data.data).slice(0, 15)
          for (let d of res.data.data) {
            console.log(d)
            if (d.originalRecognizedString == ''){
              that.shoot(d.greeting.content, d.user.avatarUrl, d.id)
            }
            else{
              that.shoot(d.originalRecognizedString, d.user.avatarUrl, d.id)
            }
          }
        } else {
          let texts = ["123", "234", "345", "456", "678", "一二三四五六七八九十一二三四"]
          for (let i = 0; i < texts.length; i++) {
            that.shoot(texts[i], "", "")
          }
        }

        timer = setInterval(function () {
          for (var i = 0; i < barrageStyle.length; i++) {
            barrageStyle[i].left += barrageStyle[i].speed

            if (barrageStyle[i].left > that.data.phoneWidth) {
              barrageStyle[i].top = (Math.random()) * that.data.phoneHeight * 0.65
              barrageStyle[i].left = 0
              barrageStyle[i].speed = Math.random() * 2 + 2
            }
          }

          that.drawBarrage(barrageStyle)
        }, 30);
      }
    })
  },

  onHide: function (e) {
    clearInterval(timer)
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

        app.globalData.userInfo = e.detail.userInfo

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

              app.globalData.barrageStatus = barrageStyle
              wx.navigateTo({
                url: '../record/record'
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

  drawBarrage: function(barrageStyle) {
    let c = wx.createCanvasContext('canvas', this)
    let px = this.data.phoneWidth / 750
    let rem = this.data.phoneWidth / 20

    function _drawItem(x, y, avatar, text){
      /*
      .barrage-fly-obj {
        position: absolute;
        width: 12.5rem;
        height: 2.5rem;
        overflow: hidden;
      }

      .barrage-content {
        position: absolute;
        top: 1.25rem;
        left: 2.1rem;
        width: 9rem;
        height: 1.5rem;
      }

      .barrage-content image {
        position: absolute;
        top: 0;
        left: 0;
        width: 1rem;
        height: 1rem;
      }

      .barrage-content text {
        position: absolute;
        top: 0;
        left: 1rem;
        width: 8rem;
        font-size: 0.8rem;
        text-align: right;
      }

      .barrage-back {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
      */
      
      c.drawImage("../../assets/barrage_back.png", x, y, 12.5 * rem, 2.5 * rem)
      c.drawImage(avatar, x + 2.1 * rem, y + 1.25 * rem, rem, rem)
      c.setFontSize(0.8 * rem)
      c.setFillStyle("#FFFFFF")
      c.setTextAlign('left')
      c.fillText(text, x + 3.5 * rem, y + 2 * rem, 8 * rem)
    }

    for (let i = 0; i < barrageStyle.length; i++){
      _drawItem(barrageStyle[i].left, barrageStyle[i].top, barrageStyle[i].avatar, barrageStyle[i].text)
    }

    c.draw()
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
      left: (Math.random()) * this.data.phoneWidth * 0.5,
      text: text,
      speed: Math.random() * 2 + 2,
      color: "#FFFFFF",
      avatar: avatarURI,
      voiceId: voiceId,
      animationObj: wx.createAnimation({
        duration: 1000
      }),
      animationData: {}
    };

    barrageStyle.push(barrageStyleObj);
  },
  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */
  shuffle: function (a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }
})
