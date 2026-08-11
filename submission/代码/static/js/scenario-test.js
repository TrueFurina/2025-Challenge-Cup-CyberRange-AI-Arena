// 场景测试页面JavaScript功能

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeScenarioTest();
    loadScenarios();
    bindEvents();
});

// 场景数据
const scenarioData = [
    {
        id: 1,
        title: 'Web应用渗透测试',
        description: '针对Web应用程序进行全面的安全渗透测试，包括SQL注入、XSS、CSRF等常见漏洞的发现与利用。',
        difficulty: 'intermediate',
        type: '渗透测试',
        status: 'completed',
        duration: '2小时',
        points: 150,
        participants: 1247,
        progress: 100,
        score: 92,
        completedTime: '2024-01-15',
        icon: '🌐',
        category: 'web'
    },
    {
        id: 2,
        title: 'APT攻击防御演练',
        description: '模拟高级持续性威胁(APT)攻击场景，学习如何检测、分析和防御复杂的网络攻击。',
        difficulty: 'advanced',
        type: '防御演练',
        status: 'in-progress',
        duration: '4小时',
        points: 300,
        participants: 856,
        progress: 65,
        icon: '🛡️',
        category: 'defense'
    },
    {
        id: 3,
        title: '数字取证分析',
        description: '学习数字取证的基本原理和方法，包括文件恢复、网络流量分析、内存取证等技术。',
        difficulty: 'beginner',
        type: '取证分析',
        status: 'available',
        duration: '3小时',
        points: 200,
        participants: 2134,
        icon: '🔍',
        category: 'forensics'
    },
    {
        id: 4,
        title: '恶意软件静态分析',
        description: '深入学习恶意软件的静态分析技术，包括PE文件结构分析、反汇编、代码混淆识别等。',
        difficulty: 'expert',
        type: '恶意软件分析',
        status: 'locked',
        duration: '5小时',
        points: 400,
        participants: 423,
        unlockRequirement: '完成3个中级场景',
        icon: '🦠',
        category: 'malware'
    },
    {
        id: 5,
        title: 'CTF综合挑战赛',
        description: '综合性CTF竞赛，涵盖Web安全、逆向工程、密码学、取证等多个领域的挑战题目。',
        difficulty: 'advanced',
        type: 'CTF竞赛',
        status: 'competition',
        duration: '6小时',
        points: 500,
        participants: 3421,
        ranking: '未参与',
        deadline: '2024-02-28',
        icon: '🏆',
        category: 'ctf',
        isHot: true
    },
    {
        id: 6,
        title: '企业网络渗透实战',
        description: '模拟真实企业网络环境，进行全面的网络渗透测试，包括内网渗透、权限提升、横向移动等。',
        difficulty: 'expert',
        type: '实战演练',
        status: 'available',
        duration: '8小时',
        points: 600,
        participants: 567,
        icon: '🏢',
        category: 'network'
    }
];

// 初始化页面
function initializeScenarioTest() {
    updateStats();
    setupFilters();
}

// 更新统计信息
function updateStats() {
    const completed = scenarioData.filter(s => s.status === 'completed').length;
    const inProgress = scenarioData.filter(s => s.status === 'in-progress').length;
    const total = scenarioData.filter(s => s.status !== 'locked').length;
    const passRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    document.getElementById('completedCount').textContent = completed;
    document.getElementById('inProgressCount').textContent = inProgress;
    document.getElementById('passRate').textContent = passRate + '%';
}

// 设置筛选器
function setupFilters() {
    const difficultySelect = document.getElementById('difficultyFilter');
    const typeSelect = document.getElementById('typeFilter');
    const statusSelect = document.getElementById('statusFilter');
    
    // 填充类型选项
    const types = [...new Set(scenarioData.map(s => s.type))];
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

// 绑定事件
function bindEvents() {
    // 筛选器事件
    document.getElementById('difficultyFilter').addEventListener('change', filterScenarios);
    document.getElementById('typeFilter').addEventListener('change', filterScenarios);
    document.getElementById('statusFilter').addEventListener('change', filterScenarios);
    
    // 搜索事件
    document.getElementById('searchInput').addEventListener('input', debounce(filterScenarios, 300));
    document.getElementById('searchBtn').addEventListener('click', filterScenarios);
    
    // 回车搜索
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterScenarios();
        }
    });
}

// 加载场景列表
function loadScenarios(scenarios = scenarioData) {
    const grid = document.getElementById('scenariosGrid');
    grid.innerHTML = '';
    
    scenarios.forEach(scenario => {
        const card = createScenarioCard(scenario);
        grid.appendChild(card);
    });
}

