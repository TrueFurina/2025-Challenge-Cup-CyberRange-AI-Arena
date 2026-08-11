// 权限管理数据
const permissions = {
    user: [
        { code: 'user.list.view', name: '查看用户列表', type: 'read', icon: 'fas fa-eye' },
        { code: 'user.create', name: '创建用户', type: 'write', icon: 'fas fa-plus' },
        { code: 'user.edit', name: '编辑用户信息', type: 'write', icon: 'fas fa-edit' },
        { code: 'user.delete', name: '删除用户', type: 'delete', icon: 'fas fa-trash' },
        { code: 'user.role.assign', name: '分配角色', type: 'admin', icon: 'fas fa-user-tag' },
        { code: 'user.password.reset', name: '重置密码', type: 'admin', icon: 'fas fa-key' },
        { code: 'user.status.change', name: '修改用户状态', type: 'admin', icon: 'fas fa-toggle-on' },
        { code: 'user.export', name: '导出用户数据', type: 'read', icon: 'fas fa-download' }
    ],
    target: [
        { code: 'target.list.view', name: '查看靶标列表', type: 'read', icon: 'fas fa-eye' },
        { code: 'target.create', name: '创建靶标', type: 'write', icon: 'fas fa-plus' },
        { code: 'target.edit', name: '编辑靶标', type: 'write', icon: 'fas fa-edit' },
        { code: 'target.delete', name: '删除靶标', type: 'delete', icon: 'fas fa-trash' },
        { code: 'target.deploy', name: '部署靶标', type: 'admin', icon: 'fas fa-rocket' },
        { code: 'target.stop', name: '停止靶标', type: 'admin', icon: 'fas fa-stop' }
    ],
    training: [
        { code: 'training.list.view', name: '查看训练场景', type: 'read', icon: 'fas fa-eye' },
        { code: 'training.create', name: '创建训练场景', type: 'write', icon: 'fas fa-plus' },
        { code: 'training.edit', name: '编辑训练场景', type: 'write', icon: 'fas fa-edit' },
        { code: 'training.delete', name: '删除训练场景', type: 'delete', icon: 'fas fa-trash' },
        { code: 'training.start', name: '启动训练', type: 'admin', icon: 'fas fa-play' },
        { code: 'training.stop', name: '停止训练', type: 'admin', icon: 'fas fa-stop' },
        { code: 'training.monitor', name: '监控训练进度', type: 'read', icon: 'fas fa-chart-line' },
        { code: 'training.score.view', name: '查看训练成绩', type: 'read', icon: 'fas fa-trophy' },
        { code: 'training.report.generate', name: '生成训练报告', type: 'admin', icon: 'fas fa-file-alt' },
        { code: 'training.export', name: '导出训练数据', type: 'read', icon: 'fas fa-download' }
    ],
    system: [
        { code: 'system.config', name: '系统配置', type: 'admin', icon: 'fas fa-cog' },
        { code: 'system.logs.view', name: '查看系统日志', type: 'read', icon: 'fas fa-chart-bar' },
        { code: 'system.backup', name: '系统备份', type: 'admin', icon: 'fas fa-database' },
        { code: 'system.monitor', name: '系统监控', type: 'read', icon: 'fas fa-heartbeat' },
        { code: 'system.maintenance', name: '系统维护', type: 'admin', icon: 'fas fa-tools' }
    ]
};

const moduleNames = {
    user: '用户管理',
    target: '靶标管理',
    training: '训练场景管理',
    system: '系统管理'
};

const moduleIcons = {
    user: 'fas fa-users',
    target: 'fas fa-bullseye',
    training: 'fas fa-graduation-cap',
    system: 'fas fa-cog'
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderPermissionTree();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 侧边栏功能由组件管理
    
    // 搜索功能
    const searchInput = document.getElementById('permissionSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // 筛选功能
    const moduleFilter = document.getElementById('moduleFilter');
    const typeFilter = document.getElementById('permissionTypeFilter');
    if (moduleFilter) {
        moduleFilter.addEventListener('change', handleFilter);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', handleFilter);
    }

    // 模态框关闭事件
    const modal = document.getElementById('addPermissionModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddPermissionModal();
            }
        });
    }

    // 表单提交事件
    const addPermissionForm = document.getElementById('addPermissionForm');
    if (addPermissionForm) {
        addPermissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAddPermission();
        });
    }
}

