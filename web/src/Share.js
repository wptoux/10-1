import React, { Component } from 'react';

import backImg from './assets/background.jpg'
import badgeImg from './assets/badge.png'
import qrcode from './assets/qrcode.jpg'
import recRstBackImg from './assets/recog_result_back.png'
import simBackImg from './assets/sim_txt_back.png'
import nthBackImg from './assets/you_re_the_xxxth.png'

class Share extends Component {
  constructor(props) {
    super(props)

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

  }

  render() {
    return (
      <div>
        <img className='page' src={backImg} />
        <div className='sim-desc'>
          <img src={simBackImg} />
          {this.state.desc}
        </div>

        <div className='user-cnt-desc'>
          <img className='badge' src={badgeImg} />
          <img class='user-cnt-desc-back' src={nthBackImg} />
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

        <img className='qrcode' src={qrcode} />
      </div>
    )
  }
}

export default Share