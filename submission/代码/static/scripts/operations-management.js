// 运维管理页面JavaScript功能

// 全局变量
let systemData = {};
let healthData = {};
let updateInterval = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeOperationsManagement();
    startRealTimeUpdates();
    bindEventListeners();
});

// 初始化运维管理页面
function initializeOperationsManagement() {
    loadSystemStatus();
    loadHealthStatus();
    loadSystemLogs();
    loadProcessInfo();
}

// 绑定事件监听器
function bindEventListeners() {
    // 快速操作按钮
    const restartBtn = document.querySelector('button[data-action="restart"]');
    const backupBtn = document.querySelector('button[data-action="backup"]');
    const cleanupBtn = document.querySelector('button[data-action="cleanup"]');
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => performMaintenance('restart_services'));
    }
    if (backupBtn) {
        backupBtn.addEventListener('click', () => performMaintenance('backup_database'));
    }
    if (cleanupBtn) {
        cleanupBtn.addEventListener('click', () => performMaintenance('cleanup_temp'));
    }
    
    // 刷新按钮
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshAllData);
    }
}

// 加载系统状态
async function loadSystemStatus() {
    try {
        const response = await fetch('/api/monitoring/system');
        const data = await response.json();
        
        if (data.error) {
            console.error('获取系统状态失败:', data.error);
            return;
        }
        
        systemData = data;
        updateSystemStatusDisplay(data);
        updateResourceUsageDisplay(data);
    } catch (error) {
        console.error('加载系统状态失败:', error);
        showNotification('加载系统状态失败', 'error');
    }
}

// 加载健康检查状态
async function loadHealthStatus() {
    try {
        const response = await fetch('/api/monitoring/health');
        const data = await response.json();
        
        healthData = data;
        updateHealthStatusDisplay(data);
    } catch (error) {
        console.error('加载健康状态失败:', error);
        showNotification('加载健康状态失败', 'error');
    }
}

// 加载系统日志
async function loadSystemLogs() {
    try {
        const response = await fetch('/api/monitoring/logs?limit=20');
        const logs = await response.json();
        
        updateLogsDisplay(logs);
    } catch (error) {
        console.error('加载系统日志失败:', error);
    }
}

// 加载进程信息
async function loadProcessInfo() {
    try {
        const response = await fetch('/api/monitoring/processes');
        const processes = await response.json();
        
        updateProcessDisplay(processes);
    } catch (error) {
        console.error('加载进程信息失败:', error);
    }
}

// 更新系统状态显示
function updateSystemStatusDisplay(data) {
    // 更新Web服务器状态
    const webServerStatus = document.querySelector('.status-item:nth-child(1) .status');
    if (webServerStatus) {
        webServerStatus.textContent = '运行中';
        webServerStatus.className = 'status status-ok';
    }
    
    // 更新数据库状态
    const dbStatus = document.querySelector('.status-item:nth-child(2) .status');
    if (dbStatus) {
        dbStatus.textContent = '运行中';
        dbStatus.className = 'status status-ok';
    }
    
    // 更新靶场环境状态（基于系统负载）
    const targetStatus = document.querySelector('.status-item:nth-child(3) .status');
    if (targetStatus && data.cpu) {
        if (data.cpu.usage_percent < 70) {
            targetStatus.textContent = '运行正常';
            targetStatus.className = 'status status-ok';
        } else if (data.cpu.usage_percent < 90) {
            targetStatus.textContent = '部分降级';
            targetStatus.className = 'status status-warning';
        } else {
            targetStatus.textContent = '性能受限';
            targetStatus.className = 'status status-error';
        }
    }
}

// 更新资源使用率显示
function updateResourceUsageDisplay(data) {
    if (!data.cpu || !data.memory || !data.disk) return;
    
    // 更新CPU使用率
    updateProgressBar('cpu-usage', data.cpu.usage_percent);
    updateMetricValue('cpu-percent', data.cpu.usage_percent.toFixed(1) + '%');
    
    // 更新内存使用率
    updateProgressBar('memory-usage', data.memory.percent);
    updateMetricValue('memory-percent', data.memory.percent.toFixed(1) + '%');
    updateMetricValue('memory-used', formatBytes(data.memory.used));
    updateMetricValue('memory-total', formatBytes(data.memory.total));
    
    // 更新磁盘使用率
    updateProgressBar('disk-usage', data.disk.percent);
    updateMetricValue('disk-percent', data.disk.percent.toFixed(1) + '%');
    updateMetricValue('disk-used', formatBytes(data.disk.used));
    updateMetricValue('disk-total', formatBytes(data.disk.total));
    
    // 更新网络统计
    if (data.network) {
        updateMetricValue('network-sent', formatBytes(data.network.bytes_sent));
        updateMetricValue('network-recv', formatBytes(data.network.bytes_recv));
    }
    
    // 更新系统运行时间
    if (data.uptime) {
        updateMetricValue('system-uptime', formatUptime(data.uptime));
    }
}

