# core/llm_clients.py
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# 初始化一个强大但有创造力的模型用于分析
analysis_llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

# 初始化一个更便宜、更快的模型用于一些简单的任务
fast_llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)