// 创建场景卡片
function createScenarioCard(scenario) {
    const card = document.createElement('div');
    card.className = 'scenario-card';
    card.dataset.id = scenario.id;
    
    const difficultyClass = scenario.difficulty;
    const statusInfo = getStatusInfo(scenario);
    const actionButton = getActionButton(scenario);
    
    card.innerHTML = `
        <div class="card-header">
            <span class="scenario-icon">${scenario.icon}</span>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="difficulty-badge ${difficultyClass}">${getDifficultyText(scenario.difficulty)}</span>
                ${scenario.isHot ? '<span class="hot-badge">🔥 热门</span>' : ''}
                ${scenario.status === 'completed' ? '<span class="completed-badge">✅ 已完成</span>' : ''}
                ${scenario.status === 'locked' ? '<span class="locked-badge">🔒</span>' : ''}
            </div>
        </div>
        
        <div class="card-content" onclick="viewScenarioDetail(${scenario.id})" style="cursor: pointer;">
            <h3>${scenario.title}</h3>
            <p>${scenario.description}</p>
            
            <div class="scenario-meta">
                <div class="meta-item">
                    <span class="meta-icon">⏱️</span>
                    <span>预计时长: ${scenario.duration}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">🎯</span>
                    <span>奖励积分: ${scenario.points}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span>参与人数: ${scenario.participants.toLocaleString()}</span>
                </div>
                ${scenario.deadline ? `
                <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span>截止时间: ${scenario.deadline}</span>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="card-footer">
            ${statusInfo}
            ${actionButton}
        </div>
    `;
    
    return card;
}

// 获取状态信息
function getStatusInfo(scenario) {
    switch (scenario.status) {
        case 'completed':
            return `
                <div class="completion-info">
                    <div class="completion-score">得分: ${scenario.score}分</div>
                    <div class="completion-time">完成时间: ${scenario.completedTime}</div>
                </div>
            `;
        case 'in-progress':
            return `
                <div class="progress-info">
                    <span class="progress-label">进度:</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${scenario.progress}%"></div>
                    </div>
                    <span class="progress-text">${scenario.progress}%</span>
                </div>
            `;
        case 'locked':
            return `
                <div class="lock-info">
                    <div class="lock-text">解锁条件: ${scenario.unlockRequirement}</div>
                </div>
            `;
        case 'competition':
            return `
                <div class="competition-info">
                    <div class="participants">参赛人数: ${scenario.participants.toLocaleString()}</div>
                    <div class="ranking">当前排名: ${scenario.ranking}</div>
                </div>
            `;
        default:
            return '<div style="flex: 1;"></div>';
    }
}

// 获取操作按钮
function getActionButton(scenario) {
    switch (scenario.status) {
        case 'available':
            return `<button class="start-btn" onclick="event.stopPropagation(); startScenario(${scenario.id})">开始挑战</button>`;
        case 'in-progress':
            return `<button class="continue-btn" onclick="event.stopPropagation(); continueScenario(${scenario.id})">继续挑战</button>`;
        case 'completed':
            return `<button class="review-btn" onclick="event.stopPropagation(); viewScenarioDetail(${scenario.id})">查看详情</button>`;
        case 'competition':
            return `<button class="join-btn" onclick="event.stopPropagation(); joinCompetition(${scenario.id})">参加竞赛</button>`;
        case 'locked':
            return `<button class="locked-btn" disabled>🔒 未解锁</button>`;
        default:
            return '';
    }
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

// 筛选场景
function filterScenarios() {
    const difficulty = document.getElementById('difficultyFilter').value;
    const type = document.getElementById('typeFilter').value;
    const status = document.getElementById('statusFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = scenarioData.filter(scenario => {
        const matchesDifficulty = !difficulty || scenario.difficulty === difficulty;
        const matchesType = !type || scenario.type === type;
        const matchesStatus = !status || scenario.status === status;
        const matchesSearch = !search || 
            scenario.title.toLowerCase().includes(search) ||
            scenario.description.toLowerCase().includes(search) ||
            scenario.type.toLowerCase().includes(search);
        
        return matchesDifficulty && matchesType && matchesStatus && matchesSearch;
    });
    
    loadScenarios(filtered);
    
    // 显示筛选结果数量
    const resultCount = filtered.length;
    const totalCount = scenarioData.length;
    console.log(`显示 ${resultCount} / ${totalCount} 个场景`);
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

// 场景操作函数
function startScenario(id) {
    const scenario = scenarioData.find(s => s.id === id);
    if (scenario) {
        console.log(`开始场景: ${scenario.title}`);
        
        if (confirm(`即将开始「${scenario.title}」挑战！\n\n预计时长: ${scenario.duration}\n奖励积分: ${scenario.points}\n\n准备好了吗？`)) {
            // 更新场景状态
            scenario.status = 'in-progress';
            scenario.progress = 0;
            updateStats();
            loadScenarios();
            
            // 跳转到场景详情页面
            viewScenarioDetail(id);
        }
    }
}

function continueScenario(id) {
    const scenario = scenarioData.find(s => s.id === id);
    if (scenario) {
        console.log(`继续场景: ${scenario.title}`);
        
        if (confirm(`继续「${scenario.title}」挑战！\n\n当前进度: ${scenario.progress}%\n\n加油完成剩余部分！`)) {
            // 跳转到场景详情页面
            viewScenarioDetail(id);
        }
    }
}

function reviewScenario(id) {
    const scenario = scenarioData.find(s => s.id === id);
    if (scenario) {
        console.log(`查看场景详情: ${scenario.title}`);
        viewScenarioDetail(id);
    }
}

// 查看场景详情
function viewScenarioDetail(id) {
    const scenario = scenarioData.find(s => s.id === id);
    if (scenario) {
        console.log(`查看场景详情: ${scenario.title}`);
        
        // 检查是否在学员端框架中
        if (window.parent && window.parent !== window) {
            // 在iframe中，通知父页面加载场景详情页面
            window.parent.postMessage({ 
                action: 'loadPage', 
                page: 'scenario-detail.html',
                params: { id: id }
            }, '*');
        } else {
            // 直接跳转
            window.location.href = `scenario-detail.html?id=${id}`;
        }
    }
}

function joinCompetition(id) {
    const scenario = scenarioData.find(s => s.id === id);
    if (scenario) {
        console.log(`参加竞赛: ${scenario.title}`);
        alert(`参加「${scenario.title}」竞赛！\n\n竞赛时长: ${scenario.duration}\n截止时间: ${scenario.deadline}\n当前参赛人数: ${scenario.participants.toLocaleString()}\n\n确认参加吗？`);
    }
}

// 导出函数供全局使用
window.startScenario = startScenario;
window.continueScenario = continueScenario;
window.reviewScenario = reviewScenario;
window.joinCompetition = joinCompetition;
window.viewScenarioDetail = viewScenarioDetail;