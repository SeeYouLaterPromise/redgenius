# tools/database_tools.py
from langchain.agents import tool
from app.database import SessionLocal
from app import crud, schemas

@tool
def save_topic_to_database(topic_data: dict) -> str:
    """
    将一个结构化的话题JSON对象，保存到最终的数据库中。
    这是流程的最后一步。topic_data必须包含title, summary, category, keywords, source_url。
    """
    print(f"🛠️  正在存入数据库: {topic_data.get('title')}")
    db = SessionLocal()
    try:
        # Pydantic模型可以帮助我们验证数据
        # (注: 您需要在schemas.py和crud.py中相应地增加TopicCreate模型和create_topic函数)
        validated_data = schemas.TopicCreate(**topic_data)
        crud.create_topic(db=db, topic_data=validated_data)
        db.commit()
        return "话题已成功存入数据库。"
    except Exception as e:
        db.rollback()
        return f"存入数据库失败: {e}"
    finally:
        db.close()

database_tools = [save_topic_to_database]