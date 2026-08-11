// 训练场景管理 - 拓扑设计模块

// 拓扑设计模块

// 拓扑相关全局变量
let topologyNodes = [];
let topologyConnectors = [];
let selectedNode = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isConnectingMode = false;
let connectionStartNode = null;

// 初始化拓扑模块
function initTopology() {
    initializeDragAndDrop();
    
    // 添加清空按钮事件监听器
    const clearBtn = document.getElementById('clearTopologyBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearTopology);
    }
    
    // 添加自动布局按钮事件监听器
    const autoLayoutBtn = document.getElementById('autoLayoutBtn');
    if (autoLayoutBtn) {
        autoLayoutBtn.addEventListener('click', autoLayoutTopology);
    }
    
    // 绑定连线规则面板切换事件
    const toggleRulesBtn = document.getElementById('toggleRulesBtn');
    if (toggleRulesBtn) {
        toggleRulesBtn.addEventListener('click', toggleConnectionRulesPanel);
    }
    
    // 添加画布点击事件（取消选择节点）
    const dropzone = document.getElementById('topology-dropzone');
    if (dropzone) {
        dropzone.addEventListener('click', function(e) {
            if (e.target === dropzone || e.target.classList.contains('dropzone-placeholder')) {
                deselectAllNodes();
            }
        });
    }
}

// 设备类型连接规则
const connectionRules = {
    // 网络设备可以连接的设备类型
    'router': ['router', 'switch', 'firewall', 'webserver', 'database', 'fileserver', 'pc', 'vuln', 'kali', 'parrot', 'blackarch', 'pentoo', 'backbox', 'deft'],
    'switch': ['router', 'switch', 'firewall', 'webserver', 'database', 'fileserver', 'pc', 'iot', 'vuln', 'kali', 'parrot', 'blackarch', 'pentoo', 'backbox', 'deft'],
    'firewall': ['router', 'switch', 'webserver', 'database', 'fileserver', 'vuln'],
    'wireless-ap': ['switch', 'router', 'pc', 'mobile', 'iot', 'kali', 'parrot', 'blackarch', 'pentoo', 'backbox', 'deft'],
    'load-balancer': ['router', 'switch', 'webserver', 'vuln'],
    
    // 服务器类设备
    'webserver': ['router', 'switch', 'firewall', 'load-balancer', 'database', 'vuln'],
    'database': ['router', 'switch', 'firewall', 'webserver', 'vuln'],
    'fileserver': ['router', 'switch', 'firewall', 'vuln'],
    
    // 终端设备
    'pc': ['router', 'switch', 'wireless-ap'],
    'mobile': ['wireless-ap'],
    'iot': ['switch', 'wireless-ap'],
    
    // 攻击设备可以连接网络设备和靶标
    'kali': ['router', 'switch', 'wireless-ap', 'webserver', 'database', 'fileserver', 'vuln'],
    'parrot': ['router', 'switch', 'wireless-ap', 'webserver', 'database', 'fileserver', 'vuln'],
    'blackarch': ['router', 'switch', 'wireless-ap', 'webserver', 'database', 'fileserver', 'vuln'],
    'pentoo': ['router', 'switch', 'wireless-ap', 'webserver', 'database', 'fileserver', 'vuln'],
    'backbox': ['router', 'switch', 'wireless-ap', 'webserver', 'database', 'fileserver', 'vuln'],
    'deft': ['router', 'switch', 'wireless-ap', 'webserver', 'database', 'fileserver', 'vuln'],
    
    // 漏洞靶标可以连接到网络设备、服务器和攻击设备
    'vuln': ['router', 'switch', 'firewall', 'webserver', 'database', 'fileserver', 'load-balancer', 'kali', 'parrot', 'blackarch', 'pentoo', 'backbox', 'deft']
};

// 初始化拖拽功能
function initializeDragAndDrop() {
    const dropzone = document.getElementById('topology-dropzone');
    if (!dropzone) return;
    
    // 为拖拽项添加事件监听器
    const draggableItems = document.querySelectorAll('.target-item-draggable');
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
    });
    
    // 为放置区域添加事件监听器
    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('dragenter', handleDragEnter);
    dropzone.addEventListener('dragleave', handleDragLeave);
    dropzone.addEventListener('drop', handleDrop);
    
    // 点击空白区域取消选择
    dropzone.addEventListener('click', (e) => {
        if (e.target === dropzone) {
            if (isConnectingMode && connectionStartNode) {
                // 取消连接模式
                cancelConnectionMode();
            } else {
                deselectAllNodes();
            }
        }
    });
}

