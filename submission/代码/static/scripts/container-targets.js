// 容器靶标模拟数据
const containerTargets = [
    {
        id: 1,
        name: 'nginx-web-server',
        image: 'nginx:latest',
        ports: '8080:80',
        status: 'running',
        ip: '172.17.0.2',
        description: 'Nginx Web服务器容器',
        createTime: '2024-01-15 10:30:00',
        env: 'NGINX_HOST=localhost',
        vulnerabilities: ['目录遍历', '配置错误']
    },
    {
        id: 2,
        name: 'dvwa-vulnerable-app',
        image: 'dvwa:latest',
        ports: '8081:80',
        status: 'running',
        ip: '172.17.0.3',
        description: 'DVWA漏洞演示应用',
        createTime: '2024-01-16 14:20:00',
        env: 'MYSQL_ROOT_PASSWORD=password',
        vulnerabilities: ['SQL注入', 'XSS', 'CSRF', '文件包含']
    },
    {
        id: 3,
        name: 'mysql-database',
        image: 'mysql:8.0',
        ports: '3306:3306',
        status: 'running',
        ip: '172.17.0.4',
        description: 'MySQL数据库服务器',
        createTime: '2024-01-17 09:15:00',
        env: 'MYSQL_ROOT_PASSWORD=123456\nMYSQL_DATABASE=testdb',
        vulnerabilities: ['弱口令', '权限提升', 'SQL注入']
    },
    {
        id: 4,
        name: 'redis-cache',
        image: 'redis:6.2',
        ports: '6379:6379',
        status: 'stopped',
        ip: '172.17.0.5',
        description: 'Redis缓存服务器',
        createTime: '2024-01-18 16:45:00',
        env: 'REDIS_PASSWORD=redis123',
        vulnerabilities: ['未授权访问', '代码执行', '信息泄露']
    },
    {
        id: 5,
        name: 'apache-php-app',
        image: 'apache:2.4',
        ports: '8082:80',
        status: 'error',
        ip: '172.17.0.6',
        description: 'Apache PHP应用服务器',
        createTime: '2024-01-19 11:30:00',
        env: 'PHP_VERSION=7.4',
        vulnerabilities: ['文件上传', '代码执行', '信息泄露']
    },
    {
        id: 6,
        name: 'wordpress-blog',
        image: 'wordpress:latest',
        ports: '8083:80',
        status: 'running',
        ip: '172.17.0.7',
        description: 'WordPress博客系统',
        createTime: '2024-01-20 13:25:00',
        env: 'WORDPRESS_DB_HOST=mysql\nWORDPRESS_DB_PASSWORD=wp123',
        vulnerabilities: ['插件漏洞', '弱口令', 'XML-RPC攻击']
    }
];

// 分页相关变量
let currentPage = 1;
const itemsPerPage = 10;
let filteredContainers = [...containerTargets];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderContainerTable();
    updatePaginationInfo();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // 筛选功能
    document.getElementById('statusFilter').addEventListener('change', handleFilter);
    document.getElementById('imageFilter').addEventListener('change', handleFilter);
    
    // 全选功能
    document.getElementById('selectAll').addEventListener('change', handleSelectAll);
    
    // 添加容器按钮
    document.getElementById('addContainerBtn').addEventListener('click', () => {
        document.getElementById('addContainerModal').style.display = 'block';
    });
    // 导出按钮
    const exportBtn = document.getElementById('exportContainersBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportContainers);
    
    // 关闭模态框
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('addContainerModal').style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('addContainerModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 提交添加容器表单
    document.getElementById('addContainerForm').addEventListener('submit', handleAddContainer);
}

// 搜索功能
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredContainers = containerTargets.filter(container => 
        container.name.toLowerCase().includes(searchTerm) ||
        container.image.toLowerCase().includes(searchTerm) ||
        container.ip.includes(searchTerm) ||
        container.description.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    renderContainerTable();
    updatePaginationInfo();
}

// 筛选功能
function handleFilter() {
    const statusFilter = document.getElementById('statusFilter').value;
    const imageFilter = document.getElementById('imageFilter').value;
    
    filteredContainers = containerTargets.filter(container => {
        const statusMatch = !statusFilter || container.status === statusFilter;
        const imageMatch = !imageFilter || container.image.toLowerCase().includes(imageFilter.toLowerCase());
        return statusMatch && imageMatch;
    });
    
    currentPage = 1;
    renderContainerTable();
    updatePaginationInfo();
}

// 全选功能
function handleSelectAll(event) {
    const checkboxes = document.querySelectorAll('#containerTableBody input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = event.target.checked;
    });
}

