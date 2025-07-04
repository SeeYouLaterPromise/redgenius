# hotspot_research_agent.py
import asyncio
import re
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from black.agent.deepseek_llm import DeepSeekAugmentedLLM
# 这里我们使用默认的LLM以便于演示

# 初始化MCPApp，为我们的应用命名
app = MCPApp("hotspot_researcher")

async def main():
    """
    主函数，定义并运行我们的Agent工作流
    """
    async with app.run():
        # ------------------------------------------------------------------
        # 1. 定义“发现者”Agent (Finder)
        # 它的任务是发现当前的热点话题
        # ------------------------------------------------------------------
        finder = Agent(
            name="finder",
            instruction="你是一个敏锐的趋势观察员，擅长从互联网上发现最新的热点话题。请用中文回答。",
            # 假设它需要网络访问来发现热点
            server_names=["fetch"], 
        )

        chosen_topic = None
        
        # ------------------------------------------------------------------
        # 2. 运行“发现者”Agent，获取热点列表
        # ------------------------------------------------------------------
        print("--- 步骤1: 启动Finder Agent发现热点话题 ---")
        async with finder:
            # 附加一个LLM到Agent上
            llm = await finder.attach_llm(DeepSeekAugmentedLLM) # 如果使用特定LLM
            # llm = await finder.attach_llm()

            # 提出问题，让LLM生成热点话题
            # 这里的提问方式直接决定了产出质量
            hot_topics_str = await llm.generate_str(
                "请发现当前最热门的3个社会热点话题，并以有序列表的形式返回 (例如 '1. ...' '2. ...')"
            )
            
            print("\n>>> Finder发现的当前热点：\n")
            print(hot_topics_str)

            # 从返回的字符串中解析出第一个话题用于后续研究
            # 这是一个简化的处理方式，实际应用中可以让人工选择
            topic_list = re.findall(r'^\d+\.\s*(.*)', hot_topics_str, re.MULTILINE)
            if topic_list:
                chosen_topic = topic_list[0]
                print(f"\n--- 自动选择第一个主题进行深入研究：【{chosen_topic}】---\n")
            else:
                print("未能解析出热点话题，程序退出。")
                return

        # 如果没有选出话题，则不继续
        if not chosen_topic:
            return

        # ------------------------------------------------------------------
        # 3. 定义“研究员”Agent (Researcher)
        # 它的任务是针对一个具体话题，生成调研报告
        # ------------------------------------------------------------------
        researcher = Agent(
            name="researcher",
            instruction="你是一位资深的行业分析师，将根据我提供的主题，撰写一份详尽的调研报告。请用中文回答。",
            server_names=["fetch"],
        )

        # ------------------------------------------------------------------
        # 4. 运行“研究员”Agent，生成调研报告
        # ------------------------------------------------------------------
        print("--- 步骤2: 启动Researcher Agent生成调研报告 ---")
        async with researcher:
            # 附加LLM
            llm = await researcher.attach_llm(DeepSeekAugmentedLLM) # 如果使用特定LLM
            # llm = await researcher.attach_llm()

            # 提出带有明确指令和上下文（我们选定的话题）的问题
            report = await llm.generate_str(
                f"请针对以下主题，生成一份详细的热点调研报告：\n\n"
                f"主题：'{chosen_topic}'\n\n"
                f"报告应包含以下几个部分：\n"
                f"1. **背景分析**：这个话题为什么会成为热点？\n"
                f"2. **当前现状**：目前围绕这个话题有哪些主要观点和事件？\n"
                f"3. **未来趋势**：这个话题未来可能会如何发展？\n"
                f"4. **总结**：简要总结你的发现。"
            )

            print("\n>>> Researcher生成的调研报告：\n")
            print(report)
            print("\n--- 热点调研任务完成 ---")


if __name__ == "__main__":
    # 运行异步主函数
    asyncio.run(main())