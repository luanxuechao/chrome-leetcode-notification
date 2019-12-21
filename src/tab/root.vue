<template lang="pug">
    div(style="width:100%")
      el-row
        el-col(:span="8" :offset="8")
          el-form(ref="form" :model="form" label-width="80px")
            el-form-item(label="Host:")
              el-select(v-model="form.host" placeholder="seletct host" label-width="80px")
                el-option(label="https://leetcode.com" value="https://leetcode.com")
                el-option(label="https://leetcode-cn.com" value="https://leetcode-cn.com")
            el-form-item(label="Switch:")
              el-switch(v-model="form.switch" active-color="#13ce66" inactive-color="#ff4949")
            el-form-item(label="Timing:")
              el-col(:span="12")
                el-input(v-model="form.timing" )
                  template(slot="append") Min
            el-form-item(label="Title:")
              el-input(v-model="form.title" )
            el-form-item(label="Message:")
              el-input(v-model="form.message" )   
            el-form-item(label="Urls:")
                el-tag(:key="tag" v-for="url in form.urls" closable :disable-transitions="false" style="margin: 0 5px;" @close="handleClose(tag)") {{url}}
                el-input(class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm" @blur="handleInputConfirm")
                el-button(v-else class="button-new-tag"  style="margin: 0 5px;" size="small" @click="showInput") + New Tag
            el-form-item()
                el-col(:span="8" :offset="8")
                  el-button(plain @click="save") Save
          
</template>
<script>
import chromep from 'chrome-promise'

export default {
  data () {
    return {
      inputVisible: false,
      inputValue: '',
      form: {
        host: '',
        switch: false,
        timing: 10,
        title: '',
        message: '',
        urls: ''
      }
    }
  },
  computed: { },
  created () {},
  mounted () {
    const _this = this
    chromep.storage.local.get('options').then((value) => {
      const options = JSON.parse(value.options)
      _this.form.host = options.host
      _this.form.switch = options.switch
      _this.form.timing = options.timing
      _this.form.title = options.title
      _this.form.message = options.message
      _this.form.urls = options.urls
    })
  },
  methods: {
    handleClose (url) {
      this.form.urls.splice(this.form.urls.indexOf(url), 1)
    },

    showInput () {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm () {
      let inputValue = this.inputValue
      if (inputValue) {
        this.form.urls.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    save () {
      const _this = this
      chromep.storage.local.set({'options': JSON.stringify(_this.form)}).then(function () {
        _this.$message({
          message: '保存成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
<style lang="scss">
  div {
    color: blue
  }
</style>