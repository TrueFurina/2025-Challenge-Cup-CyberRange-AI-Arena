// 侧边栏组件JavaScript
class SidebarManager {
    constructor() {
        this.currentPage = this.getCurrentPageName();
        this.isMainFrame = window.location.pathname.includes('main-frame.html'); // 检测是否是主框架页面
        this.isFrameMode = window.parent !== window; // 检测是否在iframe中
        this.init();
    }

    // 获取当前页面名称
    getCurrentPageName() {
        try {
            if (this.isMainFrame) {
                // 在主框架模式下，默认返回 admin-dashboard
                return 'admin-dashboard';
            } else if (this.isFrameMode) {
                // 在iframe模式下，从URL参数或默认值获取当前页面
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get('page') || 'admin-dashboard';
            } else {
                const path = window.location.pathname;
                const filename = path.split('/').pop();
                console.log('Current filename:', filename);
                return filename.replace('.html', '');
            }
        } catch (error) {
            console.error('获取当前页面名称时出错:', error);
            return 'admin-dashboard'; // 出错时返回默认值
        }
    }

    // 初始化侧边栏
    init() {
        this.loadSidebar();
    }

    // 加载侧边栏HTML
    async loadSidebar() {
        try {
            console.log('Loading sidebar...');
            // 根据是否在主框架中确定正确的路径
            const sidebarPath = '/static/components/sidebar.html';
            console.log('Sidebar path:', sidebarPath);
            
            const response = await fetch(sidebarPath);
            const sidebarHTML = await response.text();
            
            // 查找侧边栏容器并插入HTML
            const sidebarContainer = document.querySelector('#sidebar-container') || document.querySelector('.sidebar') || document.querySelector('#sidebar');
            console.log('Found sidebar container:', sidebarContainer);
            
            if (sidebarContainer) {
                sidebarContainer.innerHTML = sidebarHTML;
                console.log('Inserted sidebar HTML into container');
            } else {
                // 如果没有找到容器，在body中插入
                console.log('No sidebar container found, inserting into body');
                const body = document.querySelector('body');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = sidebarHTML;
                body.insertBefore(tempDiv.firstElementChild, body.firstChild.nextSibling);
            }
            
            console.log('Sidebar loaded successfully');
            
            // 立即初始化事件监听器，不使用setTimeout
            this.initEventListeners();
            console.log('Event listeners initialized');
            
            this.setActiveState();
            console.log('Active state set');
            
            // 确保所有子菜单的初始状态是隐藏的
            document.querySelectorAll('.submenu').forEach(submenu => {
                submenu.style.display = 'none';
            });
            console.log('All submenus initially hidden');
        } catch (error) {
            console.error('加载侧边栏失败:', error);
        }
    }

    // 初始化事件监听器
    initEventListeners() {
        // 使用事件委托处理子菜单切换
        document.addEventListener('click', (e) => {
            try {
                console.log('Click event detected:', e.target);
                
                // 检查是否点击了子菜单切换按钮或其子元素
                const toggle = e.target.closest('.submenu-toggle');
                if (toggle) {
                    console.log('Submenu toggle clicked:', toggle);
                    e.preventDefault();
                    e.stopPropagation(); // 阻止事件冒泡
                    
                    const parentLi = toggle.closest('li.has-submenu');
                    console.log('Parent li element:', parentLi);
                    
                    if (!parentLi) {
                        console.error('无法找到父级li.has-submenu元素');
                        return;
                    }
                    
                    const submenu = parentLi.querySelector('.submenu');
                    console.log('Submenu element:', submenu);
                    
                    if (!submenu) {
                        console.error('无法找到.submenu元素');
                        return;
                    }
                    
                    const arrow = toggle.querySelector('.submenu-arrow');
                    console.log('Arrow element:', arrow);
                    
                    // 获取计算后的样式，而不是内联样式
                    const computedStyle = window.getComputedStyle(submenu);
                    console.log('当前submenu计算后的显示状态:', computedStyle.display);
                    
                    // 根据计算后的样式判断是显示还是隐藏
                    const isVisible = computedStyle.display !== 'none';
                    console.log('子菜单是否可见:', isVisible);
                    
                    if (isVisible) {
                        console.log('正在关闭子菜单');
                        submenu.style.display = 'none';
                        parentLi.classList.remove('expanded');
                        if (arrow) arrow.style.transform = 'rotate(0deg)';
                    } else {
                        console.log('正在打开子菜单');
                        // 先收起其他所有子菜单
                        document.querySelectorAll('.submenu').forEach(menu => {
                            menu.style.display = 'none';
                        });
                        document.querySelectorAll('.has-submenu').forEach(item => {
                            item.classList.remove('expanded');
                        });
                        document.querySelectorAll('.submenu-arrow').forEach(arr => {
                            arr.style.transform = 'rotate(0deg)';
                        });
                        
                        // 展开当前子菜单
                        submenu.style.display = 'block';
                        parentLi.classList.add('expanded');
                        if (arrow) arrow.style.transform = 'rotate(180deg)';
                        
                        console.log('子菜单已展开，当前状态:', submenu.style.display);
                    }
                }
            } catch (error) {
                console.error('处理子菜单点击事件出错:', error);
            }
            
            // 处理页面导航链接
            const link = e.target.closest('a[href]');
            if (link && link.getAttribute('href').endsWith('.html')) {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (this.isMainFrame && window.frameManager) {
                    // 在主框架模式下，使用frameManager进行导航
                    window.frameManager.loadPage(href);
                    // 更新激活状态
                    this.updateActiveStateFromHref(href);
                } else if (this.isFrameMode && window.parent.frameManager) {
                    // 在iframe模式下，通知父窗口进行导航
                    window.parent.frameManager.loadPage(href);
                } else {
                    // 在普通模式下，直接跳转
                    window.location.href = href;
                }
            }
        });
    }

