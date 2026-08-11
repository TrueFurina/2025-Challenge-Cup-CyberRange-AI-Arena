// 训练场景管理 - 表单处理模块

// 当前步骤
let currentStep = 1;

// 重置创建场景表单
function resetCreateScenarioForm() {
    const form = document.getElementById('scenarioInfoForm');
    if (form) {
        form.reset();
    }
    
    // 清空拓扑
    clearTopology();
    
    // 重置步骤
    currentStep = 1;
    updateStepIndicator();
}

// 更新步骤指示器
function updateStepIndicator() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// 显示指定步骤
function showStep(step) {
    // 隐藏所有步骤内容
    const stepPanes = document.querySelectorAll('.step-pane');
    stepPanes.forEach(pane => pane.classList.remove('active'));
    
    // 显示当前步骤
    const currentPane = document.getElementById(`step${step}`);
    if (currentPane) {
        currentPane.classList.add('active');
    }
    
    // 更新按钮状态
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    const createBtn = document.getElementById('createScenarioBtn');
    
    if (prevBtn) {
        prevBtn.style.display = step > 1 ? 'inline-block' : 'none';
    }
    
    if (nextBtn && createBtn) {
        if (step === 2) {
            nextBtn.style.display = 'none';
            createBtn.style.display = 'inline-block';
        } else {
            nextBtn.style.display = 'inline-block';
            createBtn.style.display = 'none';
        }
    }
    
    currentStep = step;
    updateStepIndicator();
}

// 下一步
function goToNextStep() {
    if (currentStep === 1) {
        if (validateScenarioInfoForm()) {
            showStep(2);
            initializeDragAndDrop();
        }
    }
}

// 上一步
function goToPrevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

// 验证场景信息表单（演示模式：跳过验证）
function validateScenarioInfoForm() {
    // 演示模式：直接返回true，跳过所有必填项验证
    return true;
}

// 创建场景
function handleCreateScenario() {
    console.log('创建场景按钮被点击');
    
    // 验证第一步表单
    if (!validateScenarioInfoForm()) {
        showStep(1); // 返回第一步
        return;
    }
    
    // 获取表单数据
    const scenarioName = document.getElementById('scenarioName').value;
    const scenarioType = document.getElementById('scenarioType').value;
    const scenarioDifficulty = document.getElementById('scenarioDifficulty').value;
    const scenarioDescription = document.getElementById('scenarioDescription').value;
    const scenarioObjectives = document.getElementById('scenarioObjectives').value;
    const scenarioPrerequisites = document.getElementById('scenarioPrerequisites') ? document.getElementById('scenarioPrerequisites').value : '';
    const estimatedTime = document.getElementById('estimatedTime') ? parseInt(document.getElementById('estimatedTime').value) || 60 : 60;
    
    // 收集拓扑数据
    const targets = topologyNodes.map(node => ({
        id: parseInt(node.targetId.replace(/\D/g, '')) + 1000, // 生成唯一ID
        name: node.name,
        type: node.type,
        x: node.x,
        y: node.y
    }));
    
    // 创建新场景对象
    const newScenario = {
        id: scenarios.length + 1,
        name: scenarioName,
        type: scenarioType,
        difficulty: scenarioDifficulty,
        status: 'draft',
        description: scenarioDescription,
        objectives: scenarioObjectives,
        prerequisites: scenarioPrerequisites,
        estimatedTime: estimatedTime,
        createdAt: new Date().toISOString().split('T')[0],
        modifiedAt: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(/\//g, '-'),
        targets: targets,
        icon: getIconByType(scenarioType)
    };
    
    // 添加到场景列表
    scenarios.push(newScenario);
    filteredScenarios = [...scenarios];
    
    // 关闭模态框
    const modal = document.getElementById('addScenarioModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // 刷新表格
    renderScenarioTable();
    
    // 显示成功消息
    showNotification('场景创建成功！', 'success');
    
    console.log('新场景已创建:', newScenario);
}

// 根据类型获取图标
function getIconByType(type) {
    const iconMap = {
        'penetration': 'fa-bug',
        'defense': 'fa-shield-alt',
        'forensics': 'fa-search',
        'ctf': 'fa-flag'
    };
    return iconMap[type] || 'fa-cog';
}

// 编辑场景
function editScenario(scenarioId) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
        showNotification('场景不存在', 'error');
        return;
    }
    
    // 这里可以实现编辑功能
    showNotification(`编辑场景: ${scenario.name}`, 'info');
    console.log('编辑场景:', scenario);
}

// 部署场景
function deployScenario(scenarioId) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
        showNotification('场景不存在', 'error');
        return;
    }
    
    // 更新场景状态为活跃
    scenario.status = 'active';
    scenario.modifiedAt = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/\//g, '-');
    
    // 刷新表格
    renderScenarioTable();
    
    showNotification(`场景 "${scenario.name}" 部署成功！`, 'success');
    console.log('部署场景:', scenario);
}

// 查看场景详情
function viewScenarioDetails(scenarioId) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
        showNotification('场景不存在', 'error');
        return;
    }
    
    // 填充详情模态框
    document.getElementById('detailName').textContent = scenario.name;
    document.getElementById('detailType').textContent = getTypeText(scenario.type);
    document.getElementById('detailType').className = `scenario-type-badge ${scenario.type}`;
    document.getElementById('detailDifficulty').textContent = getDifficultyText(scenario.difficulty);
    document.getElementById('detailDifficulty').className = `difficulty-badge ${scenario.difficulty}`;
    document.getElementById('detailStatus').textContent = getStatusText(scenario.status);
    document.getElementById('detailStatus').className = `status-badge ${scenario.status}`;
    document.getElementById('detailCreated').textContent = scenario.createdAt;
    document.getElementById('detailTime').textContent = scenario.estimatedTime;
    document.getElementById('detailModified').textContent = scenario.modifiedAt;
    
    // 填充描述和目标
    const descriptionElement = document.getElementById('detailDescription');
    if (descriptionElement) {
        descriptionElement.textContent = scenario.description;
    }
    
    // 处理目标列表
    const objectivesList = document.getElementById('detailObjectives');
    if (objectivesList && scenario.objectives) {
        const objectives = scenario.objectives.split('\n').filter(obj => obj.trim());
        objectivesList.innerHTML = objectives.map(obj => `<li>${obj}</li>`).join('');
    }
    
    // 处理前置条件
    const prerequisitesElement = document.getElementById('detailPrerequisites');
    if (prerequisitesElement) {
        prerequisitesElement.textContent = scenario.prerequisites || '无特殊要求';
    }
    
    // 处理靶标列表
    const targetsList = document.getElementById('detailTargets');
    if (targetsList && scenario.targets) {
        targetsList.innerHTML = scenario.targets.map(target => `
            <div class="target-item">
                <i class="${getTargetIconClass(target.type)}"></i>
                <span>${target.name}</span>
            </div>
        `).join('');
    }
    
    // 设置按钮数据
    const editBtn = document.querySelector('#scenarioDetailModal .edit-btn');
    const deployBtn = document.querySelector('#scenarioDetailModal .deploy-btn');
    
    if (editBtn) {
        editBtn.dataset.id = scenario.id;
    }
    if (deployBtn) {
        deployBtn.dataset.id = scenario.id;
    }
    
    // 显示模态框
    const modal = document.getElementById('scenarioDetailModal');
    if (modal) {
        modal.style.display = 'block';
    }
}