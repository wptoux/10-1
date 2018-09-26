// pages/record/record.js
const app = getApp()
var recordeStatus = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loginStatus: true,

    backImgSrc: "../../assets/background.jpg",

    shouldShowHint: false,
    hintImgSrc: "../../assets/hint_back.png",
    hintText: "",

    btnImgSrc: "../../assets/recorder.png",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    if (app.globalData.loginStatus === -1) {
      return
    }

    this.getHint()

    //获取屏幕的宽度
    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          phoneWidth: res.windowWidth,
          phoneHeight: res.windowHeight
        })
      }
    })

    wx.getRecorderManager().onStop((res) => {
      if (recordeStatus == 0) {
        console.info('Record result:')
        console.info(res)
        let recordFilePath = res.tempFilePath

        wx.uploadFile({
          url: app.globalData.baseUrl + '/voice/recognize',
          filePath: recordFilePath,
          name: 'file',
          header: {
            'cookie': app.globalData.cookie
          },
          success: function (res) {
            console.info('Recognize result:')
            console.info(res)
            if (res.statusCode == 200) {
              wx.navigateTo({
                url: '../share/share?result=' + encodeURIComponent(res),
              })
            }
            else{
              wx.navigateTo({
                url: '../share/share?result=' + encodeURIComponent('{"code":0}'),
              })
            }
          },
          fail: () =>{
            wx.navigateTo({
              url: '../share/share?result=' + encodeURIComponent('{"code":0}'),
            })
          }
        })
      }
    })

    this.drawBarrage(app.globalData.barrageStatus)
  },

  onRecordPressed: function (e) {
    this.setData({
      btnImgSrc: "../../assets/recorder_down.png"
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
    recordeStatus = 1
  },
  onRecordReleased: function (e) {
    this.setData({
      btnImgSrc: "../../assets/recorder.png"
    })
    wx.getRecorderManager().stop()
    recordeStatus = 0
  },
  onRecordCancelled: function (e) {
    this.setData({
      btnImgSrc: "../../assets/recorder.png"
    })

    wx.getRecorderManager().stop()
    recordeStatus = -1
  },

  getHint: function () {
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
          if (res.data.data.content == that.data.hintText) {
            that.getHint()
          }
          else {
            that.setData({
              shouldShowHint: true,
              hintText: res.data.data.content
            })
          }
        }
        else {
          that.setData({
            shouldShowHint: true,
            hintText: "祖国您好~"
          })
        }
      }
    })
  },
  drawBarrage: function (barrageStyle) {
    let c = wx.createCanvasContext('canvas', this)
    let px = this.data.phoneWidth / 750
    let rem = this.data.phoneWidth / 20

    function _drawItem(x, y, avatar, text) {
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

    for (let i = 0; i < barrageStyle.length; i++) {
      _drawItem(barrageStyle[i].left, barrageStyle[i].top, barrageStyle[i].avatar, barrageStyle[i].text)
    }

    c.draw()
  },

})