// pages/share/share.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    desc: "对不起，你在说什么",
    backImgSrc: "../../assets/background.jpg",
    userCnt: ' 我是第8888位为祖国打call的人',
    recogResult: "苟利国家生死以，岂因祸福避趋之",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      avatar: app.globalData.userInfo.avatarUrl
    })

    let s = ""
    let sim = 0
    let cnt = 0

    let rst = JSON.parse(decodeURIComponent(options.result))
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
})