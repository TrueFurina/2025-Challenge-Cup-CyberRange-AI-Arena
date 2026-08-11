// 角色管理数据
const roles = [
    {
        id: 1,
        name: '超级管理员',
        description: '拥有系统所有权限，可以管理所有功能模块',
        icon: 'fas fa-crown',
        permissionCount: 25,
        userCount: 2,
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-20 14:25:00',
        permissions: []
    },
    {
        id: 2,
        name: '教师',
        description: '可以创建和管理训练场景，查看学生学习进度',
        icon: 'fas fa-chalkboard-teacher',
        permissionCount: 15,
        userCount: 8,
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-18 09:15:00',
        permissions: []
    },
    {
        id: 3,
        name: '学生',
        description: '可以参与训练场景，查看个人学习记录',
        icon: 'fas fa-graduation-cap',
        permissionCount: 8,
        userCount: 156,
        status: 'active',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-16 16:45:00',
        permissions: []
    },
    {
        id: 4,
        name: '观察员',
        description: '只能查看系统信息，无法进行任何修改操作',
        icon: 'fas fa-eye',
        permissionCount: 3,
        userCount: 5,
        status: 'active',
        createTime: '2024-01-16 14:20:00',
        updateTime: '2024-01-16 14:20:00',
        permissions: []
    }
];

// 可用权限清单（示例）
const availablePermissions = [
    { key: 'user:view', label: '查看用户' },
    { key: 'user:edit', label: '编辑用户' },
    { key: 'user:create', label: '创建用户' },
    { key: 'user:delete', label: '删除用户' },
    { key: 'role:view', label: '查看角色' },
    { key: 'role:edit', label: '编辑角色' },
    { key: 'role:create', label: '创建角色' },
    { key: 'role:delete', label: '删除角色' },
    { key: 'permission:assign', label: '分配权限' },
    { key: 'scenario:view', label: '查看训练场景' },
    { key: 'scenario:edit', label: '编辑训练场景' },
    { key: 'competition:manage', label: '竞赛管理' },
    { key: 'repo:read', label: '素材库读取' },
    { key: 'repo:write', label: '素材库写入' },
    { key: 'ops:monitor', label: '运维监控' }
];

// 分页相关变量
let currentPage = 1;
const rolesPerPage = 10;
let filteredRoles = [...roles];
let editingRoleId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    renderRoleTable();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 侧边栏功能由组件管理
    
    // 搜索功能
    const searchInput = document.getElementById('roleSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // 筛选功能
    const statusFilter = document.getElementById('roleStatusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', handleFilter);
    }

    // 全选功能
    const selectAllCheckbox = document.getElementById('selectAllRoles');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    // 添加角色按钮
    const addRoleBtn = document.getElementById('addRoleBtn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', openAddRoleModal);
    }

    // 关闭模态框
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddRoleModal);
    }

    // 模态框关闭事件
    const modal = document.getElementById('addRoleModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAddRoleModal();
            }
        });
    }

    // 表单提交事件
    const addRoleForm = document.getElementById('addRoleForm');
    if (addRoleForm) {
        addRoleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAddRole();
        });
    }

    // 编辑角色表单
    const editRoleForm = document.getElementById('editRoleForm');
    if (editRoleForm) {
        editRoleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitEditRole();
        });
    }
}

