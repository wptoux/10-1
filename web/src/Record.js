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

import {init_wx} from './wechat'

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
  }

  componentDidMount() {
    let that = this

    let u = navigator.userAgent
    let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

    if (!isiOS) {
      init_wx(window.location.href.split('#')[0],
        () => {
          wx.onVoiceRecordEnd({
            complete: (res) => {
              that.processRecord(res)
            }
          })
        })
    }

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

    wx.startRecord()
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
      wx.stopRecord({
        success: (res) => {
          that.processRecord(res)
        }
      })
    }
    else {
      wx.stopRecord()
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

  processRecord(resRecord) {
    let that = this

    console.info('voice recorded')
    console.info(resRecord)

    wx.uploadVoice({
      localId: resRecord.localId,
      isShowProgressTips: 1,
      success: (resServer) => {
        console.info('uploaded record')
        console.info(resServer)
        wx.translateVoice({
          localId: resRecord.localId,
          isShowProgressTips: 1,
          success: (resRecog) => {
            console.info('voice recognized')
            console.info(resRecog)

            if (resRecog.translateResult && resRecog.translateResult != '') {
              $.ajax({
                url: global.constants.baseUrl + '/voice/record/create',
                method: 'Post',
                data: {
                  url: that.props.location.state.name + ':' + resServer.serverId,
                  content: resRecog.translateResult
                },
                success: (resCreate) => {
                  console.info('resource created')
                  console.info(resCreate)
                  if (resCreate.code == 1) {
                    that.setState({
                      redirectTo: '/share',
                      redirectParams: {
                        userCnt: resCreate.data,
                        recogResult: resRecog.translateResult,
                        voiceId: resRecord.localId,
                        name: that.props.location.state.name,
                        wechatVoice: true
                      }
                    })
                  }
                }
              })

              // let a = this.state.hintText
              // let b = res.translateResult

              // this.setState({
              //     redirectTo: '/share',
              //     redirectParams: {
              //       accuracy: parseInt(this.calcAcc(a, b) * 100) + '%',
              //       userCnt: parseInt(Math.random() * 10000),
              //       recogResult: b,
              //       voiceId: voiceId,
              //       name: this.props.location.state.name
              //     }
              //   })
            }
          }
        })
      }
    })
  }

  calcAcc(str, baseStr) {
    let n = Math.min(str.length, baseStr.length)
    let i = 0
    for (; i < n; i++) {
      if (str[i] != baseStr[i]) {
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