<template lang="pug">
    div(class="pop")
      div(class="question")
        div(class="question_header")
          div(class="question_title") {{question.questionFrontendId}}. {{question.title}}
          div(class="question_tag")
            el-tag(type="success" style="margin:0 3px" v-show ="difficulty === 'Easy'"  size ="mini" effect="plain") Easy
            el-tag(type="warning"  style="margin:0 3px" v-show ="difficulty === 'Medium'"  size ="mini" effect="plain") Medium
            el-tag(type="danger" style="margin:0 3px" v-show="difficulty === 'Hard'" size ="mini" effect="plain") Hard
          div(class="question_tag")
            el-tag(effect="light" style="margin:0 3px" :key="tag.name" v-for="tag in topicTags" size ="mini") {{tag.name}}
          div(class="question_footer clear-float ")
            el-button-group(class="footer_button")
              el-button(type="primary" @click="preQuestion", :disabled="preDisable" plain =true size="small" icon="el-icon-arrow-left")
              el-button(type="primary" @click="nextQuestion" :disabled="nextDisable" plain =true size="small" icon="el-icon-arrow-right")
              el-button(type="primary" @click="openLeetcode" plain =true size="small" icon="el-icon-edit")
              el-button(type="primary" @click="refresh" plain =true size="small" icon="el-icon-refresh")
          div(class="question_header_button")
              el-autocomplete(class="inline-input" style="width: 100%;" :fetch-suggestions="querySearch" :trigger-on-focus="false" v-model="input" @select="handleSelect"  placeholder="search id"  prefix-icon="el-icon-search" )
        div(class="question_description")
          div(class="question_content" v-show = "!isPaidOnly" v-html="content")
          div(class="question_lock" v-show = "isPaidOnly")
              div(class="question_lock_content")
                i(class="el-icon-lock" style="font-size:50px")
                p Subscribe to unlock.
        div(class="question_footer clear-float ")
          el-button-group(class="footer_button")
            el-button(type="primary" @click="preQuestion", :disabled="preDisable" plain =true size="small" icon="el-icon-arrow-left")
            el-button(type="primary" @click="nextQuestion" :disabled="nextDisable" plain =true size="small" icon="el-icon-arrow-right")
            el-button(type="primary" @click="openLeetcode" plain =true size="small" icon="el-icon-edit")
            el-button(type="primary" @click="refresh" plain =true size="small" icon="el-icon-refresh")

           
         
          

</template>

<script>
import {getQuestionByDescription, findQuestionById, fuzzySearch, getAllQuestionsLength, refreshTotal} from '../resources/question'
import chromep from 'chrome-promise'
export default {
  data: () => {
    return {isPaidOnly: false, scrollTop: 0, preDisable: false, input: '111', nextDisable: false, content: '', topicTags: [], difficulty: 'Easy', question: {questionId: '', questionFrontendId: '', title: ''}}
  },
  computed: { },
  created () {
    const _this = this
    chromep.storage.local.get('lastQuestionId').then((question) => {
      return _this.getQuestionById(parseInt(question.lastQuestionId) < 1200 ? parseInt(question.lastQuestionId) : 1)
    }).catch((error) => {
      console.log(error)
      alert(JSON.stringify(error))
    })
  },
  mounted () { },
  methods: {
    getQuestionById (id) {
      const _this = this
      getQuestionByDescription(id).then(async (value) => {
        _this.isPaidOnly = value.question.isPaidOnly
        _this.content = value.question.content
        _this.topicTags = value.question.topicTags
        _this.difficulty = value.question.difficulty
        const length = await getAllQuestionsLength()
        _this.nextDisable = parseInt(value.question.questionFrontendId) >= length
        _this.preDisable = parseInt(value.question.questionFrontendId) === 1
        _this.input = ''
        _this.backTop()
        _this.question = {questionId: value.question.questionId, questionFrontendId: value.question.questionFrontendId, title: value.question.title}
        return chromep.storage.local.set({'lastQuestionId': value.question.questionId})
      }).catch((error) => {
        console.log(error)
        alert(JSON.stringify(error))
      })
    },
    querySearch (queryString, cb) {
      console.log(queryString)

      if (!queryString) {
        const result = []
        return cb(result)
      }

      fuzzySearch(queryString).then((values) => {
        cb(values)
      })
    },
    backTop () {
      const that = this
      let timer = setInterval(() => {
        let ispeed = Math.floor(-that.scrollTop / 5)
        document.documentElement.scrollTop = document.body.scrollTop = that.scrollTop + ispeed
        console.log(that.scrollTop)
        if (that.scrollTop === 0) {
          clearInterval(timer)
        }
      }, 16)
    },
    nextQuestion () {
      let id = parseInt(this.question.questionFrontendId)
      this.getQuestionById(++id)
    },
    preQuestion () {
      let id = parseInt(this.question.questionFrontendId)
      this.getQuestionById(--id)
    },
    handleSelect (item) {
      this.getQuestionById(item.questionId)
    },
    openLeetcode () {
      findQuestionById(parseInt(this.question.questionFrontendId)).then((value) => {
        console.log(value)
        window.open(`https://leetcode.com/problems/${value.stat.question__title_slug}`)
      })
    },
    scrollToTop () {
      const that = this
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
      that.scrollTop = scrollTop
      if (that.scrollTop > 60) {
        that.btnFlag = true
      } else {
        that.btnFlag = false
      }
    },
    refresh () {
      const _this = this
      refreshTotal().then((value) => {
        _this.$message({
          message: '本地题库刷新成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
<style scoped>
.pop {
  width: 500px;
  height: 400px;
}
.question_header {
  padding: 8px 0px;
  border-bottom: 1px solid rgb(238, 238, 238);
}
.question_title {
  font-size: 16px;
  color: rgb(33, 33, 33);
  font-weight: 600;
  margin-bottom: 10px;
}
.question_tag {
  margin-top: 10px;
}
.question_lock {
  width: 500px;
  height: 300px;
  font-size: 28px;
  font-weight: 400;
}
.question_lock_content {
    color: rgb(33, 33, 33);
    width: 100%;
    text-align: center;
    margin: 67px auto;
}
.question_description {
  margin: 1em 0;
  font-size: 14px;
  color: #263238;
}
>>> .question_content pre {
  white-space: pre-wrap;
  background: #f7f9fa;
  padding: 10px 15px;
  color: #263238;
  line-height: 1.6;
  font-size: 13px;
  border-radius: 3px;
  margin-top: 0;
  margin-bottom: 1em;
  overflow: auto;
}
.question_header_button {
  margin-top: 10px;
   width: 500px;
}
.question_header_button .search_input {
  display: inline-block;
  width: 500px;
}

.question_footer {
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
 
}
.question_footer .footer_button {
  float: right;
}
.clear-float:after{
  display: block;
  clear: both;
  content: "";
  visibility: hidden;
  height: 0;
  overflow: hidden;}
.clear-float{zoom: 1;}
</style>