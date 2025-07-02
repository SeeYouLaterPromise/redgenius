# tools/browser_tools.py
from langchain.agents import tool
from langchain.tools import Tool # <--- 1. 导入Tool类
import requests
import os

from langchain_community.tools import DuckDuckGoSearchRun
from langchain_community.utilities import GoogleSerperAPIWrapper

def get_search_tool() -> Tool: # <--- 2. 明确返回类型为Tool
    """
    根据环境变量决定使用哪个搜索工具。
    这个函数返回的是一个配置好的、完整的LangChain Tool对象。
    """
    if os.getenv("SERPER_API_KEY"):
        print("INFO: Using [Google Serper] as the search tool.")
        search_api = GoogleSerperAPIWrapper()
        # 3. 使用Tool类来构造工具
        return Tool(
            name="internet_search",
            func=search_api.run,
            description="首选工具。当你需要搜索互联网以查找最新的信息、事件或文章链接时使用。输入应该是一个搜索查询词。",
        )
    else:
        print("WARNING: SERPER_API_KEY not found. Using [DuckDuckGo] as a fallback search tool.")
        search_api = DuckDuckGoSearchRun()
        # 3. 使用Tool类来构造工具
        return Tool(
            name="internet_search",
            func=search_api.run,
            description="备用工具。当你需要搜索互联网查找信息时使用。这是一个免费的搜索引擎。",
        )

@tool
def scrape_web_content(url: str) -> str:
    """
    使用Jina Reader API来爬取并提取指定URL网页的干净正文内容(Markdown格式)。
    这是获取网页详细信息的首选工具。
    """
    # ... 这个工具的内部代码保持不变 ...
    print(f"🛠️  调用Jina Reader爬取: {url}")
    reader_url = f"https://r.jina.ai/{url}"
    try:
        response = requests.get(reader_url, timeout=30)
        response.raise_for_status()
        return response.text[:4000]
    except requests.exceptions.RequestException as e:
        return f"爬取失败: {e}"

# 导出一个最终的工具列表
browser_tools = [get_search_tool(), scrape_web_content]