/**
 * UI工具库 - 用户体验增强
 * 提供统一的加载状态、错误处理、通知系统等功能
 */

class UIUtils {
    constructor() {
        this.toastContainer = null;
        this.loadingOverlay = null;
        this.init();
    }

    /**
     * 初始化UI工具
     */
    init() {
        this.createToastContainer();
        this.createLoadingOverlay();
        this.setupGlobalErrorHandler();
        this.setupAjaxErrorHandler();
        this.addResponsiveHelpers();
    }

    /**
     * 创建通知容器
     */
    createToastContainer() {
        if (this.toastContainer) return;
        
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    /**
     * 创建加载遮罩层
     */
    createLoadingOverlay() {
        if (this.loadingOverlay) return;
        
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="spinner lg"></div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型 (success, error, warning, info)
     * @param {string} title - 标题
     * @param {number} duration - 显示时长(毫秒)
     */
    showToast(message, type = 'info', title = '', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        const titleMap = {
            success: '成功',
            error: '错误',
            warning: '警告',
            info: '提示'
        };
        
        const toastTitle = title || titleMap[type];
        const icon = iconMap[type];
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${toastTitle}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="关闭">
                <span aria-hidden="true">×</span>
            </button>
            <div class="toast-progress"></div>
        `;
        
        // 添加关闭事件
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toast));
        
        // 添加到容器
        this.toastContainer.appendChild(toast);
        
        // 显示动画
        setTimeout(() => toast.classList.add('show'), 10);
        
        // 自动隐藏
        if (duration > 0) {
            setTimeout(() => this.hideToast(toast), duration);
        }
        
        return toast;
    }

    /**
     * 隐藏通知
     * @param {HTMLElement} toast - 通知元素
     */
    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * 显示成功通知
     * @param {string} message - 消息内容
     * @param {string} title - 标题
     */
    showSuccess(message, title = '') {
        return this.showToast(message, 'success', title);
    }

    /**
     * 显示错误通知
     * @param {string} message - 消息内容
     * @param {string} title - ''
     */
    showError(message, title = '') {
        return this.showToast(message, 'error', title, 0); // 错误通知不自动消失
    }

    /**
     * 显示警告通知
     * @param {string} message - 消息内容
     * @param {string} title - 标题
     */
    showWarning(message, title = '') {
        return this.showToast(message, 'warning', title);
    }

    /**
     * 显示信息通知
     * @param {string} message - 消息内容
     * @param {string} title - 标题
     */
    showInfo(message, title = '') {
        return this.showToast(message, 'info', title);
    }

    /**
     * 显示全局加载状态
     * @param {string} message - 加载消息
     */
    showLoading(message = '加载中...') {
        if (this.loadingOverlay) {
            const spinner = this.loadingOverlay.querySelector('.spinner');
            if (message && message !== '加载中...') {
                let messageEl = this.loadingOverlay.querySelector('.loading-message');
                if (!messageEl) {
                    messageEl = document.createElement('div');
                    messageEl.className = 'loading-message';
                    messageEl.style.cssText = 'margin-top: 1rem; color: #666; font-size: 0.9rem;';
                    this.loadingOverlay.appendChild(messageEl);
                }
                messageEl.textContent = message;
            }
            this.loadingOverlay.classList.add('show');
        }
    }

    /**
     * 隐藏全局加载状态
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
        }
    }

    /**
     * 为按钮添加加载状态
     * @param {HTMLElement} button - 按钮元素
     * @param {boolean} loading - 是否加载中
     */
    setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
            button.dataset.originalText = button.textContent;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
            }
        }
    }

    /**
     * 创建骨架屏
     * @param {HTMLElement} container - 容器元素
     * @param {Object} options - 配置选项
     */
    showSkeleton(container, options = {}) {
        const {
            rows = 3,
            avatar = false,
            card = false
        } = options;
        
        const skeletonHTML = [];
        
        if (avatar) {
            skeletonHTML.push('<div class="skeleton skeleton-avatar"></div>');
        }
        
        if (card) {
            skeletonHTML.push('<div class="skeleton skeleton-card"></div>');
        } else {
            for (let i = 0; i < rows; i++) {
                const width = i === rows - 1 ? 'w-3-4' : 'w-full';
                skeletonHTML.push(`<div class="skeleton skeleton-text ${width}"></div>`);
            }
        }
        
        container.innerHTML = `<div class="skeleton-wrapper">${skeletonHTML.join('')}</div>`;
    }

    /**
     * 隐藏骨架屏
     * @param {HTMLElement} container - 容器元素
     * @param {string} content - 要显示的内容
     */
    hideSkeleton(container, content = '') {
        const skeletonWrapper = container.querySelector('.skeleton-wrapper');
        if (skeletonWrapper) {
            skeletonWrapper.style.opacity = '0';
            setTimeout(() => {
                container.innerHTML = content;
                container.style.opacity = '0';
                setTimeout(() => {
                    container.style.opacity = '1';
                }, 50);
            }, 200);
        }
    }

    /**
     * 创建模态框
     * @param {Object} options - 配置选项
     */
    createModal(options = {}) {
        const {
            title = '提示',
            content = '',
            showClose = true,
            backdrop = true,
            size = 'md'
        } = options;
        
        // 创建背景遮罩
        const backdrop_el = document.createElement('div');
        backdrop_el.className = 'modal-backdrop';
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = `modal modal-${size}`;
        
        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                ${showClose ? '<button class="modal-close" aria-label="关闭"><span aria-hidden="true">×</span></button>' : ''}
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
        `;
        
        // 添加到页面
        document.body.appendChild(backdrop_el);
        document.body.appendChild(modal);
        
        // 显示动画
        setTimeout(() => {
            backdrop_el.classList.add('show');
            modal.classList.add('show');
        }, 10);
        
        // 关闭事件
        const closeModal = () => {
            backdrop_el.classList.remove('show');
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(backdrop_el);
                document.body.removeChild(modal);
            }, 300);
        };
        
        // 绑定关闭事件
        if (showClose) {
            modal.querySelector('.modal-close').addEventListener('click', closeModal);
        }
        
        if (backdrop) {
            backdrop_el.addEventListener('click', closeModal);
        }
        
        // ESC键关闭
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        return {
            modal,
            backdrop: backdrop_el,
            close: closeModal
        };
    }

