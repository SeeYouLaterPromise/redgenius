# finder_demo_deepseek.py
import asyncio
from mcp_agent.agents.agent import Agent
from mcp_agent.app import MCPApp
from deepseek_llm import DeepSeekAugmentedLLM   # ← 用新类

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

async def fetch_url(url: str):
    app = MCPApp("quick_finder", settings=settings)

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

async def summary_content(content1: str, content2: str):
    app = MCPApp("summary", settings=settings)

    async with app.run():
        finder_agent = Agent(
            name="summary",
            instruction="你是一个内容总结专家，请根据用户输入的两部分内容，总结出一段大的逻辑连续的内容。",
            # server_names=["fetch", "filesystem"],
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            result = await llm.generate_str(
                message=f"用户输入的两部分内容：{content1}，{content2}, 总结出一段大的逻辑连续的内容。",
                # Can override model, tokens and other defaults
            )
            print(f"Result: {result}")

async def extract_hotspot(content: str):
    app = MCPApp("extract_hotspot", settings=settings)

    async with app.run():
        finder_agent = Agent(
            name="xhs_hotspot_summary",
            instruction="你是一个小红书爆点提炼专家，请根据用户输入的内容，提炼出多个（3-5个）适合小红书爆点的内容，要求每个爆点简明有力、突出亮点。",
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            result = await llm.generate_str(
                message=(
                    f"请根据以下内容，提炼出3-5个适合小红书爆点的内容，要求每个爆点简明有力、突出亮点，分点输出：\n"
                    f"内容：{content}\n"
                    f"请直接输出爆点内容，每个爆点单独成行。"
                ),
            )
            print(f"Result: {result}")
            return result

async def xhs_content_generator(hotspots: list[str]):
    app = MCPApp("xhs_content_generator", settings=settings)

    async with app.run():
        finder_agent = Agent(
            name="xhs_content_generator",
            instruction="你是一个小红书文案撰写专家。用户会输入若干个小红书爆点，请你针对每个爆点，生成一条100字以内的小红书文案，并为每条文案配上3-5个相关标签（以#标签#格式输出）。输出格式要求：每个爆点一组，包含文案和标签，标签单独一行。",
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            all_results = []
            for hotspot in hotspots:
                result = await llm.generate_str(
                    message=(
                        f"请针对以下小红书爆点，生成一条100字以内的小红书文案，并为该文案配上3-5个相关标签（以#标签#格式输出，标签单独一行）：\n"
                        f"爆点：{hotspot}"
                    ),
                )
                print(f"Hotspot: {hotspot}\nResult: {result}\n")
                all_results.append({"hotspot": hotspot, "output": result})
            return all_results

if __name__ == "__main__":
    # url = "http://www.cnu.cc/"
    # asyncio.run(fetch_url(url))
    # content1 = "今天写了publish端口, 更新了GitHub云端代码"
    # content2 = "今天吃了襄阳牛肉面"
    # result1 = asyncio.run(summary_content(content1, content2))
    result1 = "今天的工作和生活都过得充实而有条理。在技术方面，我完成了publish端口的开发工作，并将最新的代码更新同步到了GitHub云端仓库，这为项目的持续集成和团队协作打下了良好基础。生活上也有不错的体验，中午品尝了地道的襄阳牛肉面，浓郁的汤底和劲道的面条让人回味无穷。这种平衡工作与生活的节奏，既能保持高效产出，又能享受日常的小确幸，感觉非常满足。整体来看，今天既推进了项目进展，又照顾到了个人生活的愉悦感，算得上是张弛有度的一天。"
    asyncio.run(extract_hotspot(result1))
