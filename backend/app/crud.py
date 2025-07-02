from sqlalchemy.orm import Session
from . import models, schemas

def get_topics(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.TrendingTopic).order_by(models.TrendingTopic.created_at.desc()).offset(skip).limit(limit).all()

def create_topic(db: Session, topic_data: schemas.TopicCreate):
    # 将Pydantic模型转换为SQLAlchemy模型
    db_topic = models.TrendingTopic(**topic_data.model_dump())
    db.add(db_topic)
    # 注意：这里只add不commit，commit操作将在调用它的地方完成
    return db_topic