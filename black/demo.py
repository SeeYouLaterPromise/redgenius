from mcp_agent.app import MCPApp
import asyncio

app = MCPApp("demo")

async def main():
  async with app.run() as a:
      print(a.context.config.openai.api_key[:10]+"…")   # dp-xxxxxxxx
      print(a.context.config.openai.base_url)           # https://api.deepseek.com


# ★★★★★ 关键：调用协程入口 ★★★★★
if __name__ == "__main__":
    asyncio.run(main())
