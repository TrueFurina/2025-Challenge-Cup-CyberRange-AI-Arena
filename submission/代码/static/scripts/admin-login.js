// 管理员登录页面JavaScript

// 验证码相关变量
let adminCaptchaText = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    generateAdminCaptcha();
    
    // 添加输入框焦点效果
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});

// 生成管理员验证码
function generateAdminCaptcha() {
    const canvas = document.getElementById('adminCaptcha');
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 生成随机验证码
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    adminCaptchaText = '';
    for (let i = 0; i < 4; i++) {
        adminCaptchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 设置背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制干扰线
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // 绘制验证码文字
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < adminCaptchaText.length; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, 0.8)`;
        const x = (canvas.width / 4) * i + (canvas.width / 8);
        const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
        const angle = (Math.random() - 0.5) * 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(adminCaptchaText[i], 0, 0);
        ctx.restore();
    }
    
    // 添加噪点
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
}

// 处理管理员登录
function handleAdminLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.login-submit');
    
    const username = formData.get('username');
    const password = formData.get('password');
    const code = formData.get('code');
    const remember = formData.get('remember');
    
    // 验证码检查
    if (code.toUpperCase() !== adminCaptchaText.toUpperCase()) {
        ui.showError('验证码错误，请重新输入');
        generateAdminCaptcha();
        document.getElementById('adminCode').value = '';
        document.getElementById('adminCode').focus();
        return;
    }
    
    // 设置按钮加载状态
    ui.setButtonLoading(submitButton, true);
    
    // 安全修复（P0）：改为调用后端 API 真实登录，获取 token 供敏感接口鉴权
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            ui.showSuccess('登录成功！正在跳转...');
            
            // 记住用户名
            if (remember) {
                localStorage.setItem('rememberedAdminUsername', username);
            } else {
                localStorage.removeItem('rememberedAdminUsername');
            }
            
            // 设置登录状态
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            if (data.token) {
                localStorage.setItem('adminToken', data.token);
            }
            
            // 跳转延迟
            setTimeout(() => {
                window.location.href = 'main-frame.html';
            }, 1500);
        } else {
            ui.showError(data.message || '用户名或密码错误，请重新输入');
            generateAdminCaptcha();
            document.getElementById('adminCode').value = '';
            ui.setButtonLoading(submitButton, false);
        }
    })
    .catch(err => {
        ui.showError('登录请求失败：' + (err.message || '网络异常'));
        ui.setButtonLoading(submitButton, false);
    });
    }


// 表单验证
function validateForm(formData) {
    const username = formData.get('username');
    const password = formData.get('password');
    const code = formData.get('code');
    
    if (!username || username.trim().length < 3) {
        ui.showError('用户名至少需要3个字符');
        return false;
    }
    
    if (!password || password.length < 6) {
        ui.showError('密码至少需要6个字符');
        return false;
    }
    
    if (!code || code.length !== 4) {
        ui.showError('请输入4位验证码');
        return false;
    }
    
    return true;
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .form-group.focused label {
        color: #ff6b6b;
        transform: translateY(-5px);
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);

// 页面加载时检查是否有记住的用户名
window.addEventListener('load', function() {
    if (localStorage.getItem('adminRemember') === 'true') {
        const savedUsername = localStorage.getItem('adminUsername');
        if (savedUsername) {
            document.getElementById('adminUsername').value = savedUsername;
            document.querySelector('input[name="remember"]').checked = true;
        }
    }
});

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    // 按F5刷新验证码
    if (event.key === 'F5') {
        event.preventDefault();
        generateAdminCaptcha();
    }
    
    // 按Enter提交表单
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        const form = document.getElementById('adminLoginForm');
        if (form) {
            handleAdminLogin({ target: form, preventDefault: () => {} });
        }
    }
});

// 添加密码强度检查（可选功能）
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// 增强的表单处理
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('adminLoginForm');
    const inputs = form.querySelectorAll('input');
    
    // 添加实时验证
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            clearInputError(this);
        });
    });
    
    // 自动填充记住的用户名
    const rememberedUsername = localStorage.getItem('rememberedAdminUsername');
    if (rememberedUsername) {
        document.getElementById('adminUsername').value = rememberedUsername;
        document.querySelector('input[name="remember"]').checked = true;
    }
});

// 输入验证
function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';
    
    switch(input.name) {
        case 'username':
            if (value.length < 3) {
                isValid = false;
                message = '用户名至少需要3个字符';
            }
            break;
        case 'password':
            if (value.length < 6) {
                isValid = false;
                message = '密码至少需要6个字符';
            }
            break;
        case 'code':
            if (value.length !== 4) {
                isValid = false;
                message = '验证码必须是4位';
            }
            break;
    }
    
    if (!isValid) {
        showInputError(input, message);
    } else {
        clearInputError(input);
    }
    
    return isValid;
}

// 显示输入错误
function showInputError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.add('error');
    
    let errorEl = formGroup.querySelector('.error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

// 清除输入错误
function clearInputError(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('error');
    
    const errorEl = formGroup.querySelector('.error-message');
    if (errorEl) {
        errorEl.remove();
    }
}