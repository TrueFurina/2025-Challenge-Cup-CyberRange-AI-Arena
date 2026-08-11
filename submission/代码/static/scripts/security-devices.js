// 安全设备模拟数据
const securityDevices = [
    {
        id: 1,
        name: 'IDS-Sensor-01',
        type: 'ids',
        vendor: 'Snort',
        ip: '192.168.100.10',
        status: 'active',
        threatLevel: 'medium',
        ports: '80,443,22,3389',
        location: 'DMZ区域',
        description: 'Snort入侵检测系统，监控网络流量异常',
        lastDetection: '2024-01-20 16:45:00',
        alertCount: 156,
        detectionRules: 2847,
        vulnerabilities: ['规则库过期', '误报率高', '性能瓶颈']
    },
    {
        id: 2,
        name: 'IPS-Gateway-01',
        type: 'ips',
        vendor: 'Suricata',
        ip: '192.168.100.20',
        status: 'active',
        threatLevel: 'high',
        ports: '所有端口',
        location: '内网边界',
        description: 'Suricata入侵防护系统，实时阻断恶意流量',
        lastDetection: '2024-01-20 17:20:00',
        alertCount: 89,
        detectionRules: 3521,
        vulnerabilities: ['绕过技术', '加密流量检测不足']
    },
    {
        id: 3,
        name: 'WAF-Protection-01',
        type: 'waf',
        vendor: 'ModSecurity',
        ip: '192.168.100.30',
        status: 'active',
        threatLevel: 'low',
        ports: '80,443,8080,8443',
        location: 'Web服务器前端',
        description: 'ModSecurity Web应用防火墙，防护Web应用攻击',
        lastDetection: '2024-01-20 15:30:00',
        alertCount: 234,
        detectionRules: 1256,
        vulnerabilities: ['SQL注入绕过', 'XSS过滤不完善', '规则配置错误']
    },
    {
        id: 4,
        name: 'Honeypot-Trap-01',
        type: 'honeypot',
        vendor: 'Cowrie',
        ip: '192.168.100.40',
        status: 'inactive',
        threatLevel: 'info',
        ports: '22,23,80,443',
        location: '隔离网段',
        description: 'Cowrie SSH/Telnet蜜罐，诱捕攻击者',
        lastDetection: '2024-01-19 22:15:00',
        alertCount: 45,
        detectionRules: 0,
        vulnerabilities: ['容易被识别', '交互性不足', '日志分析滞后']
    },
    {
        id: 5,
        name: 'AntiVirus-Gateway-01',
        type: 'antivirus',
        vendor: 'ClamAV',
        ip: '192.168.100.50',
        status: 'alert',
        threatLevel: 'high',
        ports: '25,110,143,993,995',
        location: '邮件服务器',
        description: 'ClamAV防病毒网关，扫描邮件和文件传输',
        lastDetection: '2024-01-20 18:00:00',
        alertCount: 12,
        detectionRules: 8945621,
        vulnerabilities: ['病毒库更新延迟', '零日攻击检测不足', '加密文件扫描限制']
    },
    {
        id: 6,
        name: 'SIEM-Collector-01',
        type: 'siem',
        vendor: 'ELK Stack',
        ip: '192.168.100.60',
        status: 'maintenance',
        threatLevel: 'medium',
        ports: '9200,5601,5044',
        location: '安全运营中心',
        description: 'ELK安全信息与事件管理系统',
        lastDetection: '2024-01-20 12:00:00',
        alertCount: 1024,
        detectionRules: 456,
        vulnerabilities: ['存储空间不足', '查询性能下降', '告警规则不完善']
    }
];

