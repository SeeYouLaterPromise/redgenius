# RedGenius Backend

我们需要在这里开发 RedGenius 的后端。
RedGenius 可以被理解为小红书创作助手，包含搜集热点话题内容、分析生成爆点、将爆点视为标题，进行小红书内容创作

请确保每个终端都已激活 Python 虚拟环境:

终端 1：启动 FastAPI Web 服务器

```bash
uvicorn app.main:app --reload
```

终端 2：启动 Celery Worker（后台工人）

```bash
celery -A tasks.celery_worker worker --loglevel=info -P gevent
```

终端 3：启动 Celery Beat（定时调度器）

```bash
celery -A tasks.celery_worker beat --loglevel=info
```
