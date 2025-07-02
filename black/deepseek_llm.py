# deepseek_llm.py
import os, asyncio, openai
from mcp_agent.workflows.llm.augmented_llm import AugmentedLLM, RequestParams

DEESEEK_ENDPOINT = "https://api.deepseek.com"   # 不带 /v1

class DeepSeekAugmentedLLM(AugmentedLLM):
    def __init__(self, agent, model: str = "deepseek-chat", history_size: int = 8, **_):
        """
        agent : mcp_agent.agents.agent.Agent（attach_llm 会自动塞进来）
        model : DeepSeek 的聊天模型名称
        """
        super().__init__(agent=agent)
        self.history, self.max_hist = [], history_size
        openai.api_key  = os.getenv("OPENAI_API_KEY")  # 已在环境变量配置
        openai.api_base = os.getenv("OPENAI_API_BASE", DEESEEK_ENDPOINT)
        self.model = model

    # ---------- 3 个抽象方法 ---------- #
    async def generate_str(self, message: str, **kw):
        return await self._a_chat(message)

    async def generate(self, request_params: RequestParams):
        return await self._a_chat(request_params.message)

    async def generate_structured(self, schema, message: str, **kw):
        txt = await self._a_chat(message)
        return await super()._convert_str_to_schema(schema, txt)

    # ---------- 内部：异步封装同步 SDK ---------- #
    async def _chat(self, prompt: str) -> str:
        msgs = self.history + [{"role": "user", "content": prompt}]
        reply = await self._call_deepseek(msgs)
        # 追加历史并裁剪
        self.history.extend([msgs[-1], {"role":"assistant","content":reply}])
        self.history = self.history[-self.max_hist:]
        return reply
    
    async def _a_chat(self, prompt: str) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._sync_chat, prompt)

    def _sync_chat(self, prompt: str) -> str:
        rsp = openai.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=256,
        )
        return rsp.choices[0].message.content
