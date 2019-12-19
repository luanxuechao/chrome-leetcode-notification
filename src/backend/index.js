import chromep from 'chrome-promise'
import * as Question from '../resources/question'
console.log('background !')
const options = {
  open: true,
  urls: [''],
  leetcodeHost: 'https://leetcode.com/api',
  time: 0.1
}
const start = false
var timeout = ''
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
  AlertNotification(id)
})
chrome.tabs.onActivated.addListener(function (activeInfo) {
  AlertNotification(activeInfo.tabId)
})
chrome.runtime.onInstalled.addListener(function () {
  chromep.storage.local.set({options: JSON.stringify(options)}).then(function () {
    return chromep.storage.local.get('options')
  })
  Question.getAllQuestions(options.leetcodeHost)
})

var AlertNotification = async function (tabId) {
  var currentOptions = await chromep.storage.local.get('options')
  if (currentOptions && currentOptions.options) {
    currentOptions.options = JSON.parse(currentOptions.options)
  }
  if (start ||
    (currentOptions && currentOptions.options && !currentOptions.options.open)) {
    return null
  }
  var min = (currentOptions.options.time || 1) * 60 * 1000
  timeout = await creteTimeout(min)
  return timeout
//   chromep.storage.local.set({foo: 'bar'}).then(function () {
//     alert('foo set')
//     return chromep.storage.local.get('foo')
//   }).then(function (items) {
//     alert(JSON.stringify(items)) // => {"foo":"bar"}
//   })
//   chrome.tabs.get(tabId, function (tab) {
//     // alert(tabId)
//     chrome.tabs.executeScript(tabId, {
//       file: 'test.js'
//     })
//   })
}
var creteTimeout = async function (min) {
  return window.setTimeout(function () {
    var opt = {
      type: 'basic',
      title: '通知的title!',
      message: 'aaa',
      iconUrl: '../icons/16.png'
    }
    chrome.notifications.create('notify_alert1', opt, function (id) {
      setTimeout(function () {
        chrome.notifications.clear(id, function () {})
      }, 3000)
    })
  }, min)
}
