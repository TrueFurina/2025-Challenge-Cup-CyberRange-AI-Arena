// 个人中心页面JavaScript

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAbilityRadar();
    initializeStatisticsCharts();
    initializeAnimations();
    loadUserData();
});

// 初始化能力雷达图
function initializeAbilityRadar() {
    const ctx = document.getElementById('abilityRadar').getContext('2d');
    
    // 能力数据
    const abilityData = {
        labels: [
            '漏洞挖掘',
            '渗透测试', 
            '社会工程学',
            '后渗透技术',
            '威胁狩猎',
            '应急响应',
            '安全工具使用',
            '团队协作'
        ],
        datasets: [{
            label: '当前能力水平',
            data: [92, 88, 85, 45, 52, 48, 75, 68],
            backgroundColor: 'rgba(72, 52, 212, 0.2)',
            borderColor: 'rgba(72, 52, 212, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(72, 52, 212, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
        }, {
            label: '目标水平',
            data: [95, 90, 88, 80, 85, 82, 90, 85],
            backgroundColor: 'rgba(104, 109, 224, 0.1)',
            borderColor: 'rgba(104, 109, 224, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: 'rgba(104, 109, 224, 0.8)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };
    
    // 雷达图配置
    const config = {
        type: 'radar',
        data: abilityData,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: '个人能力评估雷达图',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#333',
                    padding: 20
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 12
                        },
                        color: '#666',
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(72, 52, 212, 1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.r + '%';
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 10
                        },
                        color: '#666',
                        backdropColor: 'transparent'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    angleLines: {
                        color: 'rgba(0, 0, 0, 0.1)',
                        lineWidth: 1
                    },
                    pointLabels: {
                        font: {
                            size: 11,
                            weight: '500'
                        },
                        color: '#333',
                        padding: 10
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.1
                }
            },
            interaction: {
                intersect: false,
                mode: 'point'
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    };
    
    // 创建雷达图
    new Chart(ctx, config);
}

// 初始化统计图表
function initializeStatisticsCharts() {
    initProgressChart();
    initSkillDistributionChart();
    initActivityChart();
    initScoreChart();
}

// 学习进度趋势图
function initProgressChart() {
    const ctx = document.getElementById('progressChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '学习进度',
                data: [20, 35, 50, 65, 75, 85],
                borderColor: 'rgba(72, 52, 212, 1)',
                backgroundColor: 'rgba(72, 52, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// 技能分布饼图
function initSkillDistributionChart() {
    const ctx = document.getElementById('skillDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['网络安全', '渗透测试', '恶意软件', '数字取证', '安全运维'],
            datasets: [{
                data: [25, 20, 18, 22, 15],
                backgroundColor: [
                    'rgba(72, 52, 212, 0.8)',
                    'rgba(104, 109, 224, 0.8)',
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(253, 126, 20, 0.8)',
                    'rgba(255, 193, 7, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// 月度活跃度柱状图
function initActivityChart() {
    const ctx = document.getElementById('activityChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '活跃度',
                data: [12, 19, 15, 25, 22, 8, 5],
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// 成绩分析雷达图
function initScoreChart() {
    const ctx = document.getElementById('scoreChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['理论知识', '实践操作', '团队协作', '创新思维', '问题解决'],
            datasets: [{
                data: [85, 78, 92, 70, 88],
                backgroundColor: [
                    'rgba(72, 52, 212, 0.6)',
                    'rgba(104, 109, 224, 0.6)',
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(253, 126, 20, 0.6)',
                    'rgba(255, 193, 7, 0.6)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 10,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        font: {
                            size: 9
                        }
                    }
                }
            }
        }
    });
}

// 初始化动画效果
function initializeAnimations() {
    // 观察器配置
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    // 创建观察器
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // 如果是技能项，添加延迟动画
                if (entry.target.classList.contains('strength-item') || 
                    entry.target.classList.contains('weakness-item')) {
                    const items = entry.target.parentElement.children;
                    Array.from(items).forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.section, .timeline-item, .suggestion-card');
    animatedElements.forEach(el => observer.observe(el));
    
    // 初始化技能项动画
    const skillItems = document.querySelectorAll('.strength-item, .weakness-item');
    skillItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'all 0.5s ease';
    });
}

// 加载用户数据
function loadUserData() {
    // 模拟从后端获取用户数据
    const userData = {
        username: '学员张三',
        studentId: '20240001',
        level: '中级',
        totalScore: 1250,
        completedCourses: 8,
        totalCourses: 12,
        lastLoginTime: '2024-01-15 14:30:00'
    };
    
    // 更新用户信息显示
    updateUserInfo(userData);
    
    // 更新技能数据
    updateSkillData();
    
    // 更新学习进度
    updateLearningProgress(userData);
    
    // 更新学习规划
    updateLearningPlanning();
}

// 更新用户信息
function updateUserInfo(userData) {
    const userInfoElement = document.querySelector('.user-info');
    if (userInfoElement) {
        userInfoElement.textContent = `欢迎，${userData.username} (${userData.studentId})`;
    }
}

// 更新技能数据
function updateSkillData() {
    // 优势技能数据
    const strengthsData = [
        { name: '漏洞挖掘技术强化', score: 92 },
        { name: '渗透测试方法论', score: 88 },
        { name: '社会工程学实践', score: 85 }
    ];
    
    // 弱势技能数据
    const weaknessesData = [
        { name: '后渗透技术深化', score: 45 },
        { name: '威胁狩猎技能训练', score: 52 },
        { name: '应急响应流程优化', score: 48 }
    ];
    
    // 更新优势技能显示
    updateSkillList('.strength-list', strengthsData, 'strength');
    
    // 更新弱势技能显示
    updateSkillList('.weakness-list', weaknessesData, 'weakness');
}

// 更新技能列表
function updateSkillList(selector, data, type) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    container.innerHTML = '';
    
    data.forEach((skill, index) => {
        const skillItem = document.createElement('div');
        skillItem.className = `${type}-item`;
        skillItem.innerHTML = `
            <span class="skill-name">${skill.name}</span>
            <span class="skill-score">${skill.score}%</span>
        `;
        
        // 添加点击事件
        skillItem.addEventListener('click', () => {
            showSkillDetail(skill);
        });
        
        container.appendChild(skillItem);
    });
}

// 显示技能详情
function showSkillDetail(skill) {
    // 创建模态框显示技能详情
    const modal = document.createElement('div');
    modal.className = 'skill-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${skill.name}</h3>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="skill-score-display">
                    <div class="score-circle">
                        <span class="score-text">${skill.score}%</span>
                    </div>
                </div>
                <div class="skill-description">
                    <h4>技能描述</h4>
                    <p>这是关于${skill.name}的详细描述和学习建议...</p>
                </div>
                <div class="improvement-suggestions">
                    <h4>提升建议</h4>
                    <ul>
                        <li>加强理论学习</li>
                        <li>增加实践练习</li>
                        <li>参与相关项目</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加模态框样式
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    // 点击背景关闭模态框
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.skill-modal');
    if (modal) {
        modal.remove();
    }
}

// 更新学习进度
function updateLearningProgress(userData) {
    const progressPercentage = (userData.completedCourses / userData.totalCourses) * 100;
    
    // 可以在这里添加进度条更新逻辑
    console.log(`学习进度: ${progressPercentage.toFixed(1)}%`);
}

// 更新学习规划
function updateLearningPlanning() {
    // 短期规划数据
    const shortTermGoals = [
        { title: '完成网络安全基础课程', progress: 85 },
        { title: '掌握渗透测试工具', progress: 72 },
        { title: '学习防火墙配置', progress: 60 },
        { title: '练习漏洞扫描技术', progress: 45 }
    ];

    // 长期规划数据
    const longTermMilestones = [
        { 
            icon: '🎯', 
            title: '获得CISSP认证', 
            description: '完成信息安全专业认证考试', 
            deadline: '2024年12月' 
        },
        { 
            icon: '🏆', 
            title: '参与CTF竞赛', 
            description: '参加国际网络安全竞赛并获得名次', 
            deadline: '2024年10月' 
        },
        { 
            icon: '📚', 
            title: '完成高级渗透测试', 
            description: '掌握高级渗透测试技术和方法', 
            deadline: '2024年8月' 
        }
    ];

    // 进度跟踪数据
    const progressStats = {
        completedCourses: 12,
        totalHours: 156,
        skillPoints: 2340,
        rank: 15
    };

    const recentActivities = [
        { time: '今天', desc: '完成SQL注入实验' },
        { time: '昨天', desc: '学习XSS防护技术' },
        { time: '2天前', desc: '参与团队讨论' },
        { time: '3天前', desc: '完成安全评估报告' }
    ];

    // 更新短期规划
    const shortTermContainer = document.querySelector('.short-term .planning-content');
    if (shortTermContainer) {
        shortTermContainer.innerHTML = shortTermGoals.map(goal => `
            <div class="goal-item">
                <div class="goal-title">${goal.title}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="progress-text">${goal.progress}%</div>
            </div>
        `).join('');
    }

    // 更新长期规划
    const longTermContainer = document.querySelector('.long-term .planning-content');
    if (longTermContainer) {
        longTermContainer.innerHTML = longTermMilestones.map(milestone => `
            <div class="milestone-item">
                <div class="milestone-icon">${milestone.icon}</div>
                <div class="milestone-info">
                    <h4>${milestone.title}</h4>
                    <p>${milestone.description}</p>
                    <span class="deadline">${milestone.deadline}</span>
                </div>
            </div>
        `).join('');
    }

    // 更新进度跟踪
    const progressContainer = document.querySelector('.progress-tracking .planning-content');
    if (progressContainer) {
        progressContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${progressStats.completedCourses}</div>
                    <div class="stat-label">已完成课程</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${progressStats.totalHours}</div>
                    <div class="stat-label">学习时长(h)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${progressStats.skillPoints}</div>
                    <div class="stat-label">技能积分</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">#${progressStats.rank}</div>
                    <div class="stat-label">排名</div>
                </div>
            </div>
            <div class="recent-activity">
                <h4>最近活动</h4>
                <div class="activity-list">
                    ${recentActivities.map(activity => `
                        <div class="activity-item">
                            <span class="activity-time">${activity.time}</span>
                            <span class="activity-desc">${activity.desc}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        // 清除本地存储的用户信息
        localStorage.removeItem('studentRemember');
        localStorage.removeItem('studentUsername');
        
        // 显示退出消息
        showMessage('已成功退出登录', 'success');
        
        // 跳转到登录页面
        setTimeout(() => {
            window.location.href = 'student-login.html';
        }, 1500);
    }
}

// 显示消息提示
function showMessage(message, type) {
    // 移除已存在的消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(135deg, #28a745, #20c997);' : 'background: linear-gradient(135deg, #dc3545, #fd7e14);'}
    `;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                messageDiv.remove();
            }, 300);
        }
    }, 3000);
}

// 技能项点击效果
document.addEventListener('click', function(e) {
    if (e.target.closest('.strength-item') || e.target.closest('.weakness-item')) {
        const item = e.target.closest('.strength-item, .weakness-item');
        
        // 添加点击动画
        item.style.transform = 'scale(0.98)';
        setTimeout(() => {
            item.style.transform = 'translateX(4px)';
        }, 150);
    }
});

// 建议卡片悬停效果
document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-4px) scale(1)';
    });
});

