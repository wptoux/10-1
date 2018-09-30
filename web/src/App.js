import React, { Component } from 'react';
import $ from 'jquery';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import wx from 'weixin-js-sdk'

// import VConsole from 'vconsole'

import './config'

import './App.css';

import { init_wx } from './wechat'

import Record from './Record'

import backImg from './assets/background.jpg';
import btnImg from './assets/start_btn.png';
import btnImgDown from './assets/start_btn_down.png';
import barrageBack from './assets/barrage_back.png'

let N_BARRAGE_ROAD = 15
let barrageStyle = []
let timer = null

class App extends Component {
  constructor(props) {
    super(props);

    // let vc = new VConsole()

    this.onStartClick = this.onStartClick.bind(this)
    this.onNameClick = this.onNameClick.bind(this)
    this.onCanvasClick = this.onCanvasClick.bind(this)

    this.state = {
      btnImgSrc: btnImg
    }


    this.barrageRoads = new Array(N_BARRAGE_ROAD)
    for (let i = 0; i < N_BARRAGE_ROAD; i++) {
      this.barrageRoads[i] = new Set()
    }
  }

  componentDidMount() {
    let that = this

    init_wx(window.location.href.split('#')[0])

    barrageStyle = []

    let ele = document.getElementById('canvas')
    let c = ele.getContext("2d")

    ele.width = window.innerWidth
    ele.height = window.innerHeight * 0.7

    this.setState({
      btnImgSrc: btnImg
    })

    this.setState({
      phoneWidth: window.innerWidth,
      phoneHeight: window.innerHeight,
      canvas: c
    })

    let nameInput = document.getElementById('name')
    nameInput.value = '你的名字'

    this.setState({
      nameInput: nameInput
    })

    $.ajax({
      url: global.constants.baseUrl + '/voice/record/list/latest',
      method: 'get',
      success: (res) => {
        console.info('Get barrage list status:')
        console.info(res)

        if (res.code == 1 && res.data.length > 0) {
          let idx = 0
          for (let d of res.data) {
            if (d.originalRecognizedString == '') {
              that.shoot(d.greeting.content, d, idx)
            }
            else {
              that.shoot(d.originalRecognizedString, d, idx)
            }
            idx += 1
          }
        } else {
          for (let i = 0; i < 50; i++) {
            that.shoot(parseInt(Math.random() * 1000000), "", i)
          }
  
          this.startAnimation()
        }

        this.startAnimation()
      },
      error: (res) => {
        for (let i = 0; i < 50; i++) {
          that.shoot(parseInt(Math.random() * 1000000) + '', "", i)
        }

        this.startAnimation()
      },
      dataType: 'json'
    })
  }

  componentDidUpdate() {
    let that = this

  }

  onStartClick() {
    clearInterval(timer)
    this.setState({
      btnImgSrc: btnImgDown
    })

    let name = ""

    if (this.state.nameInput.value != '你的名字') {
      name = this.state.nameInput.value
    }

    this.setState({
      redirectTo: '/record',
      redirectParams: {
        barrageStatus: document.getElementById('canvas').toDataURL('image/png'),
        name: name
      }
    })
  }

  onNameClick() {
    if (this.state.nameInput.value == '你的名字') {
      this.state.nameInput.value = ''
    }
  }

  startAnimation() {
    let that = this
    let img = new Image()
    img.src = barrageBack
    img.onload = () => {
      this.setState({
        barrageBackImg: img
      })

      timer = setInterval(function () {
        that.updateBarrage(barrageStyle)
        that.drawBarrage(barrageStyle)
        that.processBarrageEvent()

      }, 30);
    }
  }

  processBarrageEvent() {
    if (this.canvasClickEvent) {
      let rem = this.state.phoneWidth / 20
      let w = 10 * rem
      let h = 1.5 * rem

      let x = this.canvasClickEvent.x
      let y = this.canvasClickEvent.y

      for (let i = 0; i < barrageStyle.length; i++) {
        let b = barrageStyle[i]

        if (b.left < x && b.left + w > x && b.top < y && b.top + h > y) {
          let name = ''
          let content = ''
          let userCnt = 0

          if (b.detail) {
            userCnt = b.detail.id
            if (b.detail.user) {
              name = b.detail.user.nickName
            }
          }

          if (b.detail.originalRecognizedString == '') {
            content = b.detail.greeting.content
          }
          else {
            content = b.detail.originalRecognizedString
          }

          clearInterval(timer)

          if (b.detail.voiceUrl) {
            this.downloadWeChatVoice(b.detail.voiceUrl,
              (name, localId) => {
                this.setState({
                  redirectTo: '/share',
                  redirectParams: {
                    userCnt: userCnt,
                    recogResult: content,
                    fromBarrage: true,
                    voiceId: localId,
                    name: name,
                    wechatVoice: true
                  }
                })
              }
            )
          }
          else {
            this.setState({
              redirectTo: '/share',
              redirectParams: {
                userCnt: userCnt,
                recogResult: content,
                fromBarrage: true,
                voiceId: b.detail.id,
                name: name
              }
            })
          }
          break
        }
      }
      this.canvasClickEvent = null
    }
  }

