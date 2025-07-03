import openai

client = openai.OpenAI(
    api_key="sk-",
    base_url="https://api.deepseek.com/v1",
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Give me an inspirational quote"}]
)

print(response.choices[0].message.content)

