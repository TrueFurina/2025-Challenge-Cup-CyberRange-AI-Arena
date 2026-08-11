// 训练场景管理 - 核心功能模块

// 全局变量
let scenarios = [
    {
        id: 1,
        name: 'Web应用渗透测试基础',
        type: 'penetration',
        difficulty: 'beginner',
        status: 'active',
        description: '这是一个针对Web应用的基础渗透测试训练场景，包含常见的Web漏洞识别与利用。学员将学习如何发现和利用SQL注入、XSS、CSRF等常见漏洞。',
        objectives: '1. 学习基本的Web漏洞扫描技术\n2. 识别并利用SQL注入漏洞\n3. 发现并利用XSS漏洞\n4. 理解CSRF攻击原理并实施\n5. 编写基础渗透测试报告',
        prerequisites: '基本的HTML、HTTP协议知识，了解SQL语法基础',
        estimatedTime: 120,
        createdAt: '2024-01-15',
        modifiedAt: '2024-01-20 14:30',
        targets: [
            { id: 101, name: 'DVWA靶机', type: 'web' },
            { id: 102, name: '脆弱Web服务器', type: 'web' }
        ],
        icon: 'fa-bug'
    },
    {
        id: 2,
        name: '网络流量分析与取证',
        type: 'forensics',
        difficulty: 'intermediate',
        status: 'active',
        description: '本场景专注于网络流量捕获与分析技术，学员将学习如何使用Wireshark等工具分析网络数据包，从中提取有价值的信息，识别异常流量和潜在的安全威胁。',
        objectives: '1. 掌握Wireshark的基本使用方法\n2. 学习TCP/IP协议分析技术\n3. 从加密流量中提取信息\n4. 识别网络攻击特征\n5. 生成网络流量分析报告',
        prerequisites: '了解TCP/IP协议栈，熟悉基本的网络概念',
        estimatedTime: 180,
        createdAt: '2024-02-10',
        modifiedAt: '2024-02-15 09:45',
        targets: [
            { id: 201, name: '流量捕获服务器', type: 'server' },
            { id: 202, name: '样本PCAP文件集', type: 'file' }
        ],
        icon: 'fa-network-wired'
    },
    {
        id: 3,
        name: '企业网络防御演练',
        type: 'defense',
        difficulty: 'advanced',
        status: 'active',
        description: '模拟企业网络环境下的安全防御场景，学员将扮演蓝队角色，应对各种网络攻击并加固系统安全。包含防火墙配置、入侵检测、日志分析等实战内容。',
        objectives: '1. 配置企业级防火墙规则\n2. 部署和调优IDS/IPS系统\n3. 实施网络分段策略\n4. 建立有效的日志监控系统\n5. 应对模拟的网络攻击并制定应急响应计划',
        prerequisites: '熟悉Linux系统管理，了解网络安全设备配置，具备基本的脚本编写能力',
        estimatedTime: 240,
        createdAt: '2024-03-01',
        modifiedAt: '2024-03-05 16:20',
        targets: [
            { id: 301, name: '企业网络模拟环境', type: 'network' },
            { id: 302, name: '攻击流量生成器', type: 'tool' }
        ],
        icon: 'fa-shield-alt'
    }
];

// 分页和筛选变量
let filteredScenarios = [...scenarios];
let currentPage = 1;
const itemsPerPage = 10;

