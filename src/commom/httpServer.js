import axios from 'axios'
import { URL } from './config'

const service = axios.create({
  baseURL: URL, // 基本路径
  timeout: 5000 // 请求超时时间
})
export default service
