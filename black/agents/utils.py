import os
import tempfile
from pathlib import Path
from playwright.async_api import async_playwright


async def save_html_and_screenshot(html: str, output_dir="screenshots", filename="xhs_cover.png"):
    """
    将 HTML 字符串保存为临时文件，并用 Playwright 截图保存成 PNG。
    
    Args:
        html (str): 完整的 HTML 内容
        output_dir (str): 截图保存目录（默认 "screenshots"）
        filename (str): 输出文件名（默认 "xhs_cover.png"）

    Returns:
        str: 截图的文件路径
    """
    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)
    screenshot_path = os.path.join(output_dir, filename)

    # 将 HTML 写入临时文件
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
        html_path = Path(f.name).as_uri()  # 转为 file:// 路径

    # 用 Playwright 打开 HTML 文件并截图
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 600, "height": 800},  # 3:4 比例
            device_scale_factor=2  # 高清截图
        )
        page = await context.new_page()
        await page.goto(html_path)
        await page.screenshot(path=screenshot_path, full_page=True)
        await browser.close()

    # 清理临时 HTML 文件（可选）
    os.unlink(f.name)

    return screenshot_path

def clean_html_response(result: str) -> str:
    lines = result.strip().splitlines()

    # 去除第一行和最后一行（通常是 ```html 和 ```）
    if lines[0].strip().startswith("```"):
        lines = lines[1:]
    if lines[-1].strip() == "```":
        lines = lines[:-1]

    return "\n".join(lines).strip()



def load_from_txt(filepath: str) -> str:
    """
    从指定的 .txt 文件中读取文本。
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"找不到文件: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read().strip()
    return content


import os

def save_to_txt(content: str,
                       filepath: str,
                       mode: str = "w",
                       encoding: str = "utf-8") -> None:
    """
    将字符串内容写入指定的 .txt 文件。
    
    Parameters
    ----------
    content : str
        需要写入文件的文本内容。
    filepath : str
        目标文件路径（含文件名）。
    mode : {"w", "a"}, default "w"
        写入模式：
        - "w"  覆盖写入（如文件已存在会被覆盖）。
        - "a"  追加写入（内容追加到文件末尾）。
    encoding : str, default "utf-8"
        文件编码方式。
    """
    # 检查写入模式合法性
    if mode not in {"w", "a"}:
        raise ValueError(f"不支持的 mode: {mode}，只允许 'w' 或 'a'。")
    
    # 如果目录不存在则创建
    dir_path = os.path.dirname(os.path.abspath(filepath))
    if dir_path and not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    
    # 写入文件
    with open(filepath, mode, encoding=encoding) as f:
        f.write(content if content.endswith("\n") else content + "\n")




if __name__ == "__main__":
    html_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "output/card.html"))
    save_html_and_screenshot()