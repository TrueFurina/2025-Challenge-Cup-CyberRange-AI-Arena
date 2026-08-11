// 课程学习页面JavaScript功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeCourseLearning();
    loadCourses();
    bindEvents();
});

// 课程数据
const courseData = [
    {
        id: 1,
        title: '网络安全基础理论',
        instructor: '李教授',
        category: '基础理论',
        level: 'beginner',
        description: '全面介绍网络安全的基本概念、原理和方法，为后续深入学习打下坚实基础。',
        duration: '24小时',
        rating: 4.8,
        students: 15420,
        price: 'free',
        status: 'completed',
        progress: 100,
        icon: '🛡️',
        badge: 'free',
        completedDate: '2024-01-20'
    },
    {
        id: 2,
        title: 'Web应用安全测试',
        instructor: '张安全',
        category: '渗透测试',
        level: 'intermediate',
        description: '深入学习Web应用安全测试技术，包括SQL注入、XSS、CSRF等常见漏洞的检测与利用。',
        duration: '36小时',
        rating: 4.9,
        students: 8765,
        price: '¥299',
        status: 'in-progress',
        progress: 65,
        icon: '🌐',
        badge: 'hot'
    },
    {
        id: 3,
        title: '恶意软件分析技术',
        instructor: '王专家',
        category: '恶意软件',
        level: 'advanced',
        description: '学习恶意软件的静态分析和动态分析技术，掌握逆向工程和行为分析方法。',
        duration: '48小时',
        rating: 4.7,
        students: 3421,
        price: '¥599',
        status: 'not-started',
        progress: 0,
        icon: '🦠',
        badge: 'new'
    },
    {
        id: 4,
        title: '数字取证与事件响应',
        instructor: '赵取证',
        category: '取证分析',
        level: 'intermediate',
        description: '掌握数字取证的基本流程和技术方法，学习事件响应和证据收集分析技能。',
        duration: '32小时',
        rating: 4.6,
        students: 5643,
        price: '¥399',
        status: 'not-started',
        progress: 0,
        icon: '🔍'
    },
    {
        id: 5,
        title: '企业网络防御体系',
        instructor: '刘防御',
        category: '防御技术',
        level: 'advanced',
        description: '构建企业级网络安全防御体系，包括防火墙配置、入侵检测、安全监控等技术。',
        duration: '40小时',
        rating: 4.8,
        students: 4567,
        price: '¥499',
        status: 'in-progress',
        progress: 25,
        icon: '🏰'
    },
    {
        id: 6,
        title: '密码学原理与应用',
        instructor: '陈密码',
        category: '密码学',
        level: 'expert',
        description: '深入学习现代密码学理论，掌握各种加密算法的原理和实际应用场景。',
        duration: '56小时',
        rating: 4.9,
        students: 2134,
        price: '¥799',
        status: 'not-started',
        progress: 0,
        icon: '🔐'
    },
    {
        id: 7,
        title: 'Python安全编程',
        instructor: '孙编程',
        category: '基础理论',
        level: 'intermediate',
        description: '使用Python进行安全工具开发，学习自动化渗透测试和安全分析脚本编写。',
        duration: '28小时',
        rating: 4.7,
        students: 9876,
        price: '¥199',
        status: 'completed',
        progress: 100,
        icon: '🐍',
        completedDate: '2024-01-10'
    },
    {
        id: 8,
        title: '移动应用安全测试',
        instructor: '周移动',
        category: '渗透测试',
        level: 'advanced',
        description: '专注于Android和iOS应用的安全测试，包括静态分析、动态调试和逆向分析。',
        duration: '44小时',
        rating: 4.5,
        students: 3789,
        price: '¥549',
        status: 'not-started',
        progress: 0,
        icon: '📱',
        badge: 'new'
    }
];

// 当前视图模式
let currentView = 'grid';

// 初始化页面
function initializeCourseLearning() {
    updateStats();
    setupFilters();
}

