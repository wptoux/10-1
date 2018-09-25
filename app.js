//app.js
App({
  onLaunch: function () {

  },
  globalData: {
    userInfo: null,
    baseUrl: "https://kaixinabc.net/party",
    cookie: null,
    // 0: not logined, 1: ok, -1: error
    loginStatus: 0,
    barrageStatus: null
  }
})