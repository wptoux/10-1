//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isImageReady: false,
    imageSrc: ""
  },

  onStartTap: function(){
    wx.navigateTo({
      url: '../record/record',
    })
  },

  onLoad: function(){
    this.setData({
      isImageReady: true,
      imageSrc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535798551&di=2ef16e231335625e1a51e898fc6cc612&imgtype=jpg&er=1&src=http%3A%2F%2Fwww.wallcoo.com%2Fcartoon%2FKitsunenoir_Design_Illustration_V%2Fwallpapers%2F2560x1440%2Fkim-holtermand-reflections.jpg"
    })

    // wx.navigateTo({
    //   url: '../record/record',
    // })
  }
})