// 处理拖拽开始
function handleDragStart(e) {
    const targetType = e.target.dataset.targetType;
    const targetId = e.target.dataset.targetId;
    
    e.dataTransfer.setData('text/plain', JSON.stringify({
        type: targetType,
        id: targetId
    }));
}

// 处理拖拽悬停
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
}

// 处理拖拽进入
function handleDragEnter(e) {
    e.preventDefault();
    const dropzone = document.getElementById('topology-dropzone');
    dropzone.classList.add('drag-over');
}

// 处理拖拽离开
function handleDragLeave(e) {
    e.preventDefault();
    const dropzone = document.getElementById('topology-dropzone');
    if (!dropzone.contains(e.relatedTarget)) {
        dropzone.classList.remove('drag-over');
    }
}

// 处理放置
function handleDrop(e) {
    e.preventDefault();
    const dropzone = document.getElementById('topology-dropzone');
    dropzone.classList.remove('drag-over');
    
    try {
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const rect = dropzone.getBoundingClientRect();
        const x = e.clientX - rect.left - 40; // 减去节点宽度的一半
        const y = e.clientY - rect.top - 40;  // 减去节点高度的一半
        
        createTopologyNode(data.type, data.id, x, y);
    } catch (error) {
        console.error('处理放置数据时出错:', error);
    }
}

