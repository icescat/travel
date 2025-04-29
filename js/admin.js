/**
 * 旅游攻略数据管理后台
 */

// 全局变量
let tripData = null;
let editingSpot = null;
let editingDayIndex = null;
let editingSpotIndex = null;
let dataModified = false;

// 初始化
document.addEventListener('DOMContentLoaded', init);

/**
 * 初始化函数
 */
async function init() {
    try {
        // 加载行程数据
        await loadTripData();
        
        // 渲染行程视图
        renderTripInfo();
        renderScheduleView();
        updateJsonEditor();
        
        // 绑定事件
        bindEvents();
        
        // 显示成功消息
        showMessage('数据加载成功', 'success');
    } catch (error) {
        console.error('初始化错误:', error);
        showMessage('数据加载失败，请检查数据文件', 'error');
    }
}

/**
 * 加载行程数据
 */
async function loadTripData() {
    try {
        // 获取所有行程列表
        const tripsResponse = await fetch(CONFIG.api.baseUrl + CONFIG.api.endpoints.trips);
        if (!tripsResponse.ok) {
            throw new Error(`HTTP错误! 状态码: ${tripsResponse.status}`);
        }
        
        const trips = await tripsResponse.json();
        
        if (!trips || !Array.isArray(trips.results) || trips.results.length === 0) {
            throw new Error('没有找到任何行程数据');
        }
        
        // 获取第一个行程的详细信息
        const tripId = trips.results[0].id;
        const tripDetailsUrl = CONFIG.api.baseUrl + CONFIG.api.endpoints.tripDetails.replace('{id}', tripId);
        const tripDetailsResponse = await fetch(tripDetailsUrl);
        
        if (!tripDetailsResponse.ok) {
            throw new Error(`HTTP错误! 状态码: ${tripDetailsResponse.status}`);
        }
        
        tripData = await tripDetailsResponse.json();
        console.log('行程数据加载成功:', tripData);
    } catch (error) {
        console.error('加载行程数据失败:', error);
        tripData = {
            tripInfo: {
                title: "新建行程",
                date: new Date().toISOString().split('T')[0],
                days: 1,
                totalDistance: "0公里",
                description: "请输入行程描述"
            },
            dailySchedule: [
                {
                    day: 1,
                    title: "第一天",
                    date: new Date().toISOString().split('T')[0],
                    description: "请输入当天行程描述",
                    spots: []
                }
            ]
        };
        showMessage('创建了新的行程数据', 'success');
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 导航标签切换
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有激活状态
            document.querySelectorAll('.nav-item').forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            // 添加当前激活状态
            this.classList.add('active');
            
            // 隐藏所有内容
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // 显示当前内容
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).style.display = 'block';
        });
    });
    
    // 保存行程信息
    document.getElementById('save-trip-info-btn').addEventListener('click', saveTripInfo);
    
    // JSON编辑器功能
    document.getElementById('validate-json-btn').addEventListener('click', validateJson);
    document.getElementById('format-json-btn').addEventListener('click', formatJson);
    document.getElementById('save-json-btn').addEventListener('click', saveJson);
    
    // 添加天数按钮
    document.getElementById('add-day-btn').addEventListener('click', addDay);
    
    // 景点模态框按钮
    document.getElementById('cancel-spot-btn').addEventListener('click', closeSpotModal);
    document.getElementById('close-spot-modal').addEventListener('click', closeSpotModal);
    document.getElementById('save-spot-btn').addEventListener('click', saveSpot);
    
    // 备份和恢复功能
    document.getElementById('backup-data-btn').addEventListener('click', backupData);
    document.getElementById('restore-data-btn').addEventListener('click', restoreData);
    
    // POI搜索功能
    document.getElementById('search-poi-btn').addEventListener('click', searchPOI);
    document.getElementById('copy-poi-btn').addEventListener('click', copyPOIInfo);
    document.getElementById('copy-poi-json-btn').addEventListener('click', copyPOIJson);
    
    // 添加生成数据按钮事件
    document.getElementById('generate-data-btn').addEventListener('click', generateData);
}

/**
 * 渲染行程信息
 */
function renderTripInfo() {
    if (!tripData || !tripData.tripInfo) return;
    
    document.getElementById('trip-title').value = tripData.tripInfo.title || '';
    document.getElementById('trip-date').value = tripData.tripInfo.date || '';
    document.getElementById('trip-days').value = tripData.tripInfo.days || '';
    document.getElementById('trip-distance').value = tripData.tripInfo.totalDistance || '';
    document.getElementById('trip-description').value = tripData.tripInfo.description || '';
}

