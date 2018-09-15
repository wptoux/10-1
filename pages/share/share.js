// pages/share/share.js
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    desc: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log(options)
    let recordFilePath = decodeURIComponent(options.recordFilePath)

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

        let s = ""
        if (res.statusCode == 200) {
          let rst = JSON.parse(res.data)
          if (rst.code == 1){
            s = "识别成功！您说的是：" + rst.data.data
          }
        }
        if (s == ""){
          s = "对不起，你在说什么？"
        }
        that.setData({
          desc: s
        })
      }
    })
  },

})