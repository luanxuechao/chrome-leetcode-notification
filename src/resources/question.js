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
  const host = await getHost()
  const result = await HttpServer({
    url: host + '/api/problems/all/',
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
  const question = await findQuestionById(id)
  if (!question) {
    return {}
  }
  const body = {'operationName': 'questionData', 'variables': {'titleSlug': question.stat.question__title_slug}, 'query': 'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    langToValidPlayground\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    envInfo\n    libraryUrl\n    __typename\n  }\n}\n'}
  const host = await getHost()
  const questionDetail = await HttpServer({
    url: host + '/graphql',
    data: body,
    method: 'POST'
  })
  return questionDetail.data.data
}

export async function findQuestionById (id) {
  let results = await getAllQuestions()
  const ret = _.find(results, (question) => { return question.stat.frontend_question_id === id })
  return ret
}
export async function getAllQuestionsLength () {
  let results = await getAllQuestions()
  return results.length
}
export async function fuzzySearch (id) {
  let results = await getAllQuestions()
  const values = []

  for (const result of results) {
    if (values.length > 10) {
      break
    }
    if (result.stat.frontend_question_id.toString().indexOf(id) === 0) {
      values.push({value: `${result.stat.frontend_question_id}.${result.stat.question__title}`, questionId: result.stat.frontend_question_id})
    }
  }
  results = null
  return values
}
export async function refreshTotal () {
  const host = await getHost()
  const result = await HttpServer({
    url: host + '/api/problems/all/',
    method: 'get'
  })
  result.data.stat_status_pairs = _.orderBy(result.data.stat_status_pairs, function (a) {
    return a.stat.frontend_question_id
  })
  if (result.data) {
    await chromep.storage.local.set({'stat_status_pairs': JSON.stringify(result.data.stat_status_pairs)})
  }
}

async function getHost () {
  const ret = await chromep.storage.local.get('options')
  if (!ret.options) {
    return 'https://leetcode.com'
  }
  const host = JSON.stringify(ret.options).host
  return host || 'https://leetcode.com'
}
