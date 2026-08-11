document.addEventListener('DOMContentLoaded', function() {
    const experimentData = [
        { id: 1, name: 'SQL注入漏洞分析', type: 1, difficulty: 2, createTime: '2024-05-10', status: 2, credits: 10, score: 95, description: '学习如何发现和利用SQL注入漏洞，并掌握相应的防御技术。', tags: ['SQL注入', 'Web安全', '漏洞分析'], participants: 1234 },
        { id: 2, name: '跨站脚本攻击（XSS）防御', type: 1, difficulty: 2, createTime: '2024-05-12', status: 1, credits: 10, description: '深入理解XSS攻击原理，学习不同类型的XSS及其防御策略。', tags: ['XSS', 'Web安全', '前端安全'], participants: 2345 },
        { id: 3, name: '文件上传漏洞利用', type: 1, difficulty: 3, createTime: '2024-05-15', status: 0, credits: 15, description: '掌握文件上传漏洞的各种绕过技巧和利用方法。', tags: ['文件上传', 'Web安全', '渗透测试'], participants: 876 },
        { id: 4, name: '内网渗透测试', type: 2, difficulty: 3, createTime: '2024-05-18', status: 2, credits: 20, score: 88, description: '模拟真实攻击场景，学习内网环境下的渗透测试流程和技术。', tags: ['内网渗透', '系统安全', '横向移动'], participants: 3456 },
        { id: 5, name: '逆向工程入门', type: 3, difficulty: 1, createTime: '2024-05-20', status: 1, credits: 5, description: '学习使用IDA Pro等工具进行基本的静态和动态分析。', tags: ['逆向工程', '二进制安全', '入门'], participants: 987 }
    ];

    updateDashboard();

    const cardGrid = document.getElementById('card-grid');
    const cardTemplate = document.getElementById('experiment-card-template');

    function renderCards(data) {
        if (!cardGrid || !cardTemplate) return;
        cardGrid.innerHTML = '';
        data.forEach(item => {
            const cardClone = cardTemplate.content.cloneNode(true);

            cardClone.querySelector('.card-title').textContent = item.name;
            cardClone.querySelector('.card-description').textContent = item.description;
            
            const metaSpans = cardClone.querySelectorAll('.card-meta span');
            metaSpans[0].innerHTML = `<i class="fas fa-tag"></i> 类型: ${getTypeName(item.type)}`;
            metaSpans[1].innerHTML = `<i class="fas fa-fire"></i> 难度: ${getDifficultyName(item.difficulty)}`;

            const tagsContainer = cardClone.querySelector('.card-tags');
            tagsContainer.innerHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

            cardClone.querySelector('.participants').innerHTML = `<i class="fas fa-users"></i> ${item.participants} 人参与`;
            
            cardGrid.appendChild(cardClone);
        });
    }

    function getTypeName(type) {
        switch (type) {
            case 1: return 'Web安全';
            case 2: return '系统安全';
            case 3: return '网络安全';
            case 4: return '逆向工程';
            default: return '未知';
        }
    }

    function getDifficultyName(difficulty) {
        switch (difficulty) {
            case 1: return '简单';
            case 2: return '中等';
            case 3: return '困难';
            default: return '未知';
        }
    }



    function updateDashboard() {
        const completed = experimentData.filter(e => e.status === 2).length;
        const ongoing = experimentData.filter(e => e.status === 1).length;
        const totalCredits = experimentData.filter(e => e.status === 2).reduce((sum, e) => sum + (e.credits || 0), 0);
        const completedExperiments = experimentData.filter(e => e.status === 2 && e.score !== undefined);
        const averageScore = completedExperiments.length > 0 
            ? (completedExperiments.reduce((sum, e) => sum + e.score, 0) / completedExperiments.length).toFixed(1)
            : 0;

        document.getElementById('completed-experiments').textContent = completed;
        document.getElementById('ongoing-experiments').textContent = ongoing;
        document.getElementById('total-credits').textContent = totalCredits;
        document.getElementById('average-score').textContent = averageScore;
    }

    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');

    function filterAndRender() {
        let filteredData = experimentData;

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(item => item.name.toLowerCase().includes(searchTerm));
        }

        const type = typeFilter.value;
        if (type) {
            filteredData = filteredData.filter(item => item.type === type);
        }

        const difficulty = difficultyFilter.value;
        if (difficulty) {
            filteredData = filteredData.filter(item => item.difficulty === difficulty);
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
    difficultyFilter.addEventListener('change', filterAndRender);

    filterAndRender();
});