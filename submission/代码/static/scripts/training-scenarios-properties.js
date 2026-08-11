// 训练场景管理 - 节点属性面板模块

// 当前节点属性
let currentNodeProperties = {};

// 设备类型特定属性配置
const deviceProperties = {
    // 网络设备
    'router': {
        name: '路由器',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-ip', label: '管理IP', type: 'text', placeholder: '192.168.1.1' },
            { id: 'node-interfaces', label: '接口数量', type: 'number', min: 1, max: 48 },
            { id: 'node-routing-protocol', label: '路由协议', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'static', text: '静态路由' },
                { value: 'rip', text: 'RIP' },
                { value: 'ospf', text: 'OSPF' },
                { value: 'bgp', text: 'BGP' }
            ]},
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'switch': {
        name: '交换机',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-ip', label: '管理IP', type: 'text', placeholder: '192.168.1.2' },
            { id: 'node-ports', label: '端口数量', type: 'number', min: 4, max: 48 },
            { id: 'node-vlan-support', label: 'VLAN支持', type: 'checkbox' },
            { id: 'node-spanning-tree', label: '生成树协议', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'stp', text: 'STP' },
                { value: 'rstp', text: 'RSTP' },
                { value: 'mstp', text: 'MSTP' }
            ]},
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'firewall': {
        name: '防火墙',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-ip', label: '管理IP', type: 'text', placeholder: '192.168.1.254' },
            { id: 'node-zones', label: '安全区域', type: 'text', placeholder: 'DMZ, LAN, WAN' },
            { id: 'node-rules-count', label: '防火墙规则数', type: 'number', min: 0 },
            { id: 'node-ips-enabled', label: '启用IPS', type: 'checkbox' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'wireless-ap': {
        name: '无线AP',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-ip', label: '管理IP', type: 'text', placeholder: '192.168.1.100' },
            { id: 'node-ssid', label: 'SSID', type: 'text', placeholder: 'WiFi-Network' },
            { id: 'node-security', label: '安全协议', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'open', text: '开放' },
                { value: 'wep', text: 'WEP' },
                { value: 'wpa', text: 'WPA' },
                { value: 'wpa2', text: 'WPA2' },
                { value: 'wpa3', text: 'WPA3' }
            ]},
            { id: 'node-channel', label: '信道', type: 'number', min: 1, max: 14 },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'load-balancer': {
        name: '负载均衡器',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-ip', label: '管理IP', type: 'text', placeholder: '192.168.1.200' },
            { id: 'node-algorithm', label: '负载均衡算法', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'round-robin', text: '轮询' },
                { value: 'least-connections', text: '最少连接' },
                { value: 'ip-hash', text: 'IP哈希' },
                { value: 'weighted', text: '加权轮询' }
            ]},
            { id: 'node-backend-servers', label: '后端服务器数', type: 'number', min: 1 },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    
    // 服务器类设备
    'webserver': {
        name: 'Web服务器',
        fields: [
            { id: 'node-name', label: '服务器名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.10' },
            { id: 'node-os', label: '操作系统', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'ubuntu', text: 'Ubuntu Server' },
                { value: 'centos', text: 'CentOS' },
                { value: 'windows-server', text: 'Windows Server' },
                { value: 'debian', text: 'Debian' }
            ]},
            { id: 'node-web-server', label: 'Web服务器软件', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'apache', text: 'Apache' },
                { value: 'nginx', text: 'Nginx' },
                { value: 'iis', text: 'IIS' },
                { value: 'tomcat', text: 'Tomcat' }
            ]},
            { id: 'node-ports', label: '开放端口', type: 'text', placeholder: '80, 443, 8080' },
            { id: 'node-applications', label: '部署应用', type: 'text', placeholder: '网站, API服务' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'database': {
        name: '数据库服务器',
        fields: [
            { id: 'node-name', label: '服务器名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.11' },
            { id: 'node-os', label: '操作系统', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'ubuntu', text: 'Ubuntu Server' },
                { value: 'centos', text: 'CentOS' },
                { value: 'windows-server', text: 'Windows Server' }
            ]},
            { id: 'node-db-type', label: '数据库类型', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'mysql', text: 'MySQL' },
                { value: 'postgresql', text: 'PostgreSQL' },
                { value: 'oracle', text: 'Oracle' },
                { value: 'mssql', text: 'SQL Server' },
                { value: 'mongodb', text: 'MongoDB' }
            ]},
            { id: 'node-db-port', label: '数据库端口', type: 'number', placeholder: '3306' },
            { id: 'node-databases', label: '数据库列表', type: 'text', placeholder: 'app_db, user_db' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'fileserver': {
        name: '文件服务器',
        fields: [
            { id: 'node-name', label: '服务器名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.12' },
            { id: 'node-os', label: '操作系统', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'ubuntu', text: 'Ubuntu Server' },
                { value: 'centos', text: 'CentOS' },
                { value: 'windows-server', text: 'Windows Server' }
            ]},
            { id: 'node-file-protocol', label: '文件协议', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'ftp', text: 'FTP' },
                { value: 'sftp', text: 'SFTP' },
                { value: 'smb', text: 'SMB/CIFS' },
                { value: 'nfs', text: 'NFS' }
            ]},
            { id: 'node-storage-size', label: '存储容量(GB)', type: 'number', min: 1 },
            { id: 'node-shares', label: '共享目录', type: 'text', placeholder: 'public, private' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    
    // 终端设备
    'pc': {
        name: 'PC',
        fields: [
            { id: 'node-name', label: '计算机名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.100' },
            { id: 'node-os', label: '操作系统', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'windows-10', text: 'Windows 10' },
                { value: 'windows-11', text: 'Windows 11' },
                { value: 'ubuntu', text: 'Ubuntu Desktop' },
                { value: 'macos', text: 'macOS' }
            ]},
            { id: 'node-user', label: '用户名', type: 'text', placeholder: 'admin' },
            { id: 'node-software', label: '安装软件', type: 'text', placeholder: 'Office, Browser' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'mobile': {
        name: '移动设备',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-device-type', label: '设备类型', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'smartphone', text: '智能手机' },
                { value: 'tablet', text: '平板电脑' },
                { value: 'laptop', text: '笔记本电脑' }
            ]},
            { id: 'node-os', label: '操作系统', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'android', text: 'Android' },
                { value: 'ios', text: 'iOS' },
                { value: 'windows', text: 'Windows' }
            ]},
            { id: 'node-apps', label: '安装应用', type: 'text', placeholder: '微信, 支付宝, 浏览器' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'iot': {
        name: 'IoT设备',
        fields: [
            { id: 'node-name', label: '设备名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.150' },
            { id: 'node-device-type', label: '设备类型', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'camera', text: '摄像头' },
                { value: 'sensor', text: '传感器' },
                { value: 'smart-home', text: '智能家居' },
                { value: 'industrial', text: '工业设备' }
            ]},
            { id: 'node-protocol', label: '通信协议', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'wifi', text: 'WiFi' },
                { value: 'zigbee', text: 'ZigBee' },
                { value: 'bluetooth', text: 'Bluetooth' },
                { value: 'lora', text: 'LoRa' }
            ]},
            { id: 'node-firmware', label: '固件版本', type: 'text', placeholder: 'v1.0.0' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    
    // 攻击设备
    'kali': {
        name: 'Kali Linux',
        fields: [
            { id: 'node-name', label: '主机名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.200' },
            { id: 'node-tools', label: '预装工具', type: 'text', value: 'Nmap, Metasploit, Burp Suite', readonly: true },
            { id: 'node-user', label: '用户名', type: 'text', placeholder: 'kali' },
            { id: 'node-attack-targets', label: '攻击目标', type: 'text', placeholder: '目标IP或域名' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    'parrot': {
        name: 'Parrot OS',
        fields: [
            { id: 'node-name', label: '主机名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.201' },
            { id: 'node-tools', label: '预装工具', type: 'text', value: 'Hydra, SQLmap, Aircrack-ng', readonly: true },
            { id: 'node-user', label: '用户名', type: 'text', placeholder: 'parrot' },
            { id: 'node-attack-targets', label: '攻击目标', type: 'text', placeholder: '目标IP或域名' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    },
    
    // 漏洞靶标
    'vuln': {
        name: '漏洞靶标',
        fields: [
            { id: 'node-name', label: '靶标名称', type: 'text', required: true },
            { id: 'node-ip', label: 'IP地址', type: 'text', placeholder: '192.168.1.50' },
            { id: 'node-vuln-type', label: '漏洞类型', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'sql-injection', text: 'SQL注入' },
                { value: 'xss', text: 'XSS跨站脚本' },
                { value: 'rce', text: '远程代码执行' },
                { value: 'file-upload', text: '文件上传' },
                { value: 'csrf', text: 'CSRF' },
                { value: 'ssrf', text: 'SSRF' }
            ]},
            { id: 'node-difficulty', label: '难度级别', type: 'select', options: [
                { value: '', text: '请选择' },
                { value: 'easy', text: '简单' },
                { value: 'medium', text: '中等' },
                { value: 'hard', text: '困难' }
            ]},
            { id: 'node-ports', label: '开放端口', type: 'text', placeholder: '80, 443' },
            { id: 'node-description', label: '描述', type: 'textarea', rows: 3 }
        ]
    }
};

// 初始化节点属性面板
function initNodePropertiesPanel() {
    const panel = document.getElementById('node-properties-panel');
    if (!panel) return;
    
    // 隐藏面板
    panel.style.display = 'none';
    
    // 添加保存按钮事件监听器
    const saveBtn = document.getElementById('save-node-properties');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveNodeProperties);
    }
    
    // 添加关闭按钮事件监听器
    const closeBtn = document.querySelector('.close-panel-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideNodePropertiesPanel);
    }
    
    // 添加连接模式按钮
    addConnectionModeButton();
}

// 添加连接模式按钮
function addConnectionModeButton() {
    const controls = document.querySelector('.topology-controls');
    if (!controls) return;
    
    // 检查是否已存在按钮
    if (document.getElementById('connectionModeBtn')) return;
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'connectionModeBtn';
    btn.className = 'btn btn-sm btn-outline';
    btn.innerHTML = '<i class="fas fa-link"></i> 连接节点';
    btn.addEventListener('click', toggleConnectionMode);
    
    controls.appendChild(btn);
}

// 显示节点属性面板
function showNodePropertiesPanel(nodeData) {
    // 保存当前节点属性到全局变量
    currentNodeProperties = { ...nodeData };
    
    // 获取属性面板
    const panel = document.getElementById('node-properties-panel');
    const panelBody = panel.querySelector('.panel-body');
    
    // 获取设备类型配置
    const deviceConfig = deviceProperties[nodeData.type] || deviceProperties['pc'];
    
    // 设置面板标题
    document.querySelector('.panel-header h4').textContent = `${deviceConfig.name} 属性设置`;
    
    // 动态生成表单字段
    panelBody.innerHTML = deviceConfig.fields.map(field => {
        return generateFormField(field, nodeData);
    }).join('');
    
    // 显示面板
    panel.style.display = 'block';
}

// 生成表单字段
function generateFormField(field, nodeData) {
    const value = nodeData[field.id.replace('node-', '')] || field.value || '';
    
    let fieldHtml = `<div class="form-group">
        <label for="${field.id}">${field.label}${field.required ? ' *' : ''}</label>`;
    
    switch (field.type) {
        case 'text':
        case 'number':
            fieldHtml += `<input type="${field.type}" id="${field.id}" class="form-control" 
                value="${value}" placeholder="${field.placeholder || ''}" 
                ${field.min ? `min="${field.min}"` : ''} 
                ${field.max ? `max="${field.max}"` : ''}
                ${field.readonly ? 'readonly' : ''}>`;
            break;
            
        case 'textarea':
            fieldHtml += `<textarea id="${field.id}" class="form-control" 
                rows="${field.rows || 3}" placeholder="${field.placeholder || ''}">${value}</textarea>`;
            break;
            
        case 'select':
            fieldHtml += `<select id="${field.id}" class="form-control">`;
            field.options.forEach(option => {
                const selected = value === option.value ? 'selected' : '';
                fieldHtml += `<option value="${option.value}" ${selected}>${option.text}</option>`;
            });
            fieldHtml += `</select>`;
            break;
            
        case 'checkbox':
            const checked = value === true || value === 'true' ? 'checked' : '';
            fieldHtml += `<div class="checkbox-wrapper">
                <input type="checkbox" id="${field.id}" ${checked}>
                <label for="${field.id}" class="checkbox-label">启用</label>
            </div>`;
            break;
    }
    
    fieldHtml += `</div>`;
    return fieldHtml;
}

// 隐藏节点属性面板
function hideNodePropertiesPanel() {
    const panel = document.getElementById('node-properties-panel');
    panel.style.display = 'none';
    currentNodeProperties = {};
}

// 保存节点属性
function saveNodeProperties() {
    if (!selectedNode) return;
    
    // 获取节点ID
    const nodeId = selectedNode.id;
    
    // 查找节点索引
    const nodeIndex = topologyNodes.findIndex(n => n.id === nodeId);
    if (nodeIndex === -1) return;
    
    // 获取设备类型配置
    const deviceConfig = deviceProperties[topologyNodes[nodeIndex].type] || deviceProperties['pc'];
    
    // 验证必填字段
    for (const field of deviceConfig.fields) {
        if (field.required) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                showNotification(`请填写${field.label}`, 'error');
                element?.focus();
                return;
            }
        }
    }
    
    // 收集表单数据
    const updatedData = { ...topologyNodes[nodeIndex] };
    
    deviceConfig.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            const key = field.id.replace('node-', '');
            if (field.type === 'checkbox') {
                updatedData[key] = element.checked;
            } else if (field.type === 'number') {
                updatedData[key] = element.value ? parseInt(element.value) : null;
            } else {
                updatedData[key] = element.value;
            }
        }
    });
    
    // 更新节点数据
    topologyNodes[nodeIndex] = updatedData;
    
    // 更新节点显示名称
    const nameElement = selectedNode.querySelector('span');
    if (nameElement) {
        nameElement.textContent = updatedData.name || getTargetName(updatedData.type, updatedData.targetId);
    }
    
    // 提示保存成功
    showNotification('节点属性已保存', 'success');
    
    // 隐藏属性面板
    hideNodePropertiesPanel();
}