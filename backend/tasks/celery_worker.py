from celery import Celery
from celery.schedules import crontab
import os
from dotenv import load_dotenv

# 加载.env文件中的环境变量
load_dotenv()

# 创建Celery实例
# 第一个参数是项目名，broker是我们的"任务公告板"Redis
celery_app = Celery(
    "redgenius_tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
    # include=["tasks.pipelines"] # 告诉Celery去哪里找我们的任务函数
)

# Celery的配置
celery_app.conf.update(
    result_expires=3600,
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)

@celery_app.task
def trigger_ceo_agent_task(high_level_goal: str):
    """
    这个任务只负责一件事：用一个高层目标唤醒CEO Agent。
    """
    from agents.ceo_agent import ceo_agent_executor
    print(f"⏰ 定时任务触发，唤醒CEO -> 目标: {high_level_goal}")
    result = ceo_agent_executor.invoke({"input": high_level_goal})
    print(f"✅ CEO任务完成, 最终报告: {result}")
    return str(result)

celery_app.conf.beat_schedule = {
    'ceo-run-topic-discovery-flow': {
        'task': 'tasks.celery_worker.trigger_ceo_agent_task',
        'schedule': crontab(minute='0'), # 每小时执行
        'args': ("寻找一个关于'AI赋能内容创作'的最新热点，并完成分析、归档。",), # CEO的指令非常高层
    },
}

if __name__ == "__main__":
    celery_app.start()