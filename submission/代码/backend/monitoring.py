import logging
import os
import sqlite3
import time
from datetime import datetime, timedelta

import psutil

logger = logging.getLogger(__name__)


class SystemMonitor:
    """系统监控类"""

    def __init__(self):
        self.start_time = time.time()

    def get_system_info(self):
        """获取系统基本信息"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            # 获取网络统计
            net_io = psutil.net_io_counters()

            return {
                "cpu": {
                    "usage_percent": cpu_percent,
                    "count": psutil.cpu_count(),
                    "frequency": (
                        psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None
                    ),
                },
                "memory": {
                    "total": memory.total,
                    "available": memory.available,
                    "used": memory.used,
                    "percent": memory.percent,
                },
                "disk": {
                    "total": disk.total,
                    "used": disk.used,
                    "free": disk.free,
                    "percent": (disk.used / disk.total) * 100,
                },
                "network": {
                    "bytes_sent": net_io.bytes_sent,
                    "bytes_recv": net_io.bytes_recv,
                    "packets_sent": net_io.packets_sent,
                    "packets_recv": net_io.packets_recv,
                },
                "uptime": time.time() - self.start_time,
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error("获取系统信息失败: %s", exc_info=e)
            return {"error": str(e)}

    def get_process_info(self):
        """获取进程信息"""
        try:
            processes = []
            for proc in psutil.process_iter(
                ["pid", "name", "cpu_percent", "memory_percent"]
            ):
                try:
                    processes.append(proc.info)
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    pass

            # 按CPU使用率排序，取前10个
            processes.sort(key=lambda x: x["cpu_percent"] or 0, reverse=True)
            return processes[:10]
        except Exception as e:
            logger.error("获取进程信息失败: %s", exc_info=e)
            return {"error": str(e)}

    def check_service_health(self):
        """检查服务健康状态"""
        services = {
            "web_server": self._check_web_server(),
            "database": self._check_database(),
            "disk_space": self._check_disk_space(),
            "memory_usage": self._check_memory_usage(),
        }

        # 计算整体健康状态
        healthy_services = sum(
            1 for status in services.values() if status["status"] == "healthy"
        )
        total_services = len(services)
        overall_health = (
            "healthy"
            if healthy_services == total_services
            else "warning" if healthy_services > total_services // 2 else "critical"
        )

        return {
            "overall_status": overall_health,
            "services": services,
            "healthy_count": healthy_services,
            "total_count": total_services,
            "timestamp": datetime.now().isoformat(),
        }

    def _check_web_server(self):
        """检查Web服务器状态"""
        try:
            import requests

            response = requests.get("http://127.0.0.1:5000/", timeout=5)
            if response.status_code == 200:
                return {"status": "healthy", "message": "Web服务器运行正常"}
            else:
                return {
                    "status": "warning",
                    "message": f"Web服务器响应异常: {response.status_code}",
                }
        except Exception as e:
            logger.error("Web 服务器健康检查失败: %s", exc_info=e)
            return {"status": "critical", "message": f"Web服务器无法访问: {str(e)}"}

    def _check_database(self):
        """检查数据库状态"""
        try:
            # 检查数据库文件是否存在
            db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app.db")
            if not os.path.exists(db_path):
                return {"status": "critical", "message": "数据库文件不存在"}

            # 尝试连接数据库
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            conn.close()

            return {"status": "healthy", "message": "数据库连接正常"}
        except Exception as e:
            logger.error("数据库健康检查失败: %s", exc_info=e)
            return {"status": "critical", "message": f"数据库连接失败: {str(e)}"}

    def _check_disk_space(self):
        """检查磁盘空间"""
        try:
            disk = psutil.disk_usage("/")
            usage_percent = (disk.used / disk.total) * 100

            if usage_percent < 80:
                return {
                    "status": "healthy",
                    "message": f"磁盘使用率: {usage_percent:.1f}%",
                }
            elif usage_percent < 90:
                return {
                    "status": "warning",
                    "message": f"磁盘使用率较高: {usage_percent:.1f}%",
                }
            else:
                return {
                    "status": "critical",
                    "message": f"磁盘空间不足: {usage_percent:.1f}%",
                }
        except Exception as e:
            logger.error("磁盘空间检查失败: %s", exc_info=e)
            return {"status": "critical", "message": f"磁盘检查失败: {str(e)}"}

    def _check_memory_usage(self):
        """检查内存使用率"""
        try:
            memory = psutil.virtual_memory()

            if memory.percent < 80:
                return {
                    "status": "healthy",
                    "message": f"内存使用率: {memory.percent:.1f}%",
                }
            elif memory.percent < 90:
                return {
                    "status": "warning",
                    "message": f"内存使用率较高: {memory.percent:.1f}%",
                }
            else:
                return {
                    "status": "critical",
                    "message": f"内存使用率过高: {memory.percent:.1f}%",
                }
        except Exception as e:
            logger.error("内存检查失败: %s", exc_info=e)
            return {"status": "critical", "message": f"内存检查失败: {str(e)}"}

    def get_system_logs(self, limit=50):
        """获取系统日志（模拟）"""
        # 这里可以集成真实的日志系统，现在先返回模拟数据
        logs = []
        current_time = datetime.now()

        log_levels = ["INFO", "WARNING", "ERROR", "DEBUG"]
        log_messages = [
            "用户登录成功",
            "数据库连接建立",
            "系统启动完成",
            "内存使用率检查",
            "磁盘空间检查",
            "服务健康检查完成",
            "用户注销",
            "数据备份完成",
        ]

        for i in range(limit):
            log_time = current_time - timedelta(minutes=i * 5)
            logs.append(
                {
                    "timestamp": log_time.strftime("%Y-%m-%d %H:%M:%S"),
                    "level": log_levels[i % len(log_levels)],
                    "message": log_messages[i % len(log_messages)],
                    "source": "system",
                }
            )

        return logs

    def perform_maintenance_task(self, task_type):
        """执行维护任务"""
        try:
            if task_type == "restart_services":
                return self._restart_services()
            elif task_type == "backup_database":
                return self._backup_database()
            elif task_type == "cleanup_temp":
                return self._cleanup_temp_files()
            else:
                return {"success": False, "message": "未知的维护任务类型"}
        except Exception as e:
            logger.error("维护任务执行失败: %s", exc_info=e)
            return {"success": False, "message": f"维护任务执行失败: {str(e)}"}

    def _restart_services(self):
        """重启服务（模拟）"""
        # 在实际环境中，这里会重启相关服务
        time.sleep(2)  # 模拟重启时间
        return {"success": True, "message": "所有服务已重启"}

    def _backup_database(self):
        """备份数据库"""
        try:
            import shutil

            db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app.db")
            backup_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                f'app_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db',
            )

            if os.path.exists(db_path):
                shutil.copy2(db_path, backup_path)
                return {"success": True, "message": f"数据库备份完成: {backup_path}"}
            else:
                return {"success": False, "message": "数据库文件不存在"}
        except Exception as e:
            logger.error("数据库备份失败: %s", exc_info=e)
            return {"success": False, "message": f"数据库备份失败: {str(e)}"}

    def _cleanup_temp_files(self):
        """清理临时文件"""
        try:
            # 清理Python缓存文件
            cache_dirs = []
            for root, dirs, files in os.walk(
                os.path.dirname(os.path.dirname(__file__))
            ):
                if "__pycache__" in dirs:
                    cache_dirs.append(os.path.join(root, "__pycache__"))

            cleaned_count = 0
            for cache_dir in cache_dirs:
                try:
                    import shutil

                    shutil.rmtree(cache_dir)
                    cleaned_count += 1
                except Exception as exc:  # noqa: BLE001 - 单个缓存目录清理失败不中断
                    logger.warning("清理缓存目录失败 %s: %s", cache_dir, exc)

            return {"success": True, "message": f"已清理 {cleaned_count} 个缓存目录"}
        except Exception as e:
            logger.error("清理临时文件失败: %s", exc_info=e)
            return {"success": False, "message": f"清理临时文件失败: {str(e)}"}


# 全局监控实例
monitor = SystemMonitor()
