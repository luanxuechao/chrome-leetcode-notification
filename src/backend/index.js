import chromep from 'chrome-promise'
import * as Question from '../resources/question'
console.log('background !')

var timeout = null
chrome.tabs.onUpdated.addListener(function (id, info, tab) {
  AlertNotification(id)
})
chrome.tabs.onActivated.addListener(function (activeInfo) {
  AlertNotification(activeInfo.tabId)
})
chrome.runtime.onInstalled.addListener(function () {
  const options = {
    switch: true,
    urls: [],
    host: 'https://leetcode.com/',
    timing: 0.1,
    title: '刷题它不香吗？',
    message: '还在划水，还不刷题'
  }
  chromep.storage.local.set({options: JSON.stringify(options)}).then(function () {
    return chromep.storage.local.get('options')
  })
  Question.getAllQuestions(options.host)
})
var createTimeout = async function (min, title, message) {
  if (timeout) {
    return
  }
  return window.setInterval(function () {
    var opt = {
      type: 'basic',
      title,
      message,
      iconUrl: '../icons/16.png'
    }

    chrome.notifications.create('notify_alert1', opt, function (id) {
      setTimeout(function () {
        chrome.notifications.clear(id, function () {})
      }, 3000)
    })
  }, min)
}
var AlertNotification = async function (tabId) {
  var currentOptions = await chromep.storage.local.get('options')

  if (currentOptions && currentOptions.options) {
    currentOptions.options = JSON.parse(currentOptions.options)
  }
  if (currentOptions && currentOptions.options && !currentOptions.options.switch) {
    return null
  }
  const tabInfo = await chromep.tabs.get(tabId)
  let matchUrl = false
  if (tabInfo && tabInfo.url) {
    for (const url of currentOptions.options.urls) {
      const reg = new RegExp(url)
      if (reg.test(tabInfo.url)) {
        matchUrl = true
        break
      }
    }
    // 定时器已生成 无需关闭
    if (timeout && matchUrl) {
      return
    }
    // 当前url 不匹配 关闭定时器
    if (!matchUrl && timeout) {
      window.clearInterval(timeout)
      timeout = null
      return
    }
    var min = (currentOptions.options.timing || 1) * 60 * 1000
    timeout = await createTimeout(min, currentOptions.options.title, currentOptions.options.message)
    return timeout
  }
}