// 渲染容器表格
function renderContainerTable() {
    const tbody = document.getElementById('containerTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentContainers = filteredContainers.slice(startIndex, endIndex);
    
    tbody.innerHTML = currentContainers.map(container => `
        <tr>
            <td><input type="checkbox" value="${container.id}"></td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar">
                        <i class="fab fa-docker"></i>
                    </div>
                    <div class="user-details">
                        <h4>${container.name}</h4>
                        <p>${container.description}</p>
                    </div>
                </div>
            </td>
            <td>
                <div class="image-badge">
                    <i class="fas fa-cube"></i>
                    <code>${container.image}</code>
                </div>
            </td>
            <td>
                <div class="port-mapping">
                    <i class="fas fa-exchange-alt"></i>
                    <code>${container.ports}</code>
                </div>
            </td>
            <td><span class="status-badge ${container.status}">${getStatusText(container.status)}</span></td>
            <td><code>${container.ip}</code></td>
            <td>${container.createTime}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="startContainer(${container.id})" title="启动">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon" onclick="stopContainer(${container.id})" title="停止">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button class="btn-icon" onclick="restartContainer(${container.id})" title="重启">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="btn-icon" onclick="viewLogs(${container.id})" title="查看日志">
                        <i class="fas fa-file-alt"></i>
                    </button>
                    <button class="btn-icon danger" onclick="deleteContainer(${container.id})" title="删除">
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
    const totalItems = filteredContainers.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    
    document.getElementById('startItem').textContent = startItem;
    document.getElementById('endItem').textContent = endItem;
    document.getElementById('totalItems').textContent = totalItems;
}

// 添加容器
function handleAddContainer(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newContainer = {
        id: containerTargets.length + 1,
        name: formData.get('containerName'),
        image: formData.get('containerImage'),
        ports: formData.get('containerPort'),
        status: 'stopped',
        ip: `172.17.0.${containerTargets.length + 8}`,
        description: formData.get('containerDescription'),
        createTime: new Date().toLocaleString('zh-CN'),
        env: formData.get('containerEnv'),
        vulnerabilities: []
    };
    
    containerTargets.push(newContainer);
    filteredContainers = [...containerTargets];
    renderContainerTable();
    updatePaginationInfo();
    
    // 关闭模态框并重置表单
    document.getElementById('addContainerModal').style.display = 'none';
    event.target.reset();
    
    alert('容器创建成功！');
}

// 启动容器
function startContainer(id) {
    const container = containerTargets.find(c => c.id === id);
    if (container) {
        container.status = 'running';
        renderContainerTable();
        alert(`容器 "${container.name}" 启动成功！`);
    }
}

// 停止容器
function stopContainer(id) {
    const container = containerTargets.find(c => c.id === id);
    if (container) {
        container.status = 'stopped';
        renderContainerTable();
        alert(`容器 "${container.name}" 已停止！`);
    }
}

// 重启容器
function restartContainer(id) {
    const container = containerTargets.find(c => c.id === id);
    if (container) {
        container.status = 'running';
        renderContainerTable();
        alert(`容器 "${container.name}" 重启成功！`);
    }
}

// 查看日志
function viewLogs(id) {
    const container = containerTargets.find(c => c.id === id);
    if (container) {
        alert(`查看容器 "${container.name}" 的日志`);
        // 这里可以打开日志查看模态框
    }
}

// 删除容器
function deleteContainer(id) {
    if (confirm('确定要删除这个容器吗？此操作不可恢复！')) {
        const index = containerTargets.findIndex(c => c.id === id);
        if (index !== -1) {
            const container = containerTargets[index];
            containerTargets.splice(index, 1);
            filteredContainers = [...containerTargets];
            renderContainerTable();
            updatePaginationInfo();
            alert(`容器 "${container.name}" 已删除！`);
        }
    }
}

// 导出容器（当前筛选结果）
function exportContainers() {
    const headers = ['名称','镜像','端口映射','状态','IP地址','创建时间','描述'];
    const safe = (v) => {
        const s = String(v == null ? '' : v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = filteredContainers.map(c => [
        safe(c.name), safe(c.image), safe(c.ports), safe(getStatusText(c.status)), safe(c.ip), safe(c.createTime), safe(c.description || '')
    ].join(','));
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + lines.join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'containers.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 关闭添加容器模态框
function closeAddContainerModal() {
    document.getElementById('addContainerModal').style.display = 'none';
}