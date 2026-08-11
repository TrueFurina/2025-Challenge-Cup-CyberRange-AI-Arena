// 用户管理页面JavaScript

// 后端API基础URL
const API_BASE = '/api';

// 全局变量
let users = [];
let currentPage = 1;
let usersPerPage = 8;
let totalUsers = 0;
let totalPages = 0;
let currentSearch = '';
let currentRoleFilter = 'all';
let currentStatusFilter = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    fetchUsers();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearch = this.value.trim();
            currentPage = 1;
            fetchUsers();
        });
    }

    // 筛选功能
    const roleFilter = document.getElementById('userRoleFilter');
    const statusFilter = document.getElementById('userStatusFilter');
    if (roleFilter) {
        roleFilter.addEventListener('change', function() {
            currentRoleFilter = this.value;
            currentPage = 1;
            fetchUsers();
        });
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentStatusFilter = this.value;
            currentPage = 1;
            fetchUsers();
        });
    }

    // 全选功能
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }

    // 模态框关闭事件（添加用户）
    const addModal = document.getElementById('addUserModal');
    if (addModal) {
        addModal.addEventListener('click', function(e) {
            if (e.target === addModal) {
                closeAddUserModal();
            }
        });
    }

    // 模态框关闭事件（编辑用户）
    const editModal = document.getElementById('editUserModal');
    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeEditUserModal();
            }
        });
    }

    // 表单提交事件
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitAddUser();
        });
    }
}

// 从后端加载用户
async function fetchUsers() {
    try {
        const params = new URLSearchParams({
            page: String(currentPage),
            per_page: String(usersPerPage),
            search: currentSearch,
            role: currentRoleFilter,
            status: currentStatusFilter
        });
        const token = localStorage.getItem('adminToken') || '';
        const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.message || '加载用户失败');
        }
        users = data.users || [];
        totalUsers = data.total || 0;
        totalPages = data.total_pages || 0;
        renderUserTable();
        renderPaginationControls();
    } catch (err) {
        showNotification('error', '加载失败', err.message);
    }
}

// 全选功能
function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllUsers');
    const userCheckboxes = document.querySelectorAll('.user-checkbox');
    userCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 渲染用户表格
