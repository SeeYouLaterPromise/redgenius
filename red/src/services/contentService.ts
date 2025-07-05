import apiService from './apiService'

// 1. 定义提炼爆点API的请求体类型
interface ExtractHotspotRequest {
  content: string
}

// 2. 定义提炼爆点API的响应体类型
interface ExtractHotspotResponse {
  hotspots: string[]
}

/**
 * 调用后端接口，根据原文内容提炼小红书爆点。
 * @param content - 原始素材的完整文本内容。
 * @returns 一个包含爆点字符串数组的Promise。
 */
export async function fetchHotspots(
  content: string
): Promise<ExtractHotspotResponse> {
  console.log('正在向后端发送原文内容以提炼爆点...')

  const requestData: ExtractHotspotRequest = {
    content: content,
  }

  // 3. 使用我们封装好的apiService发送POST请求
  // 它会自动处理baseURL, JSON序列化, 错误捕获等
  const data: ExtractHotspotResponse = await apiService.post(
    '/extract-hotspot',
    requestData
  )

  return data
}
