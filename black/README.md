# Agents flow

调研 ResearchAgent (接收主题 → 调用 fetch+search 工具抓正文 → 存热点内容到 DB)

分析 AnalysisAgent (读取刚抓的热点内容 → 产出 “爆点”|标题|摘要)

创画 ImageAgent (根据读取刚抓的热点内容 生成 html 再通过 playwright 来得到图片)

调研 ResearchAgent 完成任务后，把收集到的内容分别传给分析 AnalysisAgent 和 创画 ImageAgent，来让他们并行执行生成内容。

返回的内容先存在前端的全局状态管理？

暴露出后端接口 api 来让前端调用启动

$Env:OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxx"

$Env:OPENAI_API_BASE = "https://api.deepseek.com"

## Start up the port

临时解决路径问题

```txt
set PYTHONPATH=F:\yexin\redgenius\xhs_toolkit;%PYTHONPATH%
```

```bash
uvicorn black.app.main:app --reload --host 0.0.0.0 --port 8000
```

## mcp-agent usage

下载`cherry studio`来安装好`uv`和`Bun`，记得配置好环境变量，查看`uvx -v`是否有输出版本号来确保配置成功。
下载`nvm`来管理`nodejs`: https://github.com/coreybutler/nvm-windows/releases

```bash
nvm install lts
nvm use lts
```

```bash
npm install -g @modelcontextprotocol/server-filesystem
```

```python
from mcp_agent.config import (
    Settings,
    LoggerSettings,
    MCPSettings,
    MCPServerSettings,
    OpenAISettings,
)

settings = Settings(
    execution_engine="asyncio",
    logger=LoggerSettings(type="file", level="debug"),
    mcp=MCPSettings(
        servers={
            "fetch": MCPServerSettings(
                command="uvx",
                args=["mcp-server-fetch"],
            ),
            "filesystem": MCPServerSettings(
                command="npx",
                args=["-y", "@modelcontextprotocol/server-filesystem", 'D:/black'],
            ),
        }
    ),
    openai=OpenAISettings(
        base_url="https://api.deepseek.com/v1",
        api_key="sk-b461ffc208b441ecbd9002bc7d7de7af",
        default_model="deepseek-chat",
    ),
)
```

```yaml
$schema: 'mcp-agent.config.schema.json'
execution_engine: asyncio
logger:
  transports: [console, file]
  level: debug
  progress_display: true
  path_settings:
    path_pattern: 'logs/mcp-agent-{unique_id}.jsonl'
    unique_id: 'timestamp' # Options: "timestamp" or "session_id"
    timestamp_format: '%Y%m%d_%H%M%S'

mcp:
  servers:
    fetch:
      command: 'uvx'
      args: ['mcp-server-fetch']
    filesystem:
      command: 'npx'
      args: ['-y', '@modelcontextprotocol/server-filesystem', 'D:/black']

openai:
  base_url: https://api.deepseek.com/v1
  default_model: deepseek-chat
```
