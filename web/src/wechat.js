import wx from 'weixin-js-sdk'

import $ from 'jquery';

function init_wx(url, onReadyCB, onErrorCB) {
  $.ajax({
    url: global.constants.baseUrl + '/common/sign',
    method: 'Post',
    data: {
      url: url
    },
    success: (res) => {
      console.info('Get signature')
      console.info(res)

      if (res.code == 1) {
        wx.config({
          debug: false,
          appId: res.data.appId,
          timestamp: res.data.timestamp,
          nonceStr: res.data.nonceStr,
          signature: res.data.signature,
          jsApiList: [
            'startRecord', 'stopRecord', 'onVoiceRecordEnd',
            'playVoice', 'stopVoice', 'pauseVoice', 'onVoicePlayEnd',
            'uploadVoice', 'downloadVoice', 'translateVoice'
          ]
        })

        wx.ready(() => {
          console.info('wx ready')

          if (onReadyCB){
            onReadyCB()
          }
        })

        wx.error((res) => {
          console.error('wx error')
          console.log(res)
          if (onErrorCB) {
            onErrorCB()
          }
        })
      }
    }
  })
}

export {init_wx}