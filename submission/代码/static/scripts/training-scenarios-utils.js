// 训练场景管理 - 工具函数模块

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加关闭事件
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
    
    // 显示动画
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
}

// 移除通知
function removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// 获取通知图标
function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || icons['info'];
}

// 截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

// 获取类型文本
function getTypeText(type) {
    const typeMap = {
        'penetration': '渗透测试',
        'defense': '防御演练',
        'forensics': '数字取证',
        'ctf': 'CTF竞赛'
    };
    return typeMap[type] || type;
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficultyMap = {
        'beginner': '初级',
        'intermediate': '中级',
        'advanced': '高级',
        'expert': '专家'
    };
    return difficultyMap[difficulty] || difficulty;
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'active': '活跃',
        'inactive': '非活跃',
        'draft': '草稿',
        'archived': '已归档'
    };
    return statusMap[status] || status;
}

// 根据类型获取靶标图标类
function getTargetIconClass(type, targetId) {
    const iconMap = {
        // 网络设备
        'router': 'fas fa-network-wired',
        'switch': 'fas fa-project-diagram',
        'firewall': 'fas fa-shield-alt',
        'wireless-ap': 'fas fa-wifi',
        'load-balancer': 'fas fa-balance-scale',
        
        // 服务器
        'webserver': 'fas fa-server',
        'database': 'fas fa-database',
        'fileserver': 'fas fa-folder-open',
        
        // 终端设备
        'pc': 'fas fa-desktop',
        'mobile': 'fas fa-mobile-alt',
        'iot': 'fas fa-microchip',
        
        // 攻击设备
        'kali': 'fas fa-skull',
        'parrot': 'fas fa-skull',
        'blackarch': 'fas fa-skull',
        'pentoo': 'fas fa-skull',
        'backbox': 'fas fa-skull',
        'deft': 'fas fa-skull',
        
        // 漏洞靶标
        'vuln': 'fas fa-bug'
    };
    
    return iconMap[type] || 'fas fa-question-circle';
}

// 根据类型获取靶标名称
function getTargetName(type, targetId) {
    const nameMap = {
        // 网络设备
        'router': '路由器',
        'switch': '交换机',
        'firewall': '防火墙',
        'wireless-ap': '无线AP',
        'load-balancer': '负载均衡器',
        
        // 服务器
        'webserver': 'Web服务器',
        'database': '数据库服务器',
        'fileserver': '文件服务器',
        
        // 终端设备
        'pc': 'PC',
        'mobile': '移动设备',
        'iot': 'IoT设备',
        
        // 攻击设备
        'kali': 'Kali Linux',
        'parrot': 'Parrot OS',
        'blackarch': 'BlackArch',
        'pentoo': 'Pentoo',
        'backbox': 'BackBox',
        'deft': 'DEFT Linux',
        
        // 漏洞靶标
        'vuln': '漏洞靶标'
    };
    
    // 如果有具体的targetId，可以返回更具体的名称
    if (targetId) {
        const specificNames = {
            'sql-injection': 'SQL注入靶标',
            'xss': 'XSS跨站靶标',
            'rce': '远程代码执行靶标',
            'file-upload': '文件上传靶标',
            'csrf': 'CSRF靶标',
            'ssrf': 'SSRF靶标',
            'xxe': 'XXE靶标',
            'deserialization': '反序列化靶标',
            'command-injection': '命令注入靶标',
            'path-traversal': '路径遍历靶标'
        };
        
        if (specificNames[targetId]) {
            return specificNames[targetId];
        }
    }
    
    return nameMap[type] || '未知设备';
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 格式化时间
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 验证IP地址格式
function validateIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
}

// 验证端口号
function validatePort(port) {
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

// 生成随机ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 深拷贝对象
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 导出拓扑数据为JSON
function exportTopologyData() {
    const data = {
        nodes: topologyNodes,
        connectors: topologyConnectors,
        exportTime: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `topology-${Date.now()}.json`;
    link.click();
    
    showNotification('拓扑数据已导出', 'success');
}

// 导入拓扑数据
function importTopologyData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.nodes && data.connectors) {
                // 清空当前拓扑
                clearTopology();
                
                // 导入节点
                topologyNodes = data.nodes;
                topologyNodes.forEach(nodeData => {
                    addNodeToTopology(nodeData);
                });
                
                // 导入连接
                topologyConnectors = data.connectors;
                updateConnectors();
                
                // 隐藏占位符
                const placeholder = document.querySelector('.dropzone-placeholder');
                if (placeholder && topologyNodes.length > 0) {
                    placeholder.style.display = 'none';
                }
                
                showNotification('拓扑数据导入成功', 'success');
            } else {
                showNotification('无效的拓扑数据格式', 'error');
            }
        } catch (error) {
            console.error('导入拓扑数据时出错:', error);
            showNotification('导入拓扑数据失败', 'error');
        }
    };
    reader.readAsText(file);
}

// 检查浏览器兼容性
function checkBrowserCompatibility() {
    const features = {
        'drag-and-drop': 'draggable' in document.createElement('div'),
        'local-storage': typeof Storage !== 'undefined',
        'file-api': typeof FileReader !== 'undefined'
    };
    
    const unsupported = Object.keys(features).filter(feature => !features[feature]);
    
    if (unsupported.length > 0) {
        showNotification(`您的浏览器不支持以下功能: ${unsupported.join(', ')}`, 'warning');
    }
    
    return unsupported.length === 0;
}

// 初始化工具函数
function initUtils() {
    // 检查浏览器兼容性
    checkBrowserCompatibility();
    
    // 添加全局错误处理
    window.addEventListener('error', function(e) {
        console.error('全局错误:', e.error);
        showNotification('发生了一个错误，请刷新页面重试', 'error');
    });
    
    // 添加未处理的Promise拒绝处理
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未处理的Promise拒绝:', e.reason);
        showNotification('操作失败，请重试', 'error');
    });
}