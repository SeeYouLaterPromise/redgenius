"""
数据存储管理器

提供统一的数据存储接口，支持CSV和PostgreSQL存储
"""

import os
import logging
from typing import Optional, List, Dict, Any
from .storage.base import BaseStorage
from .storage.csv_storage import CSVStorage
from .storage.pg_storage import PostgreSQLStorage

logger = logging.getLogger(__name__)


class StorageManager:
    """数据存储管理器"""
    
    def __init__(self):
        self._csv_storage: Optional[CSVStorage] = None
        self._pg_storage: Optional[PostgreSQLStorage] = None
        self._initialized = False
        
    def initialize(self, data_path: Optional[str] = None, 
                  database_config: Optional[Dict[str, Any]] = None) -> None:
        """
        初始化存储管理器
        
        Args:
            data_path: CSV数据存储路径，默认从环境变量DATA_STORAGE_PATH读取
            database_config: PostgreSQL配置，默认从环境变量读取
        """
        if self._initialized:
            return
            
        # 获取CSV存储路径
        if data_path is None:
            data_path = os.getenv('DATA_STORAGE_PATH', 'data')
            
        # 初始化CSV存储（始终启用）
        try:
            csv_config = {'data_dir': data_path}
            self._csv_storage = CSVStorage(csv_config)
            logger.info(f"CSV存储已初始化，数据路径: {data_path}")
        except Exception as e:
            logger.error(f"CSV存储初始化失败: {e}")
            raise
            
        # 检查是否启用PostgreSQL数据库
        enable_database = os.getenv('ENABLE_DATABASE', 'false').lower() == 'true'
        
        if enable_database:
            # 从环境变量获取数据库配置
            if database_config is None:
                database_config = self._get_database_config_from_env()
                
            # 初始化PostgreSQL存储
            try:
                self._pg_storage = PostgreSQLStorage(database_config)
                logger.info("PostgreSQL存储已启用")
            except Exception as e:
                logger.warning(f"PostgreSQL存储初始化失败，将仅使用CSV存储: {e}")
                self._pg_storage = None
        else:
            logger.info("PostgreSQL存储已禁用，仅使用CSV存储")
            
        self._initialized = True
        
    def _get_database_config_from_env(self) -> Dict[str, Any]:
        """从环境变量获取数据库配置"""
        # 优先使用DATABASE_URL
        database_url = os.getenv('DATABASE_URL')
        if database_url:
            return {'database_url': database_url}
            
        # 使用分离的配置项
        return {
            'host': os.getenv('DATABASE_HOST', 'localhost'),
            'port': int(os.getenv('DATABASE_PORT', '5432')),
            'database': os.getenv('DATABASE_NAME', 'xhs_toolkit'),
            'user': os.getenv('DATABASE_USER', 'username'),
            'password': os.getenv('DATABASE_PASSWORD', 'password')
        }
        
    def is_database_enabled(self) -> bool:
        """检查是否启用了PostgreSQL数据库"""
        return self._pg_storage is not None
        
    def get_csv_storage(self) -> CSVStorage:
        """获取CSV存储实例"""
        if not self._initialized:
            self.initialize()
        return self._csv_storage
        
    def get_pg_storage(self) -> Optional[PostgreSQLStorage]:
        """获取PostgreSQL存储实例"""
        if not self._initialized:
            self.initialize()
        return self._pg_storage
        
    def save_dashboard_data(self, data: List[Dict[str, Any]]) -> None:
        """保存仪表板数据"""
        if not self._initialized:
            self.initialize()
            
        # 保存到CSV（始终执行）
        if self._csv_storage:
            self._csv_storage.save_dashboard_data(data)
            
        # 保存到PostgreSQL（如果启用）
        if self._pg_storage:
            try:
                self._pg_storage.save_dashboard_data(data)
            except Exception as e:
                logger.error(f"保存仪表板数据到PostgreSQL失败: {e}")
                
    def save_content_analysis_data(self, data: List[Dict[str, Any]]) -> None:
        """保存内容分析数据"""
        if not self._initialized:
            self.initialize()
            
        # 保存到CSV（始终执行）
        if self._csv_storage:
            self._csv_storage.save_content_analysis_data(data)
            
        # 保存到PostgreSQL（如果启用）
        if self._pg_storage:
            try:
                self._pg_storage.save_content_analysis_data(data)
            except Exception as e:
                logger.error(f"保存内容分析数据到PostgreSQL失败: {e}")
                
    def save_fans_data(self, data: List[Dict[str, Any]]) -> None:
        """保存粉丝数据"""
        if not self._initialized:
            self.initialize()
            
        # 保存到CSV（始终执行）
        if self._csv_storage:
            self._csv_storage.save_fans_data(data)
            
        # 保存到PostgreSQL（如果启用）
        if self._pg_storage:
            try:
                self._pg_storage.save_fans_data(data)
            except Exception as e:
                logger.error(f"保存粉丝数据到PostgreSQL失败: {e}")
                
    def get_storage_info(self) -> Dict[str, Any]:
        """获取存储信息"""
        if not self._initialized:
            self.initialize()
            
        info = {
            'csv_enabled': self._csv_storage is not None,
            'postgresql_enabled': self._pg_storage is not None,
            'storage_types': []
        }
        
        if self._csv_storage:
            info['storage_types'].append('CSV')
            info['csv_info'] = self._csv_storage.get_storage_info()
            
        if self._pg_storage:
            info['storage_types'].append('PostgreSQL')
            info['postgresql_info'] = self._pg_storage.get_storage_info()
            
        return info


# 全局存储管理器实例
storage_manager = StorageManager()


def get_storage_manager() -> StorageManager:
    """
    获取全局存储管理器实例
    
    Returns:
        StorageManager: 存储管理器实例
    """
    return storage_manager


def initialize() -> None:
    """初始化全局存储管理器"""
    storage_manager.initialize() 