# agents/research_agent.py
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from core.llm_clients import fast_llm
from tools.browser_tools import browser_tools

# 为Research Agent定制的Prompt
research_prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一名世界顶级的互联网信息研究员。你的任务是根据要求，使用工具在网上搜索信息，并抓取相关网页的核心内容。你只需要提供原始信息，不要自己做总结。"),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# 创建Agent
research_agent_runnable = create_openai_tools_agent(fast_llm, browser_tools, research_prompt)
research_agent_executor = AgentExecutor(agent=research_agent_runnable, tools=browser_tools, verbose=True)