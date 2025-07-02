from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List # <--- 1. 从typing模块导入List
from . import models, crud, schemas
from .database import SessionLocal, engine
import redis

# 在应用启动时创建数据库表
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 连接到我们用Docker启动的Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# 依赖项：为每个请求提供一个数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    # 测试一下Redis连接
    try:
        redis_client.ping()
        redis_status = "connected"
    except redis.exceptions.ConnectionError:
        redis_status = "disconnected"
    return {"message": "红书智作后端正在运行", "database": "connected", "redis": redis_status}

# v-- 2. 将 list[schemas.Topic] 修改为 List[schemas.Topic] --v
@app.get("/api/topics", response_model=List[schemas.Topic])
def read_topics(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    从数据库获取热点话题列表
    """
    topics = crud.get_topics(db, skip=skip, limit=limit)
    return topics