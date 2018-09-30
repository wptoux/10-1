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

import { init_wx } from './wechat'

import backImg from './assets/background.jpg'
import badgeImg from './assets/badge.png'
import qrcode from './assets/qrcode.png'
import recRstBackImg from './assets/recog_result_back.png'
import simBackImg from './assets/sim_txt_back.png'
import nthBackImg from './assets/you_re_the_xxxth.png'
import btnImg from './assets/start_btn.png'
import btnImgDown from './assets/start_btn_down.png'
import playBtn from './assets/play.png'
import pauseBtn from './assets/pause.png'

class Share extends Component {
  constructor(props) {
    super(props)

    this.onPlayClick = this.onPlayClick.bind(this)
    this.onRetClick = this.onRetClick.bind(this)

    let params = this.props.location.state
    if (params && params.recogResult) {
      this.state = {
        name: params.name != '' ? params.name : '粉丝甲',
        userCnt: '  我是第' + params.userCnt + '位为祖国送祝福的人',
        recogResult: params.recogResult
      }
    }
    else {
      this.state = {
        name: '粉丝甲',
        userCnt: '对不起，你在说什么?',
        recogResult: "苟利国家生死以，岂因祸福避趋之",
      }
    }

    this.playState = 0

    wx.onVoicePlayEnd({
      success: (res) => {
        this.playState = 0
        this.setState({
          playBtnSrc: playBtn
        })
      }
    })
  }

  componentDidMount() {
    let that = this

    let u = navigator.userAgent
    let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)

    if (!isiOS) {
      init_wx(window.location.href.split('#')[0])
    }

    if (this.props.location.state.voiceId) {
      // wechat voice
      if (this.props.location.state.wechatVoice) {
        this.setState({
          wechat: true,
          voiceId: this.props.location.state.voiceId
        })
      }
      else {
        this.setState({
          voiceUrl: global.constants.baseUrl + '/voice/wavOfRecord?idRecord=' + this.props.location.state.voiceId
          // voiceUrl: global.constants.baseUrl + 'voice/wavOfRecord?idRecord=61'
        })
      }
    }

    this.setState({
      btnImgSrc: btnImg,
      playBtnSrc: playBtn
    })
  }

  onPlayClick() {
    if (this.playState == 0){
      this.playState = 1
      if (this.props.location.state.voiceId) {
        if (this.props.location.state.wechatVoice) {
          wx.playVoice({
            localId: this.props.location.state.voiceId
          })
        }
      }

      this.setState({
        playBtnSrc: pauseBtn
      })
    }
    else{
      this.playState = 0
      if (this.props.location.state.voiceId) {
        if (this.props.location.state.wechatVoice) {
          wx.pauseVoice({
            localId: this.props.location.state.voiceId
          })
        }
      }

      this.setState({
        playBtnSrc: playBtn
      })
    }
  }

  onRetClick() {
    this.setState({
      redirectTo: '/',
    })
  }

  render() {
    var that = this
    if (this.state.redirectTo) {
      return (<Redirect push to={{
        pathname: this.state.redirectTo,
        state: this.state.redirectParams
      }} />)
    }

    let play = <button className='btn-play' onClick={this.onPlayClick}>
      <img src={this.state.playBtnSrc} />
    </button>

    // if (this.props.location.state.voiceId){
    //   if (this.props.location.state.wechatVoice) {
    //     play = <button className='btn-play' onClick={this.onPlayClick}>
    //       <img src={playBtn}/>
    //     </button>
    //   }
    //   else{
    //     play = <audio id='audio' src={this.state.voiceUrl} preload='true' controls="controls"></audio>
    //   }
    // }

    return (
      <div>
        <img className='page' src={backImg} />
        <div className='name-desc'>
          <img src={simBackImg} />
          {this.state.name}
        </div>

        <div className='user-cnt-desc'>
          <img className='badge' src={badgeImg} />
          <img className='user-cnt-desc-back' src={nthBackImg} />
          <div className='user-cnt-desc-text'>
            {this.state.userCnt}
          </div>

        </div>

        <div className='recog-result'>
          <img src={recRstBackImg} />
          <div className='recog-result-text'>
            {this.state.recogResult}
          </div>
        </div>

        {play}

        {this.props.location.state.fromBarrage && (<button className='btn-share-return' onClick={this.onRetClick}>
          <img src={this.state.btnImgSrc} alt=''></img>
        </button>)
        }
        <img className='qrcode' src={qrcode} />
      </div>
    )
  }
}

export default Share