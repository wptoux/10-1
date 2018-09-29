import React, { Component } from 'react';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import wx from 'weixin-js-sdk'

import './config'

import backImg from './assets/background.jpg'
import badgeImg from './assets/badge.png'
import qrcode from './assets/qrcode.png'
import recRstBackImg from './assets/recog_result_back.png'
import simBackImg from './assets/sim_txt_back.png'
import nthBackImg from './assets/you_re_the_xxxth.png'

import btnImg from './assets/start_btn.png';
import btnImgDown from './assets/start_btn_down.png';

class Share extends Component {
  constructor(props) {
    super(props)

    this.onPlayClick = this.onPlayClick.bind(this)
    this.onRetClick = this.onRetClick.bind(this)

    let params = this.props.location.state
    if (params && params.accuracy) {
      this.state = {
        desc: params.accuracy,
        userCnt: '  我是第' + params.userCnt + '位为祖国打 Call 的人',
        recogResult: params.recogResult
      }
    }
    else {
      this.state = {
        desc: "对不起，你在说什么?",
        userCnt: '我是第' + 8888 + '位为祖国打 Call 的人',
        recogResult: "苟利国家生死以，岂因祸福避趋之",
      }
    }
  }

  componentDidMount() {
    if (this.props.location.state.voiceId){
      if (this.props.location.state.wechatVoice) {

      }
      else{
        this.setState({
          voiceUrl: global.constants.baseUrl + 'voice/wavOfRecord?idRecord=' + this.props.location.state.voiceId
          // voiceUrl: global.constants.baseUrl + 'voice/wavOfRecord?idRecord=61'
        })
      }
    }

    this.setState({
      btnImgSrc: btnImg
    })
  }

  onPlayClick() {
    if (this.props.location.state.voiceId){
      if (this.props.location.state.wechatVoice) {
        wx.playVoice({
          localId: this.props.location.state.voiceId
        })
      }
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

    let play = null
    
    if (this.props.location.state.voiceId){
      if (this.props.location.state.wechatVoice) {
        play = <button className='btn-play' onClick={this.onPlayClick}>play</button>
      }
      else{
        play = <audio id='audio' src={this.state.voiceUrl} preload='true' controls="controls"></audio>
      }
    }

    return (
      <div>
        <img className='page' src={backImg} />
        <div className='sim-desc'>
          <img src={simBackImg} />
          {this.state.desc}
        </div>

        <div className='user-cnt-desc'>
          <img className='badge' src={badgeImg} />
          <img className='user-cnt-desc-back' src={nthBackImg} />
          <div className='user-cnt-desc-text'>
            <h2>{this.props.location.state.name}</h2>
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