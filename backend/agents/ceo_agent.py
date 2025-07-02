# agents/ceo_agent.py
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from core.llm_clients import analysis_llm # CEO需要强大的模型来思考
from tools.department_tools import department_tools
from tools.database_tools import database_tools

# CEO的工具箱是“部门”+“档案室”
ceo_tools = department_tools + database_tools

# 为CEO定制的“元指令” (Meta-Prompt)
ceo_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """你是“红书智作”项目的CEO，一个顶级的AI智能体总指挥。
        你的目标是理解高层级的任务，并清晰、有条理地将任务拆解并委派给你的下属部门（也就是你的工具）。
        你从不亲自执行底层任务（如搜索、爬取），你只负责指挥、决策和串联结果。

        你的决策流程通常是：
        1.  调用【调研部】去获取原始信息。
        2.  拿到信息后，调用【分析部】进行处理，形成结构化报告。
        3.  拿到报告后，调用【数据库工具】将其归档。
        4.  如果任何一步失败，你需要评估情况并决定是终止任务还是重试。
        """
    ),
    ("user", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad"),
])

# 创建CEO Agent
ceo_agent_runnable = create_openai_tools_agent(analysis_llm, ceo_tools, ceo_prompt)
ceo_agent_executor = AgentExecutor(agent=ceo_agent_runnable, tools=ceo_tools, verbose=True)