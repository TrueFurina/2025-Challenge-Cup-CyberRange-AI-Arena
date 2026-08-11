// 管理员仪表板JavaScript功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeChart();
    startRealTimeUpdates();
});

// 初始化仪表板
function initializeDashboard() {
    // 设置当前时间
    updateCurrentTime();
    
    // 初始化资源监控
    updateResourceUsage();
    
    // 初始化服务器状态
    updateServerStatus();
    
    // 初始化虚拟化统计
    updateVirtualizationStats();
    
    // 初始化告警信息
    updateAlerts();
    
    // 初始化在线用户
    updateOnlineUsers();
}

// 显示指定的内容区域
function showSection(sectionId) {
    // 隐藏所有内容区域
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示指定的内容区域
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 更新导航状态
    updateNavigation(sectionId);
}

// 更新导航状态
function updateNavigation(activeSection) {
    // 导航状态由侧边栏组件管理
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除本地存储的登录信息
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUsername');
        
        // 显示退出动画
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.95)';
        
        // 延迟跳转到登录页面
        setTimeout(() => {
            window.location.href = 'admin-login.html';
        }, 300);
    }
}

// 刷新服务器数据
function refreshServerData() {
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        // 添加旋转动画
        refreshBtn.style.transform = 'rotate(360deg)';
        
        // 模拟数据刷新
        setTimeout(() => {
            updateServerStatus();
            updateResourceUsage();
            refreshBtn.style.transform = 'rotate(0deg)';
            
            // 显示刷新成功提示
            showNotification('数据刷新成功', 'success');
        }, 1000);
    }
}

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // 如果有时间显示元素，更新时间
    const timeElement = document.querySelector('.current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 更新资源使用情况
function updateResourceUsage() {
    const resources = [
        { selector: '.resource-item:nth-child(1) .progress-fill', value: Math.random() * 100 },
        { selector: '.resource-item:nth-child(2) .progress-fill', value: Math.random() * 100 },
        { selector: '.resource-item:nth-child(3) .progress-fill', value: Math.random() * 100 },
        { selector: '.resource-item:nth-child(4) .progress-fill', value: Math.random() * 100 }
    ];
    
    resources.forEach((resource, index) => {
        const element = document.querySelector(resource.selector);
        const valueElement = document.querySelector(`.resource-item:nth-child(${index + 1}) .resource-value`);
        
        if (element && valueElement) {
            const value = Math.round(resource.value);
            element.style.width = value + '%';
            valueElement.textContent = value + '%';
            
            // 根据使用率设置颜色
            if (value > 80) {
                element.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            } else if (value > 60) {
                element.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                element.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
            }
        }
    });
}

// 更新服务器状态
function updateServerStatus() {
    const serverItems = document.querySelectorAll('.server-item');
    const statuses = ['online', 'warning', 'offline'];
    const statusTexts = {
        'online': '在线',
        'warning': '高负载',
        'offline': '离线'
    };
    
    serverItems.forEach((item, index) => {
        const statusElement = item.querySelector('.server-status');
        if (statusElement && index < 3) {
            // 大部分服务器保持在线状态
            const randomStatus = Math.random() > 0.8 ? statuses[1] : statuses[0];
            
            statusElement.className = `server-status ${randomStatus}`;
            statusElement.querySelector('span').textContent = statusTexts[randomStatus];
        }
    });
}

// 更新虚拟化统计
function updateVirtualizationStats() {
    const stats = [
        { selector: '.virt-item:nth-child(1) h4', baseValue: 89, variance: 10 },
        { selector: '.virt-item:nth-child(2) h4', baseValue: 234, variance: 20 },
        { selector: '.virt-item:nth-child(3) h4', baseValue: 45, variance: 5 },
        { selector: '.virt-item:nth-child(4) h4', baseValue: 12, variance: 3 }
    ];
    
    stats.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            const newValue = stat.baseValue + Math.floor(Math.random() * stat.variance * 2 - stat.variance);
            element.textContent = newValue;
        }
    });
}

