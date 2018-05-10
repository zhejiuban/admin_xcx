let app = getApp();

const config = require('../../../config')

Page({
  data: {
    winHeight: "",//窗口高度
    currentTab: 3, //预设当前项的值
    searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
    searchLoadingComplete: false,  //“没有数据”的变量，默认false，隐藏  
    page: 1,   //分页
    items: [],
    status: 100,
    content: '1',    //判断上拉是否还有数据
    itemsLength: '1'  //获取有无数据
  },
  swichNav1: function () {
    app.swichNav('/pages/index/service/service');
  },
  swichNav2: function () {
    app.swichNav('/pages/index/assess/assess');
  },
  swichNav3: function () {
    app.swichNav('/pages/index/over/over');
  },
  swichNav4: function () {
    app.swichNav('/pages/index/all/all');
  },
  // 回到首页
  toIndex: function () {
    app.toIndex();
  },
  // 转发
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
    }
    return {
      title: '这就办维修平台',
      path: '/pages/index/inde',
      imageUrl: '/images/1.jpg',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 查看详情包括评论
  clickAllDetail: function (e) {
    let repair_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/alldetails/alldetails?status=' + this.data.status + '&repair_id=' + repair_id,
    })
  },
  
  // 回到控制面板页面
  toPanel: function () {
    app.toPanel();
  },

  // 我的
  toMe: function () {
    app.toMe();
  },

  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current
    });
    this.checkCor();
  },

  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    let cur = e.target.dataset.current;
    if (this.data.currentTaB == cur) { return false; }
    else {
      this.setData({
        currentTab: cur
      })
    }
  },

  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },

  // 图片预览
  prev_img: function (e) {
    let url = e.currentTarget.dataset.url['0'];
    let urls = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },

  //下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    let that = this;
    wx.request({
      url: config.adminRepairListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: that.data.status,
        openId: app.globalData.openId,
        page: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({
          items: [],
          page: 1,
          itemsLength: '1',
          content: '1',
        });
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        if (res.data.code == 0) {
          that.setData({
            itemsLength: '0',
            content: '1',
            page: 1
          })
        } else if (res.data.code == 1403) {
          app.errorPrompt(res.data);
        } else {
          that.setData({
            items: res.data,
            page: 1,
            itemsLength: 1,
            content: '1',
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      }
    })
  },

  //上拉加载更多 
  //滚动到底部触发事件  
  searchScrollLower: function () {
    let that = this;
    wx.showLoading();
    wx.request({
      url: config.adminRepairListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: that.data.status,
        openId: app.globalData.openId,
        page: that.data.page + 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.length > 0) {
          let arr1 = that.data.items;
          let arrs = arr1.concat(res.data);
          that.setData({
            items: arrs,
            page: that.data.page + 1
          });
        } else if (res.data.code == 0) {
          that.setData({
            content: '0'
          })
        }
        if (res.data.length < 10) {
          that.setData({
            content: '0'
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  //查询出所有工单
  onLoad: function () {
    app.network_state();
    wx.showLoading({
      mask: true,
      title: '加载中',
    });
    let that = this;
    //  高度自适应
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        let calc = clientHeight * rpxR - 180;
        that.setData({
          winHeight: calc
        });
      }
    });

    wx.request({
      url: config.adminRepairListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        status: that.data.status,
        openId: app.globalData.openId,
        page: 1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            itemsLength: '0',
            page: 1
          })
        } else if (res.data.code == 403) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                wx.navigateBack({
                  url: "/pages/home/home"
                })
              }
            }
          })
        } else {
          that.setData({
            items: res.data,
            itemsLength: '1'
          });
        }
      },
      fail: function () {
        wx.hideLoading();
        app.requestError();
      },
      complete: function () {
        wx.hideLoading();
      }
    })
  },

  onShow: function () {
    let that = this;
    that.setData({
      page: 1
    });
    that.onLoad();
  },
  
  footerTap: app.footerTap
})