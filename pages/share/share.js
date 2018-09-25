// pages/share/share.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    desc: "对不起，你在说什么",
    backImgSrc: "../../assets/background.jpg",
    userCnt: '我是第8888位为祖国打call的人',
    recogResult: "苟利国家生死以，岂因祸福避趋之",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this

    this.setData({
      avatar: app.globalData.userInfo.avatarUrl
    })
    
    let recordFilePath = decodeURIComponent(options.recordFilePath)

    wx.uploadFile({
      url: app.globalData.baseUrl + '/voice/recognize',
      filePath: recordFilePath,
      name: 'file',
      header: {
        'cookie': app.globalData.cookie
      },
      success: function(res) {
        console.info('Recognize result:')
        console.info(res)

        let s = ""
        let sim = 0
        let cnt = 0
        if (res.statusCode == 200) {
          let rst = JSON.parse(res.data)
          if (rst.code == 1) {
            s = rst.data.data
            sim = rst.data.similarity
            cnt = rst.data.count

            that.setData({
              desc: parseInt(sim * 100) + '%',
              userCnt: '我是第' + cnt + '位为祖国打call的人',
              recogResult: s
            })
          }
        }
      }
    })
  },

})