    // 设置当前页面的激活状态
    setActiveState() {
        console.log('Setting active state for page:', this.currentPage);
        
        // 清除所有激活状态
        document.querySelectorAll('.sidebar-menu li').forEach(li => {
            li.classList.remove('active');
        });

        try {
            // 根据当前页面设置激活状态
            // 首先尝试使用data-page属性查找
            let currentPageElement = document.querySelector(`[data-page="${this.currentPage}"]`);
            
            // 如果找不到，尝试使用href属性查找
            if (!currentPageElement) {
                console.log(`未找到data-page="${this.currentPage}"的元素，尝试使用href查找`);
                currentPageElement = document.querySelector(`a[href="${this.currentPage}.html"]`);
                if (currentPageElement) {
                    currentPageElement = currentPageElement.closest('li');
                }
            }
            
            console.log('Current page element:', currentPageElement);
            
            if (currentPageElement) {
                // 激活当前页面项
                currentPageElement.classList.add('active');
                console.log('Activated current page element');
                
                // 激活父菜单项并展开子菜单
                const parentSubmenu = currentPageElement.closest('.has-submenu');
                console.log('Parent submenu:', parentSubmenu);
                
                if (parentSubmenu) {
                    parentSubmenu.classList.add('active', 'expanded');
                    const submenu = parentSubmenu.querySelector('.submenu');
                    const arrow = parentSubmenu.querySelector('.submenu-arrow');
                    console.log('Submenu to expand:', submenu);
                    console.log('Arrow to rotate:', arrow);
                    
                    if (submenu) {
                        submenu.style.display = 'block';
                        console.log('Expanded submenu');
                    }
                    if (arrow) {
                        arrow.style.transform = 'rotate(180deg)';
                        console.log('Rotated arrow');
                    }
                }
            } else {
                console.warn(`无法找到与"${this.currentPage}"匹配的菜单项`);
            }
        } catch (error) {
            console.error('设置激活状态时出错:', error);
        }
        
        // 如果没有找到对应的页面，检查是否是仪表板
        if (!document.querySelector(`[data-page="${this.currentPage}"]`) && 
            !document.querySelector(`a[href="${this.currentPage}.html"]`)) {
            if (this.currentPage === 'admin-dashboard') {
                const dashboardLink = document.querySelector('a[href="admin-dashboard.html"]');
                if (dashboardLink) {
                    dashboardLink.closest('li').classList.add('active');
                }
            }
        }
    }

    // 手动设置激活页面（用于动态页面切换）
    setActivePage(pageName) {
        this.currentPage = pageName;
        this.setActiveState();
    }
    
    // 根据href更新激活状态
    updateActiveStateFromHref(href) {
        try {
            console.log('Updating active state from href:', href);
            const fileName = href.split('/').pop().replace('.html', '');
            console.log('Page name extracted from href:', fileName);
            this.currentPage = fileName;
            this.setActiveState();
        } catch (error) {
            console.error('从href更新激活状态时出错:', error);
        }
    }
}

// 侧边栏管理器类定义完成
// 初始化将在主框架页面中进行

// 全局toggleSubmenu函数已移除，子菜单切换逻辑现在由SidebarManager类处理

// 导出给其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarManager;
}