from pydantic import BaseModel
import datetime

class Topic(BaseModel):
    id: int
    title: str
    summary: str
    category: str
    keywords: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True
        
# 新增一个用于创建话题的模型，因为它不需要id和created_at
class TopicCreate(BaseModel):
    title: str
    summary: str
    category: str
    keywords: str
    source_url: str