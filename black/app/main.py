from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from ..auth.xhs_login import XHSLogin, AuthenticationError
from ..publish.auto_publish import auto_publish, PublishRequest

from fastapi import UploadFile, File, Form
from pydantic import BaseModel
from typing import List

from black.agents.text_agent import (
    fetch_url,
    summary_content,
    extract_hotspot,
    xhs_content_generator,
)
from typing import List
import shutil
import os
import uuid

app = FastAPI()

@app.post("/login")
def get_xhs_cookies():
    try:
        xhs_login = XHSLogin()
        result = xhs_login.save_cookies_interactive()
        if result:
            return JSONResponse(content={"success": True, "msg": "Cookies 获取并保存成功"})
        else:
            return JSONResponse(content={"success": False, "msg": "Cookies 获取失败"})
    except AuthenticationError as e:
        return JSONResponse(content={"success": False, "msg": str(e)})
    except Exception as e:
        return JSONResponse(content={"success": False, "msg": f"未知错误: {str(e)}"})
    
# FastAPI 路由
@app.post("/publish/path")
async def publish_note(req: PublishRequest):
    try:
        result = await auto_publish(
            title=req.title,
            content=req.content,
            topics=req.topics,
            images=req.images,
            videos=req.videos,
            location=req.location
        )
        return {"message": "✅ 发布成功", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/publish/entity")
async def upload_and_publish(
    title: str = Form(...),
    content: str = Form(...),
    topics: List[str] = Form(...),
    location: str = Form(""),
    images: List[UploadFile] = File(...)
):
    try:
        # 保存上传的文件
        saved_paths = []
        upload_dir = "uploaded_images"
        os.makedirs(upload_dir, exist_ok=True)

        for image in images:
            filename = f"{uuid.uuid4().hex}_{image.filename}"
            file_path = os.path.join(upload_dir, filename)
            with open(file_path, "wb") as f:
                shutil.copyfileobj(image.file, f)
            saved_paths.append(file_path)

        # 发布笔记
        result = await auto_publish(
            title=title,
            content=content,
            topics=topics,
            images=saved_paths,
            videos=None,
            location=location
        )

        return {"message": "✅ 发布成功", "result": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# 请求模型
class URLRequest(BaseModel):
    url: str

class SummaryRequest(BaseModel):
    content1: str
    content2: str

class ExtractRequest(BaseModel):
    content: str

class ContentGenRequest(BaseModel):
    hotspots: List[str]

# ========== 接口定义 ==========

@app.post("/fetch-url")
async def api_fetch_url(request: URLRequest):
    await fetch_url(request.url)
    return {"message": "✅ 已完成 fetch_url（控制台打印内容）"}

@app.post("/summary-content")
async def api_summary_content(request: SummaryRequest):
    await summary_content(request.content1, request.content2)
    return {"message": "✅ 已完成 summary_content（控制台打印内容）"}

@app.post("/extract-hotspot")
async def api_extract_hotspot(request: ExtractRequest):
    result = await extract_hotspot(request.content)
    return {"hotspots": result}

@app.post("/xhs-content-generator")
async def api_xhs_content_generator(request: ContentGenRequest):
    result = await xhs_content_generator(request.hotspots)
    return {"result": result}
