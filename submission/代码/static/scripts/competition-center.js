document.addEventListener('DOMContentLoaded', function() {
    // 全局变量存储比赛数据
    let competitionData = [];
    
    // 静态比赛信息
    const staticCompetitionInfo = {
        1: { type: 1, level: 3, honor: null, rank: null, description: '面向全国大学生的顶级信息安全赛事，考验团队综合实战能力。', tags: ['团队赛', 'CTF', '国家级'], participants: 4500 },
        2: { type: 2, level: 2, honor: null, rank: null, description: '国内知名的网络安全竞赛，注重实战和创新。', tags: ['个人赛', 'AWD', '实战'], participants: 8000 },
        3: { type: 3, level: 1, honor: '三等奖', rank: 58, description: '经典的CTF解题模式，包含Web、Pwn、Reverse、Crypto等方向。', tags: ['解题赛', 'Jeopardy', '线上赛'], participants: 3200 },
        4: { type: 4, level: 2, honor: '优秀贡献者', rank: 12, description: '模拟真实世界漏洞挖掘，为企业提供安全保障。', tags: ['真实世界', 'Bug Bounty', '众测'], participants: 1500 }
    };

    // 初始化页面
    function initializePage() {
        // 使用静态数据
        competitionData = [
            { id: 1, name: '全国大学生信息安全竞赛', type: 1, level: 3, honor: null, rank: null, description: '面向全国大学生的顶级信息安全赛事，考验团队综合实战能力。', tags: ['团队赛', 'CTF', '国家级'], participants: 4500, url: 'https://www.ciscn.cn/' },
            { id: 2, name: '"巅峰极客"网络安全技能挑战赛', type: 2, level: 2, honor: null, rank: null, description: '国内知名的网络安全竞赛，注重实战和创新。', tags: ['个人赛', 'AWD', '实战'], participants: 8000, url: 'https://www.ichunqiu.com/battalion' },
            { id: 3, name: 'CTF线上夺旗赛', type: 3, level: 1, honor: '三等奖', rank: 58, description: '经典的CTF解题模式，包含Web、Pwn、Reverse、Crypto等方向。', tags: ['解题赛', 'Jeopardy', '线上赛'], participants: 3200, url: 'https://ctf.bugku.com/' },
            { id: 4, name: '企业安全众测', type: 4, level: 2, honor: '优秀贡献者', rank: 12, description: '模拟真实世界漏洞挖掘，为企业提供安全保障。', tags: ['真实世界', 'Bug Bounty', '众测'], participants: 1500, url: 'https://www.butian.net/' },
            { id: 5, name: '网络空间安全创新大赛', type: 1, level: 2, honor: null, rank: null, description: '聚焦网络空间安全前沿技术，推动产学研深度融合。', tags: ['创新赛', '产学研', '前沿技术'], participants: 2800, url: 'https://www.nssctf.cn/' },
            { id: 6, name: '工业互联网安全竞赛', type: 4, level: 3, honor: '二等奖', rank: 25, description: '专注工业控制系统安全，保障关键基础设施安全。', tags: ['工控安全', 'ICS', '关基保护'], participants: 1200, url: 'https://www.freebuf.com/' }
        ];
        updateDashboard();
        renderCards(competitionData);
    }

    const cardGrid = document.getElementById('card-grid');
    const cardTemplate = document.getElementById('competition-card-template');
    
    // 启动页面初始化
    initializePage();

    function renderCards(data) {
        if (!cardGrid || !cardTemplate) return;
        cardGrid.innerHTML = '';
        data.forEach(item => {
            const cardClone = cardTemplate.content.cloneNode(true);

            cardClone.querySelector('.card-title').textContent = item.name;
            cardClone.querySelector('.card-description').textContent = item.description;
            
            const metaSpans = cardClone.querySelectorAll('.card-meta span');
            metaSpans[0].innerHTML = `<i class="fas fa-trophy"></i> 类型: ${getTypeName(item.type)}`;

            const tagsContainer = cardClone.querySelector('.card-tags');
            tagsContainer.innerHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            cardClone.querySelector('.participants').innerHTML = `<i class="fas fa-users"></i> ${item.participants} 人参与`;
            
            // 为查看详情按钮添加点击事件
            const detailsBtn = cardClone.querySelector('.details-btn');
            if (detailsBtn && item.url) {
                detailsBtn.addEventListener('click', function() {
                    window.open(item.url, '_blank');
                });
            }
            
            cardGrid.appendChild(cardClone);
        });
    }

    function getTypeName(type) {
        switch (type) {
            case 1: return '团队赛';
            case 2: return '个人赛';
            case 3: return '解题赛';
            case 4: return '攻防赛';
            default: return '未知';
        }
    }
    function updateDashboard() {
        const totalCompetitions = competitionData.length;
        const totalHonors = competitionData.filter(c => c.honor).length;
        const ranks = competitionData.filter(c => c.rank !== undefined && c.rank !== null).map(c => c.rank);
        const bestRank = ranks.length > 0 ? Math.min(...ranks) : 'N/A';
        const avgParticipants = Math.round(competitionData.reduce((sum, c) => sum + c.participants, 0) / totalCompetitions);

        document.getElementById('completed-competitions').textContent = totalCompetitions;
        document.getElementById('ongoing-competitions').textContent = avgParticipants;
        document.getElementById('total-honors').textContent = totalHonors;
        document.getElementById('best-rank').textContent = bestRank;
    }

    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');

    function filterAndRender() {
        let filteredData = competitionData;

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(item => item.name.toLowerCase().includes(searchTerm));
        }

        const type = typeFilter.value;
        if (type) {
            filteredData = filteredData.filter(item => item.type == parseInt(type));
        }

        renderCards(filteredData);
        updatePaginationInfo(filteredData.length);
    }

    function updatePaginationInfo(totalItems) {
        document.getElementById('startItem').textContent = totalItems > 0 ? 1 : 0;
        document.getElementById('endItem').textContent = totalItems;
        document.getElementById('totalItems').textContent = totalItems;
    }

    searchInput.addEventListener('input', filterAndRender);
    typeFilter.addEventListener('change', filterAndRender);

    filterAndRender();
});