// 搜索功能
function handleSearch() {
    const searchTerm = document.getElementById('roleSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('roleStatusFilter').value;
    
    filteredRoles = roles.filter(role => {
        const matchesSearch = role.name.toLowerCase().includes(searchTerm) || 
                            role.description.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || role.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    renderRoleTable();
}

// 筛选功能
function handleFilter() {
    handleSearch(); // 重用搜索逻辑
}

// 全选功能
function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllRoles');
    const roleCheckboxes = document.querySelectorAll('.role-checkbox');
    
    roleCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 渲染角色表格
function renderRoleTable() {
    const tbody = document.getElementById('roleTableBody');
    if (!tbody) return;
    
    const startIndex = (currentPage - 1) * rolesPerPage;
    const endIndex = startIndex + rolesPerPage;
    const pageRoles = filteredRoles.slice(startIndex, endIndex);
    
    tbody.innerHTML = pageRoles.map(role => `
        <tr>
            <td>
                <input type="checkbox" class="role-checkbox" data-role-id="${role.id}">
            </td>
            <td>
                <div class="role-info-cell">
                    <div class="role-icon">
                        <i class="${role.icon}"></i>
                    </div>
                    <div class="role-details">
                        <h4>${role.name}</h4>
                        <p>${role.description}</p>
                    </div>
                </div>
            </td>
            <td>${role.description}</td>
            <td><span class="permission-count">${role.permissionCount}</span></td>
            <td><span class="user-count">${role.userCount}</span></td>
            <td>
                <span class="status-badge ${role.status}">${getStatusText(role.status)}</span>
            </td>
            <td>${role.createTime}</td>
            <td>${role.updateTime}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="编辑" onclick="editRole(${role.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="权限设置" onclick="setPermissions(${role.id})">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn-icon danger" title="删除" onclick="deleteRole(${role.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // 更新分页信息与控件
    updatePaginationInfo();
    renderPaginationControls();
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'active': '启用',
        'inactive': '禁用'
    };
    return statusMap[status] || status;
}

// 更新分页信息
function updatePaginationInfo() {
    const totalRoles = filteredRoles.length;
    const startIndex = totalRoles === 0 ? 0 : (currentPage - 1) * rolesPerPage + 1;
    const endIndex = Math.min(currentPage * rolesPerPage, totalRoles);
    
    const paginationInfo = document.querySelector('.pagination-info span');
    if (paginationInfo) {
        paginationInfo.textContent = `显示 ${startIndex}-${endIndex} 条，共 ${totalRoles} 条记录`;
    }
}

// 渲染分页控件（与用户管理统一样式）
function renderPaginationControls() {
    const container = document.getElementById('paginationControls');
    if (!container) return;

    const totalRoles = filteredRoles.length;
    const totalPages = Math.max(1, Math.ceil(totalRoles / rolesPerPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const makeBtn = (label, disabled, onClick, isActive = false) => {
        const btn = document.createElement('button');
        btn.className = 'btn-pagination' + (isActive ? ' active' : '');
        btn.innerHTML = label;
        btn.disabled = disabled;
        if (!disabled && onClick) btn.addEventListener('click', onClick);
        return btn;
    };

    container.innerHTML = '';

    // Prev
    container.appendChild(makeBtn('<i class="fas fa-chevron-left"></i>', currentPage === 1 || totalRoles === 0, () => {
        currentPage -= 1; renderRoleTable();
    }));

    // Page numbers window
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, Math.min(start, Math.max(1, end - windowSize + 1)));

    if (start > 1) {
        container.appendChild(makeBtn('1', false, () => { currentPage = 1; renderRoleTable(); }, currentPage === 1));
        if (start > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            container.appendChild(dots);
        }
    }

    for (let p = start; p <= end; p++) {
        container.appendChild(makeBtn(String(p), false, () => { currentPage = p; renderRoleTable(); }, currentPage === p));
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const dots2 = document.createElement('span');
            dots2.className = 'pagination-dots';
            dots2.textContent = '...';
            container.appendChild(dots2);
        }
        container.appendChild(makeBtn(String(totalPages), false, () => { currentPage = totalPages; renderRoleTable(); }, currentPage === totalPages));
    }

    // Next
    container.appendChild(makeBtn('<i class="fas fa-chevron-right"></i>', currentPage === totalPages || totalRoles === 0, () => {
        currentPage += 1; renderRoleTable();
    }));
}

// 打开添加角色模态框
function openAddRoleModal() {
    const modal = document.getElementById('addRoleModal');
    if (modal) {
        modal.style.display = 'flex';
        // 清空表单
        document.getElementById('addRoleForm').reset();
    }
}

// 关闭添加角色模态框
function closeAddRoleModal() {
    const modal = document.getElementById('addRoleModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 提交添加角色
function submitAddRole() {
    const formData = new FormData(document.getElementById('addRoleForm'));
    const roleData = {
        id: roles.length + 1,
        name: formData.get('roleName'),
        description: formData.get('roleDescription') || '',
        icon: 'fas fa-user-tag',
        permissionCount: 0,
        userCount: 0,
        status: formData.get('roleStatus'),
        createTime: new Date().toLocaleString('zh-CN'),
        updateTime: new Date().toLocaleString('zh-CN'),
        permissions: []
    };
    
    // 添加到角色列表
    roles.push(roleData);
    filteredRoles = [...roles];
    
    // 重新渲染表格
    renderRoleTable();
    
    // 关闭模态框
    closeAddRoleModal();
    
    // 显示成功消息
    alert('角色添加成功！');
}

// 编辑角色
function editRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        editingRoleId = roleId;
        const modal = document.getElementById('editRoleModal');
        const nameInput = document.getElementById('editRoleName');
        const descInput = document.getElementById('editRoleDescription');
        const statusSelect = document.getElementById('editRoleStatus');
        if (nameInput) nameInput.value = role.name;
        if (descInput) descInput.value = role.description || '';
        if (statusSelect) statusSelect.value = role.status;
        if (modal) modal.style.display = 'flex';
    }
}

function closeEditRoleModal() {
    const modal = document.getElementById('editRoleModal');
    if (modal) modal.style.display = 'none';
    editingRoleId = null;
}

function submitEditRole() {
    if (editingRoleId == null) return;
    const role = roles.find(r => r.id === editingRoleId);
    if (!role) return;
    const nameInput = document.getElementById('editRoleName');
    const descInput = document.getElementById('editRoleDescription');
    const statusSelect = document.getElementById('editRoleStatus');
    role.name = nameInput ? nameInput.value.trim() : role.name;
    role.description = descInput ? descInput.value.trim() : role.description;
    role.status = statusSelect ? statusSelect.value : role.status;
    role.updateTime = new Date().toLocaleString('zh-CN');
    filteredRoles = [...roles];
    renderRoleTable();
    closeEditRoleModal();
    alert('角色已更新！');
}

// 设置权限
function setPermissions(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role) {
        const container = document.getElementById('permissionCheckboxes');
        if (container) {
            container.innerHTML = availablePermissions.map(p => {
                const checked = (role.permissions || []).includes(p.key);
                return `<label style="display:inline-flex; align-items:center; margin:6px 12px 6px 0;">
                    <input type="checkbox" value="${p.key}" ${checked ? 'checked' : ''} style="margin-right:6px;">${p.label}
                </label>`;
            }).join('');
        }
        // 暂存当前角色ID
        container && container.setAttribute('data-role-id', String(roleId));
        const modal = document.getElementById('permissionsModal');
        if (modal) modal.style.display = 'flex';
    }
}

function closePermissionsModal() {
    const modal = document.getElementById('permissionsModal');
    if (modal) modal.style.display = 'none';
}

function submitPermissions() {
    const container = document.getElementById('permissionCheckboxes');
    if (!container) return;
    const roleIdStr = container.getAttribute('data-role-id');
    if (!roleIdStr) return;
    const roleId = Number(roleIdStr);
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    const inputs = container.querySelectorAll('input[type="checkbox"]');
    const selected = [];
    inputs.forEach(i => { if (i.checked) selected.push(i.value); });
    role.permissions = selected;
    role.permissionCount = selected.length;
    role.updateTime = new Date().toLocaleString('zh-CN');
    renderRoleTable();
    closePermissionsModal();
    alert('权限设置已保存！');
}

// 删除角色
function deleteRole(roleId) {
    const role = roles.find(r => r.id === roleId);
    if (role && confirm(`确定要删除角色 "${role.name}" 吗？`)) {
        const index = roles.findIndex(r => r.id === roleId);
        if (index > -1) {
            roles.splice(index, 1);
            filteredRoles = [...roles];
            renderRoleTable();
            alert('角色删除成功！');
        }
    }
}

// 导出角色
function exportRoles() {
    // 导出当前筛选结果 filteredRoles 为 CSV
    const headers = ['角色名称','角色描述','权限数量','用户数量','状态','创建时间','更新时间'];
    const lines = filteredRoles.map(r => {
        const statusTxt = getStatusText(r.status);
        // 处理CSV中的逗号与换行
        const safe = (v) => {
            const s = String(v == null ? '' : v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
        };
        return [safe(r.name), safe(r.description || ''), r.permissionCount, r.userCount, safe(statusTxt), safe(r.createTime), safe(r.updateTime)].join(',');
    });
    const csv = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + lines.join('\n');
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'roles.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}