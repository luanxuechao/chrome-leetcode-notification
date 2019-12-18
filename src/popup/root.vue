<template lang="pug">
    div
      el-button(type="primary" @click="tab") New tab 
</template>
<script>
  export default {
    data: () => ({
    }),
    computed: { },
    created () { },
    mounted () { },
    methods: {
      tab () {
        // 显示一个桌面通知

        alert('更新完成！')
        // if (window.webkitNotifications) {
        //   alert('更新完成！1')
        //   var notification = window.webkitNotifications.createNotification(
        //     'images/icon.png', // icon url - can be relative
        //     '通知的title!', // notification title
        //     'aaaaaa' // notification body text
        //   )
        //   notification.show()
        //   // 设置3秒后，将桌面通知dismiss
        //   setTimeout(function () { notification.cancel() }, 3000)
        // } else
  
        chrome.tabs.getSelected(null, function (tab) {
          alert(tab.url)
        })
        if (chrome.notifications) {
          alert('更新完成！1')
          try {
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
          } catch (error) {
            alert(error)
            console.log(error)
          }
        } else {
          alert('亲，你的浏览器不支持啊！')
        }
        // chrome.tabs.create({ url: 'pages/app.html' })
      }
    }
  }
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>