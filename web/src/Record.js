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
    this.state = {
      recordBtnSrc: recordBtnImg
    }

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
              'playVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice'
            ]
          })

          wx.ready(() => {
            that.setState({
              wxReady: true
            })

            wx.onVoiceRecordEnd({
              complete: (res) => {
                console.info('voice recorded')
                console.info(res)
                wx.translateVoice({
                  localId: res.localId,
                  isShowProgressTips: 1,
                  success: (res) => {
                    console.info('voice recognized')
                    console.info(res)
                  }
                })
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

      }
    })
  }

  //todo: prevent press event. add cancel event.
  onRecorderDown() {
    this.setState({
      recordBtnSrc: recordBtnDownImg
    })

    if (this.state.wxReady) {
      wx.startRecord()
    }
  }

  onRecorderUp() {
    this.setState({
      recordBtnSrc: recordBtnImg,
      redirectTo: '/share',
      redirectParams: {
        accuracy: '100%',
        userCnt: 8888,
        recogResult: this.state.hintText,
        name: this.props.location.state.name
      }
    })

    if (this.state.wxReady) {
      wx.stopRecord()
    }
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
          <div className='hint-text'>{this.state.hintText}</div>
          <img src={hintImg}></img>
        </div>

        <img className='record-btn' src={this.state.recordBtnSrc}
          onMouseDown={this.onRecorderDown} onMouseUp={this.onRecorderUp}
          onTouchStart={this.onRecorderDown} onTouchEnd={this.onRecorderUp} 
          onTouchCancel={this.onRecorderUp}/>
      </div>)
  }
}

export default Record