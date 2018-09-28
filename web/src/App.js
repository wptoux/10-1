import React, { Component } from 'react';
import $ from 'jquery';

import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'

import './config'

import './App.css';

import Record from './Record'

import backImg from './assets/background.jpg';
import btnImg from './assets/start_btn.png';
import btnImgDown from './assets/start_btn_down.png';
import barrageBack from './assets/barrage_back.png'

let barrageStyle = []
let timer = null

class App extends Component {
  constructor(props) {
    super(props);
    this.onStartClick = this.onStartClick.bind(this)
    this.onNameClick = this.onNameClick.bind(this)

    this.state = {
      btnImgSrc: btnImg
    }
  }

  componentDidMount() {
    let that = this

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
      url: global.constants.baseUrl + '/voice/list?page=0',
      method: 'get',
      success: (res) => {
        console.info('Get barrage list status:')
        console.info(res)

        if (res.code == 1 && res.data.length > 0) {
          let arr = that.shuffle(res.data).slice(0, 15)
          let idx = 0
          for (let d of res.data) {
            if (d.originalRecognizedString == '') {
              that.shoot(d.greeting.content, d.user.avatarUrl, d.id, idx)
            }
            else {
              that.shoot(d.originalRecognizedString, d.user.avatarUrl, d.id, idx)
            }
            idx += 1
          }
        } else {
          let texts = ["123", "234", "345", "456", "678", "一二三四五六七八九十一二三四"]
          for (let i = 0; i < texts.length; i++) {
            that.shoot(texts[i], "", "", i)
          }
        }

        this.startAnimation()
      },
      error: (res) => {
        let texts = ["123", "234", "345", "456", "678", "一二三四五六七八九十一二三四"]
        for (let i = 0; i < texts.length; i++) {
          that.shoot(texts[i], "", "", i)
        }

        this.startAnimation()
      },
      dataType: 'json'
    })
  }

  componentDidUpdate() {
    // let img = new Image()
    // img.src = barrageBack
    // img.onload = () => {
    //   this.setState({
    //     barrageBackImg: img
    //   })
    // }
  }

  onStartClick() {
    clearInterval(timer)
    this.setState({
      btnImgSrc: btnImgDown
    })

    this.setState({
      redirectTo: '/record',
      redirectParams: {
        barrageStatus: document.getElementById('canvas').toDataURL('image/png'),
        name: this.state.nameInput.value
      }
    })
  }

  onNameClick() {
    if (this.state.nameInput.value == '你的名字'){
      this.state.nameInput.value = ''
    }
  }

  startAnimation() {
    let img = new Image()
    img.src = barrageBack
    img.onload = () => {
      this.setState({
        barrageBackImg: img
      })

      var that = this
      timer = setInterval(function () {
        let rem = that.state.phoneWidth / 20
        for (var i = 0; i < barrageStyle.length; i++) {
          barrageStyle[i].left += barrageStyle[i].speed

          if (barrageStyle[i].left > that.state.phoneWidth) {
            barrageStyle[i].top = parseInt(Math.random() * 15) * rem * 1.2
            barrageStyle[i].left = 0
            barrageStyle[i].speed = Math.random() * 2 + 2
          }
        }

        that.drawBarrage(barrageStyle)
      }, 30);
    }

  }

  drawBarrage(barrageStyle) {
    let that = this
    let c = this.state.canvas
    let px = this.state.phoneWidth / 750  // iphone 6
    let rem = this.state.phoneWidth / 20

    function _drawItem(x, y, avatar, text) {
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

  shoot(text, avatarURI, voiceId, idx) {
    if (text.length > 10) {
      text = text.slice(0, 9) + "..."
    }
    var that = this

    function _shoot(avatar) {
      //字体颜色随机
      // var textColor = "rgb(" + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + "," + parseInt(Math.random() * 256) + ")";
      let rem = that.state.phoneWidth / 20
      var top = idx * rem * 1.2
      var barrageStyleObj = {
        top: top,
        left: (Math.random()) * that.state.phoneWidth * 0.5,
        text: text,
        speed: Math.random() * 2 + 2,
        color: "#FFFFFF",
        avatar: avatar,
        voiceId: voiceId,
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

  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */
  shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  }

  render() {
    var that = this
    if (this.state.redirectTo){
      return (<Redirect push to={{
        pathname: this.state.redirectTo,
        state: this.state.redirectParams
      }} />)
    }

    return (
      <div className="App">
        <img class='page' src={backImg} alt=''></img>

        <canvas id='canvas' class='canvas'></canvas>

        <input type='text' id='name' onClick={this.onNameClick}/>

        <button class='btn-start' onClick={this.onStartClick}>
          <img src={this.state.btnImgSrc} alt=''></img>
        </button>
      </div>
    );
  }
}

export default App;
