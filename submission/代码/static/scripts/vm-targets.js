// 虚拟机靶材模拟数据
const vmTargets = [
    {
        id: 1,
        name: 'Web服务器靶机',
        os: 'Ubuntu 20.04',
        cpu: 2,
        memory: 4,
        disk: 40,
        status: 'running',
        ip: '192.168.1.101',
        description: 'Apache + MySQL + PHP环境',
        createTime: '2024-01-15 10:30:00',
        vulnerabilities: ['SQL注入', 'XSS', '文件上传']
    },
    {
        id: 2,
        name: 'Windows域控制器',
        os: 'Windows Server 2019',
        cpu: 4,
        memory: 8,
        disk: 80,
        status: 'running',
        ip: '192.168.1.102',
        description: 'Active Directory域控制器',
        createTime: '2024-01-16 14:20:00',
        vulnerabilities: ['权限提升', 'Kerberos攻击', '横向移动']
    },
    {
        id: 3,
        name: 'Linux FTP服务器',
        os: 'CentOS 7',
        cpu: 1,
        memory: 2,
        disk: 20,
        status: 'stopped',
        ip: '192.168.1.103',
        description: 'vsftpd FTP服务器',
        createTime: '2024-01-17 09:15:00',
        vulnerabilities: ['匿名访问', '弱口令', '目录遍历']
    },
    {
        id: 4,
        name: 'Docker容器主机',
        os: 'Ubuntu 20.04',
        cpu: 4,
        memory: 8,
        disk: 120,
        status: 'running',
        ip: '192.168.1.104',
        description: 'Docker容器运行环境',
        createTime: '2024-01-18 16:45:00',
        vulnerabilities: ['容器逃逸', '特权容器', '镜像漏洞']
    },
    {
        id: 5,
        name: 'Mail服务器',
        os: 'CentOS 7',
        cpu: 2,
        memory: 4,
        disk: 40,
        status: 'error',
        ip: '192.168.1.105',
        description: 'Postfix + Dovecot邮件服务器',
        createTime: '2024-01-19 11:30:00',
        vulnerabilities: ['邮件欺骗', '中继攻击', '暴力破解']
    }
];