/**
 * 保存行程信息
 */
function saveTripInfo() {
    if (!tripData) return;
    
    tripData.tripInfo.title = document.getElementById('trip-title').value;
    tripData.tripInfo.date = document.getElementById('trip-date').value;
    tripData.tripInfo.days = parseInt(document.getElementById('trip-days').value) || 1;
    tripData.tripInfo.totalDistance = document.getElementById('trip-distance').value;
    tripData.tripInfo.description = document.getElementById('trip-description').value;
    
    // 更新JSON编辑器
    updateJsonEditor();
    
    // 标记数据已修改
    dataModified = true;
    
    showMessage('行程信息保存成功', 'success');
}

/**
 * 渲染行程视图
 */
function renderScheduleView() {
    if (!tripData || !tripData.dailySchedule) return;
    
    const daysContainer = document.getElementById('days-container');
    daysContainer.innerHTML = '';
    
    tripData.dailySchedule.forEach((day, dayIndex) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'schedule-day';
        
        // 天数标题
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <h3>Day ${day.day}: ${day.title}</h3>
            <div>
                <button class="edit-day-btn" data-day="${dayIndex}">编辑</button>
                <button class="delete-day-btn" data-day="${dayIndex}">删除</button>
                <button class="add-spot-btn" data-day="${dayIndex}">添加景点</button>
            </div>
        `;
        dayElement.appendChild(dayHeader);
        
        // 天数内容
        const dayContent = document.createElement('div');
        dayContent.className = 'day-content';
        
        // 天数描述
        const dayDescription = document.createElement('p');
        dayDescription.textContent = day.description;
        dayContent.appendChild(dayDescription);
        
        // 景点列表
        if (day.spots && day.spots.length > 0) {
            day.spots.forEach((spot, spotIndex) => {
                const spotElement = document.createElement('div');
                spotElement.className = 'spot-item';
                
                spotElement.innerHTML = `
                    <div class="spot-info">
                        <div class="spot-name">${spot.time} - ${spot.name}</div>
                        <div class="spot-transport">${spot.transport || ''}</div>
                    </div>
                    <div class="spot-actions">
                        <button class="edit-spot-btn" data-day="${dayIndex}" data-spot="${spotIndex}">编辑</button>
                        <button class="delete-spot-btn" data-day="${dayIndex}" data-spot="${spotIndex}">删除</button>
                    </div>
                `;
                
                dayContent.appendChild(spotElement);
            });
        } else {
            const noSpots = document.createElement('p');
            noSpots.textContent = '暂无景点，请添加';
            noSpots.style.fontStyle = 'italic';
            noSpots.style.color = '#999';
            dayContent.appendChild(noSpots);
        }
        
        dayElement.appendChild(dayContent);
        daysContainer.appendChild(dayElement);
    });
    
    // 绑定天数和景点相关的事件
    bindDayEvents();
}

/**
 * 绑定天数相关事件
 */
function bindDayEvents() {
    // 编辑天数按钮
    document.querySelectorAll('.edit-day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayIndex = parseInt(this.getAttribute('data-day'));
            editDay(dayIndex);
        });
    });
    
    // 删除天数按钮
    document.querySelectorAll('.delete-day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayIndex = parseInt(this.getAttribute('data-day'));
            deleteDay(dayIndex);
        });
    });
    
    // 添加景点按钮
    document.querySelectorAll('.add-spot-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayIndex = parseInt(this.getAttribute('data-day'));
            addSpot(dayIndex);
        });
    });
    
    // 编辑景点按钮
    document.querySelectorAll('.edit-spot-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayIndex = parseInt(this.getAttribute('data-day'));
            const spotIndex = parseInt(this.getAttribute('data-spot'));
            editSpot(dayIndex, spotIndex);
        });
    });
    
    // 删除景点按钮
    document.querySelectorAll('.delete-spot-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const dayIndex = parseInt(this.getAttribute('data-day'));
            const spotIndex = parseInt(this.getAttribute('data-spot'));
            deleteSpot(dayIndex, spotIndex);
        });
    });
}

/**
 * 添加新的天数
 */
function addDay() {
    if (!tripData || !tripData.dailySchedule) return;
    
    const newDayNumber = tripData.dailySchedule.length + 1;
    
    const newDay = {
        day: newDayNumber,
        title: `第${newDayNumber}天`,
        date: new Date().toISOString().split('T')[0],
        description: "请输入当天行程描述",
        spots: []
    };
    
    tripData.dailySchedule.push(newDay);
    
    // 更新行程天数
    tripData.tripInfo.days = tripData.dailySchedule.length;
    document.getElementById('trip-days').value = tripData.tripInfo.days;
    
    // 更新视图
    renderScheduleView();
    updateJsonEditor();
    
    // 标记数据已修改
    dataModified = true;
    
    showMessage(`已添加第${newDayNumber}天`, 'success');
}

/**
 * 编辑天数
 * @param {number} dayIndex - 天数索引
 */
function editDay(dayIndex) {
    if (!tripData || !tripData.dailySchedule || dayIndex < 0 || dayIndex >= tripData.dailySchedule.length) return;
    
    const day = tripData.dailySchedule[dayIndex];
    const newTitle = prompt('请输入天数标题', day.title);
    
    if (newTitle === null) return; // 取消编辑
    
    const newDescription = prompt('请输入当天行程描述', day.description);
    
    if (newDescription === null) return; // 取消编辑
    
    day.title = newTitle;
    day.description = newDescription;
    
    // 更新视图
    renderScheduleView();
    updateJsonEditor();
    
    // 标记数据已修改
    dataModified = true;
    
    showMessage('天数信息已更新', 'success');
}

/**
 * 删除天数
 * @param {number} dayIndex - 天数索引
 */
function deleteDay(dayIndex) {
    if (!tripData || !tripData.dailySchedule || dayIndex < 0 || dayIndex >= tripData.dailySchedule.length) return;
    
    const day = tripData.dailySchedule[dayIndex];
    const confirmDelete = confirm(`确定要删除第${day.day}天(${day.title})吗？此操作不可撤销，将同时删除该天的所有景点。`);
    
    if (!confirmDelete) return;
    
    // 删除天数
    tripData.dailySchedule.splice(dayIndex, 1);
    
    // 更新剩余天数的序号
    tripData.dailySchedule.forEach((day, index) => {
        day.day = index + 1;
    });
    
    // 更新行程天数
    tripData.tripInfo.days = tripData.dailySchedule.length;
    document.getElementById('trip-days').value = tripData.tripInfo.days;
    
    // 更新视图
    renderScheduleView();
    updateJsonEditor();
    
    // 标记数据已修改
    dataModified = true;
    
    showMessage(`已删除第${day.day}天`, 'success');
}

/**
 * 添加景点
 * @param {number} dayIndex - 天数索引
 */
function addSpot(dayIndex) {
    if (!tripData || !tripData.dailySchedule || dayIndex < 0 || dayIndex >= tripData.dailySchedule.length) return;
    
    editingDayIndex = dayIndex;
    editingSpotIndex = null;
    
    // 创建新景点对象
    const spotId = `spot-${dayIndex + 1}-${tripData.dailySchedule[dayIndex].spots.length + 1}`;
    editingSpot = {
        id: spotId,
        time: "09:00",
        name: "",
        description: "",
        location: "0,0",
        transport: "自驾",
        links: []
    };
    
    // 打开景点编辑模态框
    document.getElementById('spot-modal-title').textContent = '添加景点';
    document.getElementById('spot-name-input').value = '';
    document.getElementById('spot-time-input').value = '09:00';
    document.getElementById('spot-description-input').value = '';
    document.getElementById('spot-poi-id-input').value = '';
    document.getElementById('spot-location-input').value = '';
    document.getElementById('spot-transport-input').value = '自驾';
    document.getElementById('spot-cost-input').value = '';
    
    // 清空链接容器
    document.getElementById('links-container').innerHTML = '';
    
    document.getElementById('spot-modal').style.display = 'block';
}

/**
 * 编辑景点
 * @param {number} dayIndex - 天数索引
 * @param {number} spotIndex - 景点索引
 */
function editSpot(dayIndex, spotIndex) {
    if (!tripData || !tripData.dailySchedule || 
        dayIndex < 0 || dayIndex >= tripData.dailySchedule.length || 
        spotIndex < 0 || spotIndex >= tripData.dailySchedule[dayIndex].spots.length) return;
    
    editingDayIndex = dayIndex;
    editingSpotIndex = spotIndex;
    editingSpot = JSON.parse(JSON.stringify(tripData.dailySchedule[dayIndex].spots[spotIndex]));
    
    // 打开景点编辑模态框
    document.getElementById('spot-modal-title').textContent = '编辑景点';
    document.getElementById('spot-name-input').value = editingSpot.name || '';
    document.getElementById('spot-time-input').value = editingSpot.time || '00:00';
    document.getElementById('spot-description-input').value = editingSpot.description || '';
    document.getElementById('spot-poi-id-input').value = editingSpot.poiId || '';
    document.getElementById('spot-location-input').value = editingSpot.location || '';
    document.getElementById('spot-transport-input').value = editingSpot.transport || '自驾';
    document.getElementById('spot-cost-input').value = editingSpot.cost || '';
    
    // 渲染链接
    renderLinks(editingSpot.links || []);
    
    document.getElementById('spot-modal').style.display = 'block';
}

/**
 * 渲染链接列表
 * @param {Array} links - 链接数组
 */
function renderLinks(links) {
    const linksContainer = document.getElementById('links-container');
    linksContainer.innerHTML = '';
    
    if (links && links.length > 0) {
        links.forEach((link, index) => {
            const linkItem = document.createElement('div');
            linkItem.className = 'link-item';
            linkItem.style.marginBottom = '10px';
            linkItem.style.padding = '10px';
            linkItem.style.border = '1px solid #eee';
            linkItem.style.borderRadius = '4px';
            
            linkItem.innerHTML = `
                <div class="form-group" style="margin-bottom: 5px;">
                    <label>标题</label>
                    <input type="text" class="link-title" value="${link.title || ''}">
                </div>
                <div class="form-group" style="margin-bottom: 5px;">
                    <label>URL</label>
                    <input type="text" class="link-url" value="${link.url || ''}">
                </div>
                <div class="form-group" style="margin-bottom: 5px;">
                    <label>类型</label>
                    <select class="link-type">
                        <option value="tip" ${link.type === 'tip' ? 'selected' : ''}>小贴士</option>
                        <option value="video" ${link.type === 'video' ? 'selected' : ''}>视频</option>
                        <option value="article" ${link.type === 'article' ? 'selected' : ''}>文章</option>
                    </select>
                </div>
                <button type="button" class="remove-link-btn btn-danger" data-index="${index}" style="margin-top: 5px;">删除</button>
            `;
            
            linksContainer.appendChild(linkItem);
            
            // 绑定删除链接按钮事件
            linkItem.querySelector('.remove-link-btn').addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeLink(index);
            });
        });
    }
    
    // 绑定添加链接按钮事件
    document.getElementById('add-link-btn').onclick = addLink;
}

/**
 * 添加链接
 */
function addLink() {
    const linksContainer = document.getElementById('links-container');
    const linkCount = linksContainer.querySelectorAll('.link-item').length;
    
    const linkItem = document.createElement('div');
    linkItem.className = 'link-item';
    linkItem.style.marginBottom = '10px';
    linkItem.style.padding = '10px';
    linkItem.style.border = '1px solid #eee';
    linkItem.style.borderRadius = '4px';
    
    linkItem.innerHTML = `
        <div class="form-group" style="margin-bottom: 5px;">
            <label>标题</label>
            <input type="text" class="link-title" value="">
        </div>
        <div class="form-group" style="margin-bottom: 5px;">
            <label>URL</label>
            <input type="text" class="link-url" value="">
        </div>
        <div class="form-group" style="margin-bottom: 5px;">
            <label>类型</label>
            <select class="link-type">
                <option value="tip">小贴士</option>
                <option value="video">视频</option>
                <option value="article">文章</option>
            </select>
        </div>
        <button type="button" class="remove-link-btn btn-danger" data-index="${linkCount}" style="margin-top: 5px;">删除</button>
    `;
    
    linksContainer.appendChild(linkItem);
    
    // 绑定删除链接按钮事件
    linkItem.querySelector('.remove-link-btn').addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        removeLink(index);
    });
}

/**
 * 删除链接
 * @param {number} index - 链接索引
 */
function removeLink(index) {
    const linksContainer = document.getElementById('links-container');
    const linkItems = linksContainer.querySelectorAll('.link-item');
    
    if (index >= 0 && index < linkItems.length) {
        linkItems[index].remove();
        
        // 更新剩余链接的索引
        const remainingItems = linksContainer.querySelectorAll('.link-item');
        remainingItems.forEach((item, i) => {
            item.querySelector('.remove-link-btn').setAttribute('data-index', i);
        });
    }
}

/**
 * 收集链接数据
 * @returns {Array} 链接数组
 */
function collectLinks() {
    const linksContainer = document.getElementById('links-container');
    const linkItems = linksContainer.querySelectorAll('.link-item');
    const links = [];
    
    linkItems.forEach(item => {
        const title = item.querySelector('.link-title').value;
        const url = item.querySelector('.link-url').value;
        const type = item.querySelector('.link-type').value;
        
        links.push({
            title,
            url,
            type
        });
    });
    
    return links;
}

/**
 * 保存景点
 */
function saveSpot() {
    if (editingDayIndex === null || !editingSpot) return;
    
    // 获取表单数据
    editingSpot.name = document.getElementById('spot-name-input').value;
    editingSpot.time = document.getElementById('spot-time-input').value;
    editingSpot.description = document.getElementById('spot-description-input').value;
    
    const poiId = document.getElementById('spot-poi-id-input').value;
    if (poiId) {
        editingSpot.poiId = poiId;
    } else if (editingSpot.poiId) {
        delete editingSpot.poiId;
    }
    
    editingSpot.location = document.getElementById('spot-location-input').value;
    editingSpot.transport = document.getElementById('spot-transport-input').value;
    
    const cost = document.getElementById('spot-cost-input').value;
    if (cost) {
        editingSpot.cost = cost;
    } else if (editingSpot.cost) {
        delete editingSpot.cost;
    }
    
    // 收集链接数据
    editingSpot.links = collectLinks();
    
    // 保存到数据中
    if (editingSpotIndex !== null) {
        // 编辑现有景点
        tripData.dailySchedule[editingDayIndex].spots[editingSpotIndex] = editingSpot;
    } else {
        // 添加新景点
        if (!tripData.dailySchedule[editingDayIndex].spots) {
            tripData.dailySchedule[editingDayIndex].spots = [];
        }
        tripData.dailySchedule[editingDayIndex].spots.push(editingSpot);
    }
    
    // 关闭模态框
    closeSpotModal();
    
    // 更新视图
    renderScheduleView();
    updateJsonEditor();
    
    // 标记数据已修改
    dataModified = true;
    
    showMessage('景点保存成功', 'success');
}

/**
 * 关闭景点模态框
 */
function closeSpotModal() {
    document.getElementById('spot-modal').style.display = 'none';
    editingSpot = null;
    editingDayIndex = null;
    editingSpotIndex = null;
}

/**
 * 删除景点
 * @param {number} dayIndex - 天数索引
 * @param {number} spotIndex - 景点索引
 */
function deleteSpot(dayIndex, spotIndex) {
    if (!tripData || !tripData.dailySchedule || 
        dayIndex < 0 || dayIndex >= tripData.dailySchedule.length || 
        spotIndex < 0 || spotIndex >= tripData.dailySchedule[dayIndex].spots.length) return;
    
    const spot = tripData.dailySchedule[dayIndex].spots[spotIndex];
    const confirmDelete = confirm(`确定要删除景点"${spot.name}"吗？此操作不可撤销。`);
    
    if (!confirmDelete) return;
    
    // 删除景点
    tripData.dailySchedule[dayIndex].spots.splice(spotIndex, 1);
    
    // 更新视图
    renderScheduleView();
    updateJsonEditor();
    
    // 标记数据已修改
    dataModified = true;
    
    showMessage(`已删除景点"${spot.name}"`, 'success');
}

/**
 * 更新JSON编辑器
 */
function updateJsonEditor() {
    const jsonEditor = document.getElementById('json-editor');
    
    // 确保所有坐标格式正确
    if (tripData) {
        // 遍历所有天和景点
        if (tripData.dailySchedule) {
            tripData.dailySchedule.forEach(day => {
                if (day.spots) {
                    day.spots.forEach(spot => {
                        // 将coordinates对象格式转换为location字符串格式
                        if (spot.coordinates && !spot.location) {
                            const lng = spot.coordinates.lng;
                            const lat = spot.coordinates.lat;
                            spot.location = `${lng},${lat}`;
                            // 删除旧的coordinates对象
                            delete spot.coordinates;
                        }
                        
                        // 确保tips作为链接存储
                        if (spot.tips && !spot.tips.trim()) {
                            delete spot.tips;
                        } else if (spot.tips && !spot.links) {
                            spot.links = [];
                            spot.links.push({
                                title: spot.tips,
                                url: "",
                                type: "tip"
                            });
                            delete spot.tips;
                        } else if (spot.tips) {
                            // 如果已有links数组，添加tips作为链接
                            const hasTipLink = spot.links.some(link => 
                                link.title === spot.tips && link.type === 'tip'
                            );
                            
                            if (!hasTipLink) {
                                spot.links.push({
                                    title: spot.tips,
                                    url: "",
                                    type: "tip"
                                });
                            }
                            delete spot.tips;
                        }
                        
                        // 删除category属性
                        if (spot.category) {
                            delete spot.category;
                        }
                        
                        // 修正交通方式
                        if (spot.transport) {
                            // 规范化交通方式为三种：自驾、骑行、步行
                            if (spot.transport.includes('车') || 
                                spot.transport.includes('驾') || 
                                spot.transport === '出租车' || 
                                spot.transport === '打车') {
                                spot.transport = '自驾';
                            } else if (spot.transport.includes('电动') || 
                                       spot.transport.includes('单车') || 
                                       spot.transport.includes('骑')) {
                                spot.transport = '骑行';
                            } else if (spot.transport.includes('走') || 
                                       spot.transport.includes('步') || 
                                       spot.transport === '徒步') {
                                spot.transport = '步行';
                            }
                            // 如果不符合以上任何条件，默认设为自驾
                            else if (spot.transport !== '自驾' && 
                                     spot.transport !== '骑行' && 
                                     spot.transport !== '步行') {
                                spot.transport = '自驾';
                            }
                        }
                    });
                }
            });
        }
    }
    
    jsonEditor.value = JSON.stringify(tripData, null, 2);
}

/**
 * 验证JSON格式
 */
function validateJson() {
    const jsonEditor = document.getElementById('json-editor');
    const jsonString = jsonEditor.value;
    
    try {
        JSON.parse(jsonString);
        showMessage('JSON格式正确', 'success');
        return true;
    } catch (error) {
        showMessage(`JSON格式错误: ${error.message}`, 'error');
        return false;
    }
}

/**
 * 格式化JSON
 */
function formatJson() {
    const jsonEditor = document.getElementById('json-editor');
    const jsonString = jsonEditor.value;
    
    try {
        const parsed = JSON.parse(jsonString);
        jsonEditor.value = JSON.stringify(parsed, null, 2);
        showMessage('JSON已格式化', 'success');
    } catch (error) {
        showMessage(`JSON格式错误: ${error.message}`, 'error');
    }
}

/**
 * 保存JSON
 */
function saveJson() {
    const jsonEditor = document.getElementById('json-editor');
    const jsonString = jsonEditor.value;
    
    try {
        const parsed = JSON.parse(jsonString);
        tripData = parsed;
        
        // 更新视图
        renderTripInfo();
        renderScheduleView();
        
        // 标记数据已修改
        dataModified = true;
        
        showMessage('JSON已保存', 'success');
    } catch (error) {
        showMessage(`JSON格式错误: ${error.message}`, 'error');
    }
}

/**
 * 搜索POI
 */
function searchPOI() {
    const keyword = document.getElementById('poi-keyword').value.trim();
    if (!keyword) {
        showMessage('请输入搜索关键词', 'error');
        return;
    }
    
    // 检查是否是高德地图分享链接
    if (keyword.includes('amap.com')) {
        parseAmapLink(keyword);
        return;
    }
    
    // 显示加载状态
    const resultsContainer = document.getElementById('poi-search-results');
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">搜索中...</div>';
    
    // 使用高德地图API搜索
    const placeSearch = new AMap.PlaceSearch({
        city: '全国',
        pageSize: 10,
        pageIndex: 1
    });
    
    placeSearch.search(keyword, function(status, result) {
        if (status === 'complete' && result.info === 'OK') {
            const pois = result.poiList.pois;
            
            if (pois && pois.length > 0) {
                resultsContainer.innerHTML = '';
                
                pois.forEach(poi => {
                    const item = document.createElement('div');
                    item.className = 'poi-result-item';
                    item.innerHTML = `
                        <div><strong>${poi.name}</strong></div>
                        <div style="font-size: 12px; color: #666;">${poi.address || '无详细地址'}</div>
                    `;
                    
                    item.addEventListener('click', function() {
                        // 显示POI详情
                        showPOIDetail(poi);
                    });
                    
                    resultsContainer.appendChild(item);
                });
            } else {
                resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">未找到相关地点</div>';
            }
        } else {
            resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">搜索失败，请重试</div>';
        }
    });
}

/**
 * 解析高德地图分享链接
 * @param {string} link - 高德地图分享链接
 */
function parseAmapLink(link) {
    try {
        // 尝试提取坐标参数
        const url = new URL(link);
        
        // 显示加载状态
        const resultsContainer = document.getElementById('poi-search-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">解析链接中...</div>';
        
        // 高德地图分享链接格式可能为：
        // 1. https://uri.amap.com/marker?position=113.123456,22.123456
        // 2. https://www.amap.com/regeo?lng=113.123456&lat=22.123456
        // 3. https://www.amap.com/place/B0FFHG76Y9
        
        let lng, lat, name;
        
        if (url.pathname.includes('marker') && url.searchParams.has('position')) {
            // 第一种情况
            const position = url.searchParams.get('position').split(',');
            lng = position[0];
            lat = position[1];
            name = url.searchParams.get('name') || '分享的位置';
            
            // 创建POI对象
            const poi = {
                id: '',
                name: name,
                location: {
                    lng: parseFloat(lng),
                    lat: parseFloat(lat)
                },
                address: `坐标: ${lng},${lat}`
            };
            
            showPOIDetail(poi);
        } else if (url.pathname.includes('regeo')) {
            // 第二种情况
            lng = url.searchParams.get('lng');
            lat = url.searchParams.get('lat');
            name = '分享的位置';
            
            // 创建POI对象
            const poi = {
                id: '',
                name: name,
                location: {
                    lng: parseFloat(lng),
                    lat: parseFloat(lat)
                },
                address: `坐标: ${lng},${lat}`
            };
            
            showPOIDetail(poi);
        } else if (url.pathname.includes('place')) {
            // 第三种情况 - 需要先解析POI ID，然后搜索
            const poiId = url.pathname.split('/').pop();
            
            // 使用PlaceSearch获取POI详情
            const placeSearch = new AMap.PlaceSearch();
            placeSearch.getDetails(poiId, function(status, result) {
                if (status === 'complete' && result.info === 'OK' && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                    const poi = result.poiList.pois[0];
                    showPOIDetail(poi);
                } else {
                    resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">无法解析该高德地图链接，请尝试直接搜索地点名称</div>';
                }
            });
            return;
        } else {
            // 可能是其他格式，尝试通用解析
            const params = new URLSearchParams(url.search);
            lng = params.get('lng') || params.get('longitude');
            lat = params.get('lat') || params.get('latitude');
            name = params.get('name') || '分享的位置';
            
            if (lng && lat) {
                // 创建POI对象
                const poi = {
                    id: '',
                    name: name,
                    location: {
                        lng: parseFloat(lng),
                        lat: parseFloat(lat)
                    },
                    address: `坐标: ${lng},${lat}`
                };
                
                showPOIDetail(poi);
            } else {
                resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">无法从链接中提取坐标信息，请尝试直接搜索地点名称</div>';
            }
        }
    } catch (error) {
        console.error('解析高德地图链接失败', error);
        const resultsContainer = document.getElementById('poi-search-results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = '<div style="padding: 10px; text-align: center;">无法解析该链接，请检查链接格式或尝试直接搜索地点名称</div>';
    }
}

/**
 * 显示POI详情
 * @param {Object} poi - POI对象
 */
function showPOIDetail(poi) {
    document.getElementById('poi-name').value = poi.name || '';
    document.getElementById('poi-address').value = poi.address || '';
    document.getElementById('poi-id').value = poi.id || '';
    
    // 转换坐标格式为 "经度,纬度"
    let location = '';
    if (poi.location) {
        if (typeof poi.location === 'string') {
            // 如果已经是字符串格式，直接使用
            location = poi.location;
        } else if (poi.location.lng && poi.location.lat) {
            // 如果是对象格式，转换为字符串
            location = `${poi.location.lng},${poi.location.lat}`;
        }
    }
    document.getElementById('poi-location').value = location;
    
    document.getElementById('poi-detail').style.display = 'block';
}

/**
 * 复制POI信息
 */
function copyPOIInfo() {
    const name = document.getElementById('poi-name').value;
    const address = document.getElementById('poi-address').value;
    const poiId = document.getElementById('poi-id').value;
    const location = document.getElementById('poi-location').value;
    
    // 格式化文本
    const text = `名称: ${name}\n地址: ${address}\nPOI ID: ${poiId}\n位置: ${location}`;
    
    // 复制到剪贴板
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showMessage('POI信息已复制到剪贴板', 'success'))
            .catch(err => {
                console.error('复制失败:', err);
                fallbackCopyToClipboard(text);
            });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * 复制POI的JSON格式
 */
function copyPOIJson() {
    const name = document.getElementById('poi-name').value;
    const poiId = document.getElementById('poi-id').value;
    const location = document.getElementById('poi-location').value.replace(/\s+/g, '');
    
    // 创建POI JSON对象，使用新的格式
    const poi = {
        name,
        description: `请在此处添加${name}的描述`,
        location, // 使用字符串格式的位置信息
        transport: "自驾", // 默认交通方式
        links: [
            {
                title: `请在此处添加关于${name}的小贴士`,
                url: "",
                type: "tip"
            }
        ],
        poiId
    };
    
    // 转换为格式化的JSON字符串
    const jsonString = JSON.stringify(poi, null, 2);
    
    // 复制到剪贴板
    navigator.clipboard.writeText(jsonString).then(function() {
        showMessage('JSON格式已复制到剪贴板', 'success');
    }, function() {
        fallbackCopyToClipboard(jsonString);
    });
}

/**
 * 备用的复制到剪贴板方法
 * @param {string} text - 要复制的文本
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showMessage('信息已复制到剪贴板', 'success');
        } else {
            console.error('复制失败');
            showMessage('复制失败，请手动复制', 'error');
        }
    } catch (err) {
        console.error('复制失败', err);
        showMessage('复制失败，请手动复制', 'error');
    }
    
    document.body.removeChild(textArea);
}

/**
 * 备份数据
 */
function backupData() {
    const dataStr = JSON.stringify(tripData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `travel_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage('数据备份成功', 'success');
}

/**
 * 恢复数据
 */
async function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async function(e) {
        try {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据结构
                    if (!data.tripInfo || !data.dailySchedule) {
                        throw new Error('无效的数据格式');
                    }
                    
                    tripData = data;
                    dataModified = true;
                    
                    // 保存到服务器
                    await saveData();
                    
                    // 更新界面
                    renderTripInfo();
                    renderScheduleView();
                    updateJsonEditor();
                    
                    showMessage('数据恢复成功', 'success');
                } catch (error) {
                    console.error('恢复数据失败:', error);
                    showMessage('恢复失败: ' + error.message, 'error');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('读取文件失败:', error);
            showMessage('读取文件失败', 'error');
        }
    };
    
    input.click();
}

