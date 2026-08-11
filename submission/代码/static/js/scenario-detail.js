// 场景详情页面JavaScript

// 返回场景列表
function goBack() {
    // 检查是否在学员端框架中
    if (window.parent && window.parent !== window) {
        // 在iframe中，通知父页面加载场景测试页面
        window.parent.postMessage({ 
            action: 'loadPage', 
            page: 'scenario-test.html'
        }, '*');
    } else {
        // 直接跳转
        window.location.href = 'scenario-test.html';
    }
}

// 全局变量
let currentStep = 1;
let attackSteps = [
    {
        id: 1,
        title: "信息收集",
        description: "收集目标系统的基本信息和网络架构",
        command: "nmap -sS -O 192.168.1.100",
        status: "pending"
    },
    {
        id: 2,
        title: "漏洞扫描",
        description: "使用自动化工具扫描已知漏洞",
        command: "nikto -h http://192.168.1.100",
        status: "pending"
    },
    {
        id: 3,
        title: "SQL注入测试",
        description: "测试登录页面的SQL注入漏洞",
        command: "sqlmap -u 'http://192.168.1.100/login.php' --data='username=admin&password=123' --dbs",
        status: "pending"
    }
];

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    bindEvents();
    loadScenarioData();
    loadScenarioFromURL();
    initTopologyInteraction();
    
    // 初始化测试开始时间
    if (!sessionStorage.getItem('testStartTime')) {
        sessionStorage.setItem('testStartTime', Date.now().toString());
    }
});

// 网络拓扑节点交互功能
function initTopologyInteraction() {
    // 选择所有设备元素
    const devices = document.querySelectorAll('.device');
    
    devices.forEach(device => {
        // 从设备的类名中提取设备类型
        const deviceClasses = Array.from(device.classList);
        const deviceType = deviceClasses.find(cls => 
            ['attacker', 'firewall', 'web-server', 'db-server', 'file-server'].includes(cls)
        );
        
        device.addEventListener('click', function() {
            showNodeDetails(deviceType, this);
        });
        
        // 添加鼠标悬停效果
        device.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
        
        device.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// 显示节点详细信息
function showNodeDetails(deviceType, deviceElement) {
    // 从设备元素中提取信息
    const deviceLabel = deviceElement.querySelector('.device-label').textContent;
    const deviceIP = deviceElement.querySelector('.device-ip').textContent;
    const devicePorts = deviceElement.querySelector('.device-ports')?.textContent || '';
    
    const nodeInfo = {
        'attacker': {
            name: '攻击者',
            description: '模拟的外部攻击者，位于Internet上',
            details: [
                '来源：外部网络',
                '攻击类型：Web应用渗透测试',
                '目标：获取系统权限和敏感数据',
                '工具：Burp Suite, Nmap, SQLMap等'
            ]
        },
        'firewall': {
            name: '防火墙',
            description: '网络边界防护设备，控制网络流量',
            details: [
                `IP地址：${deviceIP}`,
                `开放端口：${devicePorts || '22, 80, 443'}`,
                '功能：流量过滤、访问控制',
                '状态：在线运行'
            ]
        },
        'web-server': {
            name: 'Web服务器',
            description: '运行Web应用的服务器，是主要攻击目标',
            details: [
                `IP地址：${deviceIP}`,
                `端口：${devicePorts || '80, 443'}`,
                '服务：Apache 2.4.49 + PHP 7.4.3',
                '应用：自定义CMS系统 v2.5',
                '漏洞：存在SQL注入和XSS漏洞'
            ]
        },
        'db-server': {
            name: '数据库服务器',
            description: '存储应用数据的MySQL数据库服务器',
            details: [
                `IP地址：${deviceIP}`,
                `端口：${devicePorts || '3306'}`,
                '服务：MySQL 5.7.33',
                '数据：用户信息、业务数据'
            ]
        },
        'file-server': {
            name: '文件服务器',
            description: '内网文件共享服务器',
            details: [
                `IP地址：${deviceIP}`,
                `端口：${devicePorts || '445, 139'}`,
                '服务：SMB文件共享',
                '内容：共享文件、备份数据'
            ]
        }
    };
    
    const info = nodeInfo[nodeType];
    if (info) {
        const detailsHtml = info.details.map(detail => `<li>${detail}</li>`).join('');
        
        const modal = document.createElement('div');
        modal.className = 'node-details-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${info.name}</h3>
                    <button class="close-btn" onclick="closeNodeDetails()">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="node-description">${info.description}</p>
                    <h4>详细信息：</h4>
                    <ul class="node-details-list">
                        ${detailsHtml}
                    </ul>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加点击外部关闭功能
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeNodeDetails();
            }
        });
    }
}

// 关闭节点详情弹窗
function closeNodeDetails() {
    const modal = document.querySelector('.node-details-modal');
    if (modal) {
        modal.remove();
    }
}

// 从URL参数加载场景信息
function loadScenarioFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioId = urlParams.get('id');
    
    if (scenarioId) {
        loadScenarioDetail(parseInt(scenarioId));
    } else {
        // 默认加载第一个场景
        loadScenarioDetail(1);
    }
}

// 加载场景详情数据
function loadScenarioDetail(scenarioId) {
    // 模拟场景数据（实际应用中应从服务器获取）
    const scenarioData = {
        1: {
            title: 'Web应用渗透测试',
            description: '针对Web应用程序的全面安全测试，包括SQL注入、XSS、CSRF等常见漏洞的检测与利用。',
            difficulty: 'intermediate',
            duration: '2-3小时',
            points: 150,
            participants: 1234,
            status: 'available',
            topology: {
                nodes: ['Web服务器', '数据库服务器', '防火墙', '负载均衡器'],
                connections: ['Web服务器 -> 数据库服务器', 'Internet -> 防火墙 -> 负载均衡器 -> Web服务器']
            },
            objectives: [
                '识别Web应用中的SQL注入漏洞',
                '利用XSS漏洞获取用户凭据',
                '绕过身份验证机制',
                '提取敏感数据'
            ],
            tools: ['Burp Suite', 'SQLMap', 'OWASP ZAP', 'Nmap'],
            materials: [
                { title: 'Web安全基础教程', type: 'pdf', url: '#' },
                { title: 'SQL注入攻击演示', type: 'video', url: '#' },
                { title: 'XSS防护最佳实践', type: 'article', url: '#' }
            ]
        },
        2: {
            title: 'APT攻击防御演练',
            description: '模拟高级持续性威胁(APT)攻击场景，学习检测和防御复杂的多阶段攻击。',
            difficulty: 'advanced',
            duration: '4-5小时',
            points: 300,
            participants: 567,
            status: 'available',
            topology: {
                nodes: ['域控制器', '工作站', '邮件服务器', '文件服务器', 'IDS/IPS'],
                connections: ['Internet -> 邮件服务器', '工作站 -> 域控制器', 'IDS/IPS监控所有流量']
            },
            objectives: [
                '检测钓鱼邮件攻击',
                '识别横向移动行为',
                '发现数据渗透活动',
                '实施有效防御措施'
            ],
            tools: ['Wireshark', 'Splunk', 'Volatility', 'YARA'],
            materials: [
                { title: 'APT攻击分析报告', type: 'pdf', url: '#' },
                { title: '威胁狩猎技术', type: 'video', url: '#' },
                { title: '事件响应流程', type: 'article', url: '#' }
            ]
        }
        // 可以添加更多场景数据
    };
    
    const scenario = scenarioData[scenarioId] || scenarioData[1];
    updateScenarioDisplay(scenario);
}

// 更新场景显示信息
function updateScenarioDisplay(scenario) {
    // 更新标题和基本信息
    const titleElement = document.querySelector('.scenario-title');
    const descElement = document.querySelector('.scenario-description');
    const difficultyElement = document.querySelector('.difficulty-badge');
    const durationElement = document.querySelector('.duration-info');
    const pointsElement = document.querySelector('.points-info');
    const participantsElement = document.querySelector('.participants-info');
    
    if (titleElement) titleElement.textContent = scenario.title;
    if (descElement) descElement.textContent = scenario.description;
    if (difficultyElement) {
        difficultyElement.className = `difficulty-badge ${scenario.difficulty}`;
        difficultyElement.textContent = getDifficultyText(scenario.difficulty);
    }
    if (durationElement) durationElement.textContent = `预计时长: ${scenario.duration}`;
    if (pointsElement) pointsElement.textContent = `奖励积分: ${scenario.points}`;
    if (participantsElement) participantsElement.textContent = `参与人数: ${scenario.participants.toLocaleString()}`;
    
    // 更新网络拓扑
    updateTopologyDisplay(scenario.topology);
    
    // 更新学习目标
    updateObjectivesDisplay(scenario.objectives);
    
    // 更新推荐工具
    updateToolsDisplay(scenario.tools);
    
    // 更新学习资料
    updateMaterialsDisplay(scenario.materials);
}

// 获取难度文本
function getDifficultyText(difficulty) {
    const difficultyMap = {
        'beginner': '初级',
        'intermediate': '中级',
        'advanced': '高级',
        'expert': '专家'
    };
    return difficultyMap[difficulty] || '未知';
}

// 更新网络拓扑显示
function updateTopologyDisplay(topology) {
    const topologyContainer = document.querySelector('.topology-diagram');
    if (topologyContainer && topology) {
        let html = '<div class="topology-nodes">';
        topology.nodes.forEach(node => {
            html += `<div class="topology-node">${node}</div>`;
        });
        html += '</div><div class="topology-connections">';
        topology.connections.forEach(connection => {
            html += `<div class="connection-line">${connection}</div>`;
        });
        html += '</div>';
        topologyContainer.innerHTML = html;
    }
}

// 更新学习目标显示
function updateObjectivesDisplay(objectives) {
    const objectivesContainer = document.querySelector('.objectives-list');
    if (objectivesContainer && objectives) {
        const html = objectives.map(obj => `<li>${obj}</li>`).join('');
        objectivesContainer.innerHTML = html;
    }
}

// 更新推荐工具显示
function updateToolsDisplay(tools) {
    const toolsContainer = document.querySelector('.tools-list');
    if (toolsContainer && tools) {
        const html = tools.map(tool => `<span class="tool-tag">${tool}</span>`).join('');
        toolsContainer.innerHTML = html;
    }
}