// 分页相关变量
let currentPage = 1;
const itemsPerPage = 10;
let filteredVms = [...vmTargets];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderVmTable();
    updatePaginationInfo();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // 筛选功能
    document.getElementById('statusFilter').addEventListener('change', handleFilter);
    document.getElementById('osFilter').addEventListener('change', handleFilter);
    
    // 全选功能
    document.getElementById('selectAll').addEventListener('change', handleSelectAll);
    
    // 添加虚拟机按钮
    document.getElementById('addVmBtn').addEventListener('click', () => {
        document.getElementById('addVmModal').style.display = 'block';
    });
    // 导出按钮
    const exportBtn = document.getElementById('exportVmsBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportVms);
    
    // 关闭模态框
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('addVmModal').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('addVmModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 提交添加虚拟机表单
    document.getElementById('addVmForm').addEventListener('submit', handleAddVm);
}

// 搜索功能
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredVms = vmTargets.filter(vm => 
        vm.name.toLowerCase().includes(searchTerm) ||
        vm.os.toLowerCase().includes(searchTerm) ||
        vm.ip.includes(searchTerm) ||
        vm.description.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderVmTable();
    updatePaginationInfo();
}

// 筛选功能
function handleFilter() {
    const statusFilter = document.getElementById('statusFilter').value;
    const osFilter = document.getElementById('osFilter').value;
    
    filteredVms = vmTargets.filter(vm => {
        const statusMatch = !statusFilter || vm.status === statusFilter;
        const osMatch = !osFilter || vm.os.toLowerCase().includes(osFilter.toLowerCase());
        return statusMatch && osMatch;
    });
    
    currentPage = 1;
    renderVmTable();
    updatePaginationInfo();
}

// 全选功能
function handleSelectAll(event) {
    const checkboxes = document.querySelectorAll('#vmTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
}

// 渲染虚拟机表格
function renderVmTable() {
    const tbody = document.getElementById('vmTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentVms = filteredVms.slice(startIndex, endIndex);
    
    tbody.innerHTML = currentVms.map(vm => `
        <tr>
            <td><input type="checkbox" value="${vm.id}"></td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar">
                        <i class="fas fa-desktop"></i>
                    </div>
                    <div class="user-details">
                        <h4>${vm.name}</h4>
                        <p>${vm.description}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="os-badge ${vm.os.toLowerCase().includes('windows') ? 'windows' : 'linux'}">
                    <i class="fab fa-${vm.os.toLowerCase().includes('windows') ? 'windows' : 'linux'}"></i>
                    ${vm.os}
                </div>
            </td>
            <td>
                <div class="config-info">
                    <div>CPU: ${vm.cpu}核</div>
                    <div>内存: ${vm.memory}GB</div>
                    <div>磁盘: ${vm.disk}GB</div>
                </div>
            </td>
            <td><span class="status-badge ${vm.status}">${getStatusText(vm.status)}</span></td>
            <td><code>${vm.ip}</code></td>
            <td>${vm.createTime}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="startVm(${vm.id})" title="启动">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon" onclick="stopVm(${vm.id})" title="停止">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button class="btn-icon" onclick="editVm(${vm.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteVm(${vm.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'running': '运行中',
        'stopped': '已停止',
        'error': '错误'
    };
    return statusMap[status] || status;
}

// 更新分页信息
function updatePaginationInfo() {
    const totalItems = filteredVms.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('startItem').textContent = startItem;
    document.getElementById('endItem').textContent = endItem;
    document.getElementById('totalItems').textContent = totalItems;
}

// 添加虚拟机
function handleAddVm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newVm = {
        id: vmTargets.length + 1,
        name: formData.get('vmName'),
        os: formData.get('vmOs'),
        cpu: parseInt(formData.get('vmCpu')),
        memory: parseInt(formData.get('vmMemory')),
        disk: parseInt(formData.get('vmDisk')),
        status: 'stopped',
        ip: `192.168.1.${100 + vmTargets.length + 1}`,
        description: formData.get('vmDescription'),
        createTime: new Date().toLocaleString('zh-CN'),
        vulnerabilities: []
    };
    
    vmTargets.push(newVm);
    filteredVms = [...vmTargets];
    renderVmTable();
    updatePaginationInfo();
    
    // 关闭模态框并重置表单
    document.getElementById('addVmModal').style.display = 'none';
    event.target.reset();
    
    alert('虚拟机创建成功！');
}

// 启动虚拟机
function startVm(id) {
    const vm = vmTargets.find(v => v.id === id);
    if (vm) {
        vm.status = 'running';
        renderVmTable();
        alert(`虚拟机 "${vm.name}" 启动成功！`);
    }
}

// 停止虚拟机
function stopVm(id) {
    const vm = vmTargets.find(v => v.id === id);
    if (vm) {
        vm.status = 'stopped';
        renderVmTable();
        alert(`虚拟机 "${vm.name}" 已停止！`);
    }
}

// 编辑虚拟机
function editVm(id) {
    const vm = vmTargets.find(v => v.id === id);
    if (vm) {
        alert(`编辑虚拟机: ${vm.name}`);
        // 这里可以打开编辑模态框
    }
}

// 删除虚拟机
function deleteVm(id) {
    if (confirm('确定要删除这个虚拟机吗？此操作不可恢复！')) {
        const index = vmTargets.findIndex(v => v.id === id);
        if (index !== -1) {
            const vm = vmTargets[index];
            vmTargets.splice(index, 1);
            filteredVms = [...vmTargets];
            renderVmTable();
            updatePaginationInfo();
            alert(`虚拟机 "${vm.name}" 已删除！`);
        }
    }
}

// 导出虚拟机（当前筛选结果）
function exportVms() {
    const headers = ['名称','操作系统','CPU(核)','内存(GB)','磁盘(GB)','状态','IP地址','创建时间','描述'];
    const safe = (v) => {
        const s = String(v == null ? '' : v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = filteredVms.map(vm => [
        safe(vm.name), safe(vm.os), vm.cpu, vm.memory, vm.disk, safe(getStatusText(vm.status)), safe(vm.ip), safe(vm.createTime), safe(vm.description || '')
    ].join(','));
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + lines.join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'vms.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 关闭添加虚拟机模态框
function closeAddVmModal() {
    document.getElementById('addVmModal').style.display = 'none';
}