  downloadWeChatVoice(voiceUrl, callBack) {
    let that = this
    // wechat remote voice
    let sp = voiceUrl.split(':')

    wx.downloadVoice({
      serverId: sp[1],
      isShowProgressTips: 1,
      success: (resDownload) => {
        // that.setState({
        //   wechat: true,
        //   name: sp[0],
        //   voiceId: resDownload.localId
        // })
        callBack(sp[0], resDownload.localId)
      }
    })
  }

  updateBarrage(barrageStyle) {
    let rem = this.state.phoneWidth / 20
    let roadH = 1.5 * rem
    let barrageW = 10 * rem

    for (var i = 0; i < barrageStyle.length; i++) {
      barrageStyle[i].left += barrageStyle[i].speed

      if (barrageStyle[i].speed > 4) {
        barrageStyle[i].speed -= 0.1
      }

      if (barrageStyle[i].speed > 6) {
        barrageStyle[i].speed = 6
      }

      if (barrageStyle[i].left > this.state.phoneWidth) {
        this.leaveRoad(barrageStyle[i].road, i)
        barrageStyle[i].top = this.enterRoad(i) * roadH
        barrageStyle[i].left = -5 * this.state.phoneWidth
        barrageStyle[i].speed = Math.random() * 2 + 2
      }
    }

    //碰撞检测
    for (let r of this.barrageRoads) {
      for (let idx1 of r) {
        let b1 = barrageStyle[idx1]

        if (b1.left < -40 * rem) {
          continue
        }

        for (let idx2 of r) {
          if (idx1 == idx2) {
            continue
          }

          let b2 = barrageStyle[idx2]

          if (b1.left < b2.left && b1.left + barrageW > b2.left) {
            // let m1 = b1.text.length
            // let m2 = b2.text.length

            // b1.speed = ((m1 - m2) * b1.speed + 2 * m2 * b2.speed) / (m1 + m2)
            // b2.speed = ((m2 - m1) * b2.speed + 2 * m1 * b1.speed) / (m1 + m2)

            b2.left += 1
            let s = b1.speed
            b1.speed = b2.speed
            b2.speed = s + 1
          }
        }
      }
    }
  }

  drawBarrage(barrageStyle) {
    let that = this
    let c = this.state.canvas
    let px = this.state.phoneWidth / 750  // iphone 6
    let rem = this.state.phoneWidth / 20

    function _drawItem(x, y, avatar, text) {
      if (x < -10 * rem || y < 0) {
        return
      }

      c.drawImage(that.state.barrageBackImg, x, y, 10 * rem, 1.5 * rem)
      // c.drawImage(avatar, x + 2.1 * rem, y + 1.25 * rem, rem, rem)
      c.font = 0.8 * rem + 'px consolas'
      c.fillStyle = "#FFFFFF"
      c.textAlign = 'left'
      c.fillText(text, x + 1 * rem, y + 1 * rem, 8 * rem)
    }

    c.clearRect(0, 0, this.state.phoneWidth, this.state.phoneHeight)
    for (let i = 0; i < barrageStyle.length; i++) {
      _drawItem(barrageStyle[i].left, barrageStyle[i].top, barrageStyle[i].avatar, barrageStyle[i].text)
    }
  }

  onCanvasClick(e) {
    let x = e.nativeEvent.offsetX
    let y = e.nativeEvent.offsetY

    this.canvasClickEvent = {
      x: x,
      y: y
    }
  }

  shoot(text, detail, idx) {
    if (text.length > 10) {
      text = text.slice(0, 9) + "..."
    }
    var that = this

    function _shoot(avatar) {
      //字体颜色随机
      // var textColor = "rgb(" + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + ")";
      let rem = that.state.phoneWidth / 20

      let roadH = 1.5 * rem

      // let road = that.enterRoad()
      // let top = road * roadH

      let road = that.enterRoad(idx)
      let top = road * roadH

      var barrageStyleObj = {
        top: top,
        left: ((Math.random()) * that.state.phoneWidth * 5) - 4.5 * that.state.phoneWidth,
        text: text,
        speed: Math.random() * 2 + 2,
        color: "#FFFFFF",
        detail: detail,
        road: road
      };

      barrageStyle.push(barrageStyleObj)

    }

    _shoot('')

    // if (avatarURI != ''){
    //   wx.getImageInfo({
    //     src: avatarURI,
    //     success: (res) => {
    //       _shoot(res.path)
    //     }
    //   })
    // }
    // else{
    //   _shoot('')
    // }
  }

  enterRoad(idx) {
    let n = 1000
    let p = 0
    for (let i = parseInt(Math.random() * N_BARRAGE_ROAD); i < this.barrageRoads.length; i++) {
      if (this.barrageRoads[i].size < n) {
        n = this.barrageRoads[i].size
        p = i
      }
    }

    this.barrageRoads[p].add(idx)
    return p
  }

  leaveRoad(road, idx) {
    this.barrageRoads[road].delete(idx)
  }

  render() {
    var that = this
    if (this.state.redirectTo) {
      return (<Redirect push to={{
        pathname: this.state.redirectTo,
        state: this.state.redirectParams
      }} />)
    }

    return (
      <div className="App">
        <img className='page' src={backImg} alt=''></img>

        <canvas id='canvas' className='canvas' onClick={this.onCanvasClick}></canvas>

        <input type='text' id='name' onClick={this.onNameClick} />

        <button className='btn-start' onClick={this.onStartClick}>
          <img src={this.state.btnImgSrc} alt=''></img>
        </button>
      </div>
    );
  }
}

export default App;
