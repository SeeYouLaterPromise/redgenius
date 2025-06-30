# agents/analysis_agent.py
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from core.llm_clients import analysis_llm

# 我们之前设计的那个Prompt
analysis_prompt_template = """
你是一位顶尖的社交媒体内容策划...（此处省略和之前一样的详细Prompt）...
# 文章原文:
"""
{article_text}
"""
# 请严格以JSON对象格式返回...
"""

analysis_prompt = ChatPromptTemplate.from_template(analysis_prompt_template)
json_parser = JsonOutputParser()

# 创建分析链 (LLM Chain)
analysis_chain = analysis_prompt | analysis_llm | json_parser