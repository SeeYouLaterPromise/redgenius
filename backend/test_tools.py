# test_tools.py (修正后)
from tools.browser_tools import browser_tools
from tools.database_tools import save_topic_to_database
from dotenv import load_dotenv

load_dotenv()

def main():
    # browser_tools 列表的第一个工具是搜索，第二个是爬虫
    # 现在它们都是完整的Tool对象
    search_tool = browser_tools[0]
    scrape_tool = browser_tools[1]

    # 1. 测试搜索工具
    # print("\n--- 1. 测试搜索 ---")
    # 现在可以安全地使用 .invoke() 方法了
    # search_results = search_tool.invoke({"query": "最新的AI大模型新闻"})
    # print(f"搜索结果: {search_results}\n")

    # ----------------------------------------------------
    #  为了让测试稳定，我们手动指定一个有效的文章链接
    #  在真实的Agent中，它会智能地从search_results中挑选
    # ----------------------------------------------------
    test_link = "https://www.theverge.com/2024/5/14/24156134/google-io-2024-ai-gemini-android-search-destiny"
    print(f"--- 2. 测试爬虫 (使用手动指定的链接: {test_link}) ---")
    
    # 2. 测试爬虫工具
    content = scrape_tool.invoke({"url": test_link})
    if "爬取失败" in content:
        print(f"爬虫失败: {content}")
        return # 如果爬取失败，则终止测试
    
    print(f"爬取内容(前200字): {content[:200]}...\n")

    # 3. 测试数据库写入工具
    print("--- 3. 测试数据库写入 ---")
    dummy_topic = {
        "title": "测试：Google I/O 2024的AI发布",
        "summary": "这是Google I/O大会上关于Gemini、Android和AI搜索的最新进展的测试摘要。",
        "category": "科技前沿",
        "keywords": "Google, AI, Gemini, I/O 2024",
        "source_url": test_link # 使用我们爬取的链接作为源URL
    }
    result = save_topic_to_database.invoke({"topic_data": dummy_topic})
    print(f"数据库写入结果: {result}")


if __name__ == "__main__":
    main()