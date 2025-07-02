# tools/department_tools.py
from langchain.agents import tool
from agents.research_agent import research_agent_executor
from agents.analysis_agent import analysis_chain

@tool
def research_department(query: str) -> str:
    """
    调用调研部。当你需要从互联网上搜索和抓取信息时使用。
    例如: "请调研部查找关于'量子计算'的最新文章并爬取内容"。
    返回爬取到的文章正文。
    """
    print(f"CEO 正在调用 [调研部] -> 查询: {query}")
    # 注意：我们实际上传递给Research Agent的指令可以更具体
    detailed_input = f"请搜索关于'{query}'的最新文章，找到一篇看起来最热门或最深入的文章，然后爬取它的正文内容。"
    result = research_agent_executor.invoke({"input": detailed_input})
    return result.get("output", "调研部未能返回有效结果。")

@tool
def analysis_department(article_text: str) -> dict:
    """
    调用分析部。当你拥有了原始的文章素材，需要将其处理成结构化的JSON报告时使用。
    报告包含title, summary, category, keywords。
    """
    print(f"CEO 正在调用 [分析部] -> 分析文章...")
    result = analysis_chain.invoke({"article_text": article_text})
    return result

# 我们将所有“部门级”工具汇集起来
department_tools = [research_department, analysis_department]