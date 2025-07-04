import asyncio
from mcp_agent.agents.agent import Agent
from mcp_agent.app import MCPApp
from deepseek_llm import DeepSeekAugmentedLLM 
from setting import settings 
from utils import load_prompt_from_txt
import re
import os

async def fetch_url(url: str) -> dict:
    app = MCPApp("quick_finder", settings=settings)

    async with app.run():
        finder_agent = Agent(
            name="finder",
            instruction="You are an agent with filesystem + fetch access. Return the requested file or URL contents.",
            server_names=["fetch", "filesystem"],
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            summary = await llm.generate_str(
                message=f"获取网页内容：{url}，总结网页内容只要回复纯文本，不要出现markdown格式",
            )

            highlight = await llm.generate_str(
                message="提炼爆点从而能够发小红书。限制20字",
            )

            return {
                "url": url,
                "summary": summary.strip(),
                "highlight": highlight.strip()
            }


async def summary_content(content1: str, content2: str) -> dict:
    app = MCPApp("summary", settings=settings)

    async with app.run():
        finder_agent = Agent(
            name="summary",
            instruction="你是一个内容总结专家，请根据用户输入的两部分内容，总结出一段大的逻辑连续的内容。",
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            summary = await llm.generate_str(
                message=f"用户输入的两部分内容：{content1}，{content2}, 总结出一段大的逻辑连续的内容。",
            )

            return {
                "content1": content1,
                "content2": content2,
                "summary": summary.strip()
            }


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

    # 读取 prompt 模板（不变）
    prompt_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "prompt/xhs_content.json.txt")
    )
    prompt_instruction = load_prompt_from_txt(prompt_path)

    async with app.run():
        finder_agent = Agent(
            name="xhs_content_generator",
            instruction="你是一位小红书文案撰写专家。",  # 简略设定人格
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            # 拼接爆点为列表
            joined_hotspots = "\n".join([f"{i+1}. {h}" for i, h in enumerate(hotspots)])

            result = await llm.generate_str(
                message=(
                    f"{prompt_instruction}\n\n"
                    f"以下是用户提供的小红书爆点列表，请你按要求生成 JSON 格式文案：\n"
                    f"{joined_hotspots}"
                ),
            )

            print("📦 JSON结果：", result)
            return result


if __name__ == "__main__":
    # url = "http://www.cnu.cc/"
    # asyncio.run(fetch_url(url))
    # content1 = "今天写了publish端口, 更新了GitHub云端代码"
    # content2 = "今天吃了襄阳牛肉面"
    # result1 = asyncio.run(summary_content(content1, content2))
    result1 = "今天的工作和生活都过得充实而有条理。在技术方面，我完成了publish端口的开发工作，并将最新的代码更新同步到了GitHub云端仓库，这为项目的持续集成和团队协作打下了良好基础。生活上也有不错的体验，中午品尝了地道的襄阳牛肉面，浓郁的汤底和劲道的面条让人回味无穷。这种平衡工作与生活的节奏，既能保持高效产出，又能享受日常的小确幸，感觉非常满足。整体来看，今天既推进了项目进展，又照顾到了个人生活的愉悦感，算得上是张弛有度的一天。"
    # 示例用法
    hotspot_str = """1. 💻 高效工作：完成publish端口开发+GitHub代码同步，团队协作更顺畅！  
    2. 🍜 舌尖幸福：襄阳牛肉面暴击！汤浓面韧，打工人的治愈时刻～  
    3. ⚖️ 工作生活完美平衡：代码写得好，牛肉面吃得香，这才是理想节奏！  
    4. 🚀 今日成就：项目进度+1，幸福感+10086，张弛有度真的爽！  
    5. 🌟 小确幸哲学：高效产出和美食治愈，我全都要！"""

    lines = hotspot_str.strip().split("\n")
    pattern = re.compile(r"^\s*\d+\.\s*(.+)")
    parsed = [match.group(1).strip() for line in lines if (match := pattern.match(line))]
    print(f"Parsed Hotspots: {parsed}")
    asyncio.run(xhs_content_generator(parsed))
