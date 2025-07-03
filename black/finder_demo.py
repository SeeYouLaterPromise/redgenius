# finder_demo_deepseek.py
import asyncio
from mcp_agent.agents.agent import Agent
from mcp_agent.app import MCPApp
from deepseek_llm import DeepSeekAugmentedLLM   # ← 用新类


async def fetch_url(url: str):
    app = MCPApp("quick_finder") #, settings=settings)

    async with app.run():
        finder_agent = Agent(
            name="finder",
            instruction="You are an agent with filesystem + fetch access. Return the requested file or URL contents.",
            server_names=["fetch", "filesystem"],
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            result = await llm.generate_str(
                message=f"获取网页内容：{url}，总结网页内容只要回复纯文本，不要出现markdown格式",
                # Can override model, tokens and other defaults
            )
            print(f"Result: {result}")

            # Multi-turn conversation
            result = await llm.generate_str(
                message="提炼爆点从而能够发小红书。限制20字",
            )
            print(f"Result: {result}")

if __name__ == "__main__":
    url = "https://www.nexusmods.com/"
    asyncio.run(fetch_url(url))
