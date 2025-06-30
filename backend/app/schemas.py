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