Agents flow:
调研 ResearchAgent (接收主题 → 调用 fetch+search 工具抓正文 → 存热点内容到 DB)

分析 AnalysisAgent (读取刚抓的热点内容 → 产出 “爆点”|标题|摘要)

创画 ImageAgent (根据读取刚抓的热点内容 生成 html 再通过 playwright 来得到图片)

调研 ResearchAgent 完成任务后，把收集到的内容分别传给分析 AnalysisAgent 和 创画 ImageAgent，来让他们并行执行生成内容。

返回的内容先存在前端的全局状态管理？

暴露出后端接口 api 来让前端调用启动

$Env:OPENAI_API_KEY  = "sk-xxxxxxxxxxxxxxxxxxxxxxxx"   # DeepSeek 提供的 key
$Env:OPENAI_API_BASE = "https://api.deepseek.com"
