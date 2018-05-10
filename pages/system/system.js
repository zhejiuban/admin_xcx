const config = require('../../config')

// pages/system/system.js
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  formSubmit: function (e) {
    let that = this;
    let phone = e.detail.value.phone;
    let password = e.detail.value.password;
    if (!phone){
      wx.showModal({
        title: '提示',
        content: '请输入手机号',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    } else if (!password){
      wx.showModal({
        title: '提示',
        content: '请输入密码',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
          }
        }
      })
    }else{
      wx.request({
        url: config.adminAuthUrl,
        method: "POST",
        data: {
          role: app.globalData.role,
          token: app.globalData.token,
          openId: app.globalData.openId,
          union_id: app.globalData.unionid,
          phone: phone,
          password: password
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.code == 1) {
            app.globalData.org_id = res.data.org_id;
            app.globalData.user_id = res.data.user_id;
            wx.showModal({
              title: '提示',
              content: '用户认证成功',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.reLaunch({
                    url: '/pages/index/service/service',
                  })
                }
              }
            })
          } else if (res.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: '账号或密码错误',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.reLaunch({
                    url: '/pages/system/system',
                  })
                }
              }
            })
          } else if (res.data.code == 1403) {
            app.errorPrompt(res.data);
          }
        },
        fail: function () {
          wx.hideLoading();
          app.requestError();
        }
      })
    }
    
  },

})