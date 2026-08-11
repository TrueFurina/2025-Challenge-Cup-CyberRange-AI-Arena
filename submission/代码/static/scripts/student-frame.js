// 学员端框架JavaScript

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeUserActions();
    initializeProgressTracking();
    updateTimeInfo();
    initializeMessageListener();
});

// 初始化消息监听器
function initializeMessageListener() {
    // 监听来自iframe的消息
    window.addEventListener('message', function(event) {
        if (event.data && event.data.action === 'updateProgress') {
            updateProgressDisplay(event.data.progress);
        } else if (event.data && event.data.action === 'loadPage') {
            // 处理页面跳转请求
            const page = event.data.page;
            const params = event.data.params || {};
            
            // 构建URL参数
            const urlParams = new URLSearchParams(params).toString();
            const fullUrl = urlParams ? `${page}?${urlParams}` : page;
            
            // 加载新页面
            loadPage(fullUrl);
        }
    });
}

// 加载指定页面
function loadPage(url) {
    const contentFrame = document.getElementById('content-frame');
    if (contentFrame) {
        // 添加加载动画
        contentFrame.style.opacity = '0.5';
        
        // 延迟加载新页面
        setTimeout(() => {
            contentFrame.src = url;
            
            // 页面加载完成后恢复透明度
            contentFrame.onload = function() {
                contentFrame.style.opacity = '1';
            };
        }, 200);
    }
}

// 初始化导航功能
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const contentFrame = document.getElementById('content-frame');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            
            // 获取页面标识
            const page = this.getAttribute('data-page');
            
            // 切换页面内容
            switchPage(page, contentFrame);
        });
    });
}

// 页面切换功能
function switchPage(page, contentFrame) {
    const pageMap = {
        'personal-center': 'personal-center.html',
        'scenario-test': 'scenario-test.html',
        'course-learning': 'course-learning.html',
        'experiment-center': 'experiment-center.html',
        'scan-test': 'student-scan-test.html',
        'competition-center': 'competition-center.html'
    };
    
    const targetPage = pageMap[page];
    if (targetPage) {
        // 添加加载动画
        contentFrame.style.opacity = '0.5';
        
        // 延迟加载新页面
        setTimeout(() => {
            contentFrame.src = targetPage;
            
            // 页面加载完成后恢复透明度
            contentFrame.onload = function() {
                contentFrame.style.opacity = '1';
            };
        }, 200);
    }
}

// 初始化用户操作
function initializeUserActions() {
    // 通知按钮
    const notificationBtn = document.querySelector('.action-btn[title="通知"]');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotifications();
        });
    }
    
    // 设置按钮
    const settingsBtn = document.querySelector('.action-btn[title="设置"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            showSettings();
        });
    }
    
    // 退出登录按钮
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            handleLogout();
        });
    }
}

// 显示通知
function showNotifications() {
    // 这里可以实现通知弹窗
    alert('通知功能开发中...');
}

// 显示设置
function showSettings() {
    // 这里可以实现设置弹窗
    alert('设置功能开发中...');
}

// 处理退出登录
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除用户数据
        localStorage.removeItem('studentUser');
        sessionStorage.clear();
        
        // 跳转到登录页面
        window.location.href = 'student-login.html';
    }
}

// 初始化进度跟踪
function initializeProgressTracking() {
    // 模拟学习进度数据
    const progressData = {
        dailyProgress: 65,
        studyTime: {
            hours: 2,
            minutes: 30
        }
    };
    
    updateProgressDisplay(progressData);
    
    // 每分钟更新一次学习时长
    setInterval(() => {
        progressData.studyTime.minutes += 1;
        if (progressData.studyTime.minutes >= 60) {
            progressData.studyTime.hours += 1;
            progressData.studyTime.minutes = 0;
        }
        updateTimeInfo(progressData.studyTime);
    }, 60000); // 每分钟更新
}

// 更新进度显示
function updateProgressDisplay(data) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = data.dailyProgress + '%';
        progressText.textContent = data.dailyProgress + '%';
    }
}

// 更新时间信息
function updateTimeInfo(timeData) {
    const timeInfo = document.querySelector('.time-info');
    if (timeInfo) {
        if (timeData) {
            timeInfo.textContent = `学习时长：${timeData.hours}小时${timeData.minutes}分钟`;
        } else {
            // 默认显示当前时间
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-CN', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            timeInfo.textContent = `当前时间：${timeString}`;
        }
    }
}

// 获取用户信息
function getUserInfo() {
    // 从localStorage获取用户信息
    const userInfo = localStorage.getItem('studentUser');
    if (userInfo) {
        return JSON.parse(userInfo);
    }
    
    // 默认用户信息
    return {
        name: '学员用户',
        level: '初级学员',
        avatar: '学'
    };
}

// 更新用户显示信息
function updateUserDisplay() {
    const userInfo = getUserInfo();
    
    const userName = document.querySelector('.user-name');
    const userLevel = document.querySelector('.user-level');
    const userAvatar = document.querySelector('.user-avatar span');
    
    if (userName) userName.textContent = userInfo.name;
    if (userLevel) userLevel.textContent = userInfo.level;
    if (userAvatar) userAvatar.textContent = userInfo.avatar;
}

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // 页面重新可见时更新时间
        updateTimeInfo();
    }
});

// 窗口大小变化处理
window.addEventListener('resize', function() {
    // 响应式布局调整
    handleResponsiveLayout();
});

// 响应式布局处理
function handleResponsiveLayout() {
    const width = window.innerWidth;
    const navItems = document.querySelectorAll('.nav-item');
    
    if (width <= 1200) {
        // 小屏幕时隐藏导航文字
        navItems.forEach(item => {
            const text = item.querySelector('.nav-text');
            if (text) {
                text.style.display = 'none';
            }
        });
    } else {
        // 大屏幕时显示导航文字
        navItems.forEach(item => {
            const text = item.querySelector('.nav-text');
            if (text) {
                text.style.display = 'block';
            }
        });
    }
}

// 初始化时调用一次响应式布局
handleResponsiveLayout();

// 导出函数供其他模块使用
window.StudentFrame = {
    switchPage,
    updateProgressDisplay,
    updateUserDisplay,
    getUserInfo
};