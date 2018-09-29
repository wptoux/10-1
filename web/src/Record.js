import React, { Component } from 'react';
import $ from 'jquery';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import wx from 'weixin-js-sdk'

import './config'
import './App.css'

import backImg from './assets/background.jpg';
import hintImg from './assets/hint_back.png';
import recordBtnImg from './assets/recorder.png';
import recordBtnDownImg from './assets/recorder_down.png';

class Record extends Component {
  constructor(props) {
    super(props)

    let that = this

    this.onHinterClick = this.refreshHinter.bind(this)
    this.onRecorderDown = this.onRecorderDown.bind(this)
    this.onRecorderUp = this.onRecorderUp.bind(this)
    this.onRecorderCancel = this.onRecorderCancel.bind(this)
    this.state = {
      recordBtnSrc: recordBtnImg
    }

    this.recordStatus = 0

    $.ajax({
      url: global.constants.baseUrl + '/common/sign',
      method: 'Post',
      data: {
        url: window.location.href.split('#')[0]
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
              'playVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice',
              'translateVoice'
            ]
          })

          wx.ready(() => {
            that.setState({
              wxReady: true
            })

            wx.onVoiceRecordEnd({
              complete: (res) => {
              }
            })
          })

          wx.error((res) => {
            console.log(res)
            that.setState({
              wxReady: false
            })
          })
        }
      }
    })
  }

  componentDidMount() {
    this.refreshHinter()
  }

  refreshHinter() {
    let that = this
    $.ajax({
      url: global.constants.baseUrl + '/greeting/random',
      method: 'GET',
      success: (res) => {
        console.info('Get hint status:')
        console.info(res)
        if (res.code == 1) {
          if (res.data.content == that.state.hintText) {
            that.refreshHinter()
          }
          else {
            that.setState({
              hintText: res.data.content
            })
          }
        }
        else {
          that.setState({
            hintText: "祖国您好~"
          })
        }
      },
      error: (res) => {
        that.setState({
          hintText: "祖国您好~"
        })
      }
    })
  }

  //todo: prevent press event. add cancel event.
  onRecorderDown(e) {
    e = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;

    this.setState({
      recordBtnSrc: recordBtnDownImg
    })

    this.recordStartTime = new Date().getTime()

    if (this.state.wxReady) {
      wx.startRecord()
    }
  }

  onRecorderUp(e) {
    let that = this

    e = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;

    this.setState({
      recordBtnSrc: recordBtnImg,
    })

    let endTime = new Date().getTime()

    if ((endTime - this.recordStartTime) / 1000 > 1) {
      if (this.state.wxReady) {
        wx.stopRecord({
          success: (res) => {
            console.info('voice recorded')
            console.info(res)

            wx.uploadVoice({
              localId: res.localId,
              success: (res) => {
                alert(res.serverId)
              }
            })
            let voiceId = res.localId

            wx.translateVoice({
              localId: res.localId,
              isShowProgressTips: 1,
              success: (res) => {
                console.info('voice recognized')
                console.info(res)

                if (res.translateResult && res.translateResult != ''){
                  let a = this.state.hintText
                  let b = res.translateResult

                  this.setState({
                      redirectTo: '/share',
                      redirectParams: {
                        accuracy: parseInt(this.calcAcc(a, b) * 100) + '%',
                        userCnt: parseInt(Math.random() * 10000),
                        recogResult: b,
                        voiceId: voiceId,
                        name: this.props.location.state.name
                      }
                    })
                }
              }
            })
          }
        })
      }
    }
  }

  onRecorderCancel(e) {
    e = e || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;

    this.setState({
      recordBtnSrc: recordBtnImg
    })

    if (this.state.wxReady) {
      wx.stopRecord()
    }
  }

  calcAcc(str, baseStr){
    let n = Math.min(str.length, baseStr.length)
    let i = 0
    for (; i < n; i++){
      if (str[i] != baseStr[i]){
        break
      }
    }

    let acc = i / baseStr.length

    return acc
  }

  render() {
    if (this.state.redirectTo) {
      return (<Redirect push to={{
        pathname: this.state.redirectTo,
        state: this.state.redirectParams
      }} />)
    }

    return (
      <div>
        <img className='page' src={backImg} />
        <img className='canvas' src={this.props.location.state.barrageStatus} />
        <div className='record-hinter container' onClick={this.onHinterClick}>
          <div className='you-may-say'>你可以说:</div>
          <div className='hint-text'>{this.state.hintText}</div>
          <img src={hintImg}></img>
        </div>

        <button className='record-btn' onMouseDown={this.onRecorderDown} onMouseUp={this.onRecorderUp}
          onTouchStart={this.onRecorderDown} onTouchEnd={this.onRecorderUp}
          onTouchCancel={this.onRecorderCancel} >
          <img src={this.state.recordBtnSrc} />
          <div className='long-press-to-speak'>长按录音</div>
        </button>

      </div>)
  }
}

export default Record