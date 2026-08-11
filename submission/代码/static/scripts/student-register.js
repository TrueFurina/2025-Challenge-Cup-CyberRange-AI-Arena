// 注册页面JavaScript逻辑

let captchaText = '';
let validationState = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    realName: false
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    generateCaptcha();
    setupValidation();
    setupPasswordStrength();
});

// 生成验证码
function generateCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 生成随机验证码
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    captchaText = '';
    for (let i = 0; i < 4; i++) {
        captchaText += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 设置背景
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制干扰线
    for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 50%, 70%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }
    
    // 绘制验证码文字
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 0; i < captchaText.length; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`;
        const x = 20 + i * 20;
        const y = 20 + Math.random() * 10 - 5;
        const angle = (Math.random() - 0.5) * 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(captchaText[i], 0, 0);
        ctx.restore();
    }
    
    // 绘制干扰点
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 60%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
        ctx.fill();
    }
}

// 设置表单验证
function setupValidation() {
    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const realName = document.getElementById('realName');
    const studentId = document.getElementById('studentId');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const captcha = document.getElementById('captcha');
    
    // 用户名验证
    username.addEventListener('input', function() {
        validateUsername(this.value);
    });
    
    username.addEventListener('blur', function() {
        if (this.value && validationState.username) {
            checkUsernameAvailability(this.value);
        }
    });
    
    // 邮箱验证
    email.addEventListener('input', function() {
        validateEmail(this.value);
    });
    
    email.addEventListener('blur', function() {
        if (this.value && validationState.email) {
            checkEmailAvailability(this.value);
        }
    });
    
    // 真实姓名验证
    realName.addEventListener('input', function() {
        validateRealName(this.value);
    });
    
    // 学号验证
    studentId.addEventListener('input', function() {
        validateStudentId(this.value);
    });
    
    // 手机号验证
    phone.addEventListener('input', function() {
        validatePhone(this.value);
    });
    
    // 密码验证
    password.addEventListener('input', function() {
        validatePassword(this.value);
        if (confirmPassword.value) {
            validateConfirmPassword(confirmPassword.value);
        }
    });
    
    // 确认密码验证
    confirmPassword.addEventListener('input', function() {
        validateConfirmPassword(this.value);
    });
    
    // 验证码验证
    captcha.addEventListener('input', function() {
        validateCaptcha(this.value);
    });
}

// 用户名验证
function validateUsername(username) {
    const messageEl = document.getElementById('usernameMessage');
    const pattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
    
    if (!username) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        validationState.username = false;
        return;
    }
    
    if (!pattern.test(username)) {
        messageEl.textContent = '用户名必须以字母开头，3-16位，只能包含字母、数字和下划线';
        messageEl.className = 'validation-message error';
        validationState.username = false;
    } else {
        messageEl.textContent = '用户名格式正确';
        messageEl.className = 'validation-message success';
        validationState.username = true;
    }
    
    updateSubmitButton();
}

// 检查用户名可用性
async function checkUsernameAvailability(username) {
    const messageEl = document.getElementById('usernameMessage');
    
    try {
        const response = await fetch('/api/auth/check-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        const data = await response.json();
        
        if (data.available) {
            messageEl.textContent = '用户名可用';
            messageEl.className = 'validation-message success';
            validationState.username = true;
        } else {
            messageEl.textContent = '用户名已被使用';
            messageEl.className = 'validation-message error';
            validationState.username = false;
        }
    } catch (error) {
        messageEl.textContent = '检查用户名时出错';
        messageEl.className = 'validation-message error';
        validationState.username = false;
    }
    
    updateSubmitButton();
}

// 邮箱验证
function validateEmail(email) {
    const messageEl = document.getElementById('emailMessage');
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        validationState.email = false;
        return;
    }
    
    if (!pattern.test(email)) {
        messageEl.textContent = '请输入有效的邮箱地址';
        messageEl.className = 'validation-message error';
        validationState.email = false;
    } else {
        messageEl.textContent = '邮箱格式正确';
        messageEl.className = 'validation-message success';
        validationState.email = true;
    }
    
    updateSubmitButton();
}

// 检查邮箱可用性
async function checkEmailAvailability(email) {
    const messageEl = document.getElementById('emailMessage');
    
    try {
        const response = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.available) {
            messageEl.textContent = '邮箱可用';
            messageEl.className = 'validation-message success';
            validationState.email = true;
        } else {
            messageEl.textContent = '邮箱已被使用';
            messageEl.className = 'validation-message error';
            validationState.email = false;
        }
    } catch (error) {
        messageEl.textContent = '检查邮箱时出错';
        messageEl.className = 'validation-message error';
        validationState.email = false;
    }
    
    updateSubmitButton();
}

// 真实姓名验证
function validateRealName(realName) {
    const messageEl = document.getElementById('realNameMessage');
    const pattern = /^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/;
    
    if (!realName) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        validationState.realName = false;
        return;
    }
    
    if (!pattern.test(realName)) {
        messageEl.textContent = '姓名只能包含中文、英文和空格，2-20个字符';
        messageEl.className = 'validation-message error';
        validationState.realName = false;
    } else {
        messageEl.textContent = '姓名格式正确';
        messageEl.className = 'validation-message success';
        validationState.realName = true;
    }
    
    updateSubmitButton();
}

// 学号验证
function validateStudentId(studentId) {
    const messageEl = document.getElementById('studentIdMessage');
    
    if (!studentId) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        return;
    }
    
    const pattern = /^\d{8,12}$/;
    
    if (!pattern.test(studentId)) {
        messageEl.textContent = '学号应为8-12位数字';
        messageEl.className = 'validation-message error';
    } else {
        messageEl.textContent = '学号格式正确';
        messageEl.className = 'validation-message success';
    }
}

// 手机号验证
function validatePhone(phone) {
    const messageEl = document.getElementById('phoneMessage');
    
    if (!phone) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        return;
    }
    
    const pattern = /^1[3-9]\d{9}$/;
    
    if (!pattern.test(phone)) {
        messageEl.textContent = '请输入有效的手机号';
        messageEl.className = 'validation-message error';
    } else {
        messageEl.textContent = '手机号格式正确';
        messageEl.className = 'validation-message success';
    }
}

// 密码强度检测
function setupPasswordStrength() {
    const password = document.getElementById('password');
    const strengthEl = document.getElementById('passwordStrength');
    
    password.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        updatePasswordStrengthDisplay(strength);
    });
}

// 计算密码强度
function calculatePasswordStrength(password) {
    if (!password) return { level: 0, text: '' };
    
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        symbols: /[^\w\s]/.test(password)
    };
    
    // 基础分数
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // 字符类型分数
    Object.values(checks).forEach(check => {
        if (check) score += 1;
    });
    
    let level, text;
    if (score < 3) {
        level = 'weak';
        text = '弱';
    } else if (score < 5) {
        level = 'medium';
        text = '中等';
    } else {
        level = 'strong';
        text = '强';
    }
    
    return { level, text, score };
}

// 更新密码强度显示
function updatePasswordStrengthDisplay(strength) {
    const strengthEl = document.getElementById('passwordStrength');
    const textEl = strengthEl.querySelector('.strength-text');
    
    strengthEl.className = `password-strength strength-${strength.level}`;
    textEl.textContent = strength.text ? `密码强度：${strength.text}` : '';
}

// 密码验证
function validatePassword(password) {
    const strength = calculatePasswordStrength(password);
    
    if (!password) {
        validationState.password = false;
        return;
    }
    
    if (password.length < 6) {
        validationState.password = false;
    } else {
        validationState.password = true;
    }
    
    updateSubmitButton();
}

// 确认密码验证
function validateConfirmPassword(confirmPassword) {
    const messageEl = document.getElementById('confirmPasswordMessage');
    const password = document.getElementById('password').value;
    
    if (!confirmPassword) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        validationState.confirmPassword = false;
        return;
    }
    
    if (confirmPassword !== password) {
        messageEl.textContent = '两次输入的密码不一致';
        messageEl.className = 'validation-message error';
        validationState.confirmPassword = false;
    } else {
        messageEl.textContent = '密码确认正确';
        messageEl.className = 'validation-message success';
        validationState.confirmPassword = true;
    }
    
    updateSubmitButton();
}

// 验证码验证
function validateCaptcha(inputCaptcha) {
    const messageEl = document.getElementById('captchaMessage');
    
    if (!inputCaptcha) {
        messageEl.textContent = '';
        messageEl.className = 'validation-message';
        return;
    }
    
    if (inputCaptcha.toLowerCase() !== captchaText.toLowerCase()) {
        messageEl.textContent = '验证码错误';
        messageEl.className = 'validation-message error';
    } else {
        messageEl.textContent = '验证码正确';
        messageEl.className = 'validation-message success';
    }
}

// 更新提交按钮状态
function updateSubmitButton() {
    const submitBtn = document.getElementById('registerBtn');
    const agreement = document.getElementById('agreement');
    
    const isValid = validationState.username && 
                   validationState.email && 
                   validationState.password && 
                   validationState.confirmPassword && 
                   validationState.realName;
    
    if (isValid && agreement.checked) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// 协议复选框事件
document.addEventListener('DOMContentLoaded', function() {
    const agreement = document.getElementById('agreement');
    agreement.addEventListener('change', updateSubmitButton);
});

// 处理注册表单提交
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = document.getElementById('registerBtn');
    
    // 验证验证码
    const captchaInput = document.getElementById('captcha').value;
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
        showMessage('验证码错误，请重新输入', 'error');
        generateCaptcha();
        document.getElementById('captcha').value = '';
        return;
    }
    
    // 准备提交数据
    const registerData = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        real_name: formData.get('real_name'),
        student_id: formData.get('student_id') || null,
        phone: formData.get('phone') || null
    };
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 注册中...';
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('注册成功！正在跳转到登录页面...', 'success');
            setTimeout(() => {
                window.location.href = 'student-login.html';
            }, 2000);
        } else {
            showMessage(data.message || '注册失败，请重试', 'error');
            generateCaptcha();
            document.getElementById('captcha').value = '';
        }
    } catch (error) {
        console.error('注册错误:', error);
        showMessage('网络错误，请检查连接后重试', 'error');
        generateCaptcha();
        document.getElementById('captcha').value = '';
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> 立即注册';
    }
}

// 显示消息提示
function showMessage(message, type = 'info') {
    // 移除现有的消息
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新的消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast ${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // 添加样式
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 3000);
}

// 添加动画样式
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
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .message-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
`;
document.head.appendChild(style);