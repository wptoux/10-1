//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isImageReady: false,
    imageSrc: "",
    backImage: "../../assets/background.jpg"
  },

  onGotUserInfo: function (e) {
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
              wx.navigateTo({
                url: '../record/record',
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

  onLoad: function () {
    this.setData({
      isImageReady: true,
      imageSrc: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535798551&di=2ef16e231335625e1a51e898fc6cc612&imgtype=jpg&er=1&src=http%3A%2F%2Fwww.wallcoo.com%2Fcartoon%2FKitsunenoir_Design_Illustration_V%2Fwallpapers%2F2560x1440%2Fkim-holtermand-reflections.jpg"
    })

    // wx.navigateTo({
    //   url: '../record/record',
    // })
  }
})
