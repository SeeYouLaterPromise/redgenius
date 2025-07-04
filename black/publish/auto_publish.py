import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from xhs_toolkit.src.xiaohongshu.client import XHSClient
from xhs_toolkit.src.core.config import XHSConfig
from xhs_toolkit.src.xiaohongshu.models import XHSNote

from pydantic import BaseModel, Field
from typing import List, Optional
import asyncio

# 请求体模型
class PublishRequest(BaseModel):
    title: str = Field(..., example="自动发布测试标题")
    content: str = Field(..., example="这是小红书笔记内容")
    topics: List[str] = Field(..., example=["#测试", "#自动发布"])
    images: List[str] = Field(..., example=["F:/path/to/image1.png", "F:/path/to/image2.jpg"])
    videos: Optional[List[str]] = Field(default=None, example=None)
    location: Optional[str] = Field(default="", example="上海")


async def auto_publish(title: str, content: str, images=None, videos=None, 
                                   topics=None, location: str = ""):
    """
    自动发布小红书笔记 - 支持创作者中心（命令行使用）

    Returns:
        None
    """
    config = XHSConfig("xhs_toolkit/.env")
    note = await XHSNote.async_smart_create(
                    title=title,
                    content=content,
                    topics=topics,
                    location=location,
                    images=images,
                    videos=videos
                )
    try:
        # 创建小红书客户端
        client = XHSClient(config=config)

        # 执行发布过程
        result = await client.publish_note(note)
        print(result.success)

        print("✅ 自动发布完成")
    except Exception as e:
        print(f"❌ 自动发布失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    import asyncio
    # 示例数据
    title = "自动发布测试"
    content = "这是一个自动发布的测试笔记内容。"
    images = ["F:/yexin/redgenius/black/publish/simplify.png"]
    videos = None
    # images = ["image1.jpg", "image2.jpg"]
    # videos = ["video1.mp4"]
    topics = ["#测试", "#自动发布"]
    location = "北京"

    # 运行自动发布
    asyncio.run(auto_publish(title, content, images, videos, topics, location))