
import os, openai, pprint
openai.api_key = "sk-b461ffc208b441ecbd9002bc7d7de7af"  # 替换为 DeepSeek 提供的 Key
openai.base_url = "https://api.deepseek.com"   # 末尾带 /v1

resp = openai.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role":"user", "content":"ping"}],
    max_tokens=8,
)
pprint.pp(resp.choices[0].message.content)
