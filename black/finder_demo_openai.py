# finder_demo_deepseek.py
import asyncio
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from deepseek_llm import DeepSeekAugmentedLLM   # ← 用新类

app = MCPApp("quick_finder")

async def main():
    async with app.run():
        finder = Agent(
            name="finder",
            instruction="You can fetch URLs and read local files.",
            server_names=["fetch", "filesystem"],
        )
        async with finder:
            llm = await finder.attach_llm(DeepSeekAugmentedLLM)

            # 第一句
            quote = await llm.generate_str("Give me an inspirational quote")
            print("\n>>> quote\n", quote)

            # 第二句自动带历史
            summary = await llm.generate_str("Summarise that quote in five words")
            print("\n>>> summary\n", summary)

if __name__ == "__main__":
    asyncio.run(main())