// 更新告警信息
function updateAlerts() {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) return;
    
    const alerts = [
        {
            type: 'warning',
            icon: 'fas fa-exclamation-triangle',
            message: '计算节点-02 CPU使用率过高',
            time: '5分钟前'
        },
        {
            type: 'info',
            icon: 'fas fa-info-circle',
            message: '新增23个虚拟靶标实例',
            time: '1小时前'
        },
        {
            type: 'success',
            icon: 'fas fa-check-circle',
            message: '系统备份完成',
            time: '2小时前'
        }
    ];
    
    // 随机添加新告警
    if (Math.random() > 0.7) {
        const newAlert = {
            type: 'info',
            icon: 'fas fa-info-circle',
            message: '用户登录活动检测到异常',
            time: '刚刚'
        };
        alerts.unshift(newAlert);
    }
    
    // 限制告警数量
    alerts.splice(5);
    
    // 更新告警列表
    alertList.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
            <i class="${alert.icon}"></i>
            <div class="alert-content">
                <p>${alert.message}</p>
                <span class="alert-time">${alert.time}</span>
            </div>
        </div>
    `).join('');
}

// 更新在线用户
function updateOnlineUsers() {
    const usersList = document.querySelector('.online-users');
    if (!usersList) return;
    
    const users = [
        { name: '张三', activity: '正在进行Web安全训练' },
        { name: '李四', activity: '正在进行网络渗透测试' },
        { name: '王五', activity: '正在查看漏洞库' },
        { name: '赵六', activity: '正在配置虚拟靶标' },
        { name: '钱七', activity: '正在分析攻击日志' }
    ];
    
    // 随机显示3-5个用户
    const displayUsers = users.slice(0, Math.floor(Math.random() * 3) + 3);
    
    usersList.innerHTML = displayUsers.map(user => `
        <div class="user-item">
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <h4>${user.name}</h4>
                <p>${user.activity}</p>
            </div>
            <div class="user-status online"></div>
        </div>
    `).join('');
}

// 初始化图表
function initializeChart() {
    const canvas = document.getElementById('systemChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 清除画布
    ctx.clearRect(0, 0, width, height);
    
    // 设置样式
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    
    // 生成模拟数据
    const dataPoints = 20;
    const data = [];
    for (let i = 0; i < dataPoints; i++) {
        data.push(Math.random() * 80 + 10);
    }
    
    // 绘制图表
    ctx.beginPath();
    for (let i = 0; i < dataPoints; i++) {
        const x = (i / (dataPoints - 1)) * width;
        const y = height - (data[i] / 100) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    // 填充区域
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
    
    // 绘制线条
    ctx.beginPath();
    for (let i = 0; i < dataPoints; i++) {
        const x = (i / (dataPoints - 1)) * width;
        const y = height - (data[i] / 100) * height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 添加网格线
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.2)';
    ctx.lineWidth = 1;
    
    // 水平网格线
    for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // 垂直网格线
    for (let i = 0; i <= 4; i++) {
        const x = (i / 4) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
}

// 开始实时更新
function startRealTimeUpdates() {
    // 每30秒更新一次数据
    setInterval(() => {
        updateResourceUsage();
        updateVirtualizationStats();
        updateAlerts();
        updateOnlineUsers();
        initializeChart();
    }, 30000);
    
    // 每秒更新时间
    setInterval(updateCurrentTime, 1000);
    
    // 每5分钟更新服务器状态
    setInterval(updateServerStatus, 300000);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动移除
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// 检查登录状态
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// 页面加载时检查登录状态
if (!checkLoginStatus()) {
    // 如果未登录，阻止页面加载
    document.body.style.display = 'none';
}

// 移动端菜单切换
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

// 响应式处理
function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.querySelector('.sidebar');
    
    if (width > 768 && sidebar) {
        sidebar.classList.remove('open');
    }
}

// 监听窗口大小变化
window.addEventListener('resize', handleResize);

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl + D 显示仪表板
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        showSection('dashboard');
    }
    
    // Ctrl + U 显示用户管理
    if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        showSection('user-management');
    }
    
    // Ctrl + R 刷新数据
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        refreshServerData();
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时暂停更新
        console.log('页面隐藏，暂停数据更新');
    } else {
        // 页面显示时恢复更新
        console.log('页面显示，恢复数据更新');
        updateResourceUsage();
        updateVirtualizationStats();
        initializeChart();
    }
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
    showNotification('系统出现错误，请刷新页面重试', 'warning');
});

// 导出函数供全局使用
window.showSection = showSection;
// toggleSubmenu函数已移除，子菜单切换逻辑现在由SidebarManager类处理
window.logout = logout;
window.refreshServerData = refreshServerData;
window.toggleMobileMenu = toggleMobileMenu;