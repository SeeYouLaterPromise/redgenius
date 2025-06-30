# tools/browser_tools.py
from langchain.agents import tool
from langchain.tools import DuckDuckGoSearchRun
import requests
import os

# --- 工具1：使用LangChain内置的DuckDuckGo搜索工具 ---
# 这是一个简单、免费的选项
search_tool_ddg = DuckDuckGoSearchRun()

# --- 工具2：使用Serper Google搜索API（更强大） ---
# 需要在.env中配置SERPER_API_KEY
from langchain.utilities import GoogleSerperAPIWrapper
search_tool_serper = None
if os.getenv("SERPER_API_KEY"):
    search_tool_serper = GoogleSerperAPIWrapper()

# --- 工具3：使用Jina Reader这个强大的开源爬虫工具 ---
# 它是一个API，你给它一个URL，它返回干净的Markdown正文，非常方便
@tool
def scrape_with_jina_reader(url: str) -> str:
    """
    使用Jina Reader API来爬取并提取指定URL网页的干净正文内容(Markdown格式)。
    当你需要深度阅读一篇文章来获取详细信息时，使用此工具。
    """
    print(f"🛠️  调用Jina Reader爬取: {url}")
    reader_url = f"https://r.jina.ai/{url}"
    try:
        response = requests.get(reader_url, timeout=20)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        return f"爬取失败: {e}"

# 我们可以导出一个工具列表
browser_tools = [scrape_with_jina_reader]
if search_tool_serper:
    browser_tools.insert(0, search_tool_serper.run)
else:
    browser_tools.insert(0, search_tool_ddg)