// 更新健康状态显示
function updateHealthStatusDisplay(data) {
    if (!data.services) return;
    
    // 更新整体健康状态
    const overallStatus = document.querySelector('.overall-health-status');
    if (overallStatus) {
        overallStatus.textContent = getHealthStatusText(data.overall_status);
        overallStatus.className = `overall-health-status status-${data.overall_status}`;
    }
    
    // 更新各个服务状态
    Object.keys(data.services).forEach(serviceName => {
        const service = data.services[serviceName];
        const serviceElement = document.querySelector(`[data-service="${serviceName}"]`);
        if (serviceElement) {
            const statusElement = serviceElement.querySelector('.service-status');
            const messageElement = serviceElement.querySelector('.service-message');
            
            if (statusElement) {
                statusElement.textContent = getHealthStatusText(service.status);
                statusElement.className = `service-status status-${service.status}`;
            }
            
            if (messageElement) {
                messageElement.textContent = service.message;
            }
        }
    });
}

// 更新日志显示
function updateLogsDisplay(logs) {
    const logContainer = document.querySelector('.log-list');
    if (!logContainer || !Array.isArray(logs)) return;
    
    logContainer.innerHTML = '';
    
    logs.forEach(log => {
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        
        logItem.innerHTML = `
            <span class="log-time">${log.timestamp}</span>
            <span class="log-level ${log.level.toLowerCase()}">${log.level}</span>
            <span class="log-message">${log.message}</span>
        `;
        
        logContainer.appendChild(logItem);
    });
}

// 更新进程显示
function updateProcessDisplay(processes) {
    const processContainer = document.querySelector('.process-list');
    if (!processContainer || !Array.isArray(processes)) return;
    
    processContainer.innerHTML = '';
    
    processes.slice(0, 10).forEach(process => {
        const processItem = document.createElement('div');
        processItem.className = 'process-item';
        
        processItem.innerHTML = `
            <span class="process-name">${process.name || 'Unknown'}</span>
            <span class="process-pid">${process.pid}</span>
            <span class="process-cpu">${(process.cpu_percent || 0).toFixed(1)}%</span>
            <span class="process-memory">${(process.memory_percent || 0).toFixed(1)}%</span>
        `;
        
        processContainer.appendChild(processItem);
    });
}

// 执行维护任务
async function performMaintenance(taskType) {
    const taskNames = {
        'restart_services': '重启所有服务',
        'backup_database': '备份数据库',
        'cleanup_temp': '清理临时文件'
    };
    
    const taskName = taskNames[taskType] || taskType;
    
    // 使用UI工具库的确认对话框
    const confirmed = await ui.confirm(`确定要执行"${taskName}"操作吗？`, '确认操作');
    if (!confirmed) {
        return;
    }
    
    // 找到对应的按钮并设置加载状态
    const button = document.querySelector(`button[data-action="${taskType.split('_')[0]}"]`);
    if (button) {
        ui.setButtonLoading(button, true);
    }
    
    try {
        ui.showInfo(`正在执行${taskName}...`);
        
        const response = await fetch('/api/monitoring/maintenance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ task_type: taskType })
        });
        
        const result = await response.json();
        
        if (result.success) {
            ui.showSuccess(result.message);
            // 刷新相关数据
            setTimeout(() => {
                refreshAllData();
            }, 1000);
        } else {
            ui.showError(result.message);
        }
    } catch (error) {
        console.error('执行维护任务失败:', error);
        ui.showError(`执行${taskName}失败，请稍后重试`);
    } finally {
        // 恢复按钮状态
        if (button) {
            ui.setButtonLoading(button, false);
        }
    }
}

// 刷新所有数据
function refreshAllData() {
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        ui.setButtonLoading(refreshBtn, true);
    }
    
    ui.showInfo('正在刷新数据...');
    
    Promise.all([
        loadSystemStatus(),
        loadHealthStatus(),
        loadSystemLogs(),
        loadProcessInfo()
    ]).then(() => {
        ui.showSuccess('数据刷新完成');
    }).catch(() => {
        ui.showError('数据刷新失败');
    }).finally(() => {
        if (refreshBtn) {
            ui.setButtonLoading(refreshBtn, false);
        }
    });
}

// 开始实时更新
function startRealTimeUpdates() {
    // 每30秒更新一次数据
    updateInterval = setInterval(() => {
        loadSystemStatus();
        loadHealthStatus();
    }, 30000);
    
    // 每60秒更新一次日志
    setInterval(() => {
        loadSystemLogs();
    }, 60000);
}

// 停止实时更新
function stopRealTimeUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// 辅助函数
function updateProgressBar(id, percentage) {
    const progressBar = document.getElementById(id);
    if (progressBar) {
        const fill = progressBar.querySelector('.progress-fill');
        if (fill) {
            fill.style.width = percentage + '%';
            
            // 根据使用率设置颜色
            if (percentage < 60) {
                fill.className = 'progress-fill progress-success';
            } else if (percentage < 80) {
                fill.className = 'progress-fill progress-warning';
            } else {
                fill.className = 'progress-fill progress-danger';
            }
        }
    }
}

function updateMetricValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
        return `${days}天 ${hours}小时 ${minutes}分钟`;
    } else if (hours > 0) {
        return `${hours}小时 ${minutes}分钟`;
    } else {
        return `${minutes}分钟`;
    }
}

function getHealthStatusText(status) {
    const statusMap = {
        'healthy': '正常',
        'warning': '警告',
        'critical': '严重'
    };
    return statusMap[status] || status;
}

// 使用UI工具库的通知系统，移除原有的showNotification函数
// 现在直接使用 ui.showSuccess(), ui.showError(), ui.showWarning(), ui.showInfo()

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    stopRealTimeUpdates();
});