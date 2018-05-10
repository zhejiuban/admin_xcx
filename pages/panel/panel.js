// pages/panel/panel.js
var wxCharts = require('../../utils/wxcharts.js');
const config = require('../../config')
var app = getApp();
var pieChart1 = null;
var pieChart2 = null;
var pieChart3 = null;
var pieChart4 = null;
Page({
  data: {
    items: '',
  },
  
  onLoad: function (e) {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    let that = this;
    wx.request({
      url: config.adminIndexUrl,
      method: 'POST',
      data: {
        token: app.globalData.token,
        role: app.globalData.role,
        openId: app.globalData.openId,
        org_id: app.globalData.org_id,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        that.setData({
          items: res.data
        });
        pieChart1 = new wxCharts({
          animation: true,
          canvasId: 'pieCanvas1',
          type: 'pie',
          series: [{
            name: '待分派',
            data: res.data.process_status[0],
          }, {
            name: '待接单',
            data: res.data.process_status[1],
          }, {
            name: '维修中',
            data: res.data.process_status[2],
          }, {
            name: '待评价',
            data: res.data.process_status[3],
          }, {
            name: '已完成',
            data: res.data.process_status[4],
          }, {
            name: '已取消',
            data: res.data.process_status[5],
          }],
          width: windowWidth,
          height: 250,
          dataLabel: true
        });

        pieChart2 = new wxCharts({
          animation: true,
          canvasId: 'pieCanvas2',
          type: 'pie',
          series: [{
            name: '1分',
            data: res.data.score[0],
          }, {
            name: '2分',
            data: res.data.score[1],
          }, {
            name: '3分',
            data: res.data.score[2],
          }, {
            name: '4分',
            data: res.data.score[3],
          }, {
            name: '5分',
            data: res.data.score[4],
          }, {
            name: '未评价',
            data: res.data.score[5],
          }],
          width: windowWidth,
          height: 250,
          dataLabel: true,
        });

        pieChart3 = new wxCharts({
          animation: true,
          canvasId: 'pieCanvas3',
          type: 'pie',
          series: [{
            name: '资产工单',
            data: res.data.process_asset,
          }, {
            name: '场地工单',
            data: res.data.process_area,
          }, {
            name: '设备组工单',
            data: res.data.process_equipment,
          }],
          width: windowWidth,
          height: 250,
          dataLabel: true,
        });

      }
    })
  },
  toPanel: function () {
    app.toPanel();
  },
  toIndex: function () {
    app.toIndex();
  },
  toMe: function () {
    app.toMe();
  }
});