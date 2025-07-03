from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from ..auth.xhs_login import XHSLogin, AuthenticationError

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