// 更新学习资料显示
function updateMaterialsDisplay(materials) {
    const materialsContainer = document.querySelector('.materials-list');
    if (materialsContainer && materials) {
        const html = materials.map(material => `
            <div class="material-item">
                <span class="material-icon">${getMaterialIcon(material.type)}</span>
                <span class="material-title">${material.title}</span>
                <a href="${material.url}" class="material-link">查看</a>
            </div>
        `).join('');
        materialsContainer.innerHTML = html;
    }
}

// 获取资料类型图标
function getMaterialIcon(type) {
    const iconMap = {
        'pdf': '📄',
        'video': '🎥',
        'article': '📖',
        'link': '🔗'
    };
    return iconMap[type] || '📄';
}

// 开始场景测试
function startScenario() {
    if (confirm('确定要开始场景测试吗？\n\n测试将在新的环境中启动，请确保您已经准备好相关工具。')) {
        // 这里可以跳转到实际的测试环境
        alert('正在启动测试环境...\n\n请稍候，系统正在为您准备虚拟实验环境。');
        
        // 模拟启动过程
        setTimeout(() => {
            alert('测试环境已准备就绪！\n\n您可以开始进行渗透测试了。');
        }, 2000);
    }
}

// 进入练习模式
function enterPracticeMode() {
    if (confirm('确定要进入练习模式吗？\n\n练习模式提供引导式学习，适合初学者。')) {
        // 切换到AI辅助测试标签页
        const aiTab = document.querySelector('[data-tab="ai-assistant"]');
        if (aiTab) {
            aiTab.click();
        }
        
        alert('已切换到AI辅助测试模式！\n\n您可以使用白盒测试或黑盒测试功能进行练习。');
    }
}

// 导出函数供全局使用
window.goBack = goBack;
window.startScenario = startScenario;
window.enterPracticeMode = enterPracticeMode;

// 初始化页面
function initializePage() {
    // 设置默认标签页
    showTab('overview');
    
    // 初始化攻击步骤
    renderAttackSteps();
    
    // 模拟AI分析延迟
    setTimeout(() => {
        showAnalysisResults();
    }, 3000);
}

// 绑定事件
function bindEvents() {
    console.log('开始绑定事件监听器');
    
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    console.log('找到标签页按钮数量:', tabBtns.length);
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // 测试模式选择
    const modeCards = document.querySelectorAll('.mode-card');
    console.log('找到模式卡片数量:', modeCards.length);
    modeCards.forEach((card, index) => {
        const selectBtn = card.querySelector('.select-mode-btn');
        const mode = card.getAttribute('data-mode');
        console.log(`模式卡片 ${index + 1}: mode=${mode}, 按钮:`, selectBtn);
        
        if (selectBtn) {
            selectBtn.addEventListener('click', function() {
                console.log('点击了模式选择按钮, mode:', mode);
                selectTestMode(mode);
            });
        } else {
            console.error(`模式卡片 ${index + 1} 未找到选择按钮`);
        }
    });
    
    console.log('事件监听器绑定完成');
}

// 加载场景数据
function loadScenarioData() {
    // 从URL参数获取场景ID（实际项目中会从后端获取）
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioId = urlParams.get('id') || '1';
    
    // 模拟场景数据
    const scenarioData = {
        '1': {
            title: 'Web应用渗透测试',
            description: '针对Web应用程序进行全面的安全渗透测试，包括SQL注入、XSS、CSRF等常见漏洞的发现与利用。',
            difficulty: 'intermediate',
            type: '渗透测试',
            status: 'available',
            duration: '2小时',
            points: '150分',
            participants: '1,247人',
            passRate: '78%'
        }
    };
    
    const scenario = scenarioData[scenarioId];
    if (scenario) {
        document.getElementById('scenarioTitle').textContent = scenario.title;
        document.getElementById('scenarioDescription').textContent = scenario.description;
    }
}

// 显示标签页
function showTab(tabName) {
    // 隐藏所有标签页内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有标签按钮的激活状态
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签页
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活对应的标签按钮
    const targetBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

// 选择测试模式
function selectTestMode(mode) {
    console.log('选择测试模式:', mode);
    
    // 隐藏模式选择
    const modeSelection = document.querySelector('.test-mode-selection');
    console.log('模式选择界面元素:', modeSelection);
    if (modeSelection) {
        modeSelection.style.display = 'none';
        console.log('已隐藏模式选择界面');
    } else {
        console.error('未找到模式选择界面元素');
    }
    
    // 显示对应的测试界面
    const interfaceId = mode + '-interface';
    console.log('查找测试界面ID:', interfaceId);
    const testInterface = document.getElementById(interfaceId);
    console.log('测试界面元素:', testInterface);
    if (testInterface) {
        testInterface.classList.remove('hidden');
        console.log('已显示测试界面:', interfaceId);
    } else {
        console.error('未找到测试界面元素:', interfaceId);
    }
    
    if (mode === 'whitebox') {
        // 重置白盒测试步骤
        currentStep = 1;
        updateStepNavigation();
        showStep(1);
        console.log('已重置白盒测试步骤');
    } else if (mode === 'blackbox') {
        // 重置黑盒测试界面
        resetBlackboxInterface();
        console.log('已重置黑盒测试界面');
    }
}

// 返回模式选择
function backToModeSelection() {
    // 隐藏测试界面
    const testInterfaces = document.querySelectorAll('.test-interface');
    testInterfaces.forEach(interface => {
        interface.classList.add('hidden');
    });
    
    // 显示模式选择
    document.querySelector('.test-mode-selection').style.display = 'block';
}

// 更新步骤导航
function updateStepNavigation() {
    const stepItems = document.querySelectorAll('.step-item');
    const stepLines = document.querySelectorAll('.step-line');
    
    stepItems.forEach((item, index) => {
        const stepNumber = index + 1;
        
        // 移除所有状态类
        item.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            // 已完成的步骤
            item.classList.add('completed');
        } else if (stepNumber === currentStep) {
            // 当前活动步骤
            item.classList.add('active');
        }
        // 未来的步骤保持默认状态
    });
    
    // 更新连接线状态
    stepLines.forEach((line, index) => {
        line.classList.remove('completed');
        if (index + 1 < currentStep) {
            line.classList.add('completed');
        }
    });
}

// 显示步骤
function showStep(stepNumber) {
    // 隐藏所有步骤面板
    const stepPanels = document.querySelectorAll('.step-panel');
    stepPanels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 显示当前步骤
    const currentPanel = document.getElementById(`step-${stepNumber}`);
    if (currentPanel) {
        currentPanel.classList.add('active');
    }
    
    currentStep = stepNumber;
    updateStepNavigation();
}

// 下一步
function nextStep() {
    console.log('nextStep called, currentStep:', currentStep);
    
    if (currentStep < 5) {
        if (currentStep === 1) {
            // 验证表单输入
            console.log('验证步骤1输入...');
            if (!validateStepOneInputs()) {
                console.log('步骤1验证失败');
                return;
            }
            console.log('步骤1验证成功');
            // 切换到步骤2并开始AI分析
            console.log('切换到步骤:', currentStep + 1);
            showStep(currentStep + 1);
            startAIAnalysis();
        } else if (currentStep === 2) {
            // 切换到步骤3并开始自动化测试
            console.log('切换到步骤:', currentStep + 1);
            showStep(currentStep + 1);
            startAutomatedTest();
        } else if (currentStep === 3) {
            // 切换到步骤4并渲染攻击步骤
            console.log('切换到步骤:', currentStep + 1);
            showStep(currentStep + 1);
            renderAttackSteps();
        } else if (currentStep === 4) {
            // 切换到步骤5并生成智能报告
            console.log('切换到步骤:', currentStep + 1);
            showStep(currentStep + 1);
            generateIntelligentReport();
        }
    } else {
        console.log('已经是最后一步');
    }
}

// 上一步
function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// 验证第一步输入
function validateStepOneInputs() {
    const topology = document.getElementById('topology-input').value.trim();
    const vulnType = document.getElementById('vuln-type').value;
    const cveId = document.getElementById('cve-id').value.trim();
    const systemConfig = document.getElementById('system-config').value.trim();
    const attackGoal = document.getElementById('attack-goal').value.trim();
    
    // 调试信息
    console.log('验证输入:', {
        topology: topology,
        vulnType: vulnType,
        cveId: cveId,
        systemConfig: systemConfig,
        attackGoal: attackGoal
    });
    
    if (!topology) {
        alert('请填写网络拓扑结构信息');
        return false;
    }
    if (!vulnType) {
        alert('请选择漏洞类型');
        return false;
    }
    if (!cveId) {
        alert('请填写CVE编号');
        return false;
    }
    if (!systemConfig) {
        alert('请填写系统配置信息');
        return false;
    }
    if (!attackGoal) {
        alert('请填写攻击目标');
        return false;
    }
    
    return true;
}

// 开始AI分析
function startAIAnalysis() {
    const statusIndicator = document.querySelector('.status-indicator');
    const analysisResults = document.querySelector('.analysis-results');
    const nextBtn = document.querySelector('#step-2 .next-step-btn');
    
    // 显示处理状态
    statusIndicator.classList.add('processing');
    analysisResults.classList.add('hidden');
    nextBtn.disabled = true;
    
    // 获取用户输入的信息
    const inputData = getStepOneInputs();
    
    // 模拟AI分析过程，分阶段显示进度
    const analysisSteps = [
        { step: '正在分析目标系统架构...', duration: 800 },
        { step: '正在识别潜在攻击向量...', duration: 1000 },
        { step: '正在评估漏洞利用可行性...', duration: 900 },
        { step: '正在生成攻击路径...', duration: 700 },
        { step: '正在计算风险评分...', duration: 600 }
    ];
    
    let currentStepIndex = 0;
    
    function processNextStep() {
        if (currentStepIndex < analysisSteps.length) {
            const currentAnalysisStep = analysisSteps[currentStepIndex];
            statusIndicator.innerHTML = `<div class="status-indicator processing"><span>${currentAnalysisStep.step}</span></div>`;
            
            setTimeout(() => {
                currentStepIndex++;
                processNextStep();
            }, currentAnalysisStep.duration);
        } else {
            // 分析完成，生成结果
            completeAIAnalysis(inputData);
        }
    }
    
    processNextStep();
}

