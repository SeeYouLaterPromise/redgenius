# RedGenius Backend

我们需要在这里开发 RedGenius 的后端。
RedGenius 可以被理解为小红书创作助手，包含:

1. 搜集热点话题内容供用户参考`选题`，确定`原文素材`。这里的`原文素材`是由 ai 收集来的内容和用户自己上传的内容组成。
2. 根据`原文素材`分析生成`爆点`
3. 将`爆点`视为标题，进行小红书`内容`创作：要求内容简短精悍，短时间内让用户快速获取信息
4. 为`内容`进行配图：先生成 html，然后截屏 html 为图片
5. 调用 `xhs-toolkit` 进行全自动化发布

后端实现路线图
我们将分阶段完成整个后端系统的搭建：

第一阶段：项目奠基 (Project Setup & Foundations)

目标: 创建项目结构，配置虚拟环境，安装所有依赖，并初始化数据库。

产出: 一个可以成功运行的、空的 FastAPI 服务和一个准备就绪的数据库。

第二阶段：构建“工具箱” (Building the Toolbox)

目标: 实现最底层的、可被 Agent 调用的原子工具，如网页搜索、内容抓取、数据库读写。

第三阶段：创建“专家 Agent” (Creating Specialist Agents)

目标: 创建“调研 Agent”和“分析 Agent”，并赋予它们使用特定工具的能力。

第四阶段：创建“CEO Agent”与总编排器 (The Orchestrator)

目标: 创建顶层的 CEO Agent，让它能够理解高级指令，并指挥专家 Agent 协同工作。

第五阶段：集成 Celery，实现自动化

目标: 将 Agent 的执行流程放入 Celery 后台任务中，并设置定时器，实现无人值守的自动化内容搜集。

第六阶段：开发面向前端的 API

目标: 编写供我们 React 前端调用的 API 接口，例如获取热点话题列表、提交新的创作任务等。

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