// 时间线项目点击事件
document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', function() {
        const content = this.querySelector('.timeline-content');
        const status = this.querySelector('.status');
        
        // 添加点击反馈
        content.style.transform = 'scale(0.98)';
        setTimeout(() => {
            content.style.transform = 'scale(1)';
        }, 150);
        
        // 如果是待开始状态，可以触发相关操作
        if (status.classList.contains('pending')) {
            showMessage('该阶段尚未开放，请完成前置任务', 'info');
        }
    });
});

// 添加CSS动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        margin: 0;
        color: #333;
        font-size: 1.2rem;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .close-btn:hover {
        background: #f0f0f0;
        color: #333;
    }
    
    .modal-body {
        padding: 24px;
    }
    
    .skill-score-display {
        text-align: center;
        margin-bottom: 24px;
    }
    
    .score-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4834d4, #686de0);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }
    
    .score-text {
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
    }
    
    .skill-description,
    .improvement-suggestions {
        margin-bottom: 20px;
    }
    
    .skill-description h4,
    .improvement-suggestions h4 {
        color: #333;
        font-size: 1rem;
        margin-bottom: 12px;
        font-weight: 600;
    }
    
    .skill-description p {
        color: #666;
        line-height: 1.6;
        font-size: 0.9rem;
    }
    
    .improvement-suggestions ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .improvement-suggestions li {
        padding: 8px 0;
        color: #666;
        font-size: 0.9rem;
        position: relative;
        padding-left: 20px;
    }
    
    .improvement-suggestions li::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #4834d4;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// 键盘事件处理
document.addEventListener('keydown', function(e) {
    // ESC键关闭模态框
    if (e.key === 'Escape') {
        closeModal();
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // 页面重新可见时，可以刷新数据
        console.log('页面重新可见，可以刷新数据');
    }
});

// 导出函数供其他模块使用
window.PersonalCenter = {
    showMessage,
    closeModal,
    logout
};