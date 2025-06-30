from sqlalchemy import Column, Integer, String, DateTime
from .database import Base
import datetime

class TrendingTopic(Base):
    __tablename__ = "trending_topics"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    summary = Column(String)
    category = Column(String, index=True)
    keywords = Column(String)
    source_url = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.datetime.now)