// 获取第一步的输入数据
function getStepOneInputs() {
    return {
        topology: document.getElementById('topology-input').value.trim(),
        vulnType: document.getElementById('vuln-type').value,
        cveId: document.getElementById('cve-id').value.trim(),
        systemConfig: document.getElementById('system-config').value.trim(),
        attackGoal: document.getElementById('attack-goal').value.trim()
    };
}

// 完成AI分析并显示结果
function completeAIAnalysis(inputData) {
    const statusIndicator = document.querySelector('.status-indicator');
    const analysisResults = document.querySelector('.analysis-results');
    const nextBtn = document.querySelector('#step-2 .next-step-btn');
    
    statusIndicator.classList.remove('processing');
    statusIndicator.innerHTML = '<div class="status-indicator completed"><span>✓ AI分析完成</span></div>';
    
    // 根据输入生成智能分析结果
    generateIntelligentAnalysis(inputData);
    
    analysisResults.classList.remove('hidden');
    nextBtn.disabled = false;
    
    // AI分析完成，启用下一步按钮
    console.log('AI分析完成，可以进入下一步');
}

// 生成智能分析结果
function generateIntelligentAnalysis(inputData) {
    const attackPathElement = document.querySelector('.attack-path');
    const riskAssessmentElement = document.querySelector('.risk-assessment');
    
    // 根据漏洞类型生成不同的攻击路径
    const attackPaths = generateAttackPaths(inputData.vulnType, inputData.cveId);
    const riskScore = calculateRiskScore(inputData);
    
    if (attackPathElement) {
        attackPathElement.innerHTML = `
            <h4>推荐攻击路径</h4>
            <div class="attack-steps-preview">
                ${attackPaths.map((path, index) => `
                    <div class="attack-step-preview">
                        <span class="step-number">${index + 1}</span>
                        <span class="step-title">${path.title}</span>
                        <span class="step-confidence">置信度: ${path.confidence}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (riskAssessmentElement) {
        riskAssessmentElement.innerHTML = `
            <h4>风险评估</h4>
            <div class="risk-metrics">
                <div class="risk-item">
                    <span class="risk-label">总体风险评分:</span>
                    <span class="risk-score ${getRiskLevel(riskScore)}">${riskScore}/10</span>
                </div>
                <div class="risk-item">
                    <span class="risk-label">攻击复杂度:</span>
                    <span class="risk-value">${getComplexityLevel(inputData.vulnType)}</span>
                </div>
                <div class="risk-item">
                    <span class="risk-label">检测难度:</span>
                    <span class="risk-value">${getDetectionDifficulty(inputData.vulnType)}</span>
                </div>
                <div class="risk-item">
                    <span class="risk-label">潜在影响:</span>
                    <span class="risk-value">${getImpactLevel(riskScore)}</span>
                </div>
            </div>
        `;
    }
}

// 根据漏洞类型生成攻击路径
function generateAttackPaths(vulnType, cveId) {
    const pathTemplates = {
        'sql-injection': [
            { title: '信息收集与目标识别', confidence: 95 },
            { title: 'SQL注入点发现', confidence: 88 },
            { title: '数据库指纹识别', confidence: 92 },
            { title: '权限提升与数据提取', confidence: 75 }
        ],
        'xss': [
            { title: '输入点枚举', confidence: 90 },
            { title: 'XSS载荷构造', confidence: 85 },
            { title: '过滤器绕过', confidence: 70 },
            { title: '会话劫持执行', confidence: 80 }
        ],
        'rce': [
            { title: '远程服务识别', confidence: 93 },
            { title: '漏洞利用载荷准备', confidence: 87 },
            { title: '代码执行验证', confidence: 82 },
            { title: '权限维持与横向移动', confidence: 65 }
        ],
        'file-upload': [
            { title: '上传功能识别', confidence: 95 },
            { title: '文件类型限制绕过', confidence: 78 },
            { title: 'Webshell上传', confidence: 85 },
            { title: '远程控制建立', confidence: 90 }
        ]
    };
    
    return pathTemplates[vulnType] || pathTemplates['sql-injection'];
}

// 计算风险评分
function calculateRiskScore(inputData) {
    let baseScore = 5;
    
    // 根据漏洞类型调整评分
    const vulnScores = {
        'sql-injection': 8,
        'xss': 6,
        'rce': 9,
        'file-upload': 7,
        'csrf': 5,
        'idor': 6
    };
    
    baseScore = vulnScores[inputData.vulnType] || 5;
    
    // 根据CVE评分调整
    if (inputData.cveId && inputData.cveId.includes('CVE-')) {
        baseScore += 1; // 已知CVE增加风险
    }
    
    // 根据系统配置调整
    if (inputData.systemConfig.toLowerCase().includes('windows')) {
        baseScore += 0.5;
    }
    if (inputData.systemConfig.toLowerCase().includes('linux')) {
        baseScore += 0.3;
    }
    
    return Math.min(Math.round(baseScore * 10) / 10, 10);
}

// 获取风险等级
function getRiskLevel(score) {
    if (score >= 8) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
}

// 获取复杂度等级
function getComplexityLevel(vulnType) {
    const complexity = {
        'sql-injection': '中等',
        'xss': '简单',
        'rce': '高',
        'file-upload': '中等',
        'csrf': '简单',
        'idor': '简单'
    };
    return complexity[vulnType] || '中等';
}

// 获取检测难度
function getDetectionDifficulty(vulnType) {
    const difficulty = {
        'sql-injection': '中等',
        'xss': '困难',
        'rce': '简单',
        'file-upload': '简单',
        'csrf': '困难',
        'idor': '中等'
    };
    return difficulty[vulnType] || '中等';
}

// 获取影响等级
function getImpactLevel(score) {
    if (score >= 8) return '严重';
    if (score >= 6) return '高';
    if (score >= 4) return '中等';
    return '低';
}

// 显示分析结果
function showAnalysisResults() {
    const analysisResults = document.querySelector('.analysis-results');
    if (analysisResults) {
        analysisResults.classList.remove('hidden');
    }
}

// 开始自动化测试
function startAutomatedTest() {
    const executionStatus = document.querySelector('.execution-status .status-value');
    const logContent = document.querySelector('.log-content');
    const nextBtn = document.querySelector('#step-3 .next-step-btn');
    
    // 重置状态
    executionStatus.textContent = '执行中';
    executionStatus.className = 'status-value running';
    logContent.innerHTML = '';
    nextBtn.disabled = true;
    
    // 获取用户输入的测试参数
    const inputData = getStepOneInputs();
    
    // 根据漏洞类型生成相应的测试日志
    const testLogs = generateTestLogs(inputData.vulnType);
    
    // 添加进度条
    addProgressBar();
    
    let logIndex = 0;
    let currentProgress = 0;
    const totalSteps = testLogs.length;
    
    const logInterval = setInterval(() => {
        if (logIndex < testLogs.length) {
            const log = testLogs[logIndex];
            const logLine = document.createElement('div');
            logLine.className = `log-line ${log.type}`;
            logLine.innerHTML = `
                <span class="log-timestamp">[${getCurrentTimestamp()}]</span>
                <span class="log-level">[${log.type.toUpperCase()}]</span>
                <span class="log-message">${log.message}</span>
            `;
            logContent.appendChild(logLine);
            logContent.scrollTop = logContent.scrollHeight;
            
            // 更新进度
            currentProgress = Math.round(((logIndex + 1) / totalSteps) * 100);
            updateProgressBar(currentProgress);
            
            // 如果是关键步骤，添加延迟
            if (log.critical) {
                setTimeout(() => {
                    logIndex++;
                }, log.delay || 1000);
                return;
            }
            logIndex++;
        } else {
            clearInterval(logInterval);
            
            // 随机决定测试结果（70%成功，30%失败）
            const testSuccess = Math.random() > 0.3;
            
            if (testSuccess) {
                // 测试成功
                executionStatus.textContent = '执行成功';
                executionStatus.className = 'status-value success';
                updateProgressBar(100, 'success');
                
                // 添加成功日志
                const successLog = document.createElement('div');
                successLog.className = 'log-line success';
                successLog.innerHTML = `
                    <span class="log-timestamp">[${getCurrentTimestamp()}]</span>
                    <span class="log-level">[SUCCESS]</span>
                    <span class="log-message">✓ 白盒测试执行完成，发现安全漏洞并生成详细报告</span>
                `;
                logContent.appendChild(successLog);
                logContent.scrollTop = logContent.scrollHeight;
                
                // 延迟2秒后自动进入下一步
                setTimeout(() => {
                    nextBtn.disabled = false;
                    // 自动点击下一步按钮
                    setTimeout(() => {
                        nextStep();
                    }, 1000);
                }, 2000);
            } else {
                // 测试失败
                executionStatus.textContent = '执行失败';
                executionStatus.className = 'status-value failed';
                updateProgressBar(100, 'failed');
                
                // 显示失败分析
                showFailureAnalysis(inputData);
                
                nextBtn.disabled = false;
            }
        }
    }, 800);
}

// 生成测试日志
function generateTestLogs(vulnType) {
    const logTemplates = {
        'sql-injection': [
            { type: 'info', message: '开始执行SQL注入测试...', critical: false },
            { type: 'info', message: '目标: http://192.168.1.100/login.php', critical: false },
            { type: 'info', message: '正在进行参数枚举...', critical: true, delay: 1200 },
            { type: 'success', message: '发现可注入参数: username, password', critical: false },
            { type: 'info', message: '正在测试SQL注入载荷...', critical: true, delay: 1500 },
            { type: 'warning', message: '检测到WAF防护机制', critical: false },
            { type: 'info', message: '尝试基础注入: \' OR 1=1--', critical: false },
            { type: 'error', message: '注入失败，返回403 Forbidden', critical: false },
            { type: 'info', message: '尝试编码绕过...', critical: true, delay: 1000 },
            { type: 'error', message: '编码绕过失败', critical: false },
            { type: 'error', message: '攻击路径执行失败，需要策略调整', critical: false }
        ],
        'xss': [
            { type: 'info', message: '开始执行XSS测试...', critical: false },
            { type: 'info', message: '目标: http://192.168.1.100/search.php', critical: false },
            { type: 'info', message: '正在枚举输入点...', critical: true, delay: 1000 },
            { type: 'success', message: '发现输入点: search, comment', critical: false },
            { type: 'info', message: '测试反射型XSS...', critical: true, delay: 1200 },
            { type: 'info', message: '载荷: <script>alert(1)</script>', critical: false },
            { type: 'warning', message: '检测到输入过滤', critical: false },
            { type: 'info', message: '尝试绕过过滤器...', critical: true, delay: 1500 },
            { type: 'error', message: '过滤器绕过失败', critical: false },
            { type: 'error', message: 'XSS攻击未成功，需要调整策略', critical: false }
        ],
        'rce': [
            { type: 'info', message: '开始执行远程代码执行测试...', critical: false },
            { type: 'info', message: '目标: http://192.168.1.100/upload.php', critical: false },
            { type: 'info', message: '正在分析上传功能...', critical: true, delay: 1300 },
            { type: 'success', message: '发现文件上传接口', critical: false },
            { type: 'info', message: '测试恶意文件上传...', critical: true, delay: 1400 },
            { type: 'warning', message: '检测到文件类型限制', critical: false },
            { type: 'info', message: '尝试双扩展名绕过...', critical: true, delay: 1100 },
            { type: 'error', message: '文件上传被阻止', critical: false },
            { type: 'error', message: '代码执行攻击失败', critical: false }
        ]
    };
    
    return logTemplates[vulnType] || logTemplates['sql-injection'];
}

// 添加进度条
function addProgressBar() {
    const logContainer = document.querySelector('.log-content').parentElement;
    const existingProgress = logContainer.querySelector('.test-progress');
    
    if (existingProgress) {
        existingProgress.remove();
    }
    
    const progressHTML = `
        <div class="test-progress">
            <div class="progress-label">测试进度</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="progress-text">0%</div>
        </div>
    `;
    
    logContainer.insertAdjacentHTML('afterbegin', progressHTML);
}

// 更新进度条
function updateProgressBar(progress, status = 'running') {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const progressBar = document.querySelector('.progress-bar');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${progress}%`;
        
        // 根据状态设置颜色
        progressBar.className = `progress-bar ${status}`;
    }
}

// 获取当前时间戳
function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { hour12: false });
}

// 显示失败分析
function showFailureAnalysis(inputData) {
    const failureAnalysis = document.querySelector('.failure-analysis');
    if (failureAnalysis) {
        const analysisContent = generateFailureAnalysis(inputData.vulnType);
        failureAnalysis.innerHTML = `
            <h4>失败原因分析</h4>
            <div class="failure-reasons">
                ${analysisContent.reasons.map(reason => `
                    <div class="failure-reason">
                        <span class="reason-icon">⚠️</span>
                        <span class="reason-text">${reason}</span>
                    </div>
                `).join('')}
            </div>
            <h4>建议解决方案</h4>
            <div class="suggested-solutions">
                ${analysisContent.solutions.map((solution, index) => `
                    <div class="solution-item">
                        <button class="apply-solution-btn" onclick="applySuggestion(${index + 1})">
                            应用方案 ${index + 1}
                        </button>
                        <span class="solution-text">${solution}</span>
                    </div>
                `).join('')}
            </div>
        `;
        failureAnalysis.style.display = 'block';
    }
}

// 生成失败分析内容
function generateFailureAnalysis(vulnType) {
    const analysisTemplates = {
        'sql-injection': {
            reasons: [
                'WAF (Web应用防火墙) 检测并阻止了SQL注入尝试',
                '应用程序使用了参数化查询或预编译语句',
                '输入验证机制过滤了恶意字符',
                '数据库权限配置限制了注入攻击的影响'
            ],
            solutions: [
                '使用URL编码绕过WAF检测',
                '尝试分块传输编码绕过',
                '使用时间盲注技术',
                '尝试二次注入攻击'
            ]
        },
        'xss': {
            reasons: [
                'CSP (内容安全策略) 阻止了脚本执行',
                '输入过滤器移除了危险的HTML标签',
                '输出编码防止了XSS载荷执行',
                'HttpOnly Cookie设置阻止了会话劫持'
            ],
            solutions: [
                '使用DOM型XSS绕过过滤器',
                '尝试事件处理器注入',
                '使用编码技术绕过检测',
                '利用浏览器解析差异'
            ]
        },
        'rce': {
            reasons: [
                '文件上传功能限制了危险文件类型',
                '服务器配置禁止执行上传的文件',
                '输入验证阻止了命令注入',
                '沙箱环境限制了代码执行'
            ],
            solutions: [
                '使用双扩展名绕过文件类型检测',
                '尝试.htaccess文件上传',
                '利用文件包含漏洞',
                '使用反序列化攻击'
            ]
        }
    };
    
    return analysisTemplates[vulnType] || analysisTemplates['sql-injection'];
}

// 渲染攻击步骤
function renderAttackSteps() {
    const attackStepsContainer = document.getElementById('attack-steps');
    if (!attackStepsContainer) return;
    
    attackStepsContainer.innerHTML = '';
    
    attackSteps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'attack-step';
        stepElement.innerHTML = `
            <div class="step-info">
                <div class="step-title">${step.title}</div>
                <div class="step-description">${step.description}</div>
                <div class="step-command">${step.command}</div>
            </div>
            <div class="step-actions">
                <button class="edit-step" onclick="editAttackStep(${step.id})">编辑</button>
                <button class="delete-step" onclick="deleteAttackStep(${step.id})">删除</button>
            </div>
        `;
        attackStepsContainer.appendChild(stepElement);
    });
    
    // 启用下一步按钮
    const nextBtn = document.querySelector('#step-4 .next-step-btn');
    if (nextBtn) {
        nextBtn.disabled = false;
        console.log('攻击步骤渲染完成，启用下一步按钮');
    }
}

// 添加攻击步骤
function addAttackStep() {
    const title = prompt('请输入步骤标题:');
    if (!title) return;
    
    const description = prompt('请输入步骤描述:');
    if (!description) return;
    
    const command = prompt('请输入执行命令:');
    if (!command) return;
    
    const newStep = {
        id: Date.now(),
        title: title,
        description: description,
        command: command,
        status: 'pending'
    };
    
    attackSteps.push(newStep);
    renderAttackSteps();
}

// 编辑攻击步骤
function editAttackStep(stepId) {
    const step = attackSteps.find(s => s.id === stepId);
    if (!step) return;
    
    const title = prompt('请输入步骤标题:', step.title);
    if (title === null) return;
    
    const description = prompt('请输入步骤描述:', step.description);
    if (description === null) return;
    
    const command = prompt('请输入执行命令:', step.command);
    if (command === null) return;
    
    step.title = title;
    step.description = description;
    step.command = command;
    
    renderAttackSteps();
}

// 删除攻击步骤
function deleteAttackStep(stepId) {
    if (confirm('确定要删除这个步骤吗？')) {
        attackSteps = attackSteps.filter(s => s.id !== stepId);
        renderAttackSteps();
    }
}

// 应用建议
function applySuggestion(suggestionId) {
    const inputData = getStepOneInputs();
    let suggestion = generateSuggestionBySolution(suggestionId, inputData.vulnType);
    
    if (suggestion) {
        // 添加到攻击步骤中
        attackSteps.push(suggestion);
        renderAttackSteps();
        
        // 显示应用成功的反馈
        showSuggestionAppliedFeedback(suggestion.title);
        
        // 更新策略调整界面
        updateStrategyAdjustmentUI(suggestion);
    }
}

// 根据解决方案ID和漏洞类型生成建议
function generateSuggestionBySolution(solutionId, vulnType) {
    const suggestionTemplates = {
        'sql-injection': {
            1: {
                id: Date.now(),
                title: "URL编码绕过WAF",
                description: "使用URL编码对SQL注入payload进行编码，绕过WAF检测",
                command: "sqlmap -u 'http://192.168.1.100/login.php' --data='username=admin&password=123' --tamper=charencode",
                technique: "编码绕过",
                successRate: 75,
                status: 'pending'
            },
            2: {
                id: Date.now() + 1,
                title: "分块传输绕过",
                description: "使用HTTP分块传输编码绕过WAF检测",
                command: "sqlmap -u 'http://192.168.1.100/login.php' --data='username=admin&password=123' --chunked",
                technique: "传输编码",
                successRate: 68,
                status: 'pending'
            },
            3: {
                id: Date.now() + 2,
                title: "时间盲注攻击",
                description: "使用时间延迟技术进行盲注攻击",
                command: "sqlmap -u 'http://192.168.1.100/login.php' --data='username=admin&password=123' --technique=T",
                technique: "盲注技术",
                successRate: 82,
                status: 'pending'
            },
            4: {
                id: Date.now() + 3,
                title: "二次注入攻击",
                description: "利用存储的数据进行二次SQL注入",
                command: "sqlmap -u 'http://192.168.1.100/register.php' --data='username=admin&email=test@test.com' --second-order='http://192.168.1.100/profile.php'",
                technique: "二次注入",
                successRate: 60,
                status: 'pending'
            }
        },
        'xss': {
            1: {
                id: Date.now(),
                title: "DOM型XSS绕过",
                description: "利用DOM操作绕过服务端过滤器",
                command: "<img src=x onerror=alert(1)>",
                technique: "DOM操作",
                successRate: 70,
                status: 'pending'
            },
            2: {
                id: Date.now() + 1,
                title: "事件处理器注入",
                description: "使用HTML事件处理器执行JavaScript",
                command: "<input onfocus=alert(1) autofocus>",
                technique: "事件注入",
                successRate: 65,
                status: 'pending'
            },
            3: {
                id: Date.now() + 2,
                title: "编码绕过检测",
                description: "使用各种编码技术绕过XSS过滤器",
                command: "<script>eval(String.fromCharCode(97,108,101,114,116,40,49,41))</script>",
                technique: "编码技术",
                successRate: 58,
                status: 'pending'
            },
            4: {
                id: Date.now() + 3,
                title: "浏览器解析差异",
                description: "利用不同浏览器的解析差异",
                command: "<svg onload=alert(1)>",
                technique: "解析差异",
                successRate: 72,
                status: 'pending'
            }
        },
        'rce': {
            1: {
                id: Date.now(),
                title: "双扩展名绕过",
                description: "使用双扩展名绕过文件类型检测",
                command: "upload shell.php.jpg with PHP code",
                technique: "文件绕过",
                successRate: 73,
                status: 'pending'
            },
            2: {
                id: Date.now() + 1,
                title: ".htaccess文件上传",
                description: "上传.htaccess文件修改服务器配置",
                command: "upload .htaccess: AddType application/x-httpd-php .jpg",
                technique: "配置修改",
                successRate: 68,
                status: 'pending'
            },
            3: {
                id: Date.now() + 2,
                title: "文件包含漏洞",
                description: "利用本地文件包含执行上传的文件",
                command: "http://target.com/index.php?page=../uploads/shell.txt",
                technique: "文件包含",
                successRate: 80,
                status: 'pending'
            },
            4: {
                id: Date.now() + 3,
                title: "反序列化攻击",
                description: "构造恶意序列化数据执行代码",
                command: "craft malicious serialized payload",
                technique: "反序列化",
                successRate: 55,
                status: 'pending'
            }
        }
    };
    
    const vulnSuggestions = suggestionTemplates[vulnType] || suggestionTemplates['sql-injection'];
    return vulnSuggestions[solutionId] || vulnSuggestions[1];
}

// 显示建议应用成功的反馈
function showSuggestionAppliedFeedback(suggestionTitle) {
    // 创建临时通知
    const notification = document.createElement('div');
    notification.className = 'suggestion-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-text">已应用策略: ${suggestionTitle}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 更新策略调整界面
function updateStrategyAdjustmentUI(appliedSuggestion) {
    const strategyList = document.querySelector('.applied-strategies');
    if (strategyList) {
        const strategyItem = document.createElement('div');
        strategyItem.className = 'applied-strategy-item';
        strategyItem.innerHTML = `
            <div class="strategy-info">
                <span class="strategy-title">${appliedSuggestion.title}</span>
                <span class="strategy-technique">${appliedSuggestion.technique}</span>
                <span class="strategy-success-rate">成功率: ${appliedSuggestion.successRate}%</span>
            </div>
            <div class="strategy-actions">
                <button class="test-strategy-btn" onclick="testAppliedStrategy('${appliedSuggestion.id}')">
                    测试此策略
                </button>
            </div>
        `;
        strategyList.appendChild(strategyItem);
    }
}

// 测试应用的策略
function testAppliedStrategy(strategyId) {
    const strategy = attackSteps.find(step => step.id == strategyId);
    if (strategy) {
        // 模拟测试应用的策略
        const testResult = Math.random() > 0.3; // 70%成功率
        
        if (testResult) {
            alert(`策略 "${strategy.title}" 测试成功！可以继续执行完整测试。`);
            strategy.status = 'success';
        } else {
            alert(`策略 "${strategy.title}" 测试失败，建议尝试其他策略。`);
            strategy.status = 'failed';
        }
        
        renderAttackSteps();
    }
}

// 重新测试
function retryTest() {
    // 返回到步骤3重新执行测试
    showStep(3);
    
    // 延迟一下再开始测试，让用户看到界面切换
    setTimeout(() => {
        startRetryTest();
    }, 500);
}

// 重新执行测试
function startRetryTest() {
    const executionStatus = document.querySelector('.execution-status .status-value');
    const logContent = document.querySelector('.log-content');
    const nextBtn = document.querySelector('#step-3 .next-step-btn');
    
    // 重置状态
    executionStatus.textContent = '执行中';
    executionStatus.className = 'status-value running';
    logContent.innerHTML = '';
    nextBtn.disabled = true;
    
    // 模拟成功的执行日志
    const successLogs = [
        { type: 'info', message: '[INFO] 开始执行改进后的攻击策略...' },
        { type: 'info', message: '[INFO] 使用URL编码绕过WAF' },
        { type: 'info', message: '[INFO] 目标: http://192.168.1.100/login.php' },
        { type: 'info', message: '[INFO] Payload: username=admin%27%20OR%20%271%27%3D%271&password=123' },
        { type: 'info', message: '[SUCCESS] WAF绕过成功！' },
        { type: 'info', message: '[SUCCESS] SQL注入成功，获取数据库信息' },
        { type: 'info', message: '[SUCCESS] 发现用户表，包含管理员账号' },
        { type: 'info', message: '[SUCCESS] 攻击执行完成' }
    ];
    
    let logIndex = 0;
    const logInterval = setInterval(() => {
        if (logIndex < successLogs.length) {
            const log = successLogs[logIndex];
            const logLine = document.createElement('div');
            logLine.className = `log-line ${log.type}`;
            logLine.textContent = log.message;
            logContent.appendChild(logLine);
            logContent.scrollTop = logContent.scrollHeight;
            logIndex++;
        } else {
            clearInterval(logInterval);
            // 更新执行状态
            executionStatus.textContent = '执行成功';
            executionStatus.className = 'status-value success';
            nextBtn.disabled = false;
            
            // 隐藏失败分析
            const failureAnalysis = document.querySelector('.failure-analysis');
            if (failureAnalysis) {
                failureAnalysis.style.display = 'none';
            }
        }
    }, 600);
}

// 完成测试
function finishTest() {
    // 生成智能测试报告
    generateIntelligentReport();
}

// 生成智能测试报告
function generateIntelligentReport() {
    // 显示生成中状态
    const placeholder = document.querySelector('.report-placeholder');
    const whiteboxReport = document.querySelector('.whitebox-report');
    
    if (placeholder) {
        placeholder.classList.remove('hidden');
    }
    if (whiteboxReport) {
        whiteboxReport.classList.add('hidden');
    }
    
    // 模拟报告生成延迟
    setTimeout(() => {
        const inputData = getStepOneInputs();
        const reportData = {
            testInfo: {
                target: inputData.topology || 'http://192.168.1.100',
                vulnType: inputData.vulnType,
                cveId: inputData.cveId,
                testDate: new Date().toLocaleString('zh-CN'),
                duration: calculateTestDuration()
            },
            executionSummary: generateExecutionSummary(),
            vulnerabilities: generateVulnerabilityFindings(inputData.vulnType),
            recommendations: generateSecurityRecommendations(inputData.vulnType),
            appliedStrategies: getAppliedStrategies(),
            riskAssessment: {
                overallRisk: calculateRiskScore(inputData),
                impactLevel: getImpactLevel(calculateRiskScore(inputData)),
                likelihood: calculateLikelihood(inputData.vulnType)
            }
        };
        
        // 保存报告数据到全局变量，供下载功能使用
        window.currentWhiteboxReport = reportData;
        
        // 更新报告显示
        updateReportDisplay(reportData);
        
        // 保存报告数据到本地存储
        saveReportToStorage(reportData);
        
        // 显示报告生成完成的通知
        showReportGeneratedNotification();
    }, 3000); // 3秒延迟模拟生成过程
}

// 计算测试持续时间
function calculateTestDuration() {
    // 模拟测试持续时间计算
    const startTime = sessionStorage.getItem('testStartTime');
    if (startTime) {
        const duration = Date.now() - parseInt(startTime);
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        return `${minutes}分${seconds}秒`;
    }
    return '15分30秒'; // 默认值
}

// 生成执行摘要
function generateExecutionSummary() {
    const totalSteps = attackSteps.length;
    const successfulSteps = attackSteps.filter(step => step.status === 'success').length;
    const failedSteps = attackSteps.filter(step => step.status === 'failed').length;
    
    return {
        totalSteps,
        successfulSteps,
        failedSteps,
        successRate: totalSteps > 0 ? Math.round((successfulSteps / totalSteps) * 100) : 0
    };
}

// 生成漏洞发现
function generateVulnerabilityFindings(vulnType) {
    const vulnerabilityTemplates = {
        'sql-injection': [
            {
                title: 'SQL注入漏洞',
                severity: 'High',
                description: '登录页面存在SQL注入漏洞，攻击者可以绕过身份验证',
                location: '/login.php',
                evidence: "username=' OR 1=1-- &password=any",
                cvss: 8.1
            }
        ],
        'xss': [
            {
                title: '跨站脚本攻击(XSS)',
                severity: 'Medium',
                description: '搜索功能存在反射型XSS漏洞',
                location: '/search.php',
                evidence: '<script>alert("XSS")</script>',
                cvss: 6.1
            }
        ],
        'rce': [
            {
                title: '远程代码执行',
                severity: 'Critical',
                description: '文件上传功能存在远程代码执行漏洞',
                location: '/upload.php',
                evidence: 'shell.php.jpg uploaded successfully',
                cvss: 9.8
            }
        ]
    };
    
    return vulnerabilityTemplates[vulnType] || vulnerabilityTemplates['sql-injection'];
}

// 生成安全建议
function generateSecurityRecommendations(vulnType) {
    const recommendationTemplates = {
        'sql-injection': [
            {
                priority: 'High',
                category: '输入验证',
                recommendation: '使用参数化查询或预编译语句防止SQL注入',
                implementation: '将所有SQL查询改为使用PreparedStatement'
            },
            {
                priority: 'Medium',
                category: 'WAF配置',
                recommendation: '配置Web应用防火墙规则',
                implementation: '部署ModSecurity规则集，阻止常见SQL注入模式'
            },
            {
                priority: 'Medium',
                category: '权限控制',
                recommendation: '限制数据库用户权限',
                implementation: '为应用程序创建专用数据库用户，仅授予必要权限'
            }
        ],
        'xss': [
            {
                priority: 'High',
                category: '输出编码',
                recommendation: '对所有用户输入进行适当的输出编码',
                implementation: '使用HTML实体编码、JavaScript编码等'
            },
            {
                priority: 'High',
                category: 'CSP策略',
                recommendation: '实施内容安全策略(CSP)',
                implementation: '配置严格的CSP头，防止内联脚本执行'
            },
            {
                priority: 'Medium',
                category: 'Cookie安全',
                recommendation: '设置HttpOnly和Secure标志',
                implementation: '为所有敏感Cookie设置安全标志'
            }
        ],
        'rce': [
            {
                priority: 'Critical',
                category: '文件上传',
                recommendation: '严格验证上传文件类型和内容',
                implementation: '使用白名单验证文件类型，检查文件头部'
            },
            {
                priority: 'High',
                category: '执行权限',
                recommendation: '限制上传目录的执行权限',
                implementation: '配置Web服务器禁止执行上传目录中的文件'
            },
            {
                priority: 'Medium',
                category: '沙箱隔离',
                recommendation: '使用沙箱环境处理上传文件',
                implementation: '部署容器化或虚拟化隔离环境'
            }
        ]
    };
    
    return recommendationTemplates[vulnType] || recommendationTemplates['sql-injection'];
}

// 获取已应用的策略
function getAppliedStrategies() {
    return attackSteps.filter(step => step.technique).map(step => ({
        title: step.title,
        technique: step.technique,
        status: step.status,
        successRate: step.successRate || 0
    }));
}

// 计算可能性
function calculateLikelihood(vulnType) {
    const likelihoodMap = {
        'sql-injection': 'High',
        'xss': 'Medium',
        'rce': 'High',
        'file-upload': 'Medium',
        'csrf': 'Low',
        'idor': 'Medium'
    };
    return likelihoodMap[vulnType] || 'Medium';
}

// 更新报告显示
function updateReportDisplay(reportData) {
    // 隐藏报告占位符
    const placeholder = document.querySelector('.report-placeholder');
    if (placeholder) {
        placeholder.classList.add('hidden');
    }
    
    // 显示白盒测试报告
    const whiteboxReport = document.querySelector('.whitebox-report');
    if (whiteboxReport) {
        whiteboxReport.classList.remove('hidden');
        
        // 更新测试信息
        document.getElementById('wb-target').textContent = reportData.testInfo.target;
        document.getElementById('wb-vuln-type').textContent = reportData.testInfo.vulnType;
        document.getElementById('wb-cve-id').textContent = reportData.testInfo.cveId;
        document.getElementById('wb-test-date').textContent = reportData.testInfo.testDate;
        document.getElementById('wb-duration').textContent = reportData.testInfo.duration;
        
        // 更新执行摘要
        document.getElementById('wb-total-steps').textContent = reportData.executionSummary.totalSteps;
        document.getElementById('wb-successful-steps').textContent = reportData.executionSummary.successfulSteps;
        document.getElementById('wb-failed-steps').textContent = reportData.executionSummary.failedSteps;
        document.getElementById('wb-success-rate').textContent = reportData.executionSummary.successRate + '%';
        document.getElementById('wb-vulnerabilities').textContent = reportData.vulnerabilities.length;
        document.getElementById('wb-risk-score').textContent = reportData.riskAssessment.overallRisk;
        
        // 更新漏洞列表
        const vulnList = document.getElementById('wb-vulnerabilities-list');
        vulnList.innerHTML = reportData.vulnerabilities.map(vuln => `
            <div class="vulnerability-card severity-${vuln.severity.toLowerCase()}">
                <div class="vuln-header">
                    <h4>${vuln.title}</h4>
                    <span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
                </div>
                <div class="vuln-details">
                    <p><strong>描述:</strong> ${vuln.description}</p>
                    <p><strong>位置:</strong> ${vuln.location}</p>
                    <p><strong>证据:</strong> <code>${vuln.evidence}</code></p>
                    <p><strong>CVSS评分:</strong> ${vuln.cvss}</p>
                </div>
            </div>
        `).join('');
        
        // 更新修复建议
        const recList = document.getElementById('wb-recommendations-list');
        recList.innerHTML = reportData.recommendations.map(rec => `
            <div class="recommendation-card priority-${rec.priority.toLowerCase()}">
                <div class="rec-header">
                    <h4>${rec.category}</h4>
                    <span class="priority-badge">${rec.priority}</span>
                </div>
                <div class="rec-content">
                    <p><strong>建议:</strong> ${rec.recommendation}</p>
                    <div class="implementation">
                        <strong>实施方案:</strong>
                        <pre>${rec.implementation}</pre>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// 保存报告到本地存储
function saveReportToStorage(reportData) {
    const reports = JSON.parse(localStorage.getItem('aiTestReports') || '[]');
    reports.push({
        id: Date.now(),
        ...reportData,
        timestamp: Date.now()
    });
    localStorage.setItem('aiTestReports', JSON.stringify(reports));
}

// 显示报告生成完成通知
function showReportGeneratedNotification() {
    const notification = document.createElement('div');
    notification.className = 'report-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">📊</span>
            <span class="notification-text">AI测试报告已生成完成</span>
            <button class="view-report-btn" onclick="showStep(5)">查看报告</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// 下载报告
function downloadReport() {
    const reportData = JSON.parse(localStorage.getItem('aiTestReports') || '[]').pop();
    if (reportData) {
        const reportContent = generateReportHTML(reportData);
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI测试报告_${new Date().toISOString().slice(0, 10)}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 分享报告
function shareReport() {
    if (navigator.share) {
        navigator.share({
            title: 'AI辅助测试报告',
            text: '查看我的AI辅助安全测试报告',
            url: window.location.href
        });
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('报告链接已复制到剪贴板');
        });
    }
}

// 开始新测试
function startNewTest() {
    if (confirm('确定要开始新的测试吗？当前进度将被重置。')) {
        // 重置所有状态
        currentStep = 1;
        attackSteps = [];
        
        // 清空表单
        document.getElementById('topology-input').value = '';
        document.getElementById('vuln-type').value = '';
        document.getElementById('cve-id').value = '';
        document.getElementById('system-config').value = '';
        document.getElementById('attack-goal').value = '';
        
        // 返回第一步
        showStep(1);
        
        // 记录新测试开始时间
        sessionStorage.setItem('testStartTime', Date.now().toString());
    }
}

// 生成报告HTML
function generateReportHTML(reportData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>AI辅助测试报告</title>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .report-header { border-bottom: 2px solid #333; padding-bottom: 10px; }
                .vulnerability-item { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
                .severity.high { color: #d32f2f; }
                .severity.medium { color: #f57c00; }
                .severity.low { color: #388e3c; }
            </style>
        </head>
        <body>
            <div class="report-header">
                <h1>AI辅助安全测试报告</h1>
                <p>生成时间: ${reportData.testInfo.testDate}</p>
            </div>
            <!-- 报告内容 -->
            <h2>执行摘要</h2>
            <p>总步骤数: ${reportData.executionSummary.totalSteps}</p>
            <p>成功率: ${reportData.executionSummary.successRate}%</p>
            
            <h2>发现的漏洞</h2>
            ${reportData.vulnerabilities.map(vuln => `
                <div class="vulnerability-item">
                    <h3>${vuln.title} <span class="severity ${vuln.severity.toLowerCase()}">[${vuln.severity}]</span></h3>
                    <p><strong>描述:</strong> ${vuln.description}</p>
                    <p><strong>位置:</strong> ${vuln.location}</p>
                    <p><strong>CVSS评分:</strong> ${vuln.cvss}</p>
                </div>
            `).join('')}
            
            <h2>修复建议</h2>
            ${reportData.recommendations.map(rec => `
                <div class="recommendation-item">
                    <h4>${rec.category} [${rec.priority}]</h4>
                    <p><strong>建议:</strong> ${rec.recommendation}</p>
                    <p><strong>实施方案:</strong> ${rec.implementation}</p>
                </div>
            `).join('')}
        </body>
        </html>
    `;
}

// 返回场景列表
function goBack() {
    // 检查是否在学员端框架中
    if (window.parent && window.parent !== window) {
        // 在iframe中，通知父页面切换到场景测试
        window.parent.postMessage({ action: 'navigate', page: 'scenario-test' }, '*');
    } else {
        // 直接跳转
        window.location.href = 'scenario-test.html';
    }
}

// 开始场景测试
function startScenario() {
    alert('正在启动场景测试环境，请稍候...');
    // 这里可以跳转到实际的测试环境
}

// 进入练习模式
function enterPracticeMode() {
    alert('正在进入练习模式...');
    // 这里可以跳转到练习环境
}

// 监听来自父页面的消息
window.addEventListener('message', function(event) {
    if (event.data.action === 'loadScenario') {
        // 加载特定场景的数据
        loadScenarioData(event.data.scenarioId);
    }
});

// 工具函数：格式化时间
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
        return `${minutes}分钟${secs}秒`;
    } else {
        return `${secs}秒`;
    }
}

// 工具函数：生成随机ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 导出函数供全局使用
// 黑盒测试相关函数
function resetBlackboxInterface() {
    // 显示第一步，隐藏进度界面
    const step1 = document.getElementById('blackbox-step-1');
    const progressStep = document.getElementById('blackbox-step-progress');
    
    if (step1) {
        step1.classList.add('active');
        step1.classList.remove('hidden');
    }
    if (progressStep) {
        progressStep.classList.add('hidden');
        progressStep.classList.remove('active');
    }
    
    // 重置步骤条状态
    const stepItems = document.querySelectorAll('.step-item');
    stepItems.forEach((item, index) => {
        item.classList.remove('active', 'completed');
        if (index === 0) { // 第一步设为活跃状态
            item.classList.add('active');
        }
    });
    
    // 重置连接线状态
    const stepLines = document.querySelectorAll('.step-line');
    stepLines.forEach(line => {
        line.classList.remove('active', 'completed');
    });
    
    // 重置表单值
    const targetUrl = document.getElementById('target-url');
    const portRange = document.getElementById('port-range');
    const scanType = document.getElementById('scan-type');
    
    if (targetUrl) targetUrl.value = 'http://192.168.1.100';
    if (portRange) portRange.value = '1-1000';
    if (scanType) scanType.value = 'comprehensive';
}

function startBlackboxTest() {
    console.log('开始黑盒测试');
    
    // 获取输入值
    const targetUrl = document.getElementById('target-url')?.value;
    const portRange = document.getElementById('port-range')?.value;
    const scanType = document.getElementById('scan-type')?.value;
    
    if (!targetUrl) {
        alert('请输入目标URL或IP地址');
        return;
    }
    
    // 标记第一步（目标识别）为完成状态
    const step1Item = document.querySelector('.step-item[data-step="1"]');
    if (step1Item) {
        step1Item.classList.remove('active');
        step1Item.classList.add('completed');
    }
    
    // 隐藏配置界面，显示进度界面
    const step1 = document.getElementById('blackbox-step-1');
    const progressStep = document.getElementById('blackbox-step-progress');
    
    if (step1) {
        step1.classList.remove('active');
        step1.classList.add('hidden');
    }
    if (progressStep) {
        progressStep.classList.remove('hidden');
        progressStep.classList.add('active');
    }
    
    // 开始测试流程
    runBlackboxTestSequence({
        targetUrl,
        portRange,
        scanType
    });
}

function runBlackboxTestSequence(config) {
    const steps = [
        { name: 'info-gathering', duration: 3000, label: '信息收集', stepNumber: 2 },
        { name: 'vuln-scan', duration: 4000, label: '漏洞扫描', stepNumber: 3 },
        { name: 'penetration', duration: 5000, label: '渗透测试', stepNumber: 4 },
        { name: 'report', duration: 2000, label: '生成报告', stepNumber: 5 }
    ];
    
    let currentStepIndex = 0;
    
    // 更新步骤条状态的函数
    function updateStepNavigation(stepNumber, status) {
        const stepItem = document.querySelector(`.step-item[data-step="${stepNumber}"]`);
        
        if (stepItem) {
            // 移除所有状态类
            stepItem.classList.remove('active', 'completed');
            
            // 添加新状态
            if (status === 'active') {
                stepItem.classList.add('active');
            } else if (status === 'completed') {
                stepItem.classList.add('completed');
                // 添加完成时的特殊效果
                triggerCompletionEffect(stepItem, stepNumber);
            }
        }
        
        // 更新连接线状态
        updateStepLines(stepNumber, status);
    }
    
    // 触发步骤完成的特殊效果
    function triggerCompletionEffect(stepItem, stepNumber) {
        // 添加完成通知
        showStepCompletionNotification(stepNumber);
        
        // 添加临时的闪烁效果
        stepItem.style.animation = 'none';
        setTimeout(() => {
            stepItem.style.animation = '';
        }, 10);
        
        // 播放完成音效（如果浏览器支持）
        playCompletionSound();
    }
    
    // 显示步骤完成通知
    function showStepCompletionNotification(stepNumber) {
        const stepTitles = ['', '目标识别', '信息收集', '漏洞扫描', '渗透测试', '生成报告'];
        const stepTitle = stepTitles[stepNumber] || `步骤${stepNumber}`;
        
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = 'step-completion-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">✓</div>
                <div class="notification-text">${stepTitle}已完成</div>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 3秒后移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 播放完成音效
    function playCompletionSound() {
        try {
            // 创建音频上下文（如果浏览器支持）
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // 如果音频API不支持，静默失败
            console.log('音频API不支持');
        }
    }
    
    // 更新连接线状态的函数
    function updateStepLines(currentStep, status) {
        const stepLines = document.querySelectorAll('.step-line');
        stepLines.forEach((line, index) => {
            const lineNumber = index + 1; // 连接线编号从1开始
            
            // 移除所有状态类
            line.classList.remove('active', 'completed');
            
            if (lineNumber < currentStep) {
                // 当前步骤之前的连接线设为完成状态
                line.classList.add('completed');
            } else if (lineNumber === currentStep && status === 'active') {
                // 当前步骤的连接线设为活跃状态
                line.classList.add('active');
            } else if (lineNumber === currentStep && status === 'completed') {
                // 当前步骤完成时，连接线也设为完成状态
                line.classList.add('completed');
            }
        });
    }
    
    function runNextStep() {
        if (currentStepIndex >= steps.length) {
            // 所有步骤完成，标记最后一步为完成
            updateStepNavigation(5, 'completed');
            addBlackboxLog('[SUCCESS] 黑盒测试完成，报告已生成');
            showBlackboxResults();
            return;
        }
        
        const step = steps[currentStepIndex];
        const progressElement = document.getElementById(step.name + '-progress');
        const statusElement = document.getElementById(step.name + '-status');
        
        // 更新步骤条：当前步骤设为活跃状态
        updateStepNavigation(step.stepNumber, 'active');
        
        if (statusElement) statusElement.textContent = '进行中...';
        addBlackboxLog(`[INFO] 开始${step.label}`);
        
        // 模拟进度更新
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 100) progress = 100;
            
            if (progressElement) {
                progressElement.style.width = progress + '%';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                if (statusElement) statusElement.textContent = '已完成';
                addBlackboxLog(`[SUCCESS] ${step.label}完成`);
                
                // 更新步骤条：当前步骤设为完成状态
                updateStepNavigation(step.stepNumber, 'completed');
                
                currentStepIndex++;
                setTimeout(runNextStep, 500);
            }
        }, step.duration / 10);
    }
    
    // 开始第一步
    runNextStep();
}

function addBlackboxLog(message) {
    const logContainer = document.getElementById('blackbox-logs');
    if (logContainer) {
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${getCurrentTimestamp()}] ${message}`;
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

function showBlackboxResults() {
    // 生成黑盒测试报告
    const reportData = generateBlackboxReport();
    
    // 显示报告界面
    const progressStep = document.getElementById('blackbox-step-progress');
    const reportStep = document.getElementById('blackbox-step-report');
    
    if (progressStep) {
        progressStep.classList.add('hidden');
        progressStep.classList.remove('active');
    }
    if (reportStep) {
        reportStep.classList.remove('hidden');
        reportStep.classList.add('active');
    }
    
    // 更新报告显示
    updateBlackboxReportDisplay(reportData);
    addBlackboxLog('[SUCCESS] 测试报告已生成完成');
}

function generateBlackboxReport() {
    const testEndTime = new Date();
    const testStartTime = new Date(testEndTime.getTime() - 14000); // 模拟14秒测试时间
    
    return {
        testInfo: {
            testType: '黑盒测试',
            testDate: testEndTime.toLocaleString('zh-CN'),
            duration: '14秒',
            targetUrl: document.getElementById('target-url')?.value || 'http://192.168.1.100',
            portRange: document.getElementById('port-range')?.value || '1-1000',
            scanType: document.getElementById('scan-type')?.value || 'comprehensive'
        },
        executionSummary: {
            totalSteps: 4,
            completedSteps: 4,
            successRate: 100,
            testDuration: '14秒',
            vulnerabilitiesFound: 3,
            riskLevel: '中等'
        },
        vulnerabilities: [
            {
                id: 'VULN-001',
                title: 'SQL注入漏洞',
                severity: 'High',
                cvss: '8.1',
                description: '在登录页面发现SQL注入漏洞，攻击者可能获取数据库敏感信息',
                location: '/login.php',
                impact: '数据泄露风险',
                solution: '使用参数化查询，验证输入数据'
            },
            {
                id: 'VULN-002',
                title: 'XSS跨站脚本漏洞',
                severity: 'Medium',
                cvss: '6.1',
                description: '在搜索功能中发现反射型XSS漏洞',
                location: '/search.php',
                impact: '会话劫持风险',
                solution: '对用户输入进行HTML编码和过滤'
            },
            {
                id: 'VULN-003',
                title: '目录遍历漏洞',
                severity: 'Medium',
                cvss: '5.3',
                description: '文件下载功能存在目录遍历漏洞',
                location: '/download.php',
                impact: '敏感文件泄露',
                solution: '限制文件访问路径，验证文件名'
            }
        ],
        recommendations: [
            {
                category: '代码安全',
                priority: '高',
                recommendation: '立即修复SQL注入漏洞',
                implementation: '1. 使用预编译语句\n2. 实施输入验证\n3. 最小权限原则'
            },
            {
                category: '输入验证',
                priority: '中',
                recommendation: '加强输入过滤和输出编码',
                implementation: '1. 实施白名单验证\n2. HTML实体编码\n3. CSP策略部署'
            },
            {
                category: '访问控制',
                priority: '中',
                recommendation: '完善文件访问控制机制',
                implementation: '1. 路径规范化\n2. 访问权限检查\n3. 安全文件存储'
            }
        ],
        testDetails: {
            infoGathering: {
                portsScanned: 1000,
                servicesFound: 5,
                osDetection: 'Linux Ubuntu 20.04'
            },
            vulnScan: {
                totalChecks: 1247,
                vulnerabilitiesFound: 3,
                falsePositives: 0
            },
            penetrationTest: {
                exploitsAttempted: 3,
                successfulExploits: 2,
                accessLevel: 'User Level'
            }
        }
    };
}

function updateBlackboxReportDisplay(reportData) {
    // 更新测试信息
    const testInfoElement = document.getElementById('blackbox-test-info');
    if (testInfoElement) {
        testInfoElement.innerHTML = `
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">测试类型:</span>
                    <span class="info-value">${reportData.testInfo.testType}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">测试时间:</span>
                    <span class="info-value">${reportData.testInfo.testDate}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">测试时长:</span>
                    <span class="info-value">${reportData.testInfo.duration}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">目标地址:</span>
                    <span class="info-value">${reportData.testInfo.targetUrl}</span>
                </div>
            </div>
        `;
    }
    
    // 更新执行摘要
    const summaryElement = document.getElementById('blackbox-execution-summary');
    if (summaryElement) {
        summaryElement.innerHTML = `
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-number">${reportData.executionSummary.vulnerabilitiesFound}</div>
                    <div class="stat-label">发现漏洞</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${reportData.executionSummary.successRate}%</div>
                    <div class="stat-label">成功率</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${reportData.executionSummary.completedSteps}</div>
                    <div class="stat-label">完成步骤</div>
                </div>
                <div class="stat-card risk-${reportData.executionSummary.riskLevel === '中等' ? 'medium' : 'low'}">
                    <div class="stat-number">${reportData.executionSummary.riskLevel}</div>
                    <div class="stat-label">风险等级</div>
                </div>
            </div>
        `;
    }
    
    // 更新漏洞列表
    const vulnListElement = document.getElementById('blackbox-vulnerabilities');
    if (vulnListElement) {
        vulnListElement.innerHTML = reportData.vulnerabilities.map(vuln => `
            <div class="vulnerability-card severity-${vuln.severity.toLowerCase()}">
                <div class="vuln-header">
                    <h4>${vuln.title}</h4>
                    <span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
                </div>
                <div class="vuln-details">
                    <p><strong>CVSS评分:</strong> ${vuln.cvss}</p>
                    <p><strong>位置:</strong> ${vuln.location}</p>
                    <p><strong>描述:</strong> ${vuln.description}</p>
                    <p><strong>影响:</strong> ${vuln.impact}</p>
                    <p><strong>修复建议:</strong> ${vuln.solution}</p>
                </div>
            </div>
        `).join('');
    }
    
    // 更新修复建议
    const recElement = document.getElementById('blackbox-recommendations');
    if (recElement) {
        recElement.innerHTML = reportData.recommendations.map(rec => `
            <div class="recommendation-card priority-${rec.priority === '高' ? 'high' : rec.priority === '中' ? 'medium' : 'low'}">
                <div class="rec-header">
                    <h4>${rec.category}</h4>
                    <span class="priority-badge">${rec.priority}优先级</span>
                </div>
                <div class="rec-content">
                    <p><strong>建议:</strong> ${rec.recommendation}</p>
                    <div class="implementation">
                        <strong>实施方案:</strong>
                        <pre>${rec.implementation}</pre>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('zh-CN', { hour12: false });
}

window.scenarioDetail = {
    showTab,
    selectTestMode,
    backToModeSelection,
    nextStep,
    prevStep,
    addAttackStep,
    editAttackStep,
    deleteAttackStep,
    applySuggestion,
    retryTest,
    finishTest,
    goBack,
    startScenario,
    enterPracticeMode,
    startBlackboxTest,
    resetBlackboxInterface
};

// 黑盒测试报告操作函数
function downloadBlackboxReport() {
    const reportData = generateBlackboxReport();
    const reportHTML = generateBlackboxReportHTML(reportData);
    
    const blob = new Blob([reportHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `黑盒测试报告_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // 显示下载成功提示
    showNotification('报告下载成功！', 'success');
}

function shareBlackboxReport() {
    const reportUrl = window.location.href + '#blackbox-report';
    
    if (navigator.share) {
        navigator.share({
            title: '黑盒测试报告',
            text: '查看我的黑盒测试报告',
            url: reportUrl
        }).then(() => {
            showNotification('报告分享成功！', 'success');
        }).catch(() => {
            copyToClipboard(reportUrl);
        });
    } else {
        copyToClipboard(reportUrl);
    }
}

function startNewBlackboxTest() {
    if (confirm('确定要开始新的黑盒测试吗？当前报告将被重置。')) {
        resetBlackboxInterface();
        selectTestMode('blackbox');
        showNotification('已重置黑盒测试，可以开始新的测试', 'info');
    }
}

function generateBlackboxReportHTML(reportData) {
    return `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>黑盒测试报告</title>
            <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; margin: 20px; line-height: 1.6; }
                .report-header { border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                .report-header h1 { color: #1e293b; margin: 0; font-size: 28px; }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                .info-item { background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
                .info-label { font-weight: bold; color: #374151; }
                .info-value { color: #1e293b; }
                .summary-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin: 20px 0; }
                .stat-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
                .stat-label { color: #64748b; margin-top: 5px; }
                .vulnerability-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 15px 0; }
                .severity-high { border-left: 4px solid #dc2626; }
                .severity-medium { border-left: 4px solid #d97706; }
                .severity-low { border-left: 4px solid #16a34a; }
                .severity-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
                .severity-badge.high { background: #fef2f2; color: #dc2626; }
                .severity-badge.medium { background: #fffbeb; color: #d97706; }
                .severity-badge.low { background: #f0fdf4; color: #16a34a; }
                .recommendation-card { background: #f8fafc; border-radius: 12px; padding: 20px; margin: 15px 0; }
                .priority-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #e2e8f0; color: #374151; }
                .implementation pre { background: #1e293b; color: #f1f5f9; padding: 15px; border-radius: 8px; white-space: pre-wrap; }
                h2, h3, h4 { color: #1e293b; }
                .section { margin: 30px 0; }
            </style>
        </head>
        <body>
            <div class="report-header">
                <h1>🎯 黑盒测试报告</h1>
                <p>生成时间: ${reportData.testInfo.testDate}</p>
            </div>
            
            <div class="section">
                <h2>📋 测试信息</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">测试类型:</div>
                        <div class="info-value">${reportData.testInfo.testType}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">目标地址:</div>
                        <div class="info-value">${reportData.testInfo.targetUrl}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">端口范围:</div>
                        <div class="info-value">${reportData.testInfo.portRange}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">测试时长:</div>
                        <div class="info-value">${reportData.testInfo.duration}</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>📊 执行摘要</h2>
                <div class="summary-stats">
                    <div class="stat-card">
                        <div class="stat-number">${reportData.executionSummary.vulnerabilitiesFound}</div>
                        <div class="stat-label">发现漏洞</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${reportData.executionSummary.successRate}%</div>
                        <div class="stat-label">成功率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${reportData.executionSummary.completedSteps}</div>
                        <div class="stat-label">完成步骤</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${reportData.executionSummary.riskLevel}</div>
                        <div class="stat-label">风险等级</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>🔍 发现的漏洞</h2>
                ${reportData.vulnerabilities.map(vuln => `
                    <div class="vulnerability-card severity-${vuln.severity.toLowerCase()}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0;">${vuln.title}</h3>
                            <span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
                        </div>
                        <p><strong>CVSS评分:</strong> ${vuln.cvss}</p>
                        <p><strong>位置:</strong> ${vuln.location}</p>
                        <p><strong>描述:</strong> ${vuln.description}</p>
                        <p><strong>影响:</strong> ${vuln.impact}</p>
                        <p><strong>修复建议:</strong> ${vuln.solution}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h2>💡 修复建议</h2>
                ${reportData.recommendations.map(rec => `
                    <div class="recommendation-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="margin: 0;">${rec.category}</h3>
                            <span class="priority-badge">${rec.priority}优先级</span>
                        </div>
                        <p><strong>建议:</strong> ${rec.recommendation}</p>
                        <div class="implementation">
                            <strong>实施方案:</strong>
                            <pre>${rec.implementation}</pre>
                        </div>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('链接已复制到剪贴板！', 'success');
    }).catch(() => {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('链接已复制到剪贴板！', 'success');
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 将函数暴露到全局作用域
window.startBlackboxTest = startBlackboxTest;
window.resetBlackboxInterface = resetBlackboxInterface;// 白盒测试报告操作函数
function downloadWhiteboxReport() {
    const reportData = window.currentWhiteboxReport;
    if (!reportData) {
        showNotification('没有可下载的报告', 'error');
        return;
    }
    
    const reportHTML = generateWhiteboxReportHTML(reportData);
    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `whitebox-test-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('报告下载成功', 'success');
}

function shareWhiteboxReport() {
    const reportData = window.currentWhiteboxReport;
    if (!reportData) {
        showNotification('没有可分享的报告', 'error');
        return;
    }
    
    const shareText = `AI辅助白盒测试报告\n目标: ${reportData.testInfo.target}\n漏洞类型: ${reportData.testInfo.vulnType}\n发现漏洞: ${reportData.vulnerabilities.length}个\n成功率: ${reportData.executionSummary.successRate}%`;
    
    if (navigator.share) {
        navigator.share({
            title: 'AI辅助白盒测试报告',
            text: shareText
        }).then(() => {
            showNotification('分享成功', 'success');
        }).catch(() => {
            copyToClipboard(shareText);
        });
    } else {
        copyToClipboard(shareText);
    }
}

function startNewWhiteboxTest() {
    if (confirm('确定要开始新的测试吗？当前测试数据将被清除。')) {
        // 重置界面
        document.querySelector('.whitebox-report').classList.add('hidden');
        document.querySelector('.report-placeholder').classList.remove('hidden');
        
        // 重置步骤
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.add('hidden');
        });
        document.getElementById('step1').classList.remove('hidden');
        
        // 重置步骤导航
        document.querySelectorAll('.step-item').forEach(item => {
            item.classList.remove('active', 'completed');
        });
        document.querySelector('.step-item[data-step="1"]').classList.add('active');
        
        // 清除数据
        window.currentWhiteboxReport = null;
        
        showNotification('已重置，可以开始新的测试', 'success');
    }
}

function generateWhiteboxReportHTML(reportData) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI辅助白盒测试报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .report-container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .report-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .report-section { padding: 20px 30px; border-bottom: 1px solid #eee; }
        .vulnerability-card { background: #f8f9fa; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .recommendation-card { background: #f8f9fa; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <h1>AI辅助白盒测试报告</h1>
            <p>生成时间: ${reportData.testInfo.testDate}</p>
        </div>
        <div class="report-section">
            <h2>测试信息</h2>
            <p><strong>目标:</strong> ${reportData.testInfo.target}</p>
            <p><strong>漏洞类型:</strong> ${reportData.testInfo.vulnType}</p>
            <p><strong>CVE ID:</strong> ${reportData.testInfo.cveId}</p>
            <p><strong>测试时长:</strong> ${reportData.testInfo.duration}</p>
        </div>
        <div class="report-section">
            <h2>执行摘要</h2>
            <p>总步骤数: ${reportData.executionSummary.totalSteps}</p>
            <p>成功步骤: ${reportData.executionSummary.successfulSteps}</p>
            <p>失败步骤: ${reportData.executionSummary.failedSteps}</p>
            <p>成功率: ${reportData.executionSummary.successRate}%</p>
        </div>
        <div class="report-section">
            <h2>发现的漏洞</h2>
            ${reportData.vulnerabilities.map(vuln => `
                <div class="vulnerability-card">
                    <h3>${vuln.title}</h3>
                    <p><strong>严重程度:</strong> ${vuln.severity}</p>
                    <p><strong>描述:</strong> ${vuln.description}</p>
                    <p><strong>位置:</strong> ${vuln.location}</p>
                    <p><strong>CVSS评分:</strong> ${vuln.cvss}</p>
                </div>
            `).join('')}
        </div>
        <div class="report-section">
            <h2>修复建议</h2>
            ${reportData.recommendations.map(rec => `
                <div class="recommendation-card">
                    <h3>${rec.category}</h3>
                    <p><strong>优先级:</strong> ${rec.priority}</p>
                    <p><strong>建议:</strong> ${rec.recommendation}</p>
                    <p><strong>实施方案:</strong> ${rec.implementation}</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
}

// 暴露全局函数
window.downloadBlackboxReport = downloadBlackboxReport;
window.shareBlackboxReport = shareBlackboxReport;
window.startNewBlackboxTest = startNewBlackboxTest;
window.downloadWhiteboxReport = downloadWhiteboxReport;
window.shareWhiteboxReport = shareWhiteboxReport;
window.startNewWhiteboxTest = startNewWhiteboxTest;