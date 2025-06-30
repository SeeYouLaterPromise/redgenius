from sqlalchemy.orm import Session
from . import models

def get_topics(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.TrendingTopic).order_by(models.TrendingTopic.created_at.desc()).offset(skip).limit(limit).all()