    /**
     * 确认对话框
     * @param {string} message - 确认消息
     * @param {string} title - 标题
     */
    confirm(message, title = '确认') {
        return new Promise((resolve) => {
            const footer = `
                <button class="btn btn-secondary" data-action="cancel">取消</button>
                <button class="btn btn-primary" data-action="confirm">确认</button>
            `;
            
            const modalInstance = this.createModal({
                title,
                content: `<p>${message}</p>`,
                footer,
                backdrop: false
            });
            
            // 绑定按钮事件
            modalInstance.modal.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    modalInstance.close();
                } else if (action === 'cancel') {
                    resolve(false);
                    modalInstance.close();
                }
            });
        });
    }

    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandler() {
        // 捕获未处理的Promise错误
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise错误:', event.reason);
            this.showError('系统发生错误，请稍后重试', '系统错误');
            event.preventDefault();
        });
        
        // 捕获JavaScript错误
        window.addEventListener('error', (event) => {
            console.error('JavaScript错误:', event.error);
            this.showError('页面发生错误，请刷新页面重试', '页面错误');
        });
    }

    /**
     * 设置AJAX错误处理
     */
    setupAjaxErrorHandler() {
        // 拦截fetch请求
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.message || `请求失败 (${response.status})`;
                    this.showError(errorMessage, '请求错误');
                }
                
                return response;
            } catch (error) {
                console.error('网络请求错误:', error);
                this.showError('网络连接失败，请检查网络设置', '网络错误');
                throw error;
            }
        };
    }

    /**
     * 添加响应式辅助功能
     */
    addResponsiveHelpers() {
        // 检测设备类型
        const isMobile = () => window.innerWidth <= 768;
        const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
        const isDesktop = () => window.innerWidth > 1024;
        
        // 添加设备类型类名
        const updateDeviceClass = () => {
            document.body.classList.remove('mobile', 'tablet', 'desktop');
            if (isMobile()) {
                document.body.classList.add('mobile');
            } else if (isTablet()) {
                document.body.classList.add('tablet');
            } else {
                document.body.classList.add('desktop');
            }
        };
        
        updateDeviceClass();
        window.addEventListener('resize', updateDeviceClass);
        
        // 暴露设备检测方法
        window.deviceUtils = {
            isMobile,
            isTablet,
            isDesktop
        };
    }

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} limit - 限制时间
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化时间
     * @param {Date|string} date - 日期
     */
    formatTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) { // 1天内
            return Math.floor(diff / 3600000) + '小时前';
        } else if (diff < 604800000) { // 1周内
            return Math.floor(diff / 86400000) + '天前';
        } else {
            return d.toLocaleDateString();
        }
    }

    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('已复制到剪贴板');
        } catch (err) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showSuccess('已复制到剪贴板');
            } catch (err) {
                this.showError('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
        }
    }

    /**
     * 滚动到元素
     * @param {HTMLElement|string} element - 元素或选择器
     * @param {Object} options - 滚动选项
     */
    scrollToElement(element, options = {}) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                ...options
            });
        }
    }

    /**
     * 检查元素是否在视口中
     * @param {HTMLElement} element - 要检查的元素
     */
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// 创建全局实例
const ui = new UIUtils();

// 暴露到全局
window.ui = ui;
window.UIUtils = UIUtils;

// 兼容性检查和提示
if (!window.fetch) {
    ui.showWarning('您的浏览器版本过低，部分功能可能无法正常使用，建议升级浏览器', '浏览器兼容性');
}

// 网络状态监听
if ('onLine' in navigator) {
    window.addEventListener('online', () => {
        ui.showSuccess('网络连接已恢复');
    });
    
    window.addEventListener('offline', () => {
        ui.showWarning('网络连接已断开，请检查网络设置');
    });
}

// 页面可见性变化监听
if ('visibilityState' in document) {
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // 页面重新可见时，可以刷新数据
            console.log('页面重新可见');
        }
    });
}

// 导出模块（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIUtils;
}