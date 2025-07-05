import axios from 'axios'

// 1. 创建一个axios实例
const apiService = axios.create({
  // 从环境变量中获取后端的URL，如果没有则使用本地开发地址
  // 这使得我们的前端可以轻松地在开发环境和生产环境之间切换
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000, // 设置10秒的请求超时时间
})

// 2. 添加请求拦截器 (Request Interceptor)
// 这是axios最强大的功能之一
apiService.interceptors.request.use(
  (config) => {
    // 在每个请求被发送之前，我们可以在这里统一做一些事情

    // 例如：从LocalStorage中获取用户的认证信息（比如小红书的Cookie或我们自己的Token）
    const userCookie = localStorage.getItem('xhs_cookie')

    if (userCookie) {
      // 如果存在，就把它添加到请求头中
      config.headers['X-User-Cookie'] = userCookie
    }

    console.log('发起请求:', config)
    return config
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

// 3. 添加响应拦截器 (Response Interceptor)
apiService.interceptors.response.use(
  (response) => {
    // 对2xx范围内的状态码，我们会在这里处理响应数据
    // 例如，如果后端返回的数据格式总是 { code: 0, data: ..., message: '' }
    // 我们可以在这里直接返回 data 部分，简化组件中的调用
    console.log('收到响应:', response)
    return response.data // 直接返回响应体中的data部分
  },
  (error) => {
    // 对超出2xx范围的状态码，我们会在这里统一处理错误
    let errorMessage = '发生未知错误'
    if (error.response) {
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      console.error('API Error Response:', error.response.data)
      // 尝试从后端返回的错误信息中获取更具体的提示
      errorMessage =
        error.response.data.detail ||
        error.response.data.message ||
        '服务器错误'
    } else if (error.request) {
      // 请求已经成功发起，但没有收到响应
      console.error('API No Response:', error.request)
      errorMessage = '网络无响应，请检查您的网络连接'
    } else {
      // 发送请求之前出了点事
      console.error('API Request Setup Error:', error.message)
      errorMessage = error.message
    }
    // 这里可以弹出一个全局的错误提示，比如用一个Toast组件
    // alert(errorMessage);
    return Promise.reject(new Error(errorMessage))
  }
)

export default apiService
