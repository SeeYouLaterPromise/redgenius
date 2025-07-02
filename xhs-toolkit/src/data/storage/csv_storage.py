"""
CSV存储实现

提供基于CSV文件的数据存储功能
"""

import csv
import json
import logging
import pandas as pd
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

from .base import BaseStorage

logger = logging.getLogger(__name__)


class CSVStorage(BaseStorage):
    """CSV存储实现类"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化CSV存储
        
        Args:
            config: 配置参数，包含data_dir等
        """
        super().__init__(config)
        self.data_dir = Path(config.get('data_dir', 'src/data'))
        self.csv_dir = self.data_dir / 'creator_db'
        
        # CSV文件路径
        self.dashboard_file = self.csv_dir / 'dashboard_data.csv'
        self.content_analysis_file = self.csv_dir / 'content_analysis_data.csv'
        self.fans_file = self.csv_dir / 'fans_data.csv'
        
        # CSV字段定义（英文字段名，用于代码逻辑和数据库）
        self.dashboard_fields = [
            'created_at', 'updated_at', 'timestamp', 'dimension',
            'views', 'likes', 'collects', 'comments', 'shares', 'interactions'
        ]
        self.content_analysis_fields = [
            'created_at', 'updated_at', 'timestamp', 'title', 'note_type', 'publish_time',
            'views', 'likes', 'comments', 'collects', 'shares', 'fans_growth', 'avg_watch_time', 'danmu_count',
            # 观众来源数据
            'source_recommend', 'source_search', 'source_follow', 'source_other',
            # 观众分析数据
            'gender_male', 'gender_female', 'age_18_24', 'age_25_34', 'age_35_44', 'age_45_plus',
            'city_top1', 'city_top2', 'city_top3', 'interest_top1', 'interest_top2', 'interest_top3'
        ]
        self.fans_fields = [
            'created_at', 'updated_at', 'timestamp', 'dimension', 'total_fans', 'new_fans', 'lost_fans'
        ]
        
        # 中文表头映射（用于CSV文件显示）
        self.field_chinese_mapping = {
            # 通用字段
            'created_at': '创建时间',
            'updated_at': '更新时间', 
            'timestamp': '时间戳',
            'dimension': '统计维度',
            
            # 仪表板字段
            'views': '浏览量',
            'likes': '点赞数',
            'collects': '收藏数',
            'comments': '评论数',
            'shares': '分享数',
            'interactions': '互动数',
            
            # 内容分析字段
            'title': '笔记标题',
            'note_type': '笔记类型',
            'publish_time': '发布时间',
            'fans_growth': '涨粉数',
            'avg_watch_time': '平均观看时长',
            'danmu_count': '弹幕数',
            
            # 观众来源数据
            'source_recommend': '推荐来源占比',
            'source_search': '搜索来源占比',
            'source_follow': '关注来源占比',
            'source_other': '其他来源占比',
            
            # 观众分析数据
            'gender_male': '男性占比',
            'gender_female': '女性占比',
            'age_18_24': '18-24岁占比',
            'age_25_34': '25-34岁占比',
            'age_35_44': '35-44岁占比',
            'age_45_plus': '45岁以上占比',
            'city_top1': '城市TOP1',
            'city_top2': '城市TOP2',
            'city_top3': '城市TOP3',
            'interest_top1': '兴趣TOP1',
            'interest_top2': '兴趣TOP2',
            'interest_top3': '兴趣TOP3',
            
            # 粉丝数据字段
            'total_fans': '总粉丝数',
            'new_fans': '新增粉丝',
            'lost_fans': '流失粉丝'
        }
        
        # 生成中文表头列表
        self.dashboard_chinese_headers = [self.field_chinese_mapping[field] for field in self.dashboard_fields]
        self.content_analysis_chinese_headers = [self.field_chinese_mapping[field] for field in self.content_analysis_fields]
        self.fans_chinese_headers = [self.field_chinese_mapping[field] for field in self.fans_fields]
        
        # 自动初始化
        self._initialize_sync()
    
    def _initialize_sync(self) -> None:
        """同步初始化CSV存储"""
        try:
            # 创建数据目录
            self.csv_dir.mkdir(parents=True, exist_ok=True)
            
            # 初始化CSV文件（如果不存在）
            self._init_csv_file(self.dashboard_file, self.dashboard_fields, self.dashboard_chinese_headers)
            self._init_csv_file(self.content_analysis_file, self.content_analysis_fields, self.content_analysis_chinese_headers)
            self._init_csv_file(self.fans_file, self.fans_fields, self.fans_chinese_headers)
            
            self._initialized = True
            logger.info(f"📁 CSV存储初始化成功，数据目录: {self.csv_dir}")
            
        except Exception as e:
            logger.error(f"❌ CSV存储初始化失败: {e}")
            raise
    
    async def initialize(self) -> bool:
        """
        异步初始化CSV存储，创建必要的目录和文件
        
        Returns:
            bool: 初始化是否成功
        """
        try:
            self._initialize_sync()
            return True
            
        except Exception as e:
            logger.error(f"❌ CSV存储初始化失败: {e}")
            return False
    
    def _init_csv_file(self, file_path: Path, fields: List[str], chinese_headers: List[str] = None) -> None:
        """
        初始化CSV文件，如果文件不存在则创建并写入表头
        
        Args:
            file_path: CSV文件路径
            fields: 英文字段列表（用于代码逻辑）
            chinese_headers: 中文表头列表（用于CSV显示）
        """
        if not file_path.exists():
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                if chinese_headers:
                    # 使用中文表头
                    f.write(','.join(chinese_headers) + '\n')
                else:
                    # 降级到英文表头
                    writer = csv.DictWriter(f, fieldnames=fields)
                    writer.writeheader()
            logger.debug(f"📄 创建CSV文件: {file_path}")
    
    def save_dashboard_data(self, data: List[Dict[str, Any]]) -> None:
        """
        同步保存仪表板数据到CSV
        
        Args:
            data: 仪表板数据列表
        """
        try:
            if not self._initialized:
                self._initialize_sync()
            
            # 处理数据格式
            rows = []
            for item in data:
                row = self._add_timestamp({
                    'timestamp': item.get('timestamp', ''),
                    'dimension': item.get('dimension', ''),
                    'views': item.get('views', 0),
                    'likes': item.get('likes', 0),
                    'collects': item.get('collects', 0),
                    'comments': item.get('comments', 0),
                    'shares': item.get('shares', 0),
                    'interactions': item.get('interactions', 0)
                })
                rows.append(row)
            
            # 按日期覆盖保存
            self._save_with_daily_overwrite(self.dashboard_file, self.dashboard_fields, rows, self.dashboard_chinese_headers)
            
            logger.info(f"💾 仪表板数据已保存到CSV: {len(rows)} 条记录")
            
        except Exception as e:
            logger.error(f"❌ 保存仪表板数据失败: {e}")
            raise
    
    def save_content_analysis_data(self, data: List[Dict[str, Any]]) -> None:
        """
        同步保存内容分析数据到CSV
        
        Args:
            data: 内容分析数据列表
        """
        try:
            if not self._initialized:
                self._initialize_sync()
            
            # 处理数据格式
            rows = []
            for item in data:
                row = self._add_timestamp({
                    'timestamp': item.get('timestamp', ''),
                    'title': item.get('title', ''),
                    'note_type': item.get('note_type', ''),
                    'publish_time': item.get('publish_time', ''),
                    'views': item.get('views', 0),
                    'likes': item.get('likes', 0),
                    'comments': item.get('comments', 0),
                    'collects': item.get('collects', 0),
                    'shares': item.get('shares', 0),
                    'fans_growth': item.get('fans_growth', 0),
                    'avg_watch_time': item.get('avg_watch_time', ''),
                    'danmu_count': item.get('danmu_count', 0),
                    # 观众来源数据
                    'source_recommend': item.get('source_recommend', '0%'),
                    'source_search': item.get('source_search', '0%'),
                    'source_follow': item.get('source_follow', '0%'),
                    'source_other': item.get('source_other', '0%'),
                    # 观众分析数据
                    'gender_male': item.get('gender_male', '0%'),
                    'gender_female': item.get('gender_female', '0%'),
                    'age_18_24': item.get('age_18_24', '0%'),
                    'age_25_34': item.get('age_25_34', '0%'),
                    'age_35_44': item.get('age_35_44', '0%'),
                    'age_45_plus': item.get('age_45_plus', '0%'),
                    'city_top1': item.get('city_top1', ''),
                    'city_top2': item.get('city_top2', ''),
                    'city_top3': item.get('city_top3', ''),
                    'interest_top1': item.get('interest_top1', ''),
                    'interest_top2': item.get('interest_top2', ''),
                    'interest_top3': item.get('interest_top3', '')
                })
                rows.append(row)
            
            # 按日期覆盖保存
            self._save_with_daily_overwrite(self.content_analysis_file, self.content_analysis_fields, rows, self.content_analysis_chinese_headers)
            
            logger.info(f"💾 内容分析数据已保存到CSV: {len(rows)} 条记录")
            
        except Exception as e:
            logger.error(f"❌ 保存内容分析数据失败: {e}")
            raise
    
    def save_fans_data(self, data: List[Dict[str, Any]]) -> None:
        """
        同步保存粉丝数据到CSV
        
        Args:
            data: 粉丝数据列表
        """
        try:
            if not self._initialized:
                self._initialize_sync()
            
            # 处理数据格式
            rows = []
            for item in data:
                row = self._add_timestamp({
                    'timestamp': item.get('timestamp', ''),
                    'dimension': item.get('dimension', ''),
                    'total_fans': item.get('total_fans', 0),
                    'new_fans': item.get('new_fans', 0),
                    'lost_fans': item.get('lost_fans', 0)
                })
                rows.append(row)
            
            # 按日期覆盖保存
            self._save_with_daily_overwrite(self.fans_file, self.fans_fields, rows, self.fans_chinese_headers)
            
            logger.info(f"💾 粉丝数据已保存到CSV: {len(rows)} 条记录")
            
        except Exception as e:
            logger.error(f"❌ 保存粉丝数据失败: {e}")
            raise
    
    async def get_latest_data(self, data_type: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取最新数据
        
        Args:
            data_type: 数据类型 (dashboard, content_analysis, fans)
            limit: 返回数据条数限制
            
        Returns:
            List[Dict[str, Any]]: 数据列表
        """
        try:
            if data_type == 'dashboard':
                file_path = self.dashboard_file
                fields = self.dashboard_fields
                chinese_headers = self.dashboard_chinese_headers
            elif data_type == 'content_analysis':
                file_path = self.content_analysis_file
                fields = self.content_analysis_fields
                chinese_headers = self.content_analysis_chinese_headers
            elif data_type == 'fans':
                file_path = self.fans_file
                fields = self.fans_fields
                chinese_headers = self.fans_chinese_headers
            else:
                logger.warning(f"⚠️ 未知数据类型: {data_type}")
                return []
            
            if not file_path.exists():
                return []
            
            # 读取CSV文件
            data = []
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                headers = next(reader, None)  # 读取表头
                
                if headers:
                    # 检查是否为中文表头
                    if headers == chinese_headers:
                        # 中文表头，需要转换为英文字段名
                        for row in reader:
                            if len(row) == len(fields):
                                row_dict = {field: value for field, value in zip(fields, row)}
                                data.append(row_dict)
                    else:
                        # 英文表头或其他格式，直接使用
                        for row in reader:
                            if len(row) == len(headers):
                                row_dict = {header: value for header, value in zip(headers, row)}
                                data.append(row_dict)
            
            # 按创建时间倒序排列，返回最新的limit条
            data.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            return data[:limit]
            
        except Exception as e:
            logger.error(f"❌ 获取最新数据失败: {e}")
            return []
    
    async def close(self) -> None:
        """关闭存储连接"""
        logger.debug("📁 CSV存储连接已关闭")
    
    def get_storage_info(self) -> Dict[str, Any]:
        """获取存储信息"""
        try:
            info = {
                'storage_type': 'CSV',
                'data_path': str(self.data_dir),
                'csv_path': str(self.csv_dir),
                'initialized': self._initialized,
                'files': {}
            }
            
            # 检查各个CSV文件的状态
            files = {
                'dashboard_data.csv': self.dashboard_file,
                'content_analysis_data.csv': self.content_analysis_file,
                'fans_data.csv': self.fans_file
            }
            
            for name, path in files.items():
                if path.exists():
                    # 统计记录数（减去表头）
                    with open(path, 'r', encoding='utf-8') as f:
                        reader = csv.reader(f)
                        row_count = sum(1 for _ in reader) - 1  # 减去表头
                    
                    info['files'][name] = {
                        'exists': True,
                        'path': str(path),
                        'records': max(0, row_count),
                        'size_bytes': path.stat().st_size
                    }
                else:
                    info['files'][name] = {
                        'exists': False,
                        'path': str(path),
                        'records': 0,
                        'size_bytes': 0
                    }
            
            return info
            
        except Exception as e:
            logger.error(f"❌ 获取存储信息失败: {e}")
            return {
                'storage_type': 'CSV',
                'error': str(e)
            }
    
    def _add_timestamp(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        为数据添加时间戳
        
        Args:
            data: 原始数据
            
        Returns:
            添加时间戳的数据
        """
        now = datetime.now().isoformat()
        data['created_at'] = now
        data['updated_at'] = now
        return data
    
    def _get_today_date(self) -> str:
        """获取今天的日期字符串"""
        return datetime.now().strftime('%Y-%m-%d')
    
    def _save_with_daily_overwrite(self, file_path: Path, fields: List[str], new_data: List[Dict[str, Any]], chinese_headers: List[str] = None) -> None:
        """
        按日期覆盖保存数据
        
        Args:
            file_path: CSV文件路径
            fields: 英文字段列表
            new_data: 新数据列表
            chinese_headers: 中文表头列表
        """
        try:
            today = self._get_today_date()
            
            # 读取现有数据
            existing_data = []
            if file_path.exists():
                try:
                    df = pd.read_csv(file_path)
                    if not df.empty:
                        # 如果CSV使用中文表头，需要转换为英文字段名
                        if chinese_headers and len(df.columns) == len(chinese_headers):
                            # 创建中文到英文的映射
                            chinese_to_english = {chinese: english for chinese, english in zip(chinese_headers, fields)}
                            df.rename(columns=chinese_to_english, inplace=True)
                        
                        # 过滤掉今天的数据
                        if 'created_at' in df.columns:
                            df['date'] = pd.to_datetime(df['created_at']).dt.strftime('%Y-%m-%d')
                            df_filtered = df[df['date'] != today]
                            existing_data = df_filtered.drop('date', axis=1).to_dict('records')
                        else:
                            existing_data = df.to_dict('records')
                except Exception as e:
                    logger.warning(f"⚠️ 读取现有CSV数据失败: {e}")
            
            # 合并数据：保留非今天的数据 + 今天的新数据
            all_data = existing_data + new_data
            
            # 重写整个文件
            with open(file_path, 'w', newline='', encoding='utf-8') as f:
                if chinese_headers:
                    # 使用中文表头
                    f.write(','.join(chinese_headers) + '\n')
                    # 写入数据行，按字段顺序
                    for row in all_data:
                        values = [str(row.get(field, '')) for field in fields]
                        f.write(','.join(values) + '\n')
                else:
                    # 降级到英文表头
                    writer = csv.DictWriter(f, fieldnames=fields)
                    writer.writeheader()
                    writer.writerows(all_data)
            
            logger.info(f"💾 数据已按日期覆盖保存: 保留 {len(existing_data)} 条历史记录，新增 {len(new_data)} 条今日记录")
            
        except Exception as e:
            logger.error(f"❌ 按日期覆盖保存失败: {e}")
            # 降级到追加模式
            self._append_to_csv(file_path, fields, new_data)
    
    def _append_to_csv(self, file_path: Path, fields: List[str], data: List[Dict[str, Any]]) -> None:
        """
        追加数据到CSV文件（降级方案）
        
        Args:
            file_path: CSV文件路径
            fields: 字段列表
            data: 数据列表
        """
        try:
            with open(file_path, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fields)
                writer.writerows(data)
            logger.info(f"💾 数据已追加保存: {len(data)} 条记录")
        except Exception as e:
            logger.error(f"❌ 追加保存失败: {e}")
            raise 