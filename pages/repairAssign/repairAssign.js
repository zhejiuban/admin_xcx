// pages/repairAssign/repairAssign.js

const config = require('../../config')

let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    repair_id: '',

    service_provider_list: '',
    service_provider_index: 0,
    service_provider_id: '',

    classify_list: '',
    classify_index: 0,
    classify_id: '',

    asset_category_list: '',
    asset_category_index: 0,
    asset_category_id: '',

    service_worker_list: '',
    service_worker_index: 0,
    service_worker_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //工单id options.repair_id
    if(options.repair_id){
      that.setData({
        repair_id: options.repair_id
      });
      that.getServiceProvider(options.repair_id);
    }
  },

  getServiceProvider: function (repair_id) {
    let that = this;
    wx.request({
      url: config.serviceProviderListUrl,
      method: "POST",
      data: {
        token: app.globalData.token,
        role: app.globalData.role,
        openId: app.globalData.openId,
        repair_id: that.data.repair_id,
        org_id: app.globalData.org_id,
        admin_id: app.globalData.admin_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        let arr = [{id:'',name:'请选择'}];
        let service_provider_list = arr.concat(res.data. service_provider_list);
        let classify_list = arr.concat(res.data.classify_list);
        let asset_category_list = arr.concat(res.data.category_list);
        that.setData({
          service_provider_list: service_provider_list,
          classify_list: classify_list,
          asset_category_list: asset_category_list
        })
      }
    })
  },

  //获取维修人员列表
  getWorker: function (service_provider_id,classify_id,asset_category_id) {
    let that = this;
    wx.request({
      url: config.workerListUrl,
      method: "POST",
      data: {
        role: app.globalData.role,
        token: app.globalData.token,
        openId: app.globalData.openId,
        org_id: app.globalData.org_id,
        repair_id: that.data.repair_id,
        service_provider_id: service_provider_id,
        classify_id: classify_id,
        asset_category_id: asset_category_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({
          service_worker_list: res.data,
          service_worker_id: res.data[0].id
        })
      }
    })
  },

  //选择服务商
  bindServiceProviderChange: function (e) {
    let that = this;
    let service_provider_id = that.data.service_provider_list[e.detail.value].id;
    that.setData({
      service_provider_id: service_provider_id,
      service_provider_index: e.detail.value,
    });
    that.getWorker(that.data.service_provider_id, that.data.classify_id, that.data.asset_category_id);
  },
  
  //选择维修项目
  bindClassifyChange: function (e) {
    let that = this;
    let classify_id = that.data.classify_list[e.detail.value].id;
    that.setData({
      classify_id: classify_id,
      classify_index: e.detail.value
    })
  },

  //选择资产类别
  bindAssetCategoryChange: function (e) {
    let that = this;
    let asset_category_id = that.data.asset_category_list[e.detail.value].id;
    that.setData({
      asset_category_id: asset_category_id,
      asset_category_index: e.detail.value
    })
  },

  //维修人员
  bindServiceWorkerChange: function (e) {
    let that = this;
    let service_worker_id = that.data.service_worker_list[e.detail.value].id;
    that.setData({
      service_worker_id: service_worker_id,
      service_worker_index: e.detail.value
    })
  },

  formSubmit: function (e) {
    let that = this;
    e.detail.value['img'] = that.data.img;
    let remarks = e.detail.value.remarks;
    let user_phone = null;

    if (!that.data.service_provider_id) {
      wx.showModal({
        title: '提示',
        content: '请选择一个有效的服务商',
        showCancel: false,
        success: function (res) {
        }
      })
    } else if (!that.data.service_worker_id) {
      wx.showModal({
        title: '提示',
        content: '请选择所要维修人员',
        showCancel: false,
        success: function (res) {
        }
      })
    } else {
      app.globalData.uuid = null;
      wx.showLoading({
        mask: true,
        title: '正在提交中...',
      })
      wx.request({
        url: config.assignWorkerUrl,
        method: "POST",
        data: {
          role: app.globalData.role,
          token: app.globalData.token,
          openId: app.globalData.openId,
          org_id: app.globalData.org_id,
          admin_id: app.globalData.admin_id,
          repair_id: that.data.repair_id,
          service_provider_id: that.data.service_provider_id,
          service_worker_id: that.data.service_worker_id,
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code == 1) {
            app.globalData.area_uuid = null;
            wx.showModal({
              title: '提示',
              content: '工单分派成功,等待维修服务',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: '/pages/index/service/service'
                  })
                }
              }
            })
          } else if (res.data.code == 403) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: "/pages/index/service/service"
                  })
                }
              }
            })
          } else if (res.data.code == 1403) {
            app.errorPrompt(res.data);
          } else if (res.data.code == 0) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.redirectTo({
                    url: "/pages/index/service/service"
                  })
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false,
              success: function (res) {
              }
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
    }
  },

  to_index: function () {
    app.toIndex();
  }
  
})