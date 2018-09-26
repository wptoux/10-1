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

    barrageBackImgSrc: "../../assets/barrage_back.png",
    barrageflyDisplay: "none",
    barrageStyle: [],

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

    this.setData({
      barrageStyle: app.globalData.barrageStatus
    })
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

})