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
          div(class="question_header_button clear-float")
            el-autocomplete(class="inline-input search_input" v-model="input1" :fetch-suggestions="querySearch" placeholder="search id"  prefix-icon="el-icon-search" :trigger-on-focus="false" @select="handleSelect")
        div(class="question_description")
          div(class="question_content" v-show = "!isPaidOnly" v-html="content")
          div(class="question_lock" v-show = "isPaidOnly")
              i(class="el-icon-lock")
        div(class="question_footer clear-float ")
          el-button-group(class="footer_button")
            el-button(type="primary" @click="preQuestion", plain =true size="small" icon="el-icon-arrow-left")
            el-button(type="primary" @click="nextQuestion" plain =true size="small" icon="el-icon-arrow-right")
            el-button(type="primary"  plain =true size="small" icon="el-icon-edit")
            el-button(type="primary" plain =true size="small" icon="el-icon-refresh")

           
         
          

</template>
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
.question_header_button .search_input {
  float: right;
  width: 200px;
}

.question_footer {
  margin-top: 20px;
  margin-bottom: 20px;
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
</style>>
<script>
import {getQuestionByDescription, fuzzySearch, getAllQuestionsLength} from '../resources/question'
import chromep from 'chrome-promise'
export default {
  data: () => {
    return {isPaidOnly: false, input1: '', content: '', topicTags: [], difficulty: 'Easy', question: {questionId: '', questionFrontendId: '', title: ''}}
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
      console.log(id)
      getQuestionByDescription(id).then((value) => {
        console.log(value)
        _this.isPaidOnly = value.question.isPaidOnly
        _this.content = value.question.content
        _this.topicTags = value.question.topicTags
        _this.difficulty = value.question.difficulty
        _this.question = {questionId: value.question.questionId, questionFrontendId: value.question.questionFrontendId, title: value.question.title}
        return chromep.storage.local.set({'lastQuestionId': value.question.questionId})
      }).catch((error) => {
        console.log(error)
        alert(JSON.stringify(error))
      })
    },
    querySearch (queryString, cb) {
      fuzzySearch(queryString).then((value) => {
        const results = []
        for (const i in value) {
          if (i > 20) {
            break
          }
          results.push({value: `${value[i].stat.frontend_question_id}.${value[i].stat.question__title}`, questionId: value[i].stat.frontend_question_id})
        }
        cb(results)
      })
    },
    nextQuestion () {
      getAllQuestionsLength().then((length) => {
        if (this.question.questionId < length) {
          this.getQuestionById(++this.question.questionId)
        }
      })
    },
    preQuestion () {
      if (this.question.questionId === 1) {
        return
      }
      this.getQuestionById(--this.question.questionId)
    },
    handleSelect (item) {
      this.getQuestionById(item.questionId)
    }
  }
}
</script>