import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from xhs_toolkit.src.core.config import XHSConfig
from xhs_toolkit.src.core.browser import ChromeDriverManager

from xhs_toolkit.src.core.exceptions import AuthenticationError, handle_exception
from xhs_toolkit.src.xiaohongshu.models import CRITICAL_CREATOR_COOKIES

from typing import List, Dict, Any
import json
from pathlib import Path
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

class XHSLogin:
    def __init__(self):
        self.config = XHSConfig("xhs_toolkit/.env")
        self.browser_manager = ChromeDriverManager(self.config)
    
    @handle_exception
    def save_cookies_interactive(self) -> bool:
        """
        交互式保存cookies - 支持创作者中心（命令行使用）
        
        Returns:
            是否成功保存cookies
            
        Raises:
            AuthenticationError: 当保存过程出错时
        """
        try:
            # 创建浏览器驱动
            driver = self.browser_manager.create_driver()
            
            # 导航到创作者中心
            self.browser_manager.navigate_to_creator_center()
            
            # 自动点击二维码登录选项
            self._click_qrcode_login()
            
            # 等待扫码登录完成
            if self._wait_for_login():
                cookies = driver.get_cookies()
                
                if not cookies:
                    raise AuthenticationError("未获取到cookies，请确保已正确登录", auth_type="cookie_save")
                
                # 验证关键创作者cookies
                validation_result = self._validate_critical_cookies(cookies)
                
                # 保存cookies
                save_result = self._save_cookies_to_file(cookies, validation_result)
                
                if save_result:
                    print("✅ Cookies保存成功, 保存路径：", self.config.cookies_file)
                    return True
                else:
                    raise AuthenticationError("Cookies保存失败", auth_type="cookie_save")
            else:
                raise AuthenticationError("登录超时，请重试", auth_type="cookie_save")
                
        except Exception as e:
            if isinstance(e, AuthenticationError):
                raise
            else:
                raise AuthenticationError(f"获取cookies过程出错: {str(e)}", auth_type="cookie_save") from e
        finally:
            # 确保浏览器被关闭
            self.browser_manager.close_driver()

    def _click_qrcode_login(self) -> None:
        """自动点击二维码登录选项"""
        try:
            # 定位二维码登录按钮（根据实际页面结构调整选择器）
            qrcode_button = WebDriverWait(self.browser_manager.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "img.css-wemwzq"))
            )
            qrcode_button.click()
            print("👉 已自动点击二维码登录选项")
        except TimeoutException:
            print("⚠️ 未找到二维码登录按钮，可能页面结构已变化")
            print("请手动点击页面上的二维码登录选项")

    def _wait_for_login(self) -> bool:
        """
        等待登录完成，通过检测登录成功后才会出现的元素来判断
        
        Returns:
            登录是否成功
        """
        driver = self.browser_manager.driver
        
        # 定义登录成功后才会出现的元素选择器（根据实际页面结构调整）
        login_success_selector = (By.CSS_SELECTOR, "div.publish-card")
        
        try:
            # 等待登录成功元素出现，超时时间设为300秒（5分钟）
            WebDriverWait(driver, 300).until(
                EC.presence_of_element_located(login_success_selector)
            )
            return True
        except TimeoutException:
            return False
        
    def _validate_critical_cookies(self, cookies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        验证关键创作者cookies（宽松模式）
        
        Args:
            cookies: Cookie列表
            
        Returns:
            验证结果字典
        """
        print("🔍 验证创作者cookies（宽松模式）...")
        
        found_critical = []
        for cookie in cookies:
            if cookie.get('name') in CRITICAL_CREATOR_COOKIES:
                found_critical.append(cookie.get('name'))
        
        print(f"✅ 找到关键创作者cookies: {found_critical}")
        
        # 宽松处理：不再严格要求特定cookies
        if found_critical:
            print(f"🎉 发现 {len(found_critical)} 个关键cookies，验证通过")
        else:
            print("💡 未发现预定义的关键cookies，但仍保存所有cookies")
        
        return {
            "found_critical": found_critical,
            "missing_critical": [],  # 宽松模式：不报告缺失
            "total_cookies": len(cookies)
        }
    
    def _save_cookies_to_file(self, cookies: List[Dict[str, Any]], validation_result: Dict[str, Any]) -> bool:
        """
        保存cookies到文件
        
        Args:
            cookies: Cookie列表
            validation_result: 验证结果
            
        Returns:
            是否保存成功
        """
        try:
            print("📁 开始准备保存cookies...")
            
            # 创建cookies目录
            cookies_dir = Path(self.config.cookies_dir)
            print(f"📁 cookies目录: {cookies_dir}")
            cookies_dir.mkdir(parents=True, exist_ok=True)
            print("✅ cookies目录创建成功")
            
            # 构建新格式的cookies数据
            print("📦 构建cookies数据结构...")
            cookies_data = {
                'cookies': cookies,
                'saved_at': datetime.now().isoformat(),
                'domain': 'creator.xiaohongshu.com',  # 标记为创作者中心cookies
                'critical_cookies_found': validation_result["found_critical"],
                'version': '2.0'  # 版本标记
            }
            print(f"📦 数据结构构建完成，包含 {len(cookies)} 个cookies")
            
            # 保存cookies
            cookies_file = Path(self.config.cookies_file)
            print(f"💾 准备写入文件: {cookies_file}")
            
            with open(cookies_file, 'w', encoding='utf-8') as f:
                json.dump(cookies_data, f, ensure_ascii=False, indent=2)
            
            # 验证文件是否成功写入
            if cookies_file.exists():
                file_size = cookies_file.stat().st_size
                print(f"✅ 文件写入成功: {cookies_file}")
                print(f"📊 文件大小: {file_size} 字节")
                print(f"📊 共保存了 {len(cookies)} 个cookies")
                print(f"🔑 关键创作者cookies: {len(validation_result['found_critical'])}/{len(CRITICAL_CREATOR_COOKIES)}")
                
                # 显示关键cookies列表
                if validation_result['found_critical']:
                    print(f"🔑 关键cookies列表: {validation_result['found_critical']}")
                
                return True
            else:
                print("❌ 文件写入失败：文件不存在")
                return False
            
        except PermissionError as e:
            print(f"❌ 权限错误，无法写入cookies文件: {e}")
            return False
        except json.JSONEncodeError as e:
            print(f"❌ JSON编码错误: {e}")
            return False
        except Exception as e:
            print(f"❌ 保存cookies失败: {e}")
            print(f"❌ 错误类型: {type(e).__name__}")
            import traceback
            print(f"❌ 错误详情: {traceback.format_exc()}")
            return False
        
if __name__ == "__main__":
    xhs_login = XHSLogin()
    xhs_login.save_cookies_interactive()