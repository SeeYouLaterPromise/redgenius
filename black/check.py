import openai, os
print("api_key:", openai.api_key[:10], "…")
print("api_base:", openai.api_base)
print("base_url:", openai.base_url)

from mcp_agent.app import MCPApp, asyncio
async def main():
    async with MCPApp("check").run() as c:
        print("cfg.api_key:", c.context.config.openai.api_key[:10], "…")
        print("cfg.base_url:", c.context.config.openai.base_url)

if __name__ == "__main__":
    asyncio.run(main())