// 渲染权限树
function renderPermissionTree() {
    const container = document.querySelector('.permission-tree-container');
    if (!container) return;

    container.innerHTML = Object.keys(permissions).map(moduleKey => {
        const modulePermissions = permissions[moduleKey];
        const moduleName = moduleNames[moduleKey];
        const moduleIcon = moduleIcons[moduleKey];
        
        return `
            <div class="permission-module">
                <div class="module-header" onclick="toggleModule('${moduleKey}-module')">
                    <i class="fas fa-chevron-down module-arrow"></i>
                    <i class="${moduleIcon} module-icon"></i>
                    <span class="module-name">${moduleName}</span>
                    <span class="permission-count">(${modulePermissions.length}个权限)</span>
                </div>
                <div class="module-permissions" id="${moduleKey}-module">
                    ${modulePermissions.map(permission => `
                        <div class="permission-item">
                            <div class="permission-info">
                                <i class="${permission.icon} permission-icon ${permission.type}"></i>
                                <div class="permission-details">
                                    <h4>${permission.name}</h4>
                                    <p>${permission.code}</p>
                                </div>
                            </div>
                            <div class="permission-actions">
                                <span class="permission-type ${permission.type}">${getTypeText(permission.type)}</span>
                                <button class="btn-icon" title="编辑" onclick="editPermission('${permission.code}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon danger" title="删除" onclick="deletePermission('${permission.code}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// 获取权限类型文本
function getTypeText(type) {
    const typeMap = {
        'read': '查看',
        'write': '编辑',
        'delete': '删除',
        'admin': '管理'
    };
    return typeMap[type] || type;
}

// 切换模块展开/收起
function toggleModule(moduleId) {
    const moduleElement = document.getElementById(moduleId);
    const header = moduleElement.previousElementSibling;
    const arrow = header.querySelector('.module-arrow');
    
    if (moduleElement.style.display === 'none' || !moduleElement.style.display) {
        moduleElement.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        moduleElement.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

// 搜索功能
function handleSearch() {
    const searchTerm = document.getElementById('permissionSearchInput').value.toLowerCase();
    const moduleFilter = document.getElementById('moduleFilter').value;
    const typeFilter = document.getElementById('permissionTypeFilter').value;
    
    const permissionItems = document.querySelectorAll('.permission-item');
    const modules = document.querySelectorAll('.permission-module');
    
    modules.forEach(module => {
        let hasVisiblePermissions = false;
        const moduleKey = module.querySelector('.module-permissions').id.replace('-module', '');
        
        // 检查模块筛选
        if (moduleFilter !== 'all' && moduleFilter !== moduleKey) {
            module.style.display = 'none';
            return;
        }
        
        const modulePermissions = module.querySelectorAll('.permission-item');
        modulePermissions.forEach(item => {
            const permissionName = item.querySelector('h4').textContent.toLowerCase();
            const permissionCode = item.querySelector('p').textContent.toLowerCase();
            const permissionType = item.querySelector('.permission-type').className.split(' ')[1];
            
            const matchesSearch = permissionName.includes(searchTerm) || permissionCode.includes(searchTerm);
            const matchesType = typeFilter === 'all' || permissionType === typeFilter;
            
            if (matchesSearch && matchesType) {
                item.style.display = 'flex';
                hasVisiblePermissions = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        module.style.display = hasVisiblePermissions ? 'block' : 'none';
    });
}

// 筛选功能
function handleFilter() {
    handleSearch(); // 重用搜索逻辑
}

// 打开添加权限模态框
function openAddPermissionModal() {
    const modal = document.getElementById('addPermissionModal');
    if (modal) {
        modal.style.display = 'flex';
        // 清空表单
        document.getElementById('addPermissionForm').reset();
    }
}

// 关闭添加权限模态框
function closeAddPermissionModal() {
    const modal = document.getElementById('addPermissionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 提交添加权限
function submitAddPermission() {
    const formData = new FormData(document.getElementById('addPermissionForm'));
    const permissionData = {
        code: formData.get('permissionCode'),
        name: formData.get('permissionName'),
        type: formData.get('permissionType'),
        icon: getIconByType(formData.get('permissionType')),
        description: formData.get('permissionDescription') || ''
    };
    
    const module = formData.get('permissionModule');
    
    // 检查权限代码是否已存在
    const allPermissions = Object.values(permissions).flat();
    if (allPermissions.some(p => p.code === permissionData.code)) {
        alert('权限代码已存在，请使用其他代码！');
        return;
    }
    
    // 添加到权限列表
    permissions[module].push(permissionData);
    
    // 重新渲染权限树
    renderPermissionTree();
    
    // 关闭模态框
    closeAddPermissionModal();
    
    // 显示成功消息
    alert('权限添加成功！');
}

// 根据权限类型获取图标
function getIconByType(type) {
    const iconMap = {
        'read': 'fas fa-eye',
        'write': 'fas fa-edit',
        'delete': 'fas fa-trash',
        'admin': 'fas fa-cog'
    };
    return iconMap[type] || 'fas fa-key';
}

// 编辑权限
function editPermission(permissionCode) {
    const allPermissions = Object.values(permissions).flat();
    const permission = allPermissions.find(p => p.code === permissionCode);
    if (permission) {
        alert(`编辑权限: ${permission.name} (${permission.code})`);
        // 这里可以打开编辑模态框
    }
}

// 删除权限
function deletePermission(permissionCode) {
    const allPermissions = Object.values(permissions).flat();
    const permission = allPermissions.find(p => p.code === permissionCode);
    
    if (permission && confirm(`确定要删除权限 "${permission.name}" 吗？`)) {
        // 找到权限所属的模块并删除
        for (const moduleKey in permissions) {
            const index = permissions[moduleKey].findIndex(p => p.code === permissionCode);
            if (index > -1) {
                permissions[moduleKey].splice(index, 1);
                break;
            }
        }
        
        // 重新渲染权限树
        renderPermissionTree();
        alert('权限删除成功！');
    }
}

// 导出权限
function exportPermissions() {
    const searchTerm = (document.getElementById('permissionSearchInput')?.value || '').toLowerCase();
    const moduleFilter = document.getElementById('moduleFilter')?.value || 'all';
    const typeFilter = document.getElementById('permissionTypeFilter')?.value || 'all';

    // 扁平化权限数据并根据当前筛选条件过滤
    const rows = [];
    for (const moduleKey of Object.keys(permissions)) {
        if (moduleFilter !== 'all' && moduleFilter !== moduleKey) continue;
        const modulePermissions = permissions[moduleKey] || [];
        modulePermissions.forEach(p => {
            const matchesType = typeFilter === 'all' || p.type === typeFilter;
            const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm) || p.code.toLowerCase().includes(searchTerm);
            if (matchesType && matchesSearch) {
                rows.push({ moduleKey, name: p.name, code: p.code, type: p.type });
            }
        });
    }

    const headers = ['模块','权限名称','权限代码','类型'];
    const typeText = { read:'查看', write:'编辑', delete:'删除', admin:'管理' };
    const safe = (v) => {
        const s = String(v == null ? '' : v).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const lines = rows.map(r => [
        safe(moduleNames[r.moduleKey] || r.moduleKey),
        safe(r.name),
        safe(r.code),
        safe(typeText[r.type] || r.type)
    ].join(','));

    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + lines.join('\n');
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = encodedUri;
    link.download = 'permissions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 页面加载时展开所有模块
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const moduleIds = ['user-module', 'target-module', 'training-module', 'system-module'];
        moduleIds.forEach(id => {
            const moduleElement = document.getElementById(id);
            if (moduleElement) {
                moduleElement.style.display = 'block';
                const header = moduleElement.previousElementSibling;
                const arrow = header.querySelector('.module-arrow');
                if (arrow) {
                    arrow.style.transform = 'rotate(180deg)';
                }
            }
        });
    }, 100);
});