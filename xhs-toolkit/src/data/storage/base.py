"""
数据存储基础抽象类

定义数据存储的通用接口
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from datetime import datetime


class BaseStorage(ABC):
    """数据存储基础抽象类"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化存储配置
        
        Args:
            config: 存储配置参数
        """
        self.config = config
        self._initialized = False
    
    @abstractmethod
    async def initialize(self) -> bool:
        """
        初始化存储连接
        
        Returns:
            bool: 初始化是否成功
        """
        pass
    
    @abstractmethod
    async def save_dashboard_data(self, data: Dict[str, Any]) -> bool:
        """
        保存账号概览数据
        
        Args:
            data: 账号概览数据
            
        Returns:
            bool: 保存是否成功
        """
        pass
    
    @abstractmethod
    async def save_content_analysis_data(self, data: List[Dict[str, Any]]) -> bool:
        """
        保存内容分析数据
        
        Args:
            data: 内容分析数据列表
            
        Returns:
            bool: 保存是否成功
        """
        pass
    
    @abstractmethod
    async def save_fans_data(self, data: Dict[str, Any]) -> bool:
        """
        保存粉丝数据
        
        Args:
            data: 粉丝数据
            
        Returns:
            bool: 保存是否成功
        """
        pass
    
    @abstractmethod
    async def get_latest_data(self, data_type: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取最新数据
        
        Args:
            data_type: 数据类型 (dashboard, content_analysis, fans)
            limit: 返回数据条数限制
            
        Returns:
            List[Dict[str, Any]]: 数据列表
        """
        pass
    
    @abstractmethod
    async def close(self) -> None:
        """关闭存储连接"""
        pass
    
    def _add_timestamp(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        为数据添加时间戳
        
        Args:
            data: 原始数据
            
        Returns:
            Dict[str, Any]: 添加时间戳后的数据
        """
        if isinstance(data, dict):
            data = data.copy()
            data['created_at'] = datetime.now().isoformat()
            data['updated_at'] = datetime.now().isoformat()
        return data
    
    def _add_timestamps_to_list(self, data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        为数据列表中的每个项目添加时间戳
        
        Args:
            data_list: 数据列表
            
        Returns:
            List[Dict[str, Any]]: 添加时间戳后的数据列表
        """
        return [self._add_timestamp(item) for item in data_list] 