// 分页相关变量
let currentPage = 1;
const itemsPerPage = 10;
let filteredDevices = [...securityDevices];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderDeviceTable();
    updatePaginationInfo();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // 筛选功能
    document.getElementById('typeFilter').addEventListener('change', handleFilter);
    document.getElementById('statusFilter').addEventListener('change', handleFilter);
    
    // 全选功能
    document.getElementById('selectAll').addEventListener('change', handleSelectAll);
    
    // 添加设备按钮
    document.getElementById('addDeviceBtn').addEventListener('click', () => {
        document.getElementById('addDeviceModal').style.display = 'block';
    });
    
    // 关闭模态框
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('addDeviceModal').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('addDeviceModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 提交添加设备表单
    document.getElementById('addDeviceForm').addEventListener('submit', handleAddDevice);
}

// 搜索功能
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredDevices = securityDevices.filter(device => 
        device.name.toLowerCase().includes(searchTerm) ||
        device.vendor.toLowerCase().includes(searchTerm) ||
        device.ip.includes(searchTerm) ||
        device.location.toLowerCase().includes(searchTerm) ||
        device.description.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderDeviceTable();
    updatePaginationInfo();
}

// 筛选功能
function handleFilter() {
    const typeFilter = document.getElementById('typeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    filteredDevices = securityDevices.filter(device => {
        const typeMatch = !typeFilter || device.type === typeFilter;
        const statusMatch = !statusFilter || device.status === statusFilter;
        return typeMatch && statusMatch;
    });
    
    currentPage = 1;
    renderDeviceTable();
    updatePaginationInfo();
}

