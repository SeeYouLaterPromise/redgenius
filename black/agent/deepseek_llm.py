import asyncio
from openai import OpenAI
from mcp_agent.workflows.llm.augmented_llm import AugmentedLLM, RequestParams

DEEPSEEK_ENDPOINT = "https://api.deepseek.com/v1"
DEEPSEEK_API_KEY = "sk-b461ffc208b441ecbd9002bc7d7de7af"  # 强烈建议用环境变量管理 key

class DeepSeekAugmentedLLM(AugmentedLLM):
    def __init__(self, agent, model: str = "deepseek-chat", history_size: int = 8, **_):
        """
        agent : mcp_agent.agents.agent.Agent（attach_llm 会自动塞进来）
        model : DeepSeek 的聊天模型名称
        """
        super().__init__(agent=agent)
        self.history, self.max_hist = [], history_size
        self.model = model
        self.client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_ENDPOINT)

    async def generate_str(self, message: str, **kw):
        # Append the message to the history, so that context is carried forward
        self.history.append({"role": "user", "content": message})
        response = await self._a_chat(message)
        return response

    async def generate(self, request_params: RequestParams):
        return await self._a_chat(request_params.message)

    async def generate_structured(self, schema, message: str, **kw):
        txt = await self._a_chat(message)
        return await super()._convert_str_to_schema(schema, txt)

    async def _chat(self, prompt: str) -> str:
        msgs = self.history + [{"role": "user", "content": prompt}]
        reply = await self._call_deepseek(msgs)
        # Add the model response to history to maintain context
        self.history.append({"role": "assistant", "content": reply})
        self.history = self.history[-self.max_hist:]
        return reply

    async def _a_chat(self, prompt: str) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._sync_chat, prompt)

    def _sync_chat(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=self.history,  # Send entire conversation history
            max_tokens=256,
        )
        return response.choices[0].message.content