/**
 * 生成数据（原saveData函数重命名为generateData，saveData函数变为内部函数）
 */
function generateData() {
    if (!dataModified) {
        if (!confirm('数据没有修改，确定要重新生成下载链接吗？')) {
            return;
        }
    }
    
    // 保存数据
    saveData();
    
    // 重置修改状态
    dataModified = false;
}

/**
 * 内部保存数据函数，不再自动生成下载
 */
async function saveData() {
    try {
        if (!dataModified) {
            console.log('数据未修改，无需保存');
            return;
        }
        
        // 获取所有行程列表以获取当前行程ID
        const tripsResponse = await fetch(CONFIG.api.baseUrl + CONFIG.api.endpoints.trips);
        if (!tripsResponse.ok) {
            throw new Error(`HTTP错误! 状态码: ${tripsResponse.status}`);
        }
        
        const trips = await tripsResponse.json();
        
        if (!trips || !Array.isArray(trips.results) || trips.results.length === 0) {
            throw new Error('没有找到任何行程数据');
        }
        
        const tripId = trips.results[0].id;
        const tripDetailsUrl = CONFIG.api.baseUrl + CONFIG.api.endpoints.tripDetails.replace('{id}', tripId);
        
        // 发送PUT请求更新行程数据
        const response = await fetch(tripDetailsUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tripData)
        });
        
        if (!response.ok) {
            throw new Error(`保存失败: ${response.status} ${response.statusText}`);
        }
        
        dataModified = false;
        showMessage('数据保存成功', 'success');
        console.log('数据保存成功');
    } catch (error) {
        console.error('保存数据失败:', error);
        showMessage('保存失败: ' + error.message, 'error');
    }
}

/**
 * 显示消息提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型 ('success' 或 'error')
 */
function showMessage(message, type = 'success') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 3000);
} 