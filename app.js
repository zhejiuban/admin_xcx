//app.js

const config = require('config');

App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.getUserInfo();
  },

  getUserInfo: function () {
    let that = this;
    wx.getSetting({
      success: res => {
        let scope_user = res.authSetting['scope.userInfo'];
        wx.login({
          success: res => {
            let code = res.code;
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              success: res => {
                that.globalData.userInfo = res.userInfo;
                let iv = res.iv;
                let encryptedData = res.encryptedData;
                //发起网络请求
                //登录授权
                wx.request({
                  url: config.adminLoginUrl,
                  method: "POST",
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  data: {
                    token: that.globalData.token,
                    code: code,
                    iv: iv,
                    encryptedData: encryptedData
                  },
                  success: function (res) {
                    that.globalData.openId = res.data.openId;
                    that.globalData.unionid = res.data.unionId;
                    //判断有没有验证身份
                    if (res.data.code == 0) {
                      wx.showModal({
                        title: '提示',
                        content: res.data.message,
                        showCancel: false,
                        success: function (res) {
                          if (res.confirm) {
                            wx.navigateBack({
                              delta: -1
                            })
                          }
                        }
                      })
                    } else if (res.data.code == 1403) {
                      that.errorPrompt(res.data);
                    } else {
                      wx.request({
                        url: config.phoneAuthorizeUrl,
                        method: "POST",
                        header: {
                          'content-type': 'application/json' // 默认值
                        },
                        data: {
                          role: that.globalData.role,    //用户角色
                          token: that.globalData.token,
                          openId: that.globalData.openId
                        },
                        success: function (res) {
                          // 判断是否为服务商管理员
                          if (res.data.code == 0) {
                            //暂未授权，跳转至授权绑定手机号页面
                            wx.redirectTo({
                              url: "/pages/system/system"
                            });
                          } else if (res.data.code == 1403) {
                            that.errorPrompt(res.data);
                          } else {
                            that.globalData.org_id = res.data.org_id;
                            that.globalData.admin_id = res.data.admin_id;
                            // 已授权绑定
                            wx.redirectTo({
                              url: "/pages/index/service/service"
                              // url: "/pages/panel/panel"
                              // url: "/pages/pie/index"
                            });
                          }
                        },
                        fail: function () {
                          that.requestError();
                        }
                      });
                    }
                  },
                  fail: function () {
                    that.requestError();
                  }
                });
                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (that.userInfoReadyCallback) {
                  that.userInfoReadyCallback(res)
                }
              },
              fail: function () {
                wx.hideLoading();
                that.globalData.showLoad = false;
                that.globalData.btnShow = true;
                if (scope_user == false) {
                  that.globalData.firstLogin = 2;
                }
                if (scope_user == false) {
                  that.globalData.firstLogin = 2;
                }
                if (that.globalData.firstLogin == 1) {
                  wx.redirectTo({
                    url: '/pages/home/home?type=1',
                  });
                } else {
                  wx.redirectTo({
                    url: '/pages/home/home',
                  })
                }
              }
            })
          }
        })
      }
    })
  },

  globalData: {
    userInfo: null,
    openId: null,
    unionid: null,

    //二维码资产参数key
    assets: 'assets',
    areas: 'areas',
    equipments: 'groups',
    uuid: '',

    admin_id: '',
    org_id: '',

    showLoad: false,
    btnShow: false,
    firstLogin: 1,
    service_provider_admin: 0,
    //角色
    role: 3,
    //全局变量 url
    url: 'https://wx.zhejiuban.com/',
    token: 'd3hfWmhlSml1QmFuKywuMjA0'
  },
  swichNav: function (url) {
    wx.reLaunch({
      url: url,
    })
  },

  toJson: function (data) {
    let jsonStr = data;
    jsonStr = jsonStr.replace(" ", "");
    if (typeof jsonStr != 'object') {
      jsonStr = jsonStr.replace(/\ufeff/g, "");//重点
      var jj = JSON.parse(jsonStr);
      data = jj;
    }
    return data;
  },

  getUrlParam: function (url, type) {
    let str = "";
    let arr = url.split("/");
    let repairType = arr[arr.length - 2];

    if (type == repairType) {
      return arr[arr.length - 1];
    }
    return "";
  },

  errorPrompt: function (data) {
    if (data.code == 1403) {
      wx.showModal({
        title: '提示',
        content: data.message,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            wx.redirectTo({
              url: "/pages/index/service/service"
            })
          }
        }
      })
    }
  },

  network_state: function () {
    let that = this;
    wx.getNetworkType({
      success: function (res) {
        // 返回网络类型, 有效值：
        // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
        var networkType = res.networkType;
        if (networkType == 'none') {
          wx.showModal({
            title: '提示',
            content: '网络失败，请重试',
            showCancel: false,
            confirmText: '点击重试',
            success: function (res) {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/index/service/service',
                })
              }
            }
          })
        }
      }
    })
  },

  //wx.request请求失败，统一响应
  requestError: function () {
    wx.hideLoading();
    wx.showModal({
      title: '提示',
      content: '网络请求超时，请稍后重试',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.redirectTo({
            // url: '/pages/index/service/service',
            url: '/pages/home/home',
          })
        }
      }
    })
  },

  //回到工单列表
  toIndex: function () {
    wx.reLaunch({
      url: "/pages/index/service/service"
    })
  },

  //回到控制面板页
  toPanel: function(){
    wx.navigateTo({
      url: "/pages/panel/panel"
    })
  },

  //  我的
  toMe: function () {
    wx.navigateTo({
      url: '/pages/me/me',
    })
  }
})