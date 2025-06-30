import requests
from bs4 import BeautifulSoup
from readability import Document
import json
import openai
import os

from .celery_worker import celery_app
from app.database import SessionLocal
from app.models import TrendingTopic

# 从环境变量中获取OpenAI API Key
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- 模块一：爬虫和内容提取 ---
def scrape_article_text(url: str) -> str:
    """根据URL抓取文章正文"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status() # 如果请求失败则抛出异常

        doc = Document(response.text)
        # 使用readability提取标题和正文
        title = doc.title()
        content_html = doc.summary()

        # 使用BeautifulSoup清理HTML标签
        soup = BeautifulSoup(content_html, 'lxml')
        text_content = soup.get_text(separator='\n', strip=True)

        print(f"抓取成功: {title}")
        return f"标题: {title}\n\n正文:\n{text_content}"
    except requests.exceptions.RequestException as e:
        print(f"抓取URL失败: {url}, 错误: {e}")
        return ""

# --- 模块二：AI处理 ---
def get_topics_from_llm(article_text: str) -> dict:
    """调用大模型API，将文章处理成结构化数据"""
    prompt = f"""
    你是一位顶尖的社交媒体内容策划，尤其擅长为小红书平台挖掘和包装热门话题。请仔细阅读以下提供的文章原文，并严格按照下面的要求，以JSON格式返回一个经过你专业策划的热点话题。

    # 要求:
    1. "title": 创作一个极具吸引力、符合小红书风格的爆款标题，不超过25个字。要使用emoji，激发用户好奇心。
    2. "summary": 生成一段100字左右的摘要，简明扼要地概括核心内容，并留下悬念或痛点，引导用户深入了解。
    3. "category": 从以下预设分类中选择一个最合适的：[科技前沿, 商业洞察, 生活方式, 美妆时尚, 情感故事, 社会热点]。
    4. "keywords": 提炼出3-5个核心关键词，用逗号分隔。

    # 文章原文:
    """
    {article_text}
    """

    # 请严格以JSON对象格式返回，不要包含任何额外的解释或Markdown标记。
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo", # 为了速度和成本，我们使用GPT-3.5
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        result_text = response.choices[0].message.content
        return json.loads(result_text)
    except Exception as e:
        print(f"调用LLM API失败: {e}")
        return None

# --- Celery 任务定义 ---
@celery_app.task
def run_hot_topic_pipeline():
    """
    这是我们的主流水线任务，它会被Celery Beat定时触发。
    """
    print("开始执行热点话题获取流水线...")

    # MVP阶段，我们先硬编码几个信源URL
    # 在真实项目中，这里会有一个更复杂的爬虫来动态发现热门文章
    source_urls = [
        "https://www.theverge.com/2024/3/4/24089921/apple-macbook-air-m3-review", # 示例URL，可以替换成您想测试的任何文章链接
        "https://www.ign.com/articles/final-fantasy-7-rebirth-review",
    ]

    db = SessionLocal()
    try:
        for url in source_urls:
            # 1. 抓取文章
            article_text = scrape_article_text(url)
            if not article_text:
                continue

            # 2. 调用AI处理
            topic_data = get_topics_from_llm(article_text)
            if not topic_data:
                continue

            # 3. 存入数据库
            # 检查是否已存在，避免重复
            existing_topic = db.query(TrendingTopic).filter(TrendingTopic.source_url == url).first()
            if not existing_topic:
                new_topic = TrendingTopic(
                    title=topic_data.get("title"),
                    summary=topic_data.get("summary"),
                    category=topic_data.get("category"),
                    keywords=topic_data.get("keywords"),
                    source_url=url
                )
                db.add(new_topic)
                print(f"新增话题到数据库: {new_topic.title}")

        db.commit()
    finally:
        db.close()

    print("流水线执行完毕。")
    return "OK"