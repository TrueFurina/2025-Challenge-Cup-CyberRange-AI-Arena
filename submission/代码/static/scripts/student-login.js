// 学员登录页面JavaScript

// 验证码相关变量
let studentCaptchaText = '';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    generateStudentCaptcha();
    
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

// 生成学员验证码
function generateStudentCaptcha() {
    const canvas = document.getElementById('studentCaptcha');
    const ctx = canvas.getContext('2d');
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 生成随机验证码
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    studentCaptchaText = '';
    for (let i = 0; i < 4; i++) {
        studentCaptchaText += chars.charAt(Math.floor(Math.random() * chars.length));
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
    
    for (let i = 0; i < studentCaptchaText.length; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, 0.8)`;
        const x = (canvas.width / 4) * i + (canvas.width / 8);
        const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
        const angle = (Math.random() - 0.5) * 0.3;
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillText(studentCaptchaText[i], 0, 0);
        ctx.restore();
    }
    
    // 添加噪点
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.3)`;
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
}

// 处理学员登录
async function handleStudentLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    const code = formData.get('code');
    const remember = formData.get('remember');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // 验证码检查
    if (code.toUpperCase() !== studentCaptchaText.toUpperCase()) {
        showMessage('验证码错误，请重新输入', 'error');
        generateStudentCaptcha();
        document.getElementById('studentCode').value = '';
        return;
    }
    
    if (!username || !password) {
        showMessage('请输入用户名和密码', 'error');
        return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('登录成功！正在跳转...', 'success');
            
            // 保存用户信息
            localStorage.setItem('userInfo', JSON.stringify(data.user));
            localStorage.setItem('isLoggedIn', 'true');
            
            // 记住我功能
            if (remember) {
                localStorage.setItem('studentRemember', 'true');
                localStorage.setItem('studentUsername', username);
            } else {
                localStorage.removeItem('studentRemember');
                localStorage.removeItem('studentUsername');
            }
            
            // 跳转到学员端主框架
            setTimeout(() => {
                window.location.href = 'student-main-frame.html';
            }, 1500);
        } else {
            showMessage(data.message || '登录失败，请检查用户名和密码', 'error');
            generateStudentCaptcha();
            document.getElementById('studentCode').value = '';
        }
    } catch (error) {
        console.error('登录错误:', error);
        showMessage('网络错误，请检查连接后重试', 'error');
        generateStudentCaptcha();
        document.getElementById('studentCode').value = '';
    } finally {
        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.innerHTML = '开始学习';
    }
}

// 显示消息提示
function showMessage(message, type) {
    // 移除已存在的消息
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 创建新消息
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
    `;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// 邮箱格式验证
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 实时验证用户名格式
document.getElementById('studentUsername').addEventListener('input', function(e) {
    const username = e.target.value;
    const isEmail = validateEmail(username);
    const isStudentId = /^\d{8}$/.test(username); // 8位数字学号
    const isUsername = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/.test(username); // 字母开头的用户名
    
    // 移除之前的提示
    const existingHint = document.querySelector('.username-hint');
    if (existingHint) {
        existingHint.remove();
    }
    
    if (username.length > 0 && !isEmail && !isStudentId && !isUsername) {
        const hint = document.createElement('div');
        hint.className = 'username-hint';
        hint.style.cssText = 'color: #ff6b6b; font-size: 0.8rem; margin-top: 5px;';
        hint.textContent = '请输入有效的邮箱、学号或用户名';
        e.target.parentElement.appendChild(hint);
    }
});

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
        color: #4834d4;
        transform: translateY(-5px);
        font-size: 0.9rem;
    }
    
    .password-strength {
        height: 4px;
        background: #e1e8ed;
        border-radius: 2px;
        margin-top: 5px;
        overflow: hidden;
    }
    
    .password-strength-bar {
        height: 100%;
        transition: all 0.3s ease;
        border-radius: 2px;
    }
    
    .strength-weak { background: #ff6b6b; width: 33%; }
    .strength-medium { background: #ffa726; width: 66%; }
    .strength-strong { background: #4caf50; width: 100%; }
`;
document.head.appendChild(style);

// 密码强度指示器
document.getElementById('studentPassword').addEventListener('input', function(e) {
    const password = e.target.value;
    let existingStrengthBar = document.querySelector('.password-strength');
    
    if (password.length === 0) {
        if (existingStrengthBar) {
            existingStrengthBar.remove();
        }
        return;
    }
    
    if (!existingStrengthBar) {
        existingStrengthBar = document.createElement('div');
        existingStrengthBar.className = 'password-strength';
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength-bar';
        existingStrengthBar.appendChild(strengthBar);
        e.target.parentElement.appendChild(existingStrengthBar);
    }
    
    const strengthBar = existingStrengthBar.querySelector('.password-strength-bar');
    const strength = checkPasswordStrength(password);
    
    strengthBar.className = 'password-strength-bar';
    if (strength <= 2) {
        strengthBar.classList.add('strength-weak');
    } else if (strength <= 3) {
        strengthBar.classList.add('strength-medium');
    } else {
        strengthBar.classList.add('strength-strong');
    }
});

// 检查密码强度
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    return strength;
}

// 页面加载时检查是否有记住的用户名
window.addEventListener('load', function() {
    if (localStorage.getItem('studentRemember') === 'true') {
        const savedUsername = localStorage.getItem('studentUsername');
        if (savedUsername) {
            document.getElementById('studentUsername').value = savedUsername;
            document.querySelector('input[name="remember"]').checked = true;
        }
    }
});

// 键盘事件处理
document.addEventListener('keydown', function(event) {
    // 按F5刷新验证码
    if (event.key === 'F5') {
        event.preventDefault();
        generateStudentCaptcha();
    }
    
    // 按Enter提交表单
    if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        const form = document.getElementById('studentLoginForm');
        if (form) {
            handleStudentLogin({ target: form, preventDefault: () => {} });
        }
    }
});

// 防止表单重复提交
let isSubmitting = false;
const originalHandleStudentLogin = handleStudentLogin;
handleStudentLogin = function(event) {
    if (isSubmitting) {
        event.preventDefault();
        return;
    }
    
    isSubmitting = true;
    const submitButton = document.querySelector('.login-submit');
    const originalText = submitButton.textContent;
    submitButton.textContent = '登录中...';
    submitButton.disabled = true;
    
    // 调用原始登录函数
    originalHandleStudentLogin(event);
    
    // 2秒后恢复按钮状态
    setTimeout(() => {
        isSubmitting = false;
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 2000);
};

// 添加一些有趣的交互效果
document.querySelector('.login-container').addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.02)';
    this.style.transition = 'transform 0.3s ease';
});

document.querySelector('.login-container').addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
});

// 显示登录提示信息
function showLoginHints() {
    const hints = [
        '测试账号: student / student123',
        '测试邮箱: test@example.com / test123',
        '测试学号: 20240001 / password'
    ];
    
    console.log('=== 学员登录测试账号 ===');
    hints.forEach(hint => console.log(hint));
    console.log('========================');
}

// 页面加载完成后显示提示
setTimeout(showLoginHints, 1000);