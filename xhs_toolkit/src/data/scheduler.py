"""
数据采集定时任务调度器

支持基于cron表达式的定时数据采集，以及程序启动时的立即采集
"""

import os
import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.executors.asyncio import AsyncIOExecutor

from .storage_manager import storage_manager

logger = logging.getLogger(__name__)


class DataCollectionScheduler:
    """数据采集调度器"""
    
    def __init__(self):
        self.scheduler: Optional[AsyncIOScheduler] = None
        self.client = None
        self._running = False
        
    def initialize(self, client) -> None:
        """
        初始化调度器
        
        Args:
            client: 小红书客户端实例
        """
        self.client = client
        
        # 创建调度器
        executors = {
            'default': AsyncIOExecutor()
        }
        
        job_defaults = {
            'coalesce': False,
            'max_instances': 1
        }
        
        timezone = os.getenv('TIMEZONE', 'Asia/Shanghai')
        
        self.scheduler = AsyncIOScheduler(
            executors=executors,
            job_defaults=job_defaults,
            timezone=timezone
        )
        
        logger.info(f"数据采集调度器已初始化，时区: {timezone}")
        
    async def start(self) -> None:
        """启动调度器"""
        if not self.scheduler:
            logger.error("调度器未初始化")
            return
            
        if self._running:
            logger.warning("调度器已在运行中")
            return
            
        # 检查是否启用自动采集
        enable_auto_collection = os.getenv('ENABLE_AUTO_COLLECTION', 'true').lower() == 'true'
        
        if not enable_auto_collection:
            logger.info("自动数据采集已禁用")
            return
            
        # 启动调度器
        self.scheduler.start()
        self._running = True
        logger.info("数据采集调度器已启动")
        
        # 添加定时任务
        self._add_scheduled_jobs()
        
        # 检查是否需要在启动时立即执行一次采集
        run_on_startup = os.getenv('RUN_ON_STARTUP', 'true').lower() == 'true'
        
        if run_on_startup:
            logger.info("程序启动时执行数据采集...")
            await self._run_data_collection()
            
    def _add_scheduled_jobs(self) -> None:
        """添加定时任务"""
        # 获取cron表达式
        cron_schedule = os.getenv('COLLECTION_SCHEDULE', '0 1 * * *')
        
        try:
            # 解析cron表达式
            cron_parts = cron_schedule.split()
            
            if len(cron_parts) == 5:
                # 标准cron格式：分 时 日 月 星期
                minute, hour, day, month, day_of_week = cron_parts
                second = '0'
            elif len(cron_parts) == 6:
                # 扩展cron格式：秒 分 时 日 月 星期
                second, minute, hour, day, month, day_of_week = cron_parts
            else:
                raise ValueError(f"无效的cron表达式格式: {cron_schedule}")
                
            # 创建cron触发器
            trigger = CronTrigger(
                second=second,
                minute=minute,
                hour=hour,
                day=day,
                month=month,
                day_of_week=day_of_week
            )
            
            # 添加定时任务
            self.scheduler.add_job(
                func=self._run_data_collection,
                trigger=trigger,
                id='data_collection_job',
                name='数据采集任务',
                replace_existing=True
            )
            
            logger.info(f"定时数据采集任务已添加，计划: {cron_schedule}")
            
        except Exception as e:
            logger.error(f"添加定时任务失败: {e}")
            
    async def _run_data_collection(self) -> None:
        """执行数据采集"""
        if not self.client:
            logger.error("客户端未初始化，无法执行数据采集")
            return
            
        logger.info("开始执行数据采集任务...")
        start_time = datetime.now()
        
        # 获取采集配置
        collect_dashboard = os.getenv('COLLECT_DASHBOARD', 'true').lower() == 'true'
        collect_content = os.getenv('COLLECT_CONTENT_ANALYSIS', 'true').lower() == 'true'
        collect_fans = os.getenv('COLLECT_FANS', 'true').lower() == 'true'
        
        success_count = 0
        total_count = 0
        
        # 动态导入数据采集模块（避免循环导入）
        try:
            from ..xiaohongshu.data_collector.dashboard import collect_dashboard_data
            from ..xiaohongshu.data_collector.content_analysis import collect_content_analysis_data
            from ..xiaohongshu.data_collector.fans import collect_fans_data
        except ImportError as e:
            logger.error(f"导入数据采集模块失败: {e}")
            # 如果导入失败，尝试另一种导入方式
            try:
                import sys
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
                from xiaohongshu.data_collector.dashboard import collect_dashboard_data
                from xiaohongshu.data_collector.content_analysis import collect_content_analysis_data
                from xiaohongshu.data_collector.fans import collect_fans_data
                logger.info("使用备用导入方式成功")
            except ImportError as e2:
                logger.error(f"备用导入方式也失败: {e2}")
                return
        
        # 创建WebDriver实例用于数据采集
        driver = None
        try:
            driver = self.client.browser_manager.create_driver()
            
            # 加载cookies
            cookies = self.client.cookie_manager.load_cookies()
            if cookies:
                # 先访问小红书主页以设置域名
                driver.get("https://www.xiaohongshu.com")
                
                # 加载cookies
                cookie_result = self.client.browser_manager.load_cookies(cookies)
                logger.info(f"🍪 Cookies加载结果: {cookie_result}")
            else:
                logger.warning("⚠️ 未找到cookies，数据采集可能失败")
        
        except Exception as e:
            logger.error(f"❌ 创建WebDriver失败: {e}")
            return
        
        try:
            # 采集仪表板数据
            if collect_dashboard:
                total_count += 1
                try:
                    logger.info("采集仪表板数据...")
                    result = collect_dashboard_data(driver, save_data=True)
                    if result.get("success", False):
                        success_count += 1
                        logger.info("✅ 仪表板数据采集完成")
                    else:
                        logger.error(f"❌ 仪表板数据采集失败: {result.get('error', '未知错误')}")
                except Exception as e:
                    logger.error(f"❌ 仪表板数据采集失败: {e}")
                    
            # 采集内容分析数据
            if collect_content:
                total_count += 1
                try:
                    logger.info("采集内容分析数据...")
                    result = await collect_content_analysis_data(driver, save_data=True)
                    if result.get("success", False):
                        success_count += 1
                        logger.info("✅ 内容分析数据采集完成")
                    else:
                        logger.error(f"❌ 内容分析数据采集失败: {result.get('error', '未知错误')}")
                except Exception as e:
                    logger.error(f"❌ 内容分析数据采集失败: {e}")
                    
            # 采集粉丝数据
            if collect_fans:
                total_count += 1
                try:
                    logger.info("采集粉丝数据...")
                    result = collect_fans_data(driver, save_data=True)
                    if result.get("success", False):
                        success_count += 1
                        logger.info("✅ 粉丝数据采集完成")
                    else:
                        logger.error(f"❌ 粉丝数据采集失败: {result.get('error', '未知错误')}")
                except Exception as e:
                    logger.error(f"❌ 粉丝数据采集失败: {e}")
                    
        finally:
            # 确保关闭WebDriver
            if driver:
                try:
                    driver.quit()
                    logger.debug("🔒 WebDriver已关闭")
                except Exception as e:
                    logger.warning(f"⚠️ 关闭WebDriver时出错: {e}")
                
        # 记录采集结果
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"数据采集任务完成，成功: {success_count}/{total_count}，耗时: {duration:.2f}秒")
        
        # 保存采集日志到存储
        collection_log = {
            'timestamp': start_time.isoformat(),
            'duration_seconds': duration,
            'total_tasks': total_count,
            'successful_tasks': success_count,
            'failed_tasks': total_count - success_count,
            'tasks': {
                'dashboard': collect_dashboard,
                'content_analysis': collect_content,
                'fans': collect_fans
            }
        }
        
        try:
            # 这里可以将采集日志保存到单独的日志表或文件
            logger.debug(f"采集日志: {collection_log}")
        except Exception as e:
            logger.error(f"保存采集日志失败: {e}")
            
    async def stop(self) -> None:
        """停止调度器"""
        if self.scheduler and self._running:
            self.scheduler.shutdown(wait=True)
            self._running = False
            logger.info("数据采集调度器已停止")
            
    def is_running(self) -> bool:
        """检查调度器是否在运行"""
        return self._running
        
    def get_job_info(self) -> Dict[str, Any]:
        """获取任务信息"""
        if not self.scheduler:
            return {'status': 'not_initialized'}
            
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            })
            
        return {
            'status': 'running' if self._running else 'stopped',
            'jobs': jobs,
            'config': {
                'enable_auto_collection': os.getenv('ENABLE_AUTO_COLLECTION', 'true'),
                'run_on_startup': os.getenv('RUN_ON_STARTUP', 'true'),
                'collection_schedule': os.getenv('COLLECTION_SCHEDULE', '0 1 * * *'),
                'timezone': os.getenv('TIMEZONE', 'Asia/Shanghai'),
                'collect_dashboard': os.getenv('COLLECT_DASHBOARD', 'true'),
                'collect_content_analysis': os.getenv('COLLECT_CONTENT_ANALYSIS', 'true'),
                'collect_fans': os.getenv('COLLECT_FANS', 'true')
            }
        }
        
    async def run_manual_collection(self) -> Dict[str, Any]:
        """手动执行一次数据采集"""
        logger.info("手动触发数据采集...")
        await self._run_data_collection()
        return {'status': 'completed', 'timestamp': datetime.now().isoformat()}


# 全局调度器实例
data_scheduler = DataCollectionScheduler() 