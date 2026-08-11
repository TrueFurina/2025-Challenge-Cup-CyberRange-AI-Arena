// 网络设备模拟数据
const networkDevices = [
    {
        id: 1,
        name: 'Core-Router-01',
        type: 'router',
        model: 'Cisco ISR 4331',
        ip: '192.168.1.1',
        status: 'online',
        ports: 4,
        location: '机房A-机柜1',
        description: '核心路由器，负责内外网连接',
        lastUpdate: '2024-01-20 15:30:00',
        uptime: '45天12小时',
        vulnerabilities: ['默认密码', '固件过期', 'SNMP配置错误']
    },
    {
        id: 2,
        name: 'Access-Switch-01',
        type: 'switch',
        model: 'Cisco Catalyst 2960',
        ip: '192.168.1.10',
        status: 'online',
        ports: 24,
        location: '机房A-机柜2',
        description: '接入层交换机，连接终端设备',
        lastUpdate: '2024-01-20 14:45:00',
        uptime: '30天8小时',
        vulnerabilities: ['VLAN配置错误', 'STP配置问题']
    },
    {
        id: 3,
        name: 'Firewall-01',
        type: 'firewall',
        model: 'Fortinet FortiGate 60F',
        ip: '192.168.1.254',
        status: 'online',
        ports: 8,
        location: '机房A-机柜1',
        description: '边界防火墙，网络安全防护',
        lastUpdate: '2024-01-20 16:00:00',
        uptime: '60天3小时',
        vulnerabilities: ['规则配置过于宽松', 'IPS签名过期']
    },
    {
        id: 4,
        name: 'WiFi-AP-01',
        type: 'ap',
        model: 'Ubiquiti UniFi AP AC Pro',
        ip: '192.168.1.100',
        status: 'offline',
        ports: 2,
        location: '办公区域-天花板',
        description: '无线接入点，提供WiFi服务',
        lastUpdate: '2024-01-19 10:20:00',
        uptime: '0天0小时',
        vulnerabilities: ['WPA2配置错误', '固件漏洞', '弱加密']
    },
    {
        id: 5,
        name: 'Distribution-Switch-01',
        type: 'switch',
        model: 'Cisco Catalyst 3750',
        ip: '192.168.1.20',
        status: 'maintenance',
        ports: 48,
        location: '机房B-机柜1',
        description: '汇聚层交换机，连接多个接入交换机',
        lastUpdate: '2024-01-20 09:15:00',
        uptime: '0天0小时',
        vulnerabilities: ['端口安全未配置', 'DHCP Snooping未启用']
    },
    {
        id: 6,
        name: 'Edge-Router-02',
        type: 'router',
        model: 'Juniper SRX300',
        ip: '10.0.0.1',
        status: 'online',
        ports: 8,
        location: '机房B-机柜2',
        description: '边缘路由器，分支机构连接',
        lastUpdate: '2024-01-20 13:40:00',
        uptime: '25天16小时',
        vulnerabilities: ['BGP配置错误', '访问控制列表过时']
    }
];

// 分页相关变量
let currentPage = 1;
const itemsPerPage = 10;
let filteredDevices = [...networkDevices];

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
    filteredDevices = networkDevices.filter(device => 
        device.name.toLowerCase().includes(searchTerm) ||
        device.model.toLowerCase().includes(searchTerm) ||
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
    
    filteredDevices = networkDevices.filter(device => {
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
                        <p>${device.model}</p>
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
                <div class="port-info">
                    <i class="fas fa-ethernet"></i>
                    <span>${device.ports} 端口</span>
                </div>
            </td>
            <td>${device.lastUpdate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="configureDevice(${device.id})" title="配置">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="btn-icon" onclick="monitorDevice(${device.id})" title="监控">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="btn-icon" onclick="rebootDevice(${device.id})" title="重启">
                        <i class="fas fa-power-off"></i>
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
        'router': 'fas fa-route',
        'switch': 'fas fa-network-wired',
        'firewall': 'fas fa-shield-alt',
        'ap': 'fas fa-wifi'
    };
    return iconMap[type] || 'fas fa-server';
}

// 获取设备类型文本
function getTypeText(type) {
    const typeMap = {
        'router': '路由器',
        'switch': '交换机',
        'firewall': '防火墙',
        'ap': '无线接入点'
    };
    return typeMap[type] || type;
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'online': '在线',
        'offline': '离线',
        'maintenance': '维护中'
    };
    return statusMap[status] || status;
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
        id: networkDevices.length + 1,
        name: formData.get('deviceName'),
        type: formData.get('deviceType'),
        model: formData.get('deviceModel'),
        ip: formData.get('deviceIP'),
        status: 'offline',
        ports: parseInt(formData.get('devicePorts')),
        location: formData.get('deviceLocation'),
        description: formData.get('deviceDescription'),
        lastUpdate: new Date().toLocaleString('zh-CN'),
        uptime: '0天0小时',
        vulnerabilities: []
    };
    
    networkDevices.push(newDevice);
    filteredDevices = [...networkDevices];
    renderDeviceTable();
    updatePaginationInfo();
    
    // 关闭模态框并重置表单
    document.getElementById('addDeviceModal').style.display = 'none';
    event.target.reset();
    
    alert('设备添加成功！');
}

// 配置设备
function configureDevice(id) {
    const device = networkDevices.find(d => d.id === id);
    if (device) {
        alert(`配置设备 "${device.name}"`);
        // 这里可以打开设备配置页面或模态框
    }
}

// 监控设备
function monitorDevice(id) {
    const device = networkDevices.find(d => d.id === id);
    if (device) {
        alert(`监控设备 "${device.name}"\n\n状态: ${getStatusText(device.status)}\n运行时间: ${device.uptime}\nIP地址: ${device.ip}\n端口数: ${device.ports}`);
        // 这里可以打开设备监控页面
    }
}

// 重启设备
function rebootDevice(id) {
    if (confirm('确定要重启这个设备吗？设备将暂时离线！')) {
        const device = networkDevices.find(d => d.id === id);
        if (device) {
            device.status = 'offline';
            device.lastUpdate = new Date().toLocaleString('zh-CN');
            renderDeviceTable();
            
            // 模拟重启过程
            setTimeout(() => {
                device.status = 'online';
                device.uptime = '0天0小时';
                renderDeviceTable();
                alert(`设备 "${device.name}" 重启完成！`);
            }, 3000);
            
            alert(`设备 "${device.name}" 正在重启...`);
        }
    }
}

// 编辑设备
function editDevice(id) {
    const device = networkDevices.find(d => d.id === id);
    if (device) {
        alert(`编辑设备 "${device.name}"`);
        // 这里可以打开编辑设备模态框
    }
}

// 删除设备
function deleteDevice(id) {
    if (confirm('确定要删除这个设备吗？此操作不可恢复！')) {
        const index = networkDevices.findIndex(d => d.id === id);
        if (index !== -1) {
            const device = networkDevices[index];
            networkDevices.splice(index, 1);
            filteredDevices = [...networkDevices];
            renderDeviceTable();
            updatePaginationInfo();
            alert(`设备 "${device.name}" 已删除！`);
        }
    }
}

// 关闭添加设备模态框
function closeAddDeviceModal() {
    document.getElementById('addDeviceModal').style.display = 'none';
}