import asyncio
import os
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from deepseek_llm import DeepSeekAugmentedLLM
from setting import settings
from utils import load_prompt_from_txt, save_html_and_screenshot, clean_html_response


async def generate_html_cover(content: str, save_path="output/card.html"):
    app = MCPApp("html_cover_generator", settings=settings)

    prompt_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "prompt/xhs_card.txt"))
    prompt_instruction = load_prompt_from_txt(prompt_path)

    async with app.run():
        finder_agent = Agent(
            name="html_card_cover_agent",
            instruction="你是一位网页与视觉设计专家，请根据提示生成可截图的 HTML 封面卡片。",
        )

        async with finder_agent:
            llm = await finder_agent.attach_llm(DeepSeekAugmentedLLM)

            message = (
                f"{prompt_instruction}\n\n"
                f"【原始内容】\n{content.strip()}"
            )

            result = await llm.generate_str(message=message)
            # ✅ 打印结果
            print("📦 生成的 HTML 封面：\n")
            print(result)

            cleaned_html = clean_html_response(result)
            await save_html_and_screenshot(cleaned_html, save_path)

            # ✅ 保存为 HTML 文件
            # os.makedirs(os.path.dirname(save_path), exist_ok=True)
            # with open(save_path, "w", encoding="utf-8") as f:
            #     f.write(result)
            # print(f"✅ 已保存到：{save_path}")

            return result



if __name__ == "__main__":
    content="⚖️ 理想生活公式：代码效率+美食治愈=完美平衡。白天高效敲代码，晚上用襄阳牛肉面治愈灵魂，这才是科技民工的正确打开方式！"
    asyncio.run(generate_html_cover(content))