'use strict'
import chromep from 'chrome-promise'
import HttpServer from './../commom/httpServer'
import * as _ from 'lodash'

export async function getAllQuestions () {
  let question = await chromep.storage.local.get('stat_status_pairs')
  let statStatusPairs = []
  if (question && question.stat_status_pairs) {
    const questions = JSON.parse(question.stat_status_pairs)
    statStatusPairs = questions
    return statStatusPairs
  }
  const result = await HttpServer({
    url: '/api/problems/all/',
    method: 'get'
  })
  result.data.stat_status_pairs = _.orderBy(result.data.stat_status_pairs, function (a) {
    return a.stat.frontend_question_id
  })
  if (result.data) {
    await chromep.storage.local.set({'stat_status_pairs': JSON.stringify(result.data.stat_status_pairs)})
  }
  return result.data.stat_status_pairs
}
export async function getQuestionByDescription (id) {
  const question = await getQuestionById(id)
  if (!question) {
    return {}
  }
  const body = {'operationName': 'questionData', 'variables': {'titleSlug': question.stat.question__title_slug}, 'query': 'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    langToValidPlayground\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    envInfo\n    libraryUrl\n    __typename\n  }\n}\n'}
  const questionDetail = await HttpServer({
    url: '/graphql',
    data: body,
    method: 'POST'
  })
  return questionDetail.data.data
}

export async function getQuestionById (id) {
  let results = await getAllQuestions()
  return _.find(results, (question) => { return question.stat.frontend_question_id === id })
}
export async function getAllQuestionsLength () {
  let results = await getAllQuestions()
  return results.length
}
export async function fuzzySearch (id) {
  let results = await getAllQuestions()
  return _.filter(results, (question) => { return question.stat.frontend_question_id.toString().indexOf(id) === 0 })
}