function renderUserTable() {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => {
        const role = user.role_name || 'student';
        const isActive = user.is_active ? 'active' : 'inactive';
        const created = user.created_at ? user.created_at.substring(0, 10) : '';
        const lastLogin = user.last_login ? user.last_login.replace('T', ' ').substring(0, 16) : '从未登录';
        const department = user.student_id || '-';
        return `
        <tr>
            <td>
                <input type="checkbox" class="user-checkbox" data-user-id="${user.id}">
            </td>
            <td>
                <div class="user-info-cell">
                    <div class="user-avatar-small">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4>${user.real_name || user.username}</h4>
                        <p>${user.email}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="department-badge">${department}</span>
            </td>
            <td>
                <span class="role-badge ${role}">${getRoleText(role)}</span>
            </td>
            <td>
                <span class="status-badge ${isActive}">${getStatusText(isActive)}</span>
            </td>
            <td>${created}</td>
            <td>${lastLogin}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="编辑" onclick="editUser(${user.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="重置密码" onclick="resetPassword(${user.id})">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn-icon danger" title="删除" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');

    // 更新分页信息
    updatePaginationInfo();
}

// 获取角色文本
function getRoleText(role) {
    const roleMap = {
        'admin': '管理员',
        'teacher': '教师',
        'student': '学生'
    };
    return roleMap[role] || role;
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'active': '活跃',
        'inactive': '非活跃',
        'suspended': '已暂停'
    };
    return statusMap[status] || status;
}

// 更新分页信息
function updatePaginationInfo() {
    const startIndex = totalUsers === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
    const endIndex = Math.min(currentPage * usersPerPage, totalUsers);
    const paginationInfo = document.querySelector('.pagination-info span');
    if (paginationInfo) {
        paginationInfo.textContent = `显示 ${startIndex}-${endIndex} 条，共 ${totalUsers} 条记录`;
    }
}

// 渲染分页按钮
function renderPaginationControls() {
    const container = document.getElementById('paginationControls');
    if (!container) return;

    const makeBtn = (label, disabled, onClick, isActive=false) => {
        const btn = document.createElement('button');
        btn.className = 'btn-pagination' + (isActive ? ' active' : '');
        btn.innerHTML = label;
        btn.disabled = disabled;
        if (!disabled && onClick) btn.addEventListener('click', onClick);
        return btn;
    };

    container.innerHTML = '';

    // Prev
    container.appendChild(makeBtn('<i class="fas fa-chevron-left"></i>', currentPage === 1, () => {
        currentPage -= 1; fetchUsers();
    }));

    // Page numbers (simple window)
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize/2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, Math.min(start, Math.max(1, end - windowSize + 1)));

    if (start > 1) {
        container.appendChild(makeBtn('1', false, () => { currentPage = 1; fetchUsers(); }, currentPage === 1));
        if (start > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            container.appendChild(dots);
        }
    }

    for (let p = start; p <= end; p++) {
        container.appendChild(makeBtn(String(p), false, () => { currentPage = p; fetchUsers(); }, currentPage === p));
    }

    if (end < totalPages) {
        if (end < totalPages - 1) {
            const dots2 = document.createElement('span');
            dots2.className = 'pagination-dots';
            dots2.textContent = '...';
            container.appendChild(dots2);
        }
        container.appendChild(makeBtn(String(totalPages), false, () => { currentPage = totalPages; fetchUsers(); }, currentPage === totalPages));
    }

    // Next
    container.appendChild(makeBtn('<i class="fas fa-chevron-right"></i>', currentPage === totalPages || totalPages === 0, () => {
        currentPage += 1; fetchUsers();
    }));
}

// 显示添加用户模态框
function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'flex';
        const form = document.getElementById('addUserForm');
        if (form) form.reset();
    }
}

// 关闭添加用户模态框
function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) modal.style.display = 'none';
}

// 提交添加用户表单
async function submitAddUser() {
    const form = document.getElementById('addUserForm');
    if (!form) return;

    const formData = new FormData(form);
    const userData = {
        username: formData.get('userName'),
        email: String(formData.get('userEmail') || '').trim().toLowerCase(),
        role: formData.get('userRole'),
        phone: formData.get('userPhone'),
        password: formData.get('userPassword'),
        confirmPassword: formData.get('confirmPassword'),
        real_name: formData.get('userName'),
        student_id: formData.get('userDepartment') || undefined
    };

    // 表单验证
    if (!validateUserForm(userData)) {
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || '添加失败');
        closeAddUserModal();
        showNotification('success', '添加成功', '用户已成功添加到系统中');
        fetchUsers();
    } catch (e) {
        showNotification('error', '添加失败', e.message);
    }
}

// 表单验证
function validateUserForm(userData) {
    if (!userData.username || !userData.email || !userData.role || !userData.password) {
        showNotification('error', '验证失败', '请填写所有必填字段');
        return false;
    }
    if (userData.password !== userData.confirmPassword) {
        showNotification('error', '验证失败', '两次输入的密码不一致');
        return false;
    }
    return true;
}

// 编辑用户（打开编辑模态框）
function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const modal = document.getElementById('editUserModal');
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserName').value = user.username;
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editRealName').value = user.real_name || '';
    document.getElementById('editUserPhone').value = user.phone || '';
    document.getElementById('editUserRole').value = user.role_name || 'student';
    document.getElementById('editUserStatus').value = user.is_active ? 'active' : 'inactive';
    if (modal) modal.style.display = 'flex';
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) modal.style.display = 'none';
}

// 保存编辑
async function saveEditUser() {
    const userId = Number(document.getElementById('editUserId').value);
    const payload = {
        email: document.getElementById('editUserEmail').value.trim(),
        real_name: document.getElementById('editRealName').value.trim(),
        phone: document.getElementById('editUserPhone').value.trim(),
        role: document.getElementById('editUserRole').value,
        is_active: document.getElementById('editUserStatus').value === 'active'
    };
    try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || '更新失败');
        closeEditUserModal();
        showNotification('success', '更新成功', '用户信息已保存');
        fetchUsers();
    } catch (e) {
        showNotification('error', '更新失败', e.message);
    }
}

// 重置密码
async function resetPassword(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (!confirm(`确定要重置用户 ${user.real_name || user.username} 的密码吗？`)) return;
    try {
        const token = localStorage.getItem('adminToken') || '';
        const res = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || '重置失败');
        showNotification('success', '密码已重置', `临时密码：${data.temp_password}`);
    } catch (e) {
        showNotification('error', '重置失败', e.message);
    }
}

// 删除用户
async function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (!confirm(`确定要删除用户 ${user.real_name || user.username} 吗？此操作不可撤销。`)) return;
    try {
        const token = localStorage.getItem('adminToken') || '';
        const res = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || '删除失败');
        showNotification('success', '删除成功', `用户 ${user.real_name || user.username} 已被删除`);
        // 如果当前页删除后为空，回退一页
        if (users.length === 1 && currentPage > 1) currentPage -= 1;
        fetchUsers();
    } catch (e) {
        showNotification('error', '删除失败', e.message);
    }
}

// 导出用户数据（当前筛选结果）
function exportUsers() {
    const csvContent = "data:text/csv;charset=utf-8," +
        "用户名,姓名,邮箱,角色,状态,注册时间,最后登录\n" +
        users.map(user => {
            const role = user.role_name || '';
            const status = user.is_active ? '活跃' : '非活跃';
            const created = user.created_at ? user.created_at.substring(0,10) : '';
            const last = user.last_login ? user.last_login.replace('T',' ').substring(0,16) : '';
            return `${user.username},${user.real_name || ''},${user.email},${getRoleText(role)},${status},${created},${last}`;
        }).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('success', '导出成功', '用户数据已导出为CSV文件');
}

// 显示通知
function showNotification(type, title, message) {
    // 移除现有通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(notification);
    notification.style.display = 'flex';
    setTimeout(() => { if (notification.parentElement) notification.remove(); }, 3000);
}

// 获取通知图标
function getNotificationIcon(type) {
    const iconMap = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return iconMap[type] || 'fa-info-circle';
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + N 添加新用户
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showAddUserModal();
    }
    // ESC 关闭模态框
    if (e.key === 'Escape') {
        closeAddUserModal();
        closeEditUserModal();
    }
});