// 更新统计信息
function updateStats() {
    const enrolled = courseData.filter(c => c.status !== 'not-started').length;
    const completed = courseData.filter(c => c.status === 'completed').length;
    const totalHours = courseData
        .filter(c => c.status === 'completed')
        .reduce((sum, c) => sum + parseInt(c.duration), 0);
    
    document.getElementById('enrolledCount').textContent = enrolled;
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('studyHours').textContent = totalHours;
}

// 设置筛选器
function setupFilters() {
    // 分类选项已在HTML中定义
    // 这里可以根据实际数据动态生成
}

// 绑定事件
function bindEvents() {
    // 筛选器事件
    document.getElementById('categoryFilter').addEventListener('change', filterCourses);
    document.getElementById('levelFilter').addEventListener('change', filterCourses);
    document.getElementById('statusFilter').addEventListener('change', filterCourses);
    
    // 搜索事件
    document.getElementById('searchInput').addEventListener('input', debounce(filterCourses, 300));
    document.getElementById('searchBtn').addEventListener('click', filterCourses);
    
    // 回车搜索
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterCourses();
        }
    });
    
    // 视图切换
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            switchView(view);
        });
    });
}

// 加载课程列表
function loadCourses(courses = courseData) {
    const grid = document.getElementById('coursesGrid');
    grid.innerHTML = '';
    
    courses.forEach(course => {
        const card = createCourseCard(course);
        grid.appendChild(card);
    });
}

// 创建课程卡片
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.dataset.id = course.id;
    
    const levelClass = course.level;
    const levelText = getLevelText(course.level);
    const statusInfo = getStatusInfo(course);
    const actionButton = getActionButton(course);
    const badge = course.badge ? `<div class="course-badge ${course.badge}">${getBadgeText(course.badge)}</div>` : '';
    
    if (currentView === 'grid') {
        card.innerHTML = `
            <div class="course-image">
                ${course.icon}
                ${badge}
            </div>
            <div class="course-content">
                <div class="course-header">
                    <span class="course-category">${course.category}</span>
                    <span class="course-level ${levelClass}">${levelText}</span>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-instructor">👨‍🏫 ${course.instructor}</p>
                <p class="course-description">${course.description}</p>
                
                <div class="course-meta">
                    <div class="course-rating">
                        <span>⭐</span>
                        <span>${course.rating} (${course.students.toLocaleString()})</span>
                    </div>
                    <div class="course-duration">
                        <span>⏱️</span>
                        <span>${course.duration}</span>
                    </div>
                </div>
                
                ${statusInfo}
                
                <div class="course-footer">
                    <div class="course-price ${course.price === 'free' ? 'free' : ''}">
                        ${course.price === 'free' ? '免费' : course.price}
                    </div>
                    ${actionButton}
                </div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="course-image">
                ${course.icon}
                ${badge}
            </div>
            <div class="course-content">
                <div class="course-info">
                    <div class="course-header">
                        <span class="course-category">${course.category}</span>
                        <span class="course-level ${levelClass}">${levelText}</span>
                    </div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-instructor">👨‍🏫 ${course.instructor}</p>
                    <p class="course-description">${course.description}</p>
                    
                    <div class="course-meta">
                        <div class="course-rating">
                            <span>⭐</span>
                            <span>${course.rating} (${course.students.toLocaleString()})</span>
                        </div>
                        <div class="course-duration">
                            <span>⏱️</span>
                            <span>${course.duration}</span>
                        </div>
                    </div>
                    
                    ${statusInfo}
                </div>
                
                <div class="course-actions">
                    <div class="course-price ${course.price === 'free' ? 'free' : ''}">
                        ${course.price === 'free' ? '免费' : course.price}
                    </div>
                    ${actionButton}
                </div>
            </div>
        `;
    }
    
    return card;
}

// 获取等级文本
function getLevelText(level) {
    const levelMap = {
        'beginner': '初级',
        'intermediate': '中级',
        'advanced': '高级',
        'expert': '专家'
    };
    return levelMap[level] || level;
}

// 获取徽章文本
function getBadgeText(badge) {
    const badgeMap = {
        'new': '🆕 新课程',
        'hot': '🔥 热门',
        'free': '💎 免费'
    };
    return badgeMap[badge] || badge;
}