// 全选功能
function handleSelectAll(event) {
    const checkboxes = document.querySelectorAll('#deviceTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
}

// 渲染设备表格
function renderDeviceTable() {
    const tbody = document.getElementById('deviceTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDevices = filteredDevices.slice(startIndex, endIndex);
    
    tbody.innerHTML = currentDevices.map(device => `
        <tr>
            <td><input type="checkbox" value="${device.id}"></td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar">
                        <i class="${getDeviceIcon(device.type)}"></i>
                    </div>
                    <div class="user-details">
                        <h4>${device.name}</h4>
                        <p>${device.vendor}</p>
                        <small>${device.location}</small>
                    </div>
                </div>
            </td>
            <td>
                <div class="device-type-badge ${device.type}">
                    <i class="${getDeviceIcon(device.type)}"></i>
                    ${getTypeText(device.type)}
                </div>
            </td>
            <td><code>${device.ip}</code></td>
            <td><span class="status-badge ${device.status}">${getStatusText(device.status)}</span></td>
            <td>
                <div class="threat-level ${device.threatLevel}">
                    <i class="${getThreatIcon(device.threatLevel)}"></i>
                    <span>${getThreatText(device.threatLevel)}</span>
                </div>
            </td>
            <td>${device.lastDetection}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="viewAlerts(${device.id})" title="查看告警">
                        <i class="fas fa-exclamation-triangle"></i>
                    </button>
                    <button class="btn-icon" onclick="configureRules(${device.id})" title="配置规则">
                        <i class="fas fa-cogs"></i>
                    </button>
                    <button class="btn-icon" onclick="updateSignatures(${device.id})" title="更新特征库">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-icon" onclick="editDevice(${device.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteDevice(${device.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取设备图标
function getDeviceIcon(type) {
    const iconMap = {
        'ids': 'fas fa-eye',
        'ips': 'fas fa-shield-alt',
        'waf': 'fas fa-globe',
        'honeypot': 'fas fa-spider',
        'antivirus': 'fas fa-virus-slash',
        'siem': 'fas fa-chart-bar'
    };
    return iconMap[type] || 'fas fa-server';
}

// 获取设备类型文本
function getTypeText(type) {
    const typeMap = {
        'ids': '入侵检测',
        'ips': '入侵防护',
        'waf': 'Web防火墙',
        'honeypot': '蜜罐系统',
        'antivirus': '防病毒',
        'siem': '安全管理'
    };
    return typeMap[type] || type;
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'active': '活跃',
        'inactive': '非活跃',
        'alert': '告警',
        'maintenance': '维护中'
    };
    return statusMap[status] || status;
}

// 获取威胁等级图标
function getThreatIcon(level) {
    const iconMap = {
        'low': 'fas fa-circle',
        'medium': 'fas fa-exclamation-circle',
        'high': 'fas fa-exclamation-triangle',
        'critical': 'fas fa-skull-crossbones',
        'info': 'fas fa-info-circle'
    };
    return iconMap[level] || 'fas fa-circle';
}

// 获取威胁等级文本
function getThreatText(level) {
    const levelMap = {
        'low': '低',
        'medium': '中',
        'high': '高',
        'critical': '严重',
        'info': '信息'
    };
    return levelMap[level] || level;
}

// 更新分页信息
function updatePaginationInfo() {
    const totalItems = filteredDevices.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('startItem').textContent = startItem;
    document.getElementById('endItem').textContent = endItem;
    document.getElementById('totalItems').textContent = totalItems;
}

// 添加设备
function handleAddDevice(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newDevice = {
        id: securityDevices.length + 1,
        name: formData.get('deviceName'),
        type: formData.get('deviceType'),
        vendor: formData.get('deviceVendor'),
        ip: formData.get('deviceIP'),
        status: 'inactive',
        threatLevel: 'info',
        ports: formData.get('devicePort'),
        location: formData.get('deviceLocation'),
        description: formData.get('deviceDescription'),
        lastDetection: new Date().toLocaleString('zh-CN'),
        alertCount: 0,
        detectionRules: 0,
        vulnerabilities: []
    };
    
    securityDevices.push(newDevice);
    filteredDevices = [...securityDevices];
    renderDeviceTable();
    updatePaginationInfo();
    
    // 关闭模态框并重置表单
    document.getElementById('addDeviceModal').style.display = 'none';
    event.target.reset();
    
    alert('安全设备添加成功！');
}

// 查看告警
function viewAlerts(id) {
    const device = securityDevices.find(d => d.id === id);
    if (device) {
        alert(`设备 "${device.name}" 告警信息:\n\n告警数量: ${device.alertCount}\n威胁等级: ${getThreatText(device.threatLevel)}\n最后检测: ${device.lastDetection}\n检测规则: ${device.detectionRules}`);
        // 这里可以打开告警详情页面
    }
}

// 配置规则
function configureRules(id) {
    const device = securityDevices.find(d => d.id === id);
    if (device) {
        alert(`配置设备 "${device.name}" 的检测规则`);
        // 这里可以打开规则配置页面
    }
}

// 更新特征库
function updateSignatures(id) {
    const device = securityDevices.find(d => d.id === id);
    if (device) {
        if (confirm(`确定要更新设备 "${device.name}" 的特征库吗？`)) {
            device.lastDetection = new Date().toLocaleString('zh-CN');
            device.detectionRules += Math.floor(Math.random() * 100) + 50;
            renderDeviceTable();
            alert(`设备 "${device.name}" 特征库更新完成！\n新增规则: ${Math.floor(Math.random() * 100) + 50} 条`);
        }
    }
}

// 编辑设备
function editDevice(id) {
    const device = securityDevices.find(d => d.id === id);
    if (device) {
        alert(`编辑安全设备 "${device.name}"`);
        // 这里可以打开编辑设备模态框
    }
}

// 删除设备
function deleteDevice(id) {
    if (confirm('确定要删除这个安全设备吗？此操作不可恢复！')) {
        const index = securityDevices.findIndex(d => d.id === id);
        if (index !== -1) {
            const device = securityDevices[index];
            securityDevices.splice(index, 1);
            filteredDevices = [...securityDevices];
            renderDeviceTable();
            updatePaginationInfo();
            alert(`安全设备 "${device.name}" 已删除！`);
        }
    }
}

// 关闭添加设备模态框
function closeAddDeviceModal() {
    document.getElementById('addDeviceModal').style.display = 'none';
}