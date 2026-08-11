// AI场景创建器
class AIScenarioCreator {
    constructor() {
        this.chatMessages = [];
        this.currentScenario = null;
        this.isGenerating = false;
    }

    // 初始化AI聊天
    initialize() {
        this.bindEvents();
        this.resetChat();
    }

    // 绑定事件
    bindEvents() {
        const sendBtn = document.getElementById('sendMessageBtn');
        const chatInput = document.getElementById('chatInput');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');
        const acceptBtn = document.getElementById('acceptScenarioBtn');
        const modifyBtn = document.getElementById('modifyScenarioBtn');
        const regenerateBtn = document.getElementById('regenerateScenarioBtn');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.dataset.suggestion;
                chatInput.value = suggestion;
                this.sendMessage();
            });
        });

        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => this.acceptScenario());
        }

        if (modifyBtn) {
            modifyBtn.addEventListener('click', () => this.continueOptimization());
        }

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateScenario());
        }
    }

    // 重置聊天
    resetChat() {
        this.chatMessages = [];
        this.currentScenario = null;
        this.hideGeneratedScenario();
        
        const chatMessagesContainer = document.getElementById('chatMessages');
        if (chatMessagesContainer) {
            chatMessagesContainer.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <p>您好！我是AI场景助手。请告诉我您想要创建什么类型的训练场景？</p>
                        <p>您可以描述：</p>
                        <ul>
                            <li>场景类型（渗透测试、防御演练、取证分析等）</li>
                            <li>难度级别（初级、中级、高级、专家）</li>
                            <li>具体的训练目标和技能要求</li>
                            <li>需要的设备和环境配置</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    // 发送消息
    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || this.isGenerating) return;
        
        // 添加用户消息
        this.addMessage('user', message);
        chatInput.value = '';
        
        // 模拟AI响应
        this.generateAIResponse(message);
    }

    // 添加消息到聊天界面
    addMessage(type, content) {
        const chatMessagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatarIcon = type === 'ai' ? 'fa-robot' : 'fa-user';
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        
        chatMessagesContainer.appendChild(messageDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        
        this.chatMessages.push({ type, content, timestamp: new Date() });
    }

    // 生成AI响应
    async generateAIResponse(userMessage) {
        this.isGenerating = true;
        this.showTypingIndicator();
        
        // 模拟AI思考时间
        await this.delay(1500);
        
        this.hideTypingIndicator();
        
        // 分析用户输入并生成响应
        const response = this.analyzeUserInput(userMessage);
        this.addMessage('ai', response.message);
        
        // 如果需要生成场景
        if (response.shouldGenerateScenario) {
            await this.delay(1000);
            this.generateScenario(userMessage);
        }
        
        this.isGenerating = false;
    }

    // 分析用户输入
    analyzeUserInput(message) {
        const lowerMessage = message.toLowerCase();
        
        // 检测场景类型
        const scenarioTypes = {
            '渗透测试': 'penetration',
            'web渗透': 'penetration',
            '防御演练': 'defense',
            '网络防御': 'defense',
            '取证分析': 'forensics',
            '数字取证': 'forensics',
            '恶意软件': 'malware',
            '社会工程': 'social'
        };
        
        // 检测难度级别
        const difficulties = {
            '初级': 'beginner',
            '基础': 'beginner',
            '中级': 'intermediate',
            '高级': 'advanced',
            '专家': 'expert'
        };
        
        let detectedType = null;
        let detectedDifficulty = null;
        
        for (const [key, value] of Object.entries(scenarioTypes)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                detectedType = value;
                break;
            }
        }
        
        for (const [key, value] of Object.entries(difficulties)) {
            if (lowerMessage.includes(key.toLowerCase())) {
                detectedDifficulty = value;
                break;
            }
        }
        
        // 生成响应
        if (detectedType && detectedDifficulty) {
            return {
                message: `我理解了！您想要创建一个${this.getTypeText(detectedType)}的${this.getDifficultyText(detectedDifficulty)}场景。让我为您生成一个详细的场景配置...`,
                shouldGenerateScenario: true
            };
        } else if (detectedType) {
            return {
                message: `好的，我看到您想要创建${this.getTypeText(detectedType)}场景。请告诉我您希望的难度级别是什么？（初级、中级、高级、专家）`,
                shouldGenerateScenario: false
            };
        } else if (detectedDifficulty) {
            return {
                message: `明白了，您想要${this.getDifficultyText(detectedDifficulty)}难度的场景。请告诉我具体的场景类型，比如渗透测试、防御演练、取证分析等？`,
                shouldGenerateScenario: false
            };
        } else {
            return {
                message: `我需要更多信息来为您创建场景。请告诉我：\n1. 场景类型（如：渗透测试、防御演练、取证分析）\n2. 难度级别（初级、中级、高级、专家）\n3. 具体的训练目标`,
                shouldGenerateScenario: false
            };
        }
    }

    // 生成场景
    async generateScenario(userInput) {
        this.showTypingIndicator();
        await this.delay(2000);
        this.hideTypingIndicator();
        
        // 模拟生成的场景数据
        const scenario = this.createMockScenario(userInput);
        this.currentScenario = scenario;
        
        this.addMessage('ai', '太好了！我已经为您生成了一个定制化的训练场景。请查看下方的场景配置，您可以选择接受、继续优化或重新生成。');
        
        this.showGeneratedScenario(scenario);
    }

    // 创建模拟场景数据
    createMockScenario(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        // 基于用户输入生成场景
        let scenarioType = 'penetration';
        let difficulty = 'intermediate';
        let name = 'AI生成的训练场景';
        let description = '';
        let objectives = '';
        
        // 解析网络拓扑信息
        const topologyData = this.parseNetworkTopology(userInput);
        
        if (lowerInput.includes('web') || lowerInput.includes('渗透')) {
            scenarioType = 'penetration';
            name = 'Web应用渗透测试场景';
            description = '基于您的需求生成的Web应用渗透测试训练场景，包含常见Web漏洞的识别与利用实践。';
            objectives = '1. 掌握Web应用漏洞扫描技术\n2. 学习SQL注入攻击方法\n3. 实践XSS漏洞利用\n4. 了解文件上传漏洞\n5. 编写渗透测试报告';
        } else if (lowerInput.includes('防御') || lowerInput.includes('蓝队')) {
            scenarioType = 'defense';
            name = '网络防御演练场景';
            description = '模拟真实网络环境的防御演练，学习如何检测、分析和应对各种网络攻击。';
            objectives = '1. 配置防火墙规则\n2. 部署入侵检测系统\n3. 分析攻击日志\n4. 制定应急响应计划\n5. 加固系统安全';
        } else if (lowerInput.includes('取证') || lowerInput.includes('分析')) {
            scenarioType = 'forensics';
            name = '数字取证分析场景';
            description = '通过实际案例学习数字取证技术，包括数据恢复、日志分析和证据链构建。';
            objectives = '1. 学习取证工具使用\n2. 分析系统日志\n3. 恢复删除文件\n4. 构建证据链\n5. 撰写取证报告';
        } else if (lowerInput.includes('企业网络') || lowerInput.includes('网络环境')) {
            scenarioType = 'penetration';
            name = '企业网络渗透测试场景';
            description = '模拟真实企业网络环境的渗透测试训练，包含DMZ区、内网区等多层网络架构的安全评估。';
            objectives = '1. 网络拓扑侦察与分析\n2. DMZ区Web服务器渗透\n3. 内网横向移动技术\n4. 域控制器权限提升\n5. 数据库和文件服务器攻击';
        }
        
        if (lowerInput.includes('初级') || lowerInput.includes('基础')) {
            difficulty = 'beginner';
        } else if (lowerInput.includes('高级')) {
            difficulty = 'advanced';
        } else if (lowerInput.includes('专家')) {
            difficulty = 'expert';
        }
        
        const scenario = {
            name,
            type: scenarioType,
            difficulty,
            description,
            objectives,
            estimatedTime: this.getEstimatedTime(difficulty),
            prerequisites: this.getPrerequisites(scenarioType, difficulty),
            targets: this.generateTargets(scenarioType),
            topology: topologyData
        };
        
        console.log('createMockScenario 生成的拓扑数据:', topologyData);
        console.log('createMockScenario 完整的场景数据:', scenario);
        
        return scenario;
    }

    // 获取预估时间
    getEstimatedTime(difficulty) {
        const timeMap = {
            'beginner': 90,
            'intermediate': 150,
            'advanced': 240,
            'expert': 360
        };
        return timeMap[difficulty] || 120;
    }

    // 获取前置要求
    getPrerequisites(type, difficulty) {
        const prerequisites = {
            'penetration': {
                'beginner': '基本的网络知识，了解HTTP协议',
                'intermediate': '熟悉Web技术，掌握基本的渗透测试工具',
                'advanced': '具备丰富的渗透测试经验，熟练使用各种安全工具',
                'expert': '专业级渗透测试技能，具备代码审计能力'
            },
            'defense': {
                'beginner': '基本的网络安全概念，了解常见攻击类型',
                'intermediate': '熟悉网络设备配置，掌握基本的日志分析',
                'advanced': '具备丰富的安全运维经验，熟练使用SIEM工具',
                'expert': '专业级安全架构设计能力，具备威胁狩猎技能'
            },
            'forensics': {
                'beginner': '基本的计算机知识，了解文件系统',
                'intermediate': '熟悉操作系统原理，掌握基本的取证工具',
                'advanced': '具备丰富的取证经验，熟练使用专业取证软件',
                'expert': '专业级取证技能，具备恶意软件分析能力'
            }
        };
        
        return prerequisites[type]?.[difficulty] || '基本的计算机知识';
    }

    // 解析网络拓扑信息
    parseNetworkTopology(userInput) {
        console.log('parseNetworkTopology 被调用，用户输入:', userInput);
        
        const nodes = [];
        const connections = [];
        let nodeId = 1;
        
        // 网络段解析
        let networkSegments = this.extractNetworkSegments(userInput);
        console.log('解析的网络段:', networkSegments);
        
        // 设备解析
        let devices = this.extractDevices(userInput);
        console.log('解析的设备:', devices);
        
        // 如果没有解析到具体的网络拓扑信息，根据场景类型生成默认拓扑
        if (networkSegments.length === 0 && devices.length === 0) {
            const lowerInput = userInput.toLowerCase();
            
            if (lowerInput.includes('web') || lowerInput.includes('渗透')) {
                // Web渗透测试默认拓扑
                networkSegments = [
                    {
                        type: 'dmz',
                        network: '192.168.1.0/24',
                        name: 'DMZ区',
                        description: 'DMZ非军事化区域'
                    },
                    {
                        type: 'internal',
                        network: '192.168.2.0/24',
                        name: '内网区',
                        description: '内部网络区域'
                    },
                    {
                        type: 'attack',
                        network: '10.0.0.0/24',
                        name: '攻击网段',
                        description: '渗透测试攻击网段'
                    }
                ];
                
                devices = [
                    {
                        type: 'webserver',
                        name: 'Web服务器',
                        description: 'Apache+PHP Web服务器',
                        os: 'Ubuntu 20.04',
                        services: 'HTTP, HTTPS, SSH'
                    },
                    {
                        type: 'database',
                        name: 'MySQL数据库',
                        description: 'MySQL数据库服务器',
                        os: 'CentOS 7',
                        services: 'MySQL, SSH'
                    },
                    {
                        type: 'kali',
                        name: 'Kali Linux攻击机',
                        description: 'Kali Linux渗透测试平台',
                        os: 'Kali Linux 2023.1',
                        services: 'SSH, VNC'
                    }
                ];
                
                console.log('生成默认Web渗透测试拓扑');
            } else if (lowerInput.includes('防御') || lowerInput.includes('蓝队')) {
                // 防御演练默认拓扑
                networkSegments = [
                    {
                        type: 'internal',
                        network: '192.168.1.0/24',
                        name: '内网区',
                        description: '内部网络区域'
                    }
                ];
                
                devices = [
                    {
                        type: 'domain-controller',
                        name: 'Windows AD域控',
                        description: 'Active Directory域控制器',
                        os: 'Windows Server 2019',
                        services: 'LDAP, DNS, Kerberos, RDP'
                    },
                    {
                        type: 'fileserver',
                        name: '文件服务器',
                        description: '企业文件服务器',
                        os: 'Windows Server 2019',
                        services: 'SMB, RDP, SSH'
                    }
                ];
                
                console.log('生成默认防御演练拓扑');
            }
        }
        
        // 为每个网络段创建路由器/交换机
        networkSegments.forEach((segment, index) => {
            if (segment.type === 'dmz') {
                // DMZ区路由器
                nodes.push({
                    id: `router-dmz-${nodeId++}`,
                    name: 'DMZ路由器',
                    type: 'router',
                    ip: segment.gateway || segment.network.replace('/24', '.1'),
                    x: 200 + index * 300,
                    y: 150,
                    properties: {
                        description: 'DMZ区边界路由器',
                        os: 'Cisco IOS',
                        services: 'SSH, SNMP'
                    }
                });
                
                // DMZ区交换机
                nodes.push({
                    id: `switch-dmz-${nodeId++}`,
                    name: 'DMZ交换机',
                    type: 'switch',
                    ip: segment.network.replace('/24', '.2'),
                    x: 200 + index * 300,
                    y: 250,
                    properties: {
                        description: 'DMZ区核心交换机',
                        os: 'Cisco IOS',
                        services: 'SSH, SNMP'
                    }
                });
            } else if (segment.type === 'internal') {
                // 内网核心交换机
                nodes.push({
                    id: `switch-internal-${nodeId++}`,
                    name: '内网核心交换机',
                    type: 'switch',
                    ip: segment.gateway || segment.network.replace('/24', '.1'),
                    x: 200 + index * 300,
                    y: 350,
                    properties: {
                        description: '内网核心交换机',
                        os: 'Cisco IOS',
                        services: 'SSH, SNMP'
                    }
                });
            } else if (segment.type === 'attack') {
                // 攻击网段路由器
                nodes.push({
                    id: `router-attack-${nodeId++}`,
                    name: '攻击网段路由器',
                    type: 'router',
                    ip: segment.gateway || segment.network.replace('/24', '.1'),
                    x: 200 + index * 300,
                    y: 450,
                    properties: {
                        description: '攻击网段路由器',
                        os: 'Linux',
                        services: 'SSH'
                    }
                });
            }
        });
        
        // 添加防火墙
        if (networkSegments.some(s => s.type === 'dmz') && networkSegments.some(s => s.type === 'internal')) {
            nodes.push({
                id: `firewall-${nodeId++}`,
                name: '企业防火墙',
                type: 'firewall',
                ip: '192.168.0.1',
                x: 400,
                y: 50,
                properties: {
                    description: '企业边界防火墙',
                    os: 'pfSense',
                    services: 'Web管理, SSH'
                }
            });
        }
        
        // 添加设备节点
        devices.forEach((device, index) => {
            const segment = this.findDeviceSegment(device, networkSegments);
            const baseX = segment ? (networkSegments.indexOf(segment) * 300 + 100) : 100;
            const baseY = segment ? (segment.type === 'dmz' ? 300 : segment.type === 'internal' ? 400 : 500) : 300;
            
            nodes.push({
                id: `${device.type}-${nodeId++}`,
                name: device.name,
                type: device.type,
                ip: device.ip || this.generateDeviceIP(segment),
                x: baseX + (index % 3) * 100,
                y: baseY + Math.floor(index / 3) * 80,
                properties: {
                    description: device.description || `${device.name}服务器`,
                    os: device.os || this.getDefaultOS(device.type),
                    services: device.services || this.getDefaultServices(device.type)
                }
            });
        });
        
        // 生成连接关系
        this.generateConnections(nodes, connections, networkSegments);
        
        const topologyResult = {
            nodes,
            connections,
            networkSegments
        };
        
        console.log('parseNetworkTopology 最终返回的拓扑数据:', topologyResult);
        console.log('节点数量:', nodes.length);
        console.log('连接数量:', connections.length);
        
        return topologyResult;
    }
    
    // 提取网络段信息
    extractNetworkSegments(input) {
        const segments = [];
        const lowerInput = input.toLowerCase();
        
        // DMZ区检测
        const dmzMatch = lowerInput.match(/dmz[区域]?.*?(\d+\.\d+\.\d+\.\d+\/\d+)/);
        if (dmzMatch) {
            segments.push({
                type: 'dmz',
                network: dmzMatch[1],
                name: 'DMZ区',
                description: 'DMZ非军事化区域'
            });
        }
        
        // 内网区检测
        const internalMatch = lowerInput.match(/内网[区域]?.*?(\d+\.\d+\.\d+\.\d+\/\d+)/);
        if (internalMatch) {
            segments.push({
                type: 'internal',
                network: internalMatch[1],
                name: '内网区',
                description: '内部网络区域'
            });
        }
        
        // 攻击网段检测
        const attackMatch = lowerInput.match(/攻击[机网段]?.*?(\d+\.\d+\.\d+\.\d+\/\d+)/);
        if (attackMatch) {
            segments.push({
                type: 'attack',
                network: attackMatch[1],
                name: '攻击网段',
                description: '渗透测试攻击网段'
            });
        }
        
        return segments;
    }
    
    // 提取设备信息
    extractDevices(input) {
        const devices = [];
        const lowerInput = input.toLowerCase();
        
        // Web服务器检测
        if (lowerInput.includes('web服务器') || lowerInput.includes('apache') || lowerInput.includes('nginx')) {
            devices.push({
                type: 'webserver',
                name: 'Web服务器',
                description: 'Apache+PHP Web服务器',
                os: 'Linux',
                services: 'HTTP, HTTPS, SSH'
            });
        }
        
        // 数据库服务器检测
        if (lowerInput.includes('mysql') || lowerInput.includes('数据库')) {
            devices.push({
                type: 'database',
                name: 'MySQL数据库',
                description: 'MySQL数据库服务器',
                os: 'Linux',
                services: 'MySQL, SSH'
            });
        }
        
        // FTP服务器检测
        if (lowerInput.includes('ftp') || lowerInput.includes('文件服务器')) {
            devices.push({
                type: 'fileserver',
                name: 'FTP文件服务器',
                description: 'FTP文件服务器',
                os: 'Linux',
                services: 'FTP, SSH'
            });
        }
        
        // 域控制器检测
        if (lowerInput.includes('域控') || lowerInput.includes('ad') || lowerInput.includes('active directory')) {
            devices.push({
                type: 'domain-controller',
                name: 'Windows AD域控',
                description: 'Active Directory域控制器',
                os: 'Windows Server',
                services: 'LDAP, DNS, Kerberos, RDP'
            });
        }
        
        // Kali攻击机检测
        if (lowerInput.includes('kali') || lowerInput.includes('攻击机')) {
            devices.push({
                type: 'kali',
                name: 'Kali Linux攻击机',
                description: 'Kali Linux渗透测试平台',
                os: 'Kali Linux',
                services: 'SSH, VNC'
            });
        }
        
        return devices;
    }
    
    // 查找设备所属网段
    findDeviceSegment(device, segments) {
        if (device.type === 'webserver') {
            return segments.find(s => s.type === 'dmz') || segments[0];
        } else if (['database', 'fileserver', 'domain-controller'].includes(device.type)) {
            return segments.find(s => s.type === 'internal') || segments[0];
        } else if (device.type === 'kali') {
            return segments.find(s => s.type === 'attack') || segments[0];
        }
        return segments[0];
    }
    
    // 生成设备IP
    generateDeviceIP(segment) {
        if (!segment) return '192.168.1.100';
        const baseIP = segment.network.split('/')[0].split('.');
        baseIP[3] = String(100 + Math.floor(Math.random() * 50));
        return baseIP.join('.');
    }
    
    // 获取默认操作系统
    getDefaultOS(deviceType) {
        const osMap = {
            'webserver': 'Ubuntu 20.04',
            'database': 'CentOS 7',
            'fileserver': 'Ubuntu 18.04',
            'domain-controller': 'Windows Server 2019',
            'kali': 'Kali Linux 2023.1',
            'router': 'Cisco IOS',
            'switch': 'Cisco IOS',
            'firewall': 'pfSense'
        };
        return osMap[deviceType] || 'Linux';
    }
    
    // 获取默认服务
    getDefaultServices(deviceType) {
        const servicesMap = {
            'webserver': 'Apache, PHP, SSH',
            'database': 'MySQL, SSH',
            'fileserver': 'FTP, Samba, SSH',
            'domain-controller': 'AD DS, DNS, DHCP, RDP',
            'kali': 'SSH, VNC, Metasploit',
            'router': 'SSH, SNMP, Telnet',
            'switch': 'SSH, SNMP',
            'firewall': 'Web管理, SSH, SNMP'
        };
        return servicesMap[deviceType] || 'SSH';
    }
    
    // 生成连接关系
    generateConnections(nodes, connections, segments) {
        console.log('生成连接，节点数量:', nodes.length, '网段数量:', segments.length);
        
        // 按类型分组节点
        const nodesByType = {
            firewall: nodes.filter(n => n.type === 'firewall'),
            router: nodes.filter(n => n.type === 'router'),
            switch: nodes.filter(n => n.type === 'switch'),
            webserver: nodes.filter(n => n.type === 'webserver'),
            database: nodes.filter(n => n.type === 'database'),
            fileserver: nodes.filter(n => n.type === 'fileserver'),
            'domain-controller': nodes.filter(n => n.type === 'domain-controller'),
            kali: nodes.filter(n => n.type === 'kali')
        };
        
        console.log('节点分组:', nodesByType);
        
        // 1. 防火墙连接到所有路由器
        if (nodesByType.firewall.length > 0 && nodesByType.router.length > 0) {
            nodesByType.firewall.forEach(firewall => {
                nodesByType.router.forEach(router => {
                    connections.push({
                        from: firewall.id,
                        to: router.id,
                        type: 'network'
                    });
                    console.log('添加连接: 防火墙 -> 路由器', firewall.id, '->', router.id);
                });
            });
        }
        
        // 2. 路由器连接到交换机（按网段分配）
        if (nodesByType.router.length > 0 && nodesByType.switch.length > 0) {
            // 如果有多个网段，尝试为每个网段分配路由器和交换机
            if (segments.length > 1) {
                segments.forEach((segment, index) => {
                    const routerIndex = index % nodesByType.router.length;
                    const switchIndex = index % nodesByType.switch.length;
                    const router = nodesByType.router[routerIndex];
                    const switchNode = nodesByType.switch[switchIndex];
                    
                    if (router && switchNode) {
                        connections.push({
                            from: router.id,
                            to: switchNode.id,
                            type: 'network'
                        });
                        console.log('添加连接: 路由器 -> 交换机', router.id, '->', switchNode.id);
                    }
                });
            } else {
                // 单网段情况，所有路由器连接到所有交换机
                nodesByType.router.forEach(router => {
                    nodesByType.switch.forEach(switchNode => {
                        connections.push({
                            from: router.id,
                            to: switchNode.id,
                            type: 'network'
                        });
                        console.log('添加连接: 路由器 -> 交换机', router.id, '->', switchNode.id);
                    });
                });
            }
        }
        
        // 3. 服务器设备连接到交换机
        const serverTypes = ['webserver', 'database', 'fileserver', 'domain-controller', 'kali'];
        serverTypes.forEach(serverType => {
            if (nodesByType[serverType] && nodesByType[serverType].length > 0 && nodesByType.switch.length > 0) {
                nodesByType[serverType].forEach((server, index) => {
                    // 为每个服务器分配一个交换机（轮询分配）
                    const switchIndex = index % nodesByType.switch.length;
                    const switchNode = nodesByType.switch[switchIndex];
                    
                    connections.push({
                        from: switchNode.id,
                        to: server.id,
                        type: 'network'
                    });
                    console.log(`添加连接: 交换机 -> ${serverType}`, switchNode.id, '->', server.id);
                });
            }
        });
        
        // 4. 如果没有网络设备，直接连接服务器（简化拓扑）
        if (nodesByType.router.length === 0 && nodesByType.switch.length === 0 && nodesByType.firewall.length === 0) {
            const allServers = [...nodesByType.webserver, ...nodesByType.database, ...nodesByType.fileserver, ...nodesByType['domain-controller'], ...nodesByType.kali];
            
            // 创建星型连接（第一个设备作为中心）
            if (allServers.length > 1) {
                const centerNode = allServers[0];
                for (let i = 1; i < allServers.length; i++) {
                    connections.push({
                        from: centerNode.id,
                        to: allServers[i].id,
                        type: 'network'
                    });
                    console.log('添加简化连接:', centerNode.id, '->', allServers[i].id);
                }
            }
        }
        
        console.log('生成的连接总数:', connections.length);
    }

    // 生成目标设备
    generateTargets(type) {
        const targetMap = {
            'penetration': [
                { id: 'web-server-1', name: 'DVWA靶机', type: 'web' },
                { id: 'web-server-2', name: '脆弱Web应用', type: 'web' }
            ],
            'defense': [
                { id: 'network-1', name: '企业网络环境', type: 'network' },
                { id: 'server-1', name: '监控服务器', type: 'server' }
            ],
            'forensics': [
                { id: 'evidence-1', name: '取证镜像文件', type: 'file' },
                { id: 'workstation-1', name: '可疑工作站', type: 'workstation' }
            ]
        };
        
        return targetMap[type] || [];
    }

    // 显示生成的场景
    showGeneratedScenario(scenario) {
        const scenarioContainer = document.getElementById('aiGeneratedScenario');
        const scenarioPreview = document.getElementById('scenarioPreview');
        
        if (scenarioContainer && scenarioPreview) {
            let topologyHtml = '';
            
            // 如果有拓扑信息，生成拓扑预览
            if (scenario.topology && scenario.topology.nodes && scenario.topology.nodes.length > 0) {
                topologyHtml = this.generateTopologyPreview(scenario.topology);
            }
            
            scenarioPreview.innerHTML = `
                <div class="scenario-field">
                    <label><strong>场景名称：</strong></label>
                    <span>${scenario.name}</span>
                </div>
                <div class="scenario-field">
                    <label><strong>场景类型：</strong></label>
                    <span class="scenario-type-badge ${scenario.type}">${this.getTypeText(scenario.type)}</span>
                </div>
                <div class="scenario-field">
                    <label><strong>难度级别：</strong></label>
                    <span class="difficulty-badge ${scenario.difficulty}">${this.getDifficultyText(scenario.difficulty)}</span>
                </div>
                <div class="scenario-field">
                    <label><strong>场景描述：</strong></label>
                    <p>${scenario.description}</p>
                </div>
                <div class="scenario-field">
                    <label><strong>训练目标：</strong></label>
                    <pre>${scenario.objectives}</pre>
                </div>
                <div class="scenario-field">
                    <label><strong>前置要求：</strong></label>
                    <p>${scenario.prerequisites}</p>
                </div>
                <div class="scenario-field">
                    <label><strong>预计时间：</strong></label>
                    <span>${scenario.estimatedTime} 分钟</span>
                </div>
                ${topologyHtml}
            `;
            
            scenarioContainer.style.display = 'block';
        }
    }
    
    // 生成拓扑预览HTML
    generateTopologyPreview(topology) {
        if (!topology || !topology.nodes || topology.nodes.length === 0) {
            return '';
        }
        
        let html = `
            <div class="scenario-field topology-preview">
                <label><strong>网络拓扑：</strong></label>
                <div class="topology-summary">
        `;
        
        // 网络段信息
        if (topology.networkSegments && topology.networkSegments.length > 0) {
            html += '<div class="network-segments">';
            html += '<h5><i class="fas fa-network-wired"></i> 网络段配置</h5>';
            topology.networkSegments.forEach(segment => {
                html += `
                    <div class="segment-item">
                        <span class="segment-name">${segment.name}</span>
                        <span class="segment-network">${segment.network}</span>
                        <span class="segment-desc">${segment.description}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // 设备信息
        const devicesByType = this.groupDevicesByType(topology.nodes);
        html += '<div class="devices-summary">';
        html += '<h5><i class="fas fa-server"></i> 设备配置</h5>';
        
        Object.entries(devicesByType).forEach(([type, devices]) => {
            if (devices.length > 0) {
                html += `
                    <div class="device-group">
                        <div class="device-type-header">
                            <i class="fas ${this.getDeviceIcon(type)}"></i>
                            <span>${this.getDeviceTypeName(type)} (${devices.length}台)</span>
                        </div>
                        <div class="device-list">
                `;
                
                devices.forEach(device => {
                    html += `
                        <div class="device-item">
                            <div class="device-info">
                                <span class="device-name">${device.name}</span>
                                <span class="device-ip">${device.ip}</span>
                            </div>
                            <div class="device-details">
                                <span class="device-os">${device.properties?.os || 'N/A'}</span>
                                <span class="device-services">${device.properties?.services || 'N/A'}</span>
                            </div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        
        // 连接统计
        if (topology.connections && topology.connections.length > 0) {
            html += `
                <div class="connections-summary">
                    <h5><i class="fas fa-link"></i> 网络连接</h5>
                    <p>共 ${topology.connections.length} 条网络连接</p>
                </div>
            `;
        }
        
        html += `
                </div>
                <div class="topology-note">
                    <i class="fas fa-info-circle"></i>
                    <span>接受场景后，拓扑配置将自动导入到拓扑设计器中</span>
                </div>
            </div>
        `;
        
        return html;
    }
    
    // 按类型分组设备
    groupDevicesByType(nodes) {
        const groups = {};
        nodes.forEach(node => {
            if (!groups[node.type]) {
                groups[node.type] = [];
            }
            groups[node.type].push(node);
        });
        return groups;
    }
    
    // 获取设备图标
    getDeviceIcon(type) {
        const iconMap = {
            'router': 'fa-route',
            'switch': 'fa-network-wired',
            'firewall': 'fa-shield-alt',
            'webserver': 'fa-server',
            'database': 'fa-database',
            'fileserver': 'fa-folder-open',
            'domain-controller': 'fa-users-cog',
            'kali': 'fa-user-secret'
        };
        return iconMap[type] || 'fa-desktop';
    }
    
    // 获取设备类型名称
    getDeviceTypeName(type) {
        const nameMap = {
            'router': '路由器',
            'switch': '交换机',
            'firewall': '防火墙',
            'webserver': 'Web服务器',
            'database': '数据库服务器',
            'fileserver': '文件服务器',
            'domain-controller': '域控制器',
            'kali': '攻击机'
        };
        return nameMap[type] || type;
    }

    // 隐藏生成的场景
    hideGeneratedScenario() {
        const scenarioContainer = document.getElementById('aiGeneratedScenario');
        if (scenarioContainer) {
            scenarioContainer.style.display = 'none';
        }
    }

    // 接受场景
    acceptScenario() {
        if (!this.currentScenario) {
            console.error('没有当前场景数据');
            return;
        }
        
        console.log('接受场景:', this.currentScenario);
        console.log('拓扑数据:', this.currentScenario.topology);
        
        // 关闭AI模态框
        document.getElementById('aiScenarioModal').style.display = 'none';
        
        // 打开手动创建模态框并填充数据
        const addScenarioModal = document.getElementById('addScenarioModal');
        if (addScenarioModal) {
            addScenarioModal.style.display = 'block';
            this.fillScenarioForm(this.currentScenario);
            
            // 如果有拓扑数据，导入到拓扑设计器
            if (this.currentScenario.topology && this.currentScenario.topology.nodes && this.currentScenario.topology.nodes.length > 0) {
                console.log('开始导入拓扑数据...');
                this.importTopologyToDesigner(this.currentScenario.topology);
                showStep(2); // 直接跳转到拓扑设计步骤
            } else {
                console.log('没有拓扑数据，跳转到第一步');
                showStep(1);
            }
        }
        
        const message = this.currentScenario.topology && this.currentScenario.topology.nodes && this.currentScenario.topology.nodes.length > 0 ? 
            '场景配置和拓扑数据已导入，您可以在拓扑设计器中查看和编辑。' : 
            '场景配置已导入到创建表单中，您可以进一步编辑和完善。';
        this.showNotification(message, 'success');
    }
    
    // 导入拓扑数据到设计器
    importTopologyToDesigner(topology) {
        console.log('importTopologyToDesigner 被调用，拓扑数据:', topology);
        
        if (!topology || !topology.nodes) {
            console.error('拓扑数据无效:', topology);
            return;
        }
        
        console.log('拓扑节点数量:', topology.nodes.length);
        console.log('拓扑连接数量:', topology.connections ? topology.connections.length : 0);
        
        try {
            // 确保拓扑模块已初始化
            if (typeof initTopology === 'function') {
                console.log('初始化拓扑模块...');
                initTopology();
            } else {
                console.error('initTopology 函数不存在');
            }
            
            // 清空现有拓扑
            if (typeof clearTopology === 'function') {
                console.log('清空现有拓扑...');
                clearTopology();
            } else {
                console.error('clearTopology 函数不存在');
            }
            
            // 等待一下确保清空完成
            setTimeout(() => {
                console.log('开始导入节点...');
                // 导入节点
                topology.nodes.forEach((node, index) => {
                    console.log(`导入节点 ${index + 1}:`, node);
                    this.createAITopologyNode(node);
                });
                
                // 导入连接（延迟执行确保节点都已创建）
                setTimeout(() => {
                    if (topology.connections && topology.connections.length > 0) {
                        console.log('开始导入连接...');
                        topology.connections.forEach((connection, index) => {
                            console.log(`导入连接 ${index + 1}:`, connection);
                            this.createTopologyConnection(connection);
                        });
                    } else {
                        console.log('没有连接数据需要导入');
                    }
                    
                    // 更新连接器显示
                    if (typeof updateConnectors === 'function') {
                        console.log('更新连接器显示...');
                        updateConnectors();
                    } else {
                        console.error('updateConnectors 函数不存在');
                    }
                    
                    // 导入完成
                }, 800);
                
                this.showNotification('拓扑数据导入完成！', 'success');
            }, 300);
            
        } catch (error) {
            console.error('导入拓扑数据时出错:', error);
            this.showNotification('拓扑数据导入失败，请手动创建。', 'warning');
        }
    }
    
    // 创建AI拓扑节点
    createAITopologyNode(nodeData) {
        console.log('createAITopologyNode 被调用，节点数据:', nodeData);
        
        try {
            // 使用现有的拓扑设计器函数
            if (typeof createTopologyNode === 'function') {
                console.log('调用 createTopologyNode 函数...');
                
                // 获取正确的拖拽区实际尺寸（使用topology-main而不是topology-dropzone）
                const topologyMain = document.querySelector('.topology-main');
                const dropzone = document.getElementById('topology-dropzone');
                let dropzoneWidth = 800;
                let dropzoneHeight = 600;
                
                if (topologyMain) {
                    const rect = topologyMain.getBoundingClientRect();
                    // 减去一些边距，确保节点不会贴边
                    dropzoneWidth = (rect.width > 0 ? rect.width : 800) - 40;
                    dropzoneHeight = (rect.height > 0 ? rect.height : 600) - 40;
                    console.log('使用topology-main尺寸:', { width: dropzoneWidth, height: dropzoneHeight });
                } else if (dropzone) {
                    const rect = dropzone.getBoundingClientRect();
                    dropzoneWidth = rect.width > 0 ? rect.width : 800;
                    dropzoneHeight = rect.height > 0 ? rect.height : 600;
                    console.log('回退使用topology-dropzone尺寸:', { width: dropzoneWidth, height: dropzoneHeight });
                }
                
                // 使用智能布局算法生成位置
                const position = this.calculateNodePosition(nodeData, dropzoneWidth, dropzoneHeight);
                const x = nodeData.x || position.x;
                const y = nodeData.y || position.y;
                
                // 生成自定义节点ID
                const customNodeId = `node-${nodeData.id}`;
                
                // 调用拓扑设计器的节点创建函数，传入自定义ID
                const result = createTopologyNode(nodeData.type, nodeData.id, x, y, customNodeId);
                console.log('createTopologyNode 调用完成，返回结果:', result);
                
                if (result && result.element) {
                    const createdNode = result.element;
                    console.log('成功创建节点元素:', createdNode);
                    
                    // 立即更新节点显示
                    this.updateNodeDisplay(createdNode, nodeData);
                    
                    // 更新topologyNodes数组中的数据
                    if (typeof topologyNodes !== 'undefined' && result.data) {
                        const nodeIndex = topologyNodes.findIndex(n => n.id === result.data.id);
                        if (nodeIndex !== -1) {
                            topologyNodes[nodeIndex] = {
                                ...topologyNodes[nodeIndex],
                                name: nodeData.name || topologyNodes[nodeIndex].name,
                                ip: nodeData.ip || topologyNodes[nodeIndex].ip,
                                description: nodeData.description || nodeData.properties?.description || '',
                                os: nodeData.os || nodeData.properties?.os || '',
                                services: nodeData.services || nodeData.properties?.services || ''
                            };
                            console.log('节点数据更新完成:', topologyNodes[nodeIndex]);
                        }
                    }
                } else {
                    console.error('createTopologyNode 未返回有效结果');
                }
            } else {
                console.error('createTopologyNode函数不可用');
            }
            
        } catch (error) {
            console.error('创建AI拓扑节点时出错:', error);
        }
    }
    
    // 更新节点显示
    updateNodeDisplay(nodeElement, nodeData) {
        try {
            console.log('更新节点显示，节点元素:', nodeElement, '节点数据:', nodeData);
            
            // 查找节点内的文本元素
            const textElement = nodeElement.querySelector('span');
            if (textElement && nodeData.name) {
                textElement.textContent = nodeData.name;
                console.log('设置节点名称:', nodeData.name);
            }
            
            // 如果有IP信息，可以添加到节点显示中
            if (nodeData.ip) {
                // 检查是否已有IP显示元素
                let ipElement = nodeElement.querySelector('.node-ip');
                if (!ipElement) {
                    ipElement = document.createElement('div');
                    ipElement.className = 'node-ip';
                    ipElement.style.fontSize = '10px';
                    ipElement.style.color = '#666';
                    ipElement.style.textAlign = 'center';
                    nodeElement.appendChild(ipElement);
                }
                ipElement.textContent = nodeData.ip;
                console.log('设置节点IP:', nodeData.ip);
            }
            
        } catch (error) {
            console.error('更新节点显示时出错:', error);
        }
    }
    
    // 计算节点位置（智能布局算法）
    calculateNodePosition(nodeData, canvasWidth, canvasHeight) {
        const margin = 80;
        const nodeSize = 60; // 节点大小
        const minDistance = 120; // 节点间最小距离
        
        // 获取已存在的节点位置
        const existingNodes = document.querySelectorAll('#topology-dropzone .topology-node');
        const existingPositions = [];
        
        existingNodes.forEach(node => {
            const rect = node.getBoundingClientRect();
            const dropzoneRect = document.getElementById('topology-dropzone').getBoundingClientRect();
            existingPositions.push({
                x: rect.left - dropzoneRect.left + rect.width / 2,
                y: rect.top - dropzoneRect.top + rect.height / 2
            });
        });
        
        // 根据节点类型确定布局策略
        const layoutStrategy = this.getLayoutStrategy(nodeData.type);
        let position;
        
        switch (layoutStrategy.type) {
            case 'top': // 网络设备放在顶部
                position = this.findPositionInArea(
                    margin, margin,
                    canvasWidth - margin, canvasHeight * 0.3,
                    existingPositions, minDistance
                );
                break;
            case 'middle': // 服务器放在中间
                position = this.findPositionInArea(
                    margin, canvasHeight * 0.3,
                    canvasWidth - margin, canvasHeight * 0.7,
                    existingPositions, minDistance
                );
                break;
            case 'bottom': // 攻击机放在底部
                position = this.findPositionInArea(
                    margin, canvasHeight * 0.7,
                    canvasWidth - margin, canvasHeight - margin,
                    existingPositions, minDistance
                );
                break;
            default: // 随机位置
                position = this.findPositionInArea(
                    margin, margin,
                    canvasWidth - margin, canvasHeight - margin,
                    existingPositions, minDistance
                );
        }
        
        return position;
    }
    
    // 获取节点类型的布局策略
    getLayoutStrategy(nodeType) {
        const strategies = {
            'firewall': { type: 'top', priority: 1 },
            'router': { type: 'top', priority: 2 },
            'switch': { type: 'top', priority: 3 },
            'webserver': { type: 'middle', priority: 1 },
            'database': { type: 'middle', priority: 2 },
            'fileserver': { type: 'middle', priority: 3 },
            'domain-controller': { type: 'middle', priority: 4 },
            'kali': { type: 'bottom', priority: 1 }
        };
        
        return strategies[nodeType] || { type: 'random', priority: 0 };
    }
    
    // 在指定区域内查找合适的位置
    findPositionInArea(minX, minY, maxX, maxY, existingPositions, minDistance) {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            const x = minX + Math.random() * (maxX - minX);
            const y = minY + Math.random() * (maxY - minY);
            
            // 检查是否与现有节点冲突
            let hasConflict = false;
            for (const pos of existingPositions) {
                const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (distance < minDistance) {
                    hasConflict = true;
                    break;
                }
            }
            
            if (!hasConflict) {
                return { x, y };
            }
            
            attempts++;
        }
        
        // 如果找不到合适位置，返回网格位置
        const gridSize = minDistance;
        const gridX = Math.floor((maxX - minX) / gridSize);
        const gridY = Math.floor((maxY - minY) / gridSize);
        const totalPositions = gridX * gridY;
        const usedPositions = existingPositions.length;
        
        if (usedPositions < totalPositions) {
            const gridIndex = usedPositions;
            const row = Math.floor(gridIndex / gridX);
            const col = gridIndex % gridX;
            
            return {
                x: minX + col * gridSize + gridSize / 2,
                y: minY + row * gridSize + gridSize / 2
            };
        }
        
        // 最后的备选方案：随机位置
        return {
            x: minX + Math.random() * (maxX - minX),
            y: minY + Math.random() * (maxY - minY)
        };
    }
    
    // 创建拓扑连接
    createTopologyConnection(connectionData) {
        try {
            console.log('创建连接:', connectionData);
            
            // 查找节点（可能有不同的ID格式）
            let fromNode = document.getElementById(`node-${connectionData.from}`) || 
                          document.getElementById(connectionData.from) ||
                          document.querySelector(`[data-target-id="${connectionData.from}"]`) ||
                          document.querySelector(`[data-node-id="${connectionData.from}"]`);
                          
            let toNode = document.getElementById(`node-${connectionData.to}`) || 
                        document.getElementById(connectionData.to) ||
                        document.querySelector(`[data-target-id="${connectionData.to}"]`) ||
                        document.querySelector(`[data-node-id="${connectionData.to}"]`);
            
            console.log('查找到的节点:', { fromNode, toNode });
            
            // 如果直接查找失败，尝试在topologyNodes中查找
            if (!fromNode && typeof topologyNodes !== 'undefined') {
                const fromNodeData = topologyNodes.find(n => 
                    n.id === `node-${connectionData.from}` ||
                    n.id === connectionData.from || 
                    n.targetId === connectionData.from ||
                    n.name === connectionData.from
                );
                if (fromNodeData) {
                    fromNode = document.getElementById(fromNodeData.id);
                    console.log('通过topologyNodes找到fromNode:', fromNode);
                }
            }
            
            if (!toNode && typeof topologyNodes !== 'undefined') {
                const toNodeData = topologyNodes.find(n => 
                    n.id === `node-${connectionData.to}` ||
                    n.id === connectionData.to || 
                    n.targetId === connectionData.to ||
                    n.name === connectionData.to
                );
                if (toNodeData) {
                    toNode = document.getElementById(toNodeData.id);
                    console.log('通过topologyNodes找到toNode:', toNode);
                }
            }
            
            // 增加调试信息
            console.log('节点查找详情:', {
                fromId: connectionData.from,
                toId: connectionData.to,
                fromNode: fromNode ? fromNode.id : null,
                toNode: toNode ? toNode.id : null,
                availableNodes: typeof topologyNodes !== 'undefined' ? 
                    topologyNodes.map(n => ({ id: n.id, targetId: n.targetId, name: n.name })) : []
            });
            
            if (fromNode && toNode) {
                if (typeof createConnection === 'function') {
                    console.log('调用 createConnection 函数');
                    createConnection(fromNode, toNode);
                } else if (typeof addConnection === 'function') {
                    console.log('调用 addConnection 函数');
                    addConnection(fromNode, toNode);
                } else {
                    console.warn('连接创建函数不可用');
                }
            } else {
                console.warn('无法找到连接节点:', {
                    from: connectionData.from,
                    to: connectionData.to,
                    fromNode,
                    toNode
                });
            }
        } catch (error) {
            console.error('创建拓扑连接时出错:', error);
        }
    }
    
    // 获取拓扑节点图标
    getTopologyNodeIcon(type) {
        const iconMap = {
            'router': 'fa-route',
            'switch': 'fa-network-wired',
            'firewall': 'fa-shield-alt',
            'webserver': 'fa-server',
            'database': 'fa-database',
            'fileserver': 'fa-folder-open',
            'domain-controller': 'fa-users-cog',
            'kali': 'fa-user-secret'
        };
        return iconMap[type] || 'fa-desktop';
    }

    // 填充场景表单
    fillScenarioForm(scenario) {
        const fields = {
            'scenarioName': scenario.name,
            'scenarioType': scenario.type,
            'difficultyLevel': scenario.difficulty,
            'scenarioDescription': scenario.description,
            'trainingObjectives': scenario.objectives,
            'prerequisites': scenario.prerequisites,
            'estimatedTime': scenario.estimatedTime
        };
        
        for (const [fieldId, value] of Object.entries(fields)) {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = value;
            }
        }
    }

    // 继续优化
    continueOptimization() {
        this.hideGeneratedScenario();
        this.addMessage('ai', '好的，请告诉我您希望如何调整这个场景？比如修改难度级别、增加特定的训练内容、或者调整场景规模等。');
    }

    // 重新生成场景
    regenerateScenario() {
        this.hideGeneratedScenario();
        this.addMessage('ai', '我将为您重新生成一个场景配置，请稍等...');
        
        // 基于之前的对话重新生成
        const lastUserMessage = this.chatMessages.filter(msg => msg.type === 'user').pop();
        if (lastUserMessage) {
            setTimeout(() => {
                this.generateScenario(lastUserMessage.content);
            }, 1000);
        }
    }

    // 显示打字指示器
    showTypingIndicator() {
        const chatMessagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessagesContainer.appendChild(typingDiv);
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // 隐藏打字指示器
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取类型文本
    getTypeText(type) {
        const typeMap = {
            'penetration': '渗透测试',
            'defense': '防御演练',
            'forensics': '取证分析',
            'malware': '恶意软件分析',
            'social': '社会工程学'
        };
        return typeMap[type] || type;
    }

    // 获取难度文本
    getDifficultyText(difficulty) {
        const difficultyMap = {
            'beginner': '初级',
            'intermediate': '中级',
            'advanced': '高级',
            'expert': '专家'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 全局AI场景创建器实例
let aiScenarioCreator = null;

// 初始化AI聊天
function initializeAIChat() {
    if (!aiScenarioCreator) {
        aiScenarioCreator = new AIScenarioCreator();
    }
    aiScenarioCreator.initialize();
}

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIScenarioCreator;
}