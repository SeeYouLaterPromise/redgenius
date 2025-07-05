import asyncio
import os
import uuid
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from deepseek_llm import DeepSeekAugmentedLLM
from setting import settings
from utils import load_from_txt, save_to_txt, save_html_and_screenshot, clean_html_response


async def generate_html_cover(content: str, save_path="output/"):
    app = MCPApp("html_cover_generator", settings=settings)

    cur_directory = os.path.dirname(os.path.abspath(__file__))
    save_dir = os.path.abspath(os.path.join(cur_directory, save_path))
    os.makedirs(save_dir, exist_ok=True)

    prompt_path = os.path.abspath(os.path.join(cur_directory, "prompt/xhs_card.txt"))
    prompt_instruction = load_from_txt(prompt_path)

    # ⬇️ 生成唯一ID用于命名
    unique_id = uuid.uuid4().hex[:8]  # 可使用 [:8] 保留前8位
    picture_name = f"cover_{unique_id}.png"
    html_name = f"cover_{unique_id}.html"
    html_path = os.path.join(save_dir, html_name)

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
            print("📦 生成的 HTML 封面：\n")
            print(result)

            cleaned_html = clean_html_response(result)

            # ⬇️ 截图保存路径（保存为 PNG 图）
            await save_html_and_screenshot(cleaned_html, save_dir, picture_name)

            # ⬇️ 保存 HTML 文件
            save_to_txt(cleaned_html, html_path)

            return result


if __name__ == "__main__":
    content = "🌟 小确幸哲学：高效产出和美食治愈，我全都要！"
    asyncio.run(generate_html_cover(content))
