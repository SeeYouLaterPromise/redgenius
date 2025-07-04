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
                args=["-y", "@modelcontextprotocol/server-filesystem", 'E:/xiaohongshu/redgenius/black'],
            ),
        }
    ),
    openai=OpenAISettings(
        base_url="https://api.deepseek.com/v1",
        api_key="sk-b461ffc208b441ecbd9002bc7d7de7af",
        default_model="deepseek-chat",
    ),
)