// 创建拓扑节点
function createTopologyNode(type, targetId, x, y, customNodeId = null) {
    // 如果提供了自定义ID，使用它；否则生成随机ID
    const nodeId = customNodeId || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 处理攻击设备类型映射
    let actualType = type;
    if (type === 'attack') {
        actualType = targetId; // 使用具体的攻击设备ID作为类型
    }
    
    const nodeData = {
        id: nodeId,
        type: actualType,
        targetId: targetId,
        name: getTargetName(actualType, targetId),
        x: Math.max(0, x),
        y: Math.max(0, y),
        ip: '',
        description: '',
        os: '',
        services: ''
    };
    
    topologyNodes.push(nodeData);
    const createdNode = addNodeToTopology(nodeData);
    
    // 隐藏占位符
    const placeholder = document.querySelector('.dropzone-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
    // 返回创建的节点元素和节点数据
    return { element: createdNode, data: nodeData };
}

// 添加节点到拓扑
function addNodeToTopology(nodeData) {
    const dropzone = document.getElementById('topology-dropzone');
    const node = document.createElement('div');
    
    node.id = nodeData.id;
    node.className = 'topology-node';
    node.style.left = `${nodeData.x}px`;
    node.style.top = `${nodeData.y}px`;
    
    node.innerHTML = `
        <i class="${getTargetIconClass(nodeData.type, nodeData.targetId)}"></i>
        <span>${nodeData.name}</span>
    `;
    
    // 添加事件监听器
    node.addEventListener('mousedown', handleNodeMouseDown);
    node.addEventListener('click', handleNodeClick);
    
    dropzone.appendChild(node);
    
    return node;
}

// 处理节点鼠标按下事件
function handleNodeMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (isConnectingMode) {
        // 在连接模式下，直接处理连接逻辑
        handleConnectionClick(e.currentTarget);
        return;
    }
    
    const node = e.currentTarget;
    selectedNode = node;
    isDragging = true;
    
    // 计算偏移量
    const rect = node.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    // 添加鼠标移动和松开事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// 处理鼠标移动事件
function handleMouseMove(e) {
    if (!isDragging || !selectedNode) return;
    
    // 获取放置区域
    const dropzone = document.getElementById('topology-dropzone');
    const rect = dropzone.getBoundingClientRect();
    
    // 计算新位置（相对于dropzone）
    let x = e.clientX - rect.left - dragOffsetX;
    let y = e.clientY - rect.top - dragOffsetY;
    
    // 限制在放置区域内
    x = Math.max(0, Math.min(x, rect.width - selectedNode.offsetWidth));
    y = Math.max(0, Math.min(y, rect.height - selectedNode.offsetHeight));
    
    // 更新节点位置
    selectedNode.style.left = `${x}px`;
    selectedNode.style.top = `${y}px`;
    
    // 更新节点对象
    const nodeIndex = topologyNodes.findIndex(n => n.id === selectedNode.id);
    if (nodeIndex !== -1) {
        topologyNodes[nodeIndex].x = x;
        topologyNodes[nodeIndex].y = y;
    }
    
    // 更新连接线
    updateConnectors();
}

// 处理鼠标松开事件
function handleMouseUp() {
    isDragging = false;
    
    // 移除事件监听器
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

// 处理节点点击事件
function handleNodeClick(e) {
    e.stopPropagation();
    
    if (isConnectingMode) {
        e.preventDefault();
        e.stopPropagation();
        return; // 连接模式下由mousedown处理
    }
    
    // 取消选择所有节点
    deselectAllNodes();
    
    // 选择当前节点
    const node = e.currentTarget;
    node.classList.add('selected');
    selectedNode = node;
    
    // 获取节点ID
    const nodeId = node.id;
    
    // 查找节点数据
    const nodeData = topologyNodes.find(n => n.id === nodeId);
    if (!nodeData) return;
    
    // 显示属性面板
    showNodePropertiesPanel(nodeData);
}

// 取消选择所有节点
function deselectAllNodes() {
    const nodes = document.querySelectorAll('.topology-node');
    nodes.forEach(node => {
        node.classList.remove('selected', 'connection-start', 'connection-candidate');
    });
    selectedNode = null;
    
    // 隐藏属性面板
    hideNodePropertiesPanel();
}

// 连接模式相关函数
function toggleConnectionMode() {
    isConnectingMode = !isConnectingMode;
    const btn = document.getElementById('connectionModeBtn');
    
    if (isConnectingMode) {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-times"></i> 取消连接';
        showNotification('连接模式已启用，点击两个节点进行连接', 'info');
    } else {
        cancelConnectionMode();
    }
}

// 取消连接模式
function cancelConnectionMode() {
    isConnectingMode = false;
    connectionStartNode = null;
    
    const btn = document.getElementById('connectionModeBtn');
    if (btn) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-link"></i> 连接节点';
    }
    
    // 清除连接相关的样式
    const nodes = document.querySelectorAll('.topology-node');
    nodes.forEach(node => {
        node.classList.remove('connection-start', 'connection-candidate');
    });
}

// 处理连接点击
function handleConnectionClick(node) {
    if (!connectionStartNode) {
        // 选择起始节点
        connectionStartNode = node;
        node.classList.add('connection-start');
        
        // 高亮可连接的节点
        highlightConnectableNodes(node);
        showNotification('请选择要连接的目标节点', 'info');
    } else if (connectionStartNode === node) {
        // 取消选择起始节点
        cancelConnectionMode();
    } else {
        // 尝试创建连接
        createConnection(connectionStartNode, node);
        cancelConnectionMode();
    }
}

// 高亮可连接的节点
function highlightConnectableNodes(startNode) {
    const startNodeData = topologyNodes.find(n => n.id === startNode.id);
    if (!startNodeData) return;
    
    const nodes = document.querySelectorAll('.topology-node');
    nodes.forEach(node => {
        if (node === startNode) return;
        
        const nodeData = topologyNodes.find(n => n.id === node.id);
        if (nodeData && canConnect(startNodeData.type, nodeData.type)) {
            node.classList.add('connection-candidate');
        }
    });
}

// 检查两个设备类型是否可以连接
function canConnect(type1, type2) {
    const rules1 = connectionRules[type1] || [];
    const rules2 = connectionRules[type2] || [];
    
    return rules1.includes(type2) || rules2.includes(type1);
}

// 创建连接
function createConnection(node1, node2) {
    const nodeData1 = topologyNodes.find(n => n.id === node1.id);
    const nodeData2 = topologyNodes.find(n => n.id === node2.id);
    
    if (!nodeData1 || !nodeData2) {
        showNotification('无法找到节点数据', 'error');
        return;
    }
    
    // 检查连接规则
    if (!canConnect(nodeData1.type, nodeData2.type)) {
        showNotification(`${getTargetName(nodeData1.type)} 无法连接到 ${getTargetName(nodeData2.type)}`, 'error');
        return;
    }
    
    // 检查是否已存在连接
    const existingConnection = topologyConnectors.find(conn => 
        (conn.source === node1.id && conn.target === node2.id) ||
        (conn.source === node2.id && conn.target === node1.id)
    );
    
    if (existingConnection) {
        showNotification('节点之间已存在连接', 'warning');
        return;
    }
    
    // 创建连接
    const connectorId = `connector-${node1.id}-${node2.id}`;
    const connector = {
        id: connectorId,
        source: node1.id,
        target: node2.id,
        type: getConnectionType(nodeData1.type, nodeData2.type)
    };
    
    topologyConnectors.push(connector);
    
    // 更新连接线显示
    updateConnectors();
    showNotification('连接创建成功', 'success');
}

// 获取连接类型
function getConnectionType(type1, type2) {
    // 根据设备类型确定连接类型
    if ((type1 === 'router' && type2 === 'router') || 
        (type1 === 'switch' && type2 === 'switch')) {
        return 'trunk';
    } else if (type1.includes('wireless') || type2.includes('wireless') ||
               type1 === 'mobile' || type2 === 'mobile') {
        return 'wireless';
    } else {
        return 'ethernet';
    }
}

// 更新连接线
function updateConnectors() {
    // 清除现有连接线
    const dropzone = document.getElementById('topology-dropzone');
    const oldConnectors = dropzone.querySelectorAll('.topology-connector');
    oldConnectors.forEach(connector => connector.remove());
    
    // 重新绘制所有连接线
    topologyConnectors.forEach(connector => {
        drawConnector(connector);
    });
}

// 绘制连接线
function drawConnector(connector) {
    const node1 = document.getElementById(connector.source);
    const node2 = document.getElementById(connector.target);
    const dropzone = document.getElementById('topology-dropzone');
    
    if (!node1 || !node2 || !dropzone) return;
    
    // 获取节点数据
    const nodeData1 = topologyNodes.find(n => n.id === connector.source);
    const nodeData2 = topologyNodes.find(n => n.id === connector.target);
    
    // 计算节点中心点
    const x1 = nodeData1.x + 40; // 节点宽度的一半
    const y1 = nodeData1.y + 40; // 节点高度的一半
    const x2 = nodeData2.x + 40;
    const y2 = nodeData2.y + 40;
    
    // 创建连接线元素
    const line = document.createElement('div');
    line.id = connector.id;
    line.className = `topology-connector ${connector.type || 'ethernet'}`;
    
    // 计算连接线长度和角度
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    // 设置连接线样式
    line.style.width = `${length}px`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.transformOrigin = '0 50%';
    
    // 添加删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'connector-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.style.left = `${length / 2}px`;
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteConnection(connector.id);
    };
    
    line.appendChild(deleteBtn);
    dropzone.appendChild(line);
}