// 获取状态信息
function getStatusInfo(course) {
    if (course.status === 'in-progress') {
        return `
            <div class="course-progress">
                <div class="progress-label">
                    <span>学习进度</span>
                    <span>${course.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${course.progress}%"></div>
                </div>
            </div>
        `;
    } else if (course.status === 'completed') {
        return `
            <div class="course-progress">
                <div class="progress-label">
                    <span>✅ 已完成</span>
                    <span>完成时间: ${course.completedDate}</span>
                </div>
            </div>
        `;
    }
    return '';
}

// 获取操作按钮
function getActionButton(course) {
    switch (course.status) {
        case 'not-started':
            return `<button class="course-action enroll" onclick="enrollCourse(${course.id})">立即报名</button>`;
        case 'in-progress':
            return `<button class="course-action continue" onclick="continueCourse(${course.id})">继续学习</button>`;
        case 'completed':
            return `<button class="course-action completed" onclick="reviewCourse(${course.id})">查看证书</button>`;
        default:
            return '';
    }
}

// 筛选课程
function filterCourses() {
    const category = document.getElementById('categoryFilter').value;
    const level = document.getElementById('levelFilter').value;
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = courseData.filter(course => {
        const matchesCategory = !category || course.category === category;
        const matchesLevel = !level || course.level === level;
        const matchesStatus = !status || course.status === status;
        const matchesSearch = !search || 
            course.title.toLowerCase().includes(search) ||
            course.description.toLowerCase().includes(search) ||
            course.instructor.toLowerCase().includes(search) ||
            course.category.toLowerCase().includes(search);
        
        return matchesCategory && matchesLevel && matchesStatus && matchesSearch;
    });
    
    loadCourses(filtered);
    
    // 显示筛选结果数量
    const resultCount = filtered.length;
    const totalCount = courseData.length;
    console.log(`显示 ${resultCount} / ${totalCount} 门课程`);
}

// 切换视图
function switchView(view) {
    currentView = view;
    
    // 更新按钮状态
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    // 更新网格样式
    const grid = document.getElementById('coursesGrid');
    if (view === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
    
    // 重新加载课程
    loadCourses();
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

// 课程操作函数
function enrollCourse(id) {
    const course = courseData.find(c => c.id === id);
    if (course) {
        console.log(`报名课程: ${course.title}`);
        
        if (course.price === 'free') {
            alert(`成功报名「${course.title}」！\n\n这是一门免费课程，您可以立即开始学习。\n\n讲师: ${course.instructor}\n课程时长: ${course.duration}`);
            
            // 模拟报名成功
            course.status = 'in-progress';
            course.progress = 0;
        } else {
            alert(`即将报名「${course.title}」\n\n课程价格: ${course.price}\n讲师: ${course.instructor}\n课程时长: ${course.duration}\n\n请前往支付页面完成报名。`);
        }
        
        updateStats();
        loadCourses();
    }
}

function continueCourse(id) {
    const course = courseData.find(c => c.id === id);
    if (course) {
        console.log(`继续学习: ${course.title}`);
        alert(`继续学习「${course.title}」\n\n当前进度: ${course.progress}%\n讲师: ${course.instructor}\n\n即将跳转到课程页面...`);
        
        // 模拟学习进度更新
        if (course.progress < 100) {
            course.progress = Math.min(100, course.progress + Math.floor(Math.random() * 20) + 10);
            if (course.progress >= 100) {
                course.status = 'completed';
                course.completedDate = new Date().toISOString().split('T')[0];
            }
            updateStats();
            loadCourses();
        }
    }
}

function reviewCourse(id) {
    const course = courseData.find(c => c.id === id);
    if (course) {
        console.log(`查看课程证书: ${course.title}`);
        alert(`「${course.title}」课程证书\n\n🎓 恭喜您成功完成本课程！\n\n完成时间: ${course.completedDate}\n讲师: ${course.instructor}\n课程时长: ${course.duration}\n\n您可以下载电子证书或分享到社交媒体。`);
    }
}

// 导出函数供全局使用
window.enrollCourse = enrollCourse;
window.continueCourse = continueCourse;
window.reviewCourse = reviewCourse;