// 页面初始化
function initializePage() {
    initializeEventListeners();
    renderScenarioTable();
}

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索框事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // 筛选下拉菜单事件
    const filterSelect = document.getElementById('filterSelect');
    if (filterSelect) {
        filterSelect.addEventListener('change', handleFilter);
    }

    // 全选复选框事件
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    // 添加场景按钮事件
    const addScenarioBtn = document.getElementById('addScenarioBtn');
    if (addScenarioBtn) {
        addScenarioBtn.addEventListener('click', () => {
            const modal = document.getElementById('scenarioModeModal');
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }

    // 模式选择事件
    const manualModeOption = document.getElementById('manualModeOption');
    const aiModeOption = document.getElementById('aiModeOption');
    
    if (manualModeOption) {
        manualModeOption.addEventListener('click', () => {
            document.getElementById('scenarioModeModal').style.display = 'none';
            const modal = document.getElementById('addScenarioModal');
            if (modal) {
                modal.style.display = 'block';
                resetCreateScenarioForm();
                showStep(1);
            }
        });
    }

    if (aiModeOption) {
        aiModeOption.addEventListener('click', () => {
            document.getElementById('scenarioModeModal').style.display = 'none';
            const modal = document.getElementById('aiScenarioModal');
            if (modal) {
                modal.style.display = 'block';
                initializeAIChat();
            }
        });
    }

    // 模态框关闭按钮事件
    const closeButtons = document.querySelectorAll('.close, #cancelAddBtn');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // 分步创建场景按钮事件
    const nextStepBtn = document.getElementById('nextStepBtn');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const createScenarioBtn = document.getElementById('createScenarioBtn');

    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', goToNextStep);
    }
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', goToPrevStep);
    }
    if (createScenarioBtn) {
        createScenarioBtn.addEventListener('click', handleCreateScenario);
    }

    // 拓扑设计按钮事件
    const clearTopologyBtn = document.getElementById('clearTopologyBtn');
    const autoLayoutBtn = document.getElementById('autoLayoutBtn');

    if (clearTopologyBtn) {
        clearTopologyBtn.addEventListener('click', clearTopology);
    }
    if (autoLayoutBtn) {
        autoLayoutBtn.addEventListener('click', autoLayoutTopology);
    }

    // 编辑和部署按钮事件（委托事件）
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const scenarioId = parseInt(e.target.dataset.id);
            editScenario(scenarioId);
        } else if (e.target.classList.contains('deploy-btn')) {
            const scenarioId = parseInt(e.target.dataset.id);
            deployScenario(scenarioId);
        }
    });
}

// 搜索处理
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterType = document.getElementById('filterSelect').value;
    
    filteredScenarios = scenarios.filter(scenario => {
        const matchesSearch = scenario.name.toLowerCase().includes(searchTerm) ||
                            scenario.description.toLowerCase().includes(searchTerm);
        const matchesFilter = filterType === '' || scenario.type === filterType;
        return matchesSearch && matchesFilter;
    });
    
    currentPage = 1;
    renderScenarioTable();
}

// 筛选处理
function handleFilter() {
    handleSearch(); // 重用搜索逻辑
}

// 全选处理
function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 渲染场景表格
function renderScenarioTable() {
    const tbody = document.querySelector('#scenarioTable tbody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageScenarios = filteredScenarios.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageScenarios.map(scenario => `
        <tr>
            <td><input type="checkbox" value="${scenario.id}"></td>
            <td>
                <div class="scenario-info-cell">
                    <div class="scenario-icon ${scenario.type}">
                        <i class="fas ${scenario.icon}"></i>
                    </div>
                    <div class="scenario-details">
                        <div class="scenario-name">${scenario.name}</div>
                        <div class="scenario-description">${truncateText(scenario.description, 60)}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="scenario-type-badge ${scenario.type}">${getTypeText(scenario.type)}</span>
            </td>
            <td>
                <span class="difficulty-badge ${scenario.difficulty}">${getDifficultyText(scenario.difficulty)}</span>
            </td>
            <td>
                <span class="status-badge ${scenario.status}">${getStatusText(scenario.status)}</span>
            </td>
            <td>${scenario.createdAt}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="viewScenarioDetails(${scenario.id})">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn btn-sm btn-secondary edit-btn" data-id="${scenario.id}">
                        <i class="fas fa-edit"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-success deploy-btn" data-id="${scenario.id}">
                        <i class="fas fa-play"></i> 部署
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updatePaginationInfo();
}

// 更新分页信息
function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredScenarios.length / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredScenarios.length);
    
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `显示 ${startItem}-${endItem} 条，共 ${filteredScenarios.length} 条记录`;
    }
    
    // 更新分页按钮状态
    const prevBtn = document.querySelector('.pagination .prev');
    const nextBtn = document.querySelector('.pagination .next');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
}

// DOMContentLoaded事件监听器
document.addEventListener('DOMContentLoaded', initializePage);