// 删除连接
function deleteConnection(connectorId) {
    // 从数组中移除
    const index = topologyConnectors.findIndex(conn => conn.id === connectorId);
    if (index !== -1) {
        topologyConnectors.splice(index, 1);
    }
    
    // 从DOM中移除
    const element = document.getElementById(connectorId);
    if (element) {
        element.remove();
    }
    
    showNotification('连接已删除', 'info');
}

// 清空拓扑
function clearTopology() {
    // 清空节点列表
    topologyNodes = [];
    topologyConnectors = [];
    
    // 清空DOM
    const dropzone = document.getElementById('topology-dropzone');
    const nodes = dropzone.querySelectorAll('.topology-node');
    const connectors = dropzone.querySelectorAll('.topology-connector');
    
    nodes.forEach(node => node.remove());
    connectors.forEach(connector => connector.remove());
    
    // 显示占位符
    const placeholder = document.querySelector('.dropzone-placeholder');
    if (placeholder) {
        placeholder.style.display = 'flex';
    }
    
    // 取消连接模式
    if (isConnectingMode) {
        cancelConnectionMode();
    }
}

// 自动布局拓扑
function autoLayoutTopology() {
    if (topologyNodes.length === 0) {
        showNotification('没有节点需要布局', 'warning');
        return;
    }
    
    const dropzone = document.getElementById('topology-dropzone');
    const rect = dropzone.getBoundingClientRect();
    const padding = 50;
    const nodeSize = 80;
    
    // 计算网格布局
    const cols = Math.ceil(Math.sqrt(topologyNodes.length));
    const rows = Math.ceil(topologyNodes.length / cols);
    
    const availableWidth = rect.width - 2 * padding;
    const availableHeight = rect.height - 2 * padding;
    
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    
    topologyNodes.forEach((nodeData, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const x = padding + col * cellWidth + (cellWidth - nodeSize) / 2;
        const y = padding + row * cellHeight + (cellHeight - nodeSize) / 2;
        
        nodeData.x = x;
        nodeData.y = y;
        
        const nodeElement = document.getElementById(nodeData.id);
        if (nodeElement) {
            nodeElement.style.left = `${x}px`;
            nodeElement.style.top = `${y}px`;
        }
    });
    
    // 更新连接线
    updateConnectors();
    showNotification('自动布局完成', 'success');
}

// 切换连线规则面板
function toggleConnectionRulesPanel() {
    const panel = document.querySelector('.connection-rules-panel');
    const toggleBtn = document.getElementById('toggleRulesBtn');
    const icon = toggleBtn.querySelector('i');
    
    if (panel.classList.contains('collapsed')) {
        panel.classList.remove('collapsed');
        icon.className = 'fas fa-chevron-right';
    } else {
        panel.classList.add('collapsed');
        icon.className = 'fas fa-chevron-down';
    }
}