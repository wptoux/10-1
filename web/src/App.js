import React, { Component } from 'react';
import $ from 'jquery';

import './config'

import './App.css';

import backImg from './assets/background.jpg';
import btnImg from './assets/start_btn.png';
import btnImgDown from './assets/start_btn_down.png';
import barrageBack from './assets/barrage_back.png'

let barrageStyle = []
let timer = null

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      btnImgSrc: btnImg
    }
  }

  componentDidMount() {
    let that = this
    
    let ele = document.getElementById('canvas')
    let c = ele.getContext("2d")

    ele.width = window.innerWidth
    ele.height = window.innerHeight * 0.7

    let img = new Image()
    img.src = barrageBack
    img.onload = () => {
      this.setState({
        barrageBackImg: img
      })
    }

    this.setState({
      phoneWidth: window.innerWidth,
      phoneHeight: window.innerHeight,
      canvas: c
    })

    $.ajax({
      url: global.constants.baseUrl + '/voice/list?page=0',
      method: 'get',
      success: (res) => {
        console.info('Get barrage list status:')
        console.info(res)

        if (res.statusCode == 200 && res.data.code == 1 && res.data.data.length > 0) {
          let arr = that.shuffle(res.data.data).slice(0, 15)
          let idx = 0
          for (let d of res.data.data) {
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
      },
      error: (res) => {
        let texts = ["123", "234", "345", "456", "678", "一二三四五六七八九十一二三四"]
        for (let i = 0; i < texts.length; i++) {
          that.shoot(texts[i], "", "", i)
        }

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
      },
      dataType: 'json'
    })
  }

  drawBarrage(barrageStyle) {
    let that = this
    let c = this.state.canvas
    let px = this.state.phoneWidth / 750
    let rem = this.state.phoneWidth / 20

    function _drawItem(x, y, avatar, text) {
      /*
      .barrage-fly-obj {
        position: absolute;
        width: 12.5rem;
        height: 2.5rem;
        overflow: hidden;
      }

      .barrage-content {
        position: absolute;
        top: 1.25rem;
        left: 2.1rem;
        width: 9rem;
        height: 1.5rem;
      }

      .barrage-content image {
        position: absolute;
        top: 0;
        left: 0;
        width: 1rem;
        height: 1rem;
      }

      .barrage-content text {
        position: absolute;
        top: 0;
        left: 1rem;
        width: 8rem;
        font-size: 0.8rem;
        text-align: right;
      }

      .barrage-back {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
      */
      
      c.drawImage(that.state.barrageBackImg, x, y, 12.5 * rem, 2.5 * rem)
      // c.drawImage(avatar, x + 2.1 * rem, y + 1.25 * rem, rem, rem)
      c.font = '0.8rem consolas'
      c.fillStyle = "#FFFFFF"
      c.textAlign = 'left'
      c.fillText(text, x + 3.5 * rem, y + 2 * rem, 8 * rem)
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
    return (
      <div className="App">
        <img class='page' src={backImg} alt=''></img>

        <canvas id='canvas' class='canvas'></canvas>

        <button class='btn-start'>
          <img src={this.state.btnImgSrc} alt=''></img>
        </button>
      </div>
    );
  }
}

export default App;
