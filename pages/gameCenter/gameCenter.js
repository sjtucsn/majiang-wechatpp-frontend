// pages/gameCenter/gameCenter.js
const constant = require('../../utils/constant.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tables: [
      ['', '', '', '']
    ]
  },

  /**
   * 点击椅子响应进入房间事件
   */
  handleUserIn(e) {
    wx.sendSocketMessage({
      data: JSON.stringify({
        type: constant.CHOOSE_SEAT,
        message: e.currentTarget.dataset.index
      })
    })
  },

  /**
   * 处理用户重新进入房间事件
   */
  handleResume() {
    const nickName = app.globalData.userInfo.nickName;
    if (this.data.tables[0].includes(nickName)) {
      wx.sendSocketMessage({
        data: JSON.stringify({
          type: constant.CHOOSE_SEAT
        })
      })
    }
  },

  /**
   * 退出游戏
   */
  handleQuitGame: function () {
    wx.showModal({
      title: '提示',
      content: '您确定要退出游戏大厅吗',
      success(res) {
        if (res.confirm) {
          wx.closeSocket()
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 连接房间
    wx.connectSocket({
      url: 'wss://mj.sjtudoit.com/game/' + encodeURI(app.globalData.userInfo.nickName)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.heartBeat) {
      // 如果websocket连接已经建立时，求加载游戏信息
      wx.sendSocketMessage({
        data: JSON.stringify({
          type: constant.GET_GAME
        })
      })
    }
    
    wx.onSocketMessage((res) => {
      // 游戏对象
      const game = JSON.parse(res.data)
      console.log(game)
      if (game.messageType === 19 && game.message === app.globalData.userInfo.nickName + '进入房间') {
        wx.navigateTo({
          url: '../room/room',
        })
        return
      }
      const data = game.userList.map(user => user.userNickName)
      this.setData({
        tables: [data]
      })
    })

    wx.onSocketError(res => {
      console.log(res)
      wx.showToast({
        title: '连接服务器失败！',
        icon: 'none'
      })
    })

    wx.onSocketOpen(res => {
      wx.showToast({
        title: '连接成功！',
        icon: 'none'
      })
      // 每隔10s发送一次心跳包，防止掉线
      app.globalData.heartBeat = setInterval(() => {
        wx.sendSocketMessage({
          data: JSON.stringify({
            type: constant.HEART_BEAT,
            message: "心跳包"
          })
        })
      }, 10000)
    })

    wx.onSocketClose(res => {
      console.log(res)
      wx.showToast({
        title: '连接关闭',
        icon: 'none'
      })
      // 如果连接断开则跳转到首页，退出房间
      wx.navigateBack()
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.closeSocket()
    clearInterval(app.globalData.heartBeat)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})