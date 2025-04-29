/**
 * 旅游攻略网站主JavaScript文件
 */

// 全局变量
let map;         // 地图实例
let tripData;    // 行程数据
let markers = []; // 标记点集合
let activeDay = 1; // 当前激活的天数
let activePath; // 当前激活的路径
let poiCache = {}; // POI信息缓存，减少API调用

// 初始化
document.addEventListener('DOMContentLoaded', init);

/**
 * 初始化函数
 */
async function init() {
    try {
        console.log('开始初始化应用...');
        // 显示加载状态
        const pageLoading = document.getElementById('pageLoading');
        if (pageLoading) {
            pageLoading.querySelector('.loading-text').textContent = '正在加载应用...';
        }

        // 从localStorage加载POI缓存
        loadPOICacheFromStorage();
        
        // 初始化地图
        initMap();
        
        try {
            // 加载行程数据
            await loadTripData();
            
            // 只有当行程数据成功加载后才执行以下操作
            if (tripData && tripData.dailySchedule) {
                // 渲染日期标签
                renderDayTabs();
                
                // 渲染第一天的行程
                renderDayContent(1);
                
                // 绑定事件
                bindEvents();
                
                // 添加控制台日志，便于调试
                console.log('行程数据:', tripData);
                console.log('地图功能说明: 点击不同的日期标签可以切换显示当天的行程和引导线路');
            } else {
                throw new Error('行程数据结构不完整');
            }
        } catch (dataError) {
            console.error('行程数据加载失败:', dataError);
            // 这里不再抛出错误，而是继续执行其它可以正常工作的功能
            // loadTripData函数已经负责显示友好的错误信息
        }
        
        // 初始化天气设置
        initWeatherSettings();
        
        // 检查Visual Crossing API Key是否已设置
        checkVisualCrossingApiKey();
        
        // 隐藏加载状态
        if (pageLoading) {
            setTimeout(() => {
                pageLoading.classList.add('fade-out');
                setTimeout(() => {
                    pageLoading.style.display = 'none';
                }, 500);
            }, 500);
        }
        
        console.log('应用初始化完成');
    } catch (error) {
        console.error('应用初始化错误:', error);
        // 隐藏加载状态
        const pageLoading = document.getElementById('pageLoading');
        if (pageLoading) {
            pageLoading.style.display = 'none';
        }
        
        // 显示友好的错误信息
        alert('应用初始化失败，请刷新页面重试。错误信息: ' + error.message);
    }
}

/**
 * 检查Visual Crossing API Key是否已设置，未设置则显示提示
 */
function checkVisualCrossingApiKey() {
    try {
        const apiKey = CONFIG.visualCrossingApiKey || CONFIG.api.weather.key;
        if (!apiKey) {
            // 等待2秒后显示通知，避免与页面加载动画冲突
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'api-key-notification';
                notification.innerHTML = `
                    <div class="api-key-notification-content">
                        <span class="notification-icon">ℹ️</span>
                        <span class="notification-text">请在设置中添加Visual Crossing API Key以获取天气信息</span>
                        <button class="notification-close">&times;</button>
                    </div>
                `;
                document.body.appendChild(notification);
                
                // 添加样式
                const style = document.createElement('style');
                style.textContent = `
                    .api-key-notification {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background-color: #f8f9fa;
                        border-left: 4px solid #3b82f6;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        padding: 12px 15px;
                        border-radius: 4px;
                        z-index: 1000;
                        max-width: 350px;
                        animation: slideIn 0.3s ease;
                    }
                    .api-key-notification-content {
                        display: flex;
                        align-items: center;
                    }
                    .notification-icon {
                        margin-right: 10px;
                        font-size: 20px;
                    }
                    .notification-text {
                        font-size: 14px;
                        color: #333;
                        flex-grow: 1;
                    }
                    .notification-close {
                        background: none;
                        border: none;
                        color: #999;
                        font-size: 20px;
                        cursor: pointer;
                        padding: 0 5px;
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
                
                // 点击关闭按钮
                const closeButton = notification.querySelector('.notification-close');
                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        notification.style.display = 'none';
                    });
                }
                
                // 点击通知打开设置面板
                notification.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('notification-close')) {
                        const settingsPanel = document.getElementById('settings-panel');
                        if (settingsPanel) {
                            settingsPanel.classList.add('active');
                            // 焦点定位到API Key输入框
                            const apiKeyInput = document.getElementById('visual-crossing-api-key');
                            if (apiKeyInput) {
                                apiKeyInput.focus();
                            }
                        }
                    }
                });
                
                // 8秒后自动消失
                setTimeout(() => {
                    notification.style.opacity = '0';
                    notification.style.transform = 'translateX(100%)';
                    notification.style.transition = 'opacity 0.3s, transform 0.3s';
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 8000);
            }, 2000);
        }
    } catch (err) {
        console.error('检查API Key时出错:', err);
    }
}

/**
 * 从localStorage加载POI缓存
 */
function loadPOICacheFromStorage() {
    try {
        const cachedData = localStorage.getItem('poiCache');
        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            poiCache = parsedData;
            console.log(`已从localStorage加载${Object.keys(poiCache).length}个POI缓存数据`);
        }
    } catch (error) {
        console.error('从localStorage加载POI缓存失败:', error);
        // 加载失败则使用空对象重置缓存
        poiCache = {};
    }
}

/**
 * 将POI缓存保存到localStorage
 */
function savePOICacheToStorage() {
    try {
        const cacheSize = Object.keys(poiCache).length;
        if (cacheSize > 0) {
            localStorage.setItem('poiCache', JSON.stringify(poiCache));
            console.log(`已将${cacheSize}个POI缓存数据保存到localStorage`);
        }
    } catch (error) {
        console.error('保存POI缓存到localStorage失败:', error);
    }
}

/**
 * 初始化地图
 */
function initMap() {
    try {
        // 获取地图容器
        const mapContainer = document.getElementById('map-container');
        
        // 显示加载中提示
        mapContainer.innerHTML = `
            <div class="map-loading" style="padding:20px;text-align:center;color:var(--secondary-color);">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto;display:block;margin-bottom:10px;">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                地图加载中，请稍候...
            </div>
        `;
        
        // 检测是否是移动设备
        const isMobile = window.innerWidth <= 768;
        
        // 创建地图实例
        map = new AMap.Map('map-container', {
            viewMode: CONFIG.map.viewMode,
            zoom: isMobile ? CONFIG.map.zoom - 1 : CONFIG.map.zoom, // 移动设备上稍微缩小地图
            center: CONFIG.map.center,
            mapStyle: 'amap://styles/normal',
            resizeEnable: true
        });
        
        // 添加地图控件
        map.plugin([
            'AMap.ToolBar',
            'AMap.Scale',
            'AMap.MapType',
            'AMap.Geolocation'
        ], function(){
            // 移动设备上减少控件
            if (!isMobile) {
                // 工具条控件
                map.addControl(new AMap.ToolBar({
                    position: 'RT'
                }));
                
                // 地图类型切换控件
                map.addControl(new AMap.MapType({
                    defaultType: 0,
                    position: 'RB'
                }));
            }
            
            // 比例尺控件
            map.addControl(new AMap.Scale());
            
            // 定位控件
            map.addControl(new AMap.Geolocation({
                position: 'LB',
                showButton: true
            }));
        });
        
        // 地图加载完成事件
        map.on('complete', function() {
            console.log('地图加载完成');
        });
        
        // 地图加载失败事件
        map.on('error', function(error) {
            console.error('地图加载失败:', error);
            mapContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: red;">
                    地图加载失败，请检查网络或刷新页面重试。
                </div>
            `;
        });
    } catch (error) {
        console.error('地图初始化错误:', error);
        document.getElementById('map-container').innerHTML = `
            <div style="text-align: center; padding: 20px; color: red;">
                地图初始化失败，请检查API密钥是否正确。
            </div>
        `;
    }
}

/**
 * 加载行程数据
 */
async function loadTripData() {
    try {
        console.log('开始加载行程数据，数据路径:', CONFIG.dataPath);
        const response = await fetch(CONFIG.dataPath);
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}, 状态文本: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.warn('警告: 响应Content-Type不是JSON格式:', contentType);
        }
        
        const text = await response.text();
        
        try {
            // 尝试解析JSON
            tripData = JSON.parse(text);
            console.log('行程数据加载成功:', tripData);
            
            // 验证数据结构
            if (!tripData.dailySchedule || !Array.isArray(tripData.dailySchedule)) {
                throw new Error('JSON数据格式错误: 缺少dailySchedule数组');
            }
            
            // 优化坐标数据
            optimizeCoordinates();
            
            // 预缓存POI信息
            await precachePOIData();
        } catch (parseError) {
            console.error('JSON解析错误:', parseError);
            console.error('原始响应文本:', text.substring(0, 500) + '...');
            throw new Error('行程数据格式不正确，无法解析JSON，请检查data/trip-data.json文件。');
        }
    } catch (error) {
        console.error('加载行程数据失败:', error);
        
        // 显示友好的错误信息到UI
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="text-align: center; padding: 20px; color: red; background: #fff9f9; border: 1px solid #ffcdcd; border-radius: 5px; margin: 20px;">
                    <h3>加载行程数据失败</h3>
                    <p>${error.message}</p>
                    <p>请检查以下可能的问题:</p>
                    <ul style="text-align: left; margin: 10px auto; max-width: 500px;">
                        <li>确认 data/trip-data.json 文件存在</li>
                        <li>检查 JSON 格式是否正确</li>
                        <li>尝试刷新页面</li>
                    </ul>
                    <button onclick="location.reload()" style="padding: 8px 16px; background: #4B89DC; color: white; border: none; border-radius: 4px; cursor: pointer;">重新加载页面</button>
                </div>
            `;
        }
        
        const spotsContainer = document.getElementById('spotsContainer');
        if (spotsContainer) {
            spotsContainer.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p>无法加载行程数据，请检查控制台获取详细错误信息。</p>
                </div>
            `;
        }
        
        throw new Error('无法加载行程数据，请检查data/trip-data.json文件。');
    }
}

/**
 * 预缓存POI信息，减少API调用次数
 */
async function precachePOIData() {
    // 如果配置不允许使用POI查询或不使用缓存，则跳过预缓存
    if (!CONFIG.api.usePOIQuery || !CONFIG.api.useCache) {
        console.log('根据配置，跳过POI信息预缓存');
        return;
    }
    
    // 检查tripData是否存在
    if (!tripData || !tripData.dailySchedule || !Array.isArray(tripData.dailySchedule)) {
        console.warn('行程数据不存在或格式不正确，跳过POI预缓存');
        return;
    }
    
    // 收集所有需要查询的POI ID
    const poiIdsToFetch = new Set();
    let totalPoiCount = 0;
    
    // 遍历所有天数的所有景点
    tripData.dailySchedule.forEach(day => {
        if (!day.spots || !Array.isArray(day.spots)) {
            console.warn(`第${day.day}天的景点数据不存在或格式不正确`);
            return;
        }
        
        day.spots.forEach(spot => {
            if (spot && spot.poiId && !poiCache[spot.poiId]) {
                poiIdsToFetch.add(spot.poiId);
                totalPoiCount++;
            }
        });
    });
    
    // 如果没有需要查询的POI ID，直接返回
    if (poiIdsToFetch.size === 0) {
        console.log('没有需要预缓存的POI数据');
        return;
    }
    
    console.log(`开始预缓存${poiIdsToFetch.size}个POI信息（总景点数：${totalPoiCount}）`);
    
    // 由于API限制，我们不是批量获取所有POI，而是只预缓存第一天的POI数据
    // 这样可以减少初始加载时的API调用数量，其他天的数据会在切换天数时按需加载
    if (tripData.dailySchedule.length > 0 && tripData.dailySchedule[0].spots) {
        const firstDayPoiIds = new Set();
        tripData.dailySchedule[0].spots.forEach(spot => {
            if (spot && spot.poiId && !poiCache[spot.poiId]) {
                firstDayPoiIds.add(spot.poiId);
            }
        });
        
        if (firstDayPoiIds.size > 0) {
            console.log(`预缓存第一天的${firstDayPoiIds.size}个POI信息`);
            
            try {
                // 创建PlaceSearch实例
                const placeSearch = new AMap.PlaceSearch({
                    pageSize: 1,
                    pageIndex: 1
                });
                
                // 依次查询每个POI（不并行请求，避免触发API限制）
                for (const poiId of firstDayPoiIds) {
                    try {
                        // 使用Promise包装getDetails回调
                        await new Promise((resolve) => {
                            placeSearch.getDetails(poiId, (status, result) => {
                                if (status === 'complete' && result.info === 'OK' && 
                                    result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                                    // 获取POI详情
                                    const poi = result.poiList.pois[0];
                                    
                                    // 存入缓存
                                    poiCache[poiId] = poi;
                                    console.log(`预缓存POI成功: ${poi.name}`);
                                } else {
                                    console.warn(`预缓存POI失败: ${poiId}`);
                                }
                                // 无论成功失败都继续下一个
                                resolve();
                            });
                        });
                        
                        // 添加延时，避免过快请求导致API限制
                        await new Promise(resolve => setTimeout(resolve, 300));
                    } catch (error) {
                        console.error(`预缓存POI时出错: ${poiId}`, error);
                    }
                }
                
                console.log('预缓存POI信息完成');
                
                // 保存缓存到localStorage
                savePOICacheToStorage();
            } catch (error) {
                console.error('预缓存POI过程中出错:', error);
            }
        }
    }
}

/**
 * 优化坐标数据，确保使用正确的坐标系统
 */
function optimizeCoordinates() {
    // 遍历所有天数
    tripData.dailySchedule.forEach(day => {
        // 遍历每天的景点
        day.spots.forEach(spot => {
            // 从location字符串获取坐标信息 "经度,纬度"
            if (spot.location) {
                const [lng, lat] = spot.location.split(',').map(coord => parseFloat(coord.trim()));
                
                // 创建coordinates对象
                spot.coordinates = {
                    lng: lng,
                    lat: lat
                };
                
                // 记录原始坐标，用于调试
                spot.originalCoordinates = {
                    lng: lng,
                    lat: lat
                };
                
                // 添加调试日志，显示坐标转换信息
                console.log(`处理景点 ${spot.name} 的坐标: ${spot.location} -> [${lng}, ${lat}]`);
            } else {
                console.warn(`警告: 景点 ${spot.name} 缺少位置信息`);
                // 为避免后续错误，创建一个默认坐标
                spot.coordinates = {
                    lng: 0,
                    lat: 0
                };
            }
            
            // 添加调试日志，显示POI ID信息
            if (spot.poiId) {
                console.log(`景点 ${spot.name} 具有POI ID: ${spot.poiId}`);
            }
        });
    });
}

/**
 * 渲染日期标签
 */
function renderDayTabs() {
    const dayTabsContainer = document.getElementById('dayTabs');
    dayTabsContainer.innerHTML = '';
    
    tripData.dailySchedule.forEach((day) => {
        const tabElement = document.createElement('div');
        tabElement.className = `day-tab ${day.day === activeDay ? 'active' : ''}`;
        tabElement.dataset.day = day.day;
        tabElement.textContent = `Day ${day.day}`;
        
        tabElement.addEventListener('click', function() {
            // 切换标签激活状态
            document.querySelectorAll('.day-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            this.classList.add('active');
            
            const dayNumber = parseInt(this.dataset.day);
            
            // 渲染对应天数的行程
            renderDayContent(dayNumber);
            
            // 确保地图视图下也能看到变化
            if (map) {
                const dayData = tripData.dailySchedule.find(day => day.day === dayNumber);
                if (dayData && dayData.spots && dayData.spots.length > 0) {
                    // 适应视图
                    setTimeout(() => {
                        map.setFitView(markers);
                    }, 500);
                }
            }
        });
        
        dayTabsContainer.appendChild(tabElement);
    });
}

/**
 * 渲染指定天数的行程内容
 * @param {number} dayNumber - 天数
 */
function renderDayContent(dayNumber) {
    // 更新当前激活的天数
    activeDay = dayNumber;
    
    // 获取当天的行程数据
    const dayData = tripData.dailySchedule.find(day => day.day === dayNumber);
    if (!dayData) return;
    
    // 清空现有内容
    const spotsContainer = document.getElementById('spotsContainer');
    spotsContainer.innerHTML = '';
    
    // 更新日期标题和描述
    const dayTitle = document.getElementById('dayTitle');
    const dayDescription = document.getElementById('dayDescription');
    const dayWeather = document.getElementById('dayWeather');
    
    if (dayTitle && dayDescription) {
        dayTitle.textContent = dayData.title;
        dayDescription.textContent = dayData.description;
    }
    
    // 更新天气信息
    if (dayWeather && dayData.city) {
        // 初始化天气加载状态
        dayWeather.innerHTML = `<span class="weather-icon">⏳</span><span>加载中...</span>`;
        // 获取天气信息 - 传入城市ID和日期
        getWeatherInfo(dayData.city, dayWeather, dayData.date);
    }
    
    // 渲染景点卡片
    dayData.spots.forEach((spot, index) => {
        const spotElement = createSpotElement(spot, index);
        spotsContainer.appendChild(spotElement);
    });
    
    // 更新地图标记和路径 - 只显示当天的行程引导线
    updateMapMarkers(dayData.spots);
    
    // 更新导航栏选中状态
    document.querySelectorAll('.day-item').forEach(item => {
        const itemDay = parseInt(item.getAttribute('data-day'));
        item.classList.toggle('active', itemDay === dayNumber);
    });
}

/**
 * 获取天气信息
 * @param {string} cityId - 城市标识(如 "guilin,CN" 或 "guilin CN")
 * @param {HTMLElement} container - 显示天气的容器元素
 * @param {string} [date] - 可选，指定日期（如 "2025-05-01"）
 */
function getWeatherInfo(cityId, container, date) {
    if (!cityId || !container) {
        console.warn('获取天气信息缺少必要参数');
        container.innerHTML = '';
        return;
    }

    console.log('开始获取天气信息:', cityId, date ? `日期: ${date}` : '');
    container.innerHTML = '<span class="weather-loading">获取天气...</span>';

    // 处理城市ID格式，将逗号替换为空格
    const formattedCityId = cityId.replace(',', ' ');
    
    // 首选Visual Crossing天气API
    const apiKey = CONFIG.visualCrossingApiKey || CONFIG.api.weather.key;
    
    // 检查是否已保存API Key，有则使用Visual Crossing，无则回退到高德天气API
    if (apiKey) {
        console.log('使用Visual Crossing天气API');
        // 使用Visual Crossing天气API，传入cityId和日期
        getVisualCrossingWeather(formattedCityId, container, true, date);
    } else {
        console.log('Visual Crossing API Key未设置，回退使用高德天气API');
        // 提取中文城市名（兼容回退到高德天气API）
        const chineseCityName = extractChineseCityName(formattedCityId);
        // 回退使用高德地图天气API
        getAmapWeather(chineseCityName, container);
    }
}

/**
 * 从城市ID中提取中文城市名（仅用于高德API回退）
 * @param {string} cityId - 城市标识(如 "guilin CN")
 * @returns {string} - 中文城市名
 */
function extractChineseCityName(cityId) {
    // 预设映射表，将常见的英文城市ID映射到中文城市名
    const cityMapping = {
        'guilin': '桂林',
        'yangshuo': '阳朔',
        'changsha': '长沙',
        'beijing': '北京',
        'shanghai': '上海'
        // 可以根据需要添加更多映射
    };
    
    // 尝试从映射表获取中文名
    if (cityId) {
        // 提取城市部分并转小写，支持空格或逗号分隔
        const lowerCityId = cityId.toLowerCase().split(/[ ,]/)[0]; 
        if (cityMapping[lowerCityId]) {
            return cityMapping[lowerCityId];
        }
    }
    
    // 如果没有找到映射，或cityId为空，则返回默认值
    return '桂林';
}

/**
 * 使用高德地图API获取天气信息
 * @param {string} city - 城市名称
 * @param {HTMLElement} container - 显示天气的容器
 */
function getAmapWeather(city, container) {
    try {
        // 获取城市的adcode
        const adcode = getCityAdcode(city);
        if (!adcode) {
            console.warn(`未找到城市${city}的adcode，无法获取天气信息`);
            container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">未能识别城市: ${city}</span></div>`;
            return;
        }
        
        // 构建API请求URL
        const amapKey = CONFIG.api.key;
        // 选择获取实时天气还是预报
        const extension = CONFIG.api.weatherForecast ? 'all' : 'base';
        const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${adcode}&extensions=${extension}`;
        
        console.log(`请求高德天气API: ${city} (${adcode}), 类型: ${extension}`);
        
        // 发起API请求
        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`天气API响应错误: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('高德天气API返回数据:', data);
                
                // 处理返回数据
                if (data.status === '1') {
                    if (extension === 'base' && data.lives && data.lives.length > 0) {
                        // 处理实时天气数据
                        const live = data.lives[0];
                        // 显示天气信息
                        displayWeatherFromAMap(live, container);
                    } else if (extension === 'all' && data.forecasts && data.forecasts.length > 0) {
                        // 处理天气预报数据
                        const forecast = data.forecasts[0];
                        // 显示天气预报信息
                        displayWeatherInfo(forecast, container);
                    } else {
                        container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">未获取到天气数据</span></div>`;
                    }
                } else {
                    console.warn('高德天气API返回错误:', data.info);
                    container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">天气API错误: ${data.info}</span></div>`;
                }
            })
            .catch(error => {
                console.error('获取高德天气数据失败:', error);
                container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">天气数据获取失败</span></div>`;
            });
    } catch (error) {
        console.error('高德天气API请求错误:', error);
        container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">天气请求错误</span></div>`;
    }
}

/**
 * 使用 Visual Crossing API 获取天气信息
 * @param {string} cityId - 城市标识(如 "guilin CN")
 * @param {HTMLElement} container - 显示天气的容器
 * @param {boolean} [fallbackToAmap=false] - 在API Key无效或请求失败时是否回退到高德天气API
 * @param {string} [date] - 可选，指定日期（如 "2025-05-01"），如不指定则查询今天天气
 */
function getVisualCrossingWeather(cityId, container, fallbackToAmap = false, date) {
    try {
        // 获取配置
        const config = CONFIG.api.weather;
        const baseUrl = config.baseUrl || 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
        const apiKey = CONFIG.visualCrossingApiKey || config.key;
        
        // 检查API Key是否存在
        if (!apiKey) {
            console.warn('未设置Visual Crossing API密钥');
            if (fallbackToAmap) {
                console.log('回退使用高德天气API');
                const chineseCityName = extractChineseCityName(cityId);
                getAmapWeather(chineseCityName, container);
            } else {
                container.innerHTML = '<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">未设置API密钥</span></div>';
            }
            return;
        }
        
        const unitGroup = config.unitGroup || 'metric';
        const lang = config.lang || 'zh';
        const elements = config.elements || 'datetime,temp,tempmax,tempmin,conditions,description,icon';
        const include = 'days,current';

        // 直接使用传入的cityId作为位置参数
        const encodedCity = encodeURIComponent(cityId);
        
        // 使用传入的日期或默认为今天
        const dateParam = date || 'today';
        const apiUrl = `${baseUrl}${encodedCity}/${dateParam}?key=${apiKey}&unitGroup=${unitGroup}&lang=${lang}&include=${include}&elements=${elements}`;

        console.log('Visual Crossing 天气API请求:', apiUrl.replace(apiKey, '****'));
        
        // 发起API请求
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`天气API响应错误: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Visual Crossing返回天气数据:', data);
                // 显示天气信息
                displayVisualCrossingWeather(data, container);
            })
            .catch(error => {
                console.error('获取Visual Crossing天气数据失败:', error);
                
                if (fallbackToAmap) {
                    console.log('切换到高德天气API');
                    const chineseCityName = extractChineseCityName(cityId);
                    getAmapWeather(chineseCityName, container);
                } else {
                    container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">天气数据获取失败</span></div>`;
                }
            });
    } catch (error) {
        console.error('Visual Crossing天气API请求错误:', error);
        
        if (fallbackToAmap) {
            console.log('因错误切换到高德天气API');
            const chineseCityName = extractChineseCityName(cityId);
            getAmapWeather(chineseCityName, container);
        } else {
            container.innerHTML = `<div class="weather-info"><span class="weather-icon">❓</span><span class="weather-desc">天气请求错误</span></div>`;
        }
    }
}

/**
 * 显示 Visual Crossing 天气数据
 * @param {Object} data - Visual Crossing API 返回的天气数据
 * @param {HTMLElement} container - 显示天气的容器
 */
function displayVisualCrossingWeather(data, container) {
    try {
        // 检查是否有有效数据并输出日志
        console.log('开始处理天气数据:', data);
        
        if (!data) {
            console.warn('无法从Visual Crossing获取天气数据');
            container.innerHTML = '<span class="weather-icon">❓</span><span>无天气数据</span>';
            return;
        }
        
        // 优先使用当前条件（如果是今天的天气）
        if (data.currentConditions) {
            const current = data.currentConditions;
            const temp = current.temp || current.temperature;
            const conditions = current.conditions || '';
            const iconCode = current.icon || '';
            
            console.log('使用当前天气数据:', {
                temp, 
                conditions, 
                iconCode
            });
            
            // 获取图标
            const icon = getWeatherIconFromVisualCrossing(iconCode, conditions);
            console.log('获取到的天气图标:', icon);
            
            // 构建天气信息对象
            const weatherInfo = {
                icon,
                temperature: Math.round(temp),
                description: conditions || getSimpleWeatherState(iconCode)
            };
            
            // 显示天气信息
            displayWeatherInfo(weatherInfo, container);
            return;
        }
        
        // 如果没有当前条件（历史或未来日期），使用日天气数据
        if (data.days && data.days.length > 0) {
            const dayData = data.days[0];
            console.log('使用日期天气数据:', dayData);
            
            const temp = dayData.temp || Math.round((dayData.tempmax + dayData.tempmin) / 2);
            const conditions = dayData.conditions || '';
            const iconCode = dayData.icon || '';
            
            console.log('提取的天气信息:', {
                temp, 
                conditions, 
                iconCode
            });
            
            // 获取图标
            const icon = getWeatherIconFromVisualCrossing(iconCode, conditions);
            console.log('获取到的天气图标:', icon);
            
            // 构建天气信息对象
            const weatherInfo = {
                icon,
                temperature: Math.round(temp),
                description: conditions || getSimpleWeatherState(iconCode)
            };
            
            // 显示天气信息
            displayWeatherInfo(weatherInfo, container);
            return;
        }
        
        // 如果都没有找到有效数据，尝试从全局数据中提取
        console.warn('无法从结构化数据中获取天气信息，尝试备用提取方法');
        displayFallbackWeather(data, container);
    } catch (error) {
        console.error('处理Visual Crossing天气数据时出错:', error);
        container.innerHTML = '<span class="weather-icon">❓</span><span>天气数据解析错误</span>';
    }
}

/**
 * 显示天气信息
 * @param {Object} weatherData - 天气数据
 * @param {HTMLElement} container - 显示天气的容器
 */
function displayWeatherInfo(weatherData, container) {
    if (!weatherData || !container) {
        container.innerHTML = '<span class="weather-icon">❓</span><span>无天气数据</span>';
        return;
    }
    
    const { icon, temperature, description } = weatherData;
    container.innerHTML = `
        <span class="weather-icon">${icon}</span>
        <span>${temperature}° ${description}</span>
    `;
}

/**
 * 从高德天气API显示天气信息
 * @param {Object} weatherData - 高德天气API返回的数据
 * @param {HTMLElement} container - 显示天气的容器
 */
function displayWeatherFromAMap(weatherData, container) {
    if (!weatherData || !weatherData.weather) {
        container.innerHTML = '<span class="weather-icon">❓</span><span>无天气数据</span>';
        return;
    }
    
    // 获取简化的天气状态
    const weather = getSimpleWeatherState(weatherData.weather);
    
    // 获取对应的图标
    const icon = getWeatherIcon(weather);
    
    // 构建完整的天气信息
    const weatherInfo = {
        icon,
        temperature: weatherData.temperature || '--',
        description: weather,
    };
    
    // 显示天气信息
    displayWeatherInfo(weatherInfo, container);
}

/**
 * 将详细的天气状况转换为简单的天气状态（晴/雨/阴/雪）
 * @param {string} weather - 详细的天气状况
 * @returns {string} - 简化的天气状态
 */
function getSimpleWeatherState(weather) {
    if (!weather) return '晴';
    
    const weatherStr = typeof weather === 'string' ? weather.toLowerCase() : '';
    
    if (weatherStr.includes('雨')) return '雨';
    if (weatherStr.includes('雪')) return '雪';
    if (weatherStr.includes('阴') || weatherStr.includes('云') || weatherStr.includes('多云')) return '阴';
    if (weatherStr.includes('雾') || weatherStr.includes('霾')) return '雾';
    if (weatherStr.includes('晴')) return '晴';
    
    // 默认返回晴
    return '晴';
}

/**
 * 尝试从任意天气数据对象中提取并显示天气信息
 * @param {Object} data - 天气数据对象
 * @param {HTMLElement} container - 显示天气的容器
 */
function displayFallbackWeather(data, container) {
    try {
        // 递归查找可能包含天气和温度的属性
        function findWeatherProps(obj, path = '') {
            let weather = null;
            let temp = null;
            
            // 如果是对象，递归查找
            if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                // 检查当前对象的属性
                for (const key in obj) {
                    const value = obj[key];
                    const currentPath = path ? `${path}.${key}` : key;
                    
                    // 检查属性名是否包含天气关键词
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('weather') || lowerKey.includes('condition') || lowerKey === 'weather' || lowerKey === 'conditions') {
                        if (typeof value === 'string') {
                            weather = value;
                            console.log(`在路径 ${currentPath} 找到天气信息:`, weather);
                        }
                    }
                    
                    // 检查属性名是否包含温度关键词
                    if (lowerKey.includes('temp') || lowerKey === 'temp' || lowerKey === 'temperature') {
                        if (typeof value === 'string' || typeof value === 'number') {
                            temp = value;
                            console.log(`在路径 ${currentPath} 找到温度信息:`, temp);
                        }
                    }
                    
                    // 如果还没找到，继续递归搜索
                    if (!weather || !temp) {
                        const result = findWeatherProps(value, currentPath);
                        weather = weather || result.weather;
                        temp = temp || result.temp;
                    }
                    
                    // 如果都找到了，可以提前结束
                    if (weather && temp) break;
                }
            }
            
            return { weather, temp };
        }
        
        // 在对象中查找天气和温度信息
        const { weather, temp } = findWeatherProps(data);
        
        // 如果找到了天气或温度信息，显示它们
        if (weather || temp) {
            const icon = weather ? getWeatherIcon(weather) : '🌈';
            const simpleWeather = weather ? getSimpleWeatherState(weather) : '晴';
            
            container.innerHTML = `
                <span class="weather-icon">${icon}</span>
                ${temp ? `<span class="weather-temp">${temp}°</span>` : ''}
                <span class="weather-desc">${simpleWeather}</span>
            `;
        } else {
            // 最终的回退，显示一个默认的天气图标和文字
            container.innerHTML = `
                <span class="weather-icon">🌈</span>
                <span class="weather-desc">晴</span>
            `;
        }
    } catch (error) {
        console.error('备用天气显示失败:', error);
        container.innerHTML = `
            <span class="weather-icon">🌈</span>
            <span class="weather-desc">晴</span>
        `;
    }
}

/**
 * 根据天气状况返回相应的图标
 * @param {string} weather - 天气状况描述
 * @returns {string} - 表示天气的emoji图标
 */
function getWeatherIcon(weather) {
    if (!weather) return '🌈';
    
    const weatherStr = typeof weather === 'string' ? weather.toLowerCase() : '';
    
    // 根据天气状况返回相应的emoji
    if (weatherStr.includes('晴') && (weatherStr.includes('云') || weatherStr.includes('阴'))) return '⛅';
    if (weatherStr.includes('晴')) return '☀️';
    if (weatherStr.includes('多云')) return '🌤️';
    if (weatherStr.includes('阴')) return '☁️';
    if (weatherStr.includes('雷')) return '⛈️';
    if ((weatherStr.includes('雨') && weatherStr.includes('雪')) || weatherStr.includes('雨夹雪')) return '🌨️';
    if (weatherStr.includes('暴雨') || weatherStr.includes('大雨') || weatherStr.includes('暴雨')) return '🌧️';
    if (weatherStr.includes('雨')) return '🌦️';
    if (weatherStr.includes('雪')) return '❄️';
    if (weatherStr.includes('雾') || weatherStr.includes('霾') || weatherStr.includes('雾霾')) return '🌫️';
    if (weatherStr.includes('沙') || weatherStr.includes('尘') || weatherStr.includes('浮尘')) return '🌪️';
    if (weatherStr.includes('风') || weatherStr.includes('大风')) return '💨';
    if (weatherStr.includes('阵雨')) return '🌦️';
    if (weatherStr.includes('小雨')) return '🌦️';
    if (weatherStr.includes('中雨')) return '🌧️';
    
    // 默认返回彩虹图标
    return '🌈';
}

/**
 * 创建景点元素
 * @param {Object} spot - 景点数据
 * @param {number} index - 景点索引
 * @returns {HTMLElement} 景点元素
 */
function createSpotElement(spot, index) {
    // 创建卡片容器
    const spotElement = document.createElement('div');
    spotElement.className = 'itinerary-card';
    spotElement.dataset.id = spot.id;
    
    // 创建卡片内容
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    // 添加序号
    const indexElement = document.createElement('div');
    indexElement.className = 'spot-number';
    indexElement.textContent = index + 1;
    cardContent.appendChild(indexElement);
    
    // 创建内容容器
    const contentContainer = document.createElement('div');
    contentContainer.className = 'spot-content';
    
    // 添加时间
    const timeElement = document.createElement('div');
    timeElement.className = 'spot-time';
    timeElement.textContent = spot.time;
    contentContainer.appendChild(timeElement);
    
    // 添加名称
    const nameElement = document.createElement('div');
    nameElement.className = 'spot-title';
    nameElement.textContent = spot.name;
    contentContainer.appendChild(nameElement);
    
    // 添加描述
    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'spot-desc';
    descriptionElement.textContent = spot.description;
    contentContainer.appendChild(descriptionElement);
    
    // 添加交通方式
    if (spot.transport) {
        const transportElement = document.createElement('div');
        transportElement.className = 'spot-meta';
        
        // 添加交通方式图标
        let transportIcon = '';
        if (spot.transport === '自驾') {
            transportIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.6-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2"></path>
                    <circle cx="7" cy="17" r="2"></circle>
                    <path d="M9 17h6"></path>
                    <circle cx="17" cy="17" r="2"></circle>
                </svg>
            `;
        } else if (spot.transport === '步行') {
            transportIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13 4v16"></path>
                    <path d="M17 4v16"></path>
                    <path d="M21 4v16"></path>
                    <path d="M9 4v16"></path>
                    <path d="M5 4v16"></path>
                    <path d="M1 4v16"></path>
                </svg>
            `;
        } else {
            transportIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="1" y="3" width="15" height="13"></rect>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
            `;
        }
        
        transportElement.innerHTML = transportIcon;
        transportElement.innerHTML += `<span>${spot.transport}</span>`;
        contentContainer.appendChild(transportElement);
    }
    
    // 添加费用
    if (spot.cost) {
        const costElement = document.createElement('div');
        costElement.className = 'spot-meta';
        costElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="6" x2="12" y2="12"></line>
                <path d="M8 12h8"></path>
            </svg>
            <span>${spot.cost}</span>
        `;
        contentContainer.appendChild(costElement);
    }
    
    // 添加提示
    if (spot.links && spot.links.length > 0) {
        const tipLinks = spot.links.filter(link => link.type === 'tip');
        
        if (tipLinks.length > 0) {
            const tipElement = document.createElement('div');
            tipElement.className = 'spot-meta';
            tipElement.style.color = '#d97706';
            tipElement.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>${tipLinks[0].title}</span>
            `;
            contentContainer.appendChild(tipElement);
        }
        
        // 添加视频链接
        const videoLinks = spot.links.filter(link => link.type === 'video' && link.url);
        if (videoLinks.length > 0) {
            const videoElement = document.createElement('div');
            videoElement.className = 'spot-meta';
            videoElement.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <a href="${videoLinks[0].url}" target="_blank" style="color: #1e70eb; text-decoration: none;">${videoLinks[0].title}</a>
            `;
            contentContainer.appendChild(videoElement);
        }
    }
    
    // 将内容容器添加到卡片
    cardContent.appendChild(contentContainer);
    spotElement.appendChild(cardContent);
    
    // 景点点击事件
    spotElement.addEventListener('click', function() {
        // 高亮选中的景点卡片
        document.querySelectorAll('.itinerary-card').forEach(item => {
            item.style.backgroundColor = 'white';
        });
        this.style.backgroundColor = '#f0f7ff';
        
        // 定位到对应的标记点
        const spotId = this.dataset.id;
        focusOnSpot(spotId);
        
        // 如果在手机端，切换到地图视图
        if (window.innerWidth <= 768) {
            const mapView = document.getElementById('map-view');
            const itineraryView = document.getElementById('itinerary-view');
            if (mapView && itineraryView) {
                // 更新视图切换按钮状态
                document.querySelectorAll('.toggle-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-view') === 'map');
                });
                
                // 切换视图
                itineraryView.style.transform = 'translateX(-100%)';
                mapView.style.transform = 'translateX(0)';
                
                // 确保地图正确调整大小
                if (window.map) {
                    window.map.resize();
                }
            }
        }
    });
    
    return spotElement;
}

/**
 * 更新地图标记点
 * @param {Array} spots - 景点数据数组
 */
function updateMapMarkers(spots) {
    // 清除所有已有的标记点和路径
    clearMapOverlays();
    
    // 如果没有景点数据，则返回
    if (!spots || spots.length === 0) return;
    
    console.log('正在更新地图标记，景点数量:', spots.length);
    
    // 创建加载指示器
    const loadingElement = document.createElement('div');
    loadingElement.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:white;padding:10px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.1);z-index:999;';
    loadingElement.innerHTML = '正在加载地图标记...';
    map.getContainer().appendChild(loadingElement);
    
    // 收集所有坐标点
    const pointsArray = [];
    markers = [];
    
    // 使用Promise处理异步标记创建
    const markerPromises = spots.map((spot, index) => {
        return new Promise((resolve) => {
            try {
                // 检查是否有POI ID且配置允许使用POI查询
                if (spot.poiId && CONFIG.api.usePOIQuery) {
                    // 检查缓存中是否已有该POI信息且配置允许使用缓存
                    if (CONFIG.api.useCache && poiCache[spot.poiId]) {
                        // 使用缓存的POI信息
                        const poiInfo = poiCache[spot.poiId];
                        // 从缓存的POI获取位置
                        let position;
                        if (typeof poiInfo.location === 'string') {
                            // 如果是字符串格式 "lng,lat"
                            const [lng, lat] = poiInfo.location.split(',').map(Number);
                            position = [lng, lat];
                        } else if (poiInfo.location.lng && poiInfo.location.lat) {
                            // 如果是旧的对象格式 {lng, lat}
                            position = [poiInfo.location.lng, poiInfo.location.lat];
                        }
                        
                        // 创建标记
                        const marker = createMarker(spot, index, position);
                        markers.push(marker);
                        pointsArray.push(position);
                        
                        console.log(`使用缓存的POI信息: ${spot.name}，坐标: [${position}]`);
                        resolve();
                    } else if (CONFIG.api.usePOIQuery) {
                        // 缓存中没有或不使用缓存，使用POI ID定位
                        const placeSearch = new AMap.PlaceSearch({
                            pageSize: 1,
                            pageIndex: 1
                        });
                        
                        placeSearch.getDetails(spot.poiId, (status, result) => {
                            if (status === 'complete' && result.info === 'OK' && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                                // 获取POI详情
                                const poi = result.poiList.pois[0];
                                
                                // 将坐标转换为字符串格式并存入缓存
                                if (CONFIG.api.useCache) {
                                    // 确保缓存的POI的location也是字符串格式
                                    const cachedPoi = {...poi};
                                    if (typeof cachedPoi.location !== 'string' && cachedPoi.location.lng && cachedPoi.location.lat) {
                                        cachedPoi.location = `${cachedPoi.location.lng},${cachedPoi.location.lat}`;
                                    }
                                    poiCache[spot.poiId] = cachedPoi;
                                    savePOICacheToStorage();
                                }
                                
                                // 更新坐标（只在内存中，不修改原数据）
                                const position = [poi.location.lng, poi.location.lat];
                                
                                // 创建标记
                                const marker = createMarker(spot, index, position);
                                markers.push(marker);
                                pointsArray.push(position);
                                
                                console.log(`通过POI ID定位成功: ${spot.name}，坐标: [${position}]`);
                                resolve();
                            } else {
                                console.warn(`通过POI ID定位失败: ${spot.name}，回退到坐标定位`);
                                // 回退到坐标定位
                                useCoordinatesPositioning(spot, index, pointsArray, resolve);
                            }
                        });
                    } else {
                        // 配置不允许使用POI查询，直接使用坐标定位
                        useCoordinatesPositioning(spot, index, pointsArray, resolve);
                    }
                } else {
                    // 没有POI ID或配置不允许使用POI查询，使用坐标定位
                    useCoordinatesPositioning(spot, index, pointsArray, resolve);
                }
            } catch (error) {
                console.error(`创建标记'${spot.name}'失败:`, error);
                // 出错时尝试使用坐标定位
                try {
                    useCoordinatesPositioning(spot, index, pointsArray, resolve);
                } catch (e) {
                    console.error('使用坐标定位也失败:', e);
                    resolve(); // 即使失败也解析Promise以继续执行
                }
            }
        });
    });
    
    // 所有标记创建完成后
    Promise.all(markerPromises).then(() => {
        // 移除加载指示器
        if (loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
        
        // 从标记中获取最准确的坐标用于路径规划
        const updatedPointsArray = getAccurateCoordinatesFromMarkers(markers);
        
        // 完成标记加载处理
        finishMarkersLoading(updatedPointsArray);
    });
}

/**
 * 使用坐标定位辅助函数
 * @param {Object} spot - 景点数据
 * @param {number} index - 景点索引
 * @param {Array} pointsArray - 坐标点数组
 * @param {Function} resolve - Promise解析函数
 */
function useCoordinatesPositioning(spot, index, pointsArray, resolve) {
    // 从location字符串获取经纬度
    let position;
    if (spot.location) {
        // 新的格式：location是字符串
        const [lng, lat] = spot.location.split(',').map(Number);
        position = [lng, lat];
    } else if (spot.coordinates && spot.coordinates.lng && spot.coordinates.lat) {
        // 兼容旧格式
        position = [spot.coordinates.lng, spot.coordinates.lat];
    } else {
        console.error(`景点${spot.name}没有有效的坐标信息`);
        position = [0, 0]; // 默认值，避免程序崩溃
    }
    
    pointsArray.push(position);
    
    // 创建标记
    const marker = createMarker(spot, index, position);
    markers.push(marker);
    console.log(`使用坐标定位: ${spot.name}，坐标: [${position}]`);
    resolve();
}

/**
 * 从标记中获取最准确的坐标
 * @param {Array} markersList - 标记列表
 * @returns {Array} 准确的坐标点数组
 */
function getAccurateCoordinatesFromMarkers(markersList) {
    const accuratePoints = [];
    
    markersList.forEach(marker => {
        const position = marker.getPosition();
        accuratePoints.push([position.lng, position.lat]);
    });
    
    console.log('从标记中获取的准确坐标点:', accuratePoints);
    return accuratePoints;
}

/**
 * 完成标记加载后的处理
 * @param {Array} pointsArray - 坐标点数组
 */
function finishMarkersLoading(pointsArray) {
    if (pointsArray.length === 0) return;
    
    try {
        // 显示已收集到的坐标点（调试用）
        console.log('路径规划使用的坐标点:', pointsArray);
        
        // 创建路径
        createPath(pointsArray);
        
        // 调整地图视野，确保所有标记点可见
        map.setFitView(markers);
        
        // 如果只有一个点，适当缩放
        if (pointsArray.length === 1) {
            map.setZoom(14);
        } else {
            // 获取当前缩放级别，并适当调整
            const currentZoom = map.getZoom();
            if (currentZoom > 14) {
                map.setZoom(Math.min(currentZoom, 14));
            }
        }
    } catch (error) {
        console.error('完成标记加载处理时发生错误:', error);
    }
    
    console.log('地图标记加载完成，共创建标记:', markers.length);
}

/**
 * 创建连接景点的路径
 * @param {Array} points - 坐标点数组（仅包含当天行程的坐标点）
 */
function createPath(points) {
    // 如果点数量小于2，则无法创建路径
    if (points.length < 2) return;
    
    try {
        console.log('创建当天行程路径，点数量:', points.length);
        
        // 获取当天的景点数据，用于确定交通方式
        const currentDaySpots = tripData.dailySchedule[activeDay - 1].spots;
        
        // 检查是否移动设备，以调整路径样式
        const isMobile = window.innerWidth <= 768;
        
        // 清除之前的路径
        if (activePath) {
            activePath.forEach(path => {
                path.setMap(null);
            });
        }
        activePath = [];
        
        // 创建加载指示器
        const loadingElement = document.createElement('div');
        loadingElement.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);background:white;padding:10px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,0.1);z-index:999;';
        loadingElement.innerHTML = '正在规划路线...';
        map.getContainer().appendChild(loadingElement);
        
        // 计算实际需要创建的路径段数量（从第1个点到第2个点开始）
        const totalSegments = points.length - 1;
        let completedSegments = 0;
        
        if (totalSegments === 0) {
            // 如果只有一个点，则没有路径可创建
            if (loadingElement.parentNode) {
                loadingElement.parentNode.removeChild(loadingElement);
            }
            return;
        }
        
        // 创建路径绘制函数
        const drawRouteBetweenPoints = (startIdx) => {
            if (startIdx >= points.length - 1) {
                // 所有路径段都已处理
                if (loadingElement.parentNode) {
                    loadingElement.parentNode.removeChild(loadingElement);
                }
                return;
            }
            
            // 获取起点和终点
            const start = points[startIdx];
            const end = points[startIdx + 1];
            
            // 获取目标地点的交通方式（目标地点的交通方式表示如何到达该地点）
            const targetSpotIndex = startIdx + 1;
            const transportMode = currentDaySpots[targetSpotIndex].transport || '自驾';
            
            console.log(`规划从${currentDaySpots[startIdx].name}到${currentDaySpots[targetSpotIndex].name}的路线，交通方式: ${transportMode}`);
            
            // 根据交通方式选择不同的路径规划方式和颜色
            let routePlanner;
            let pathColor = CONFIG.ui.lineColor; // 默认颜色
            
            try {
                if (transportMode === '步行') {
                    // 步行路径规划
                    pathColor = '#4CAF50'; // 绿色表示步行
                    routePlanner = new AMap.Walking({
                        hideMarkers: true
                    });
                    console.log(`使用步行规划，设置颜色: ${pathColor}`);
                } else if (transportMode === '骑行') {
                    // 骑行路径规划
                    pathColor = '#FF9800'; // 橙色表示骑行
                    routePlanner = new AMap.Riding({
                        hideMarkers: true
                    });
                    console.log(`使用骑行规划，设置颜色: ${pathColor}`);
                } else {
                    // 默认使用驾车路径规划（自驾或其他方式）
                    pathColor = CONFIG.ui.lineColor; // 默认蓝色
                    routePlanner = new AMap.Driving({
                        hideMarkers: true,
                        policy: AMap.DrivingPolicy.LEAST_TIME // 使用最短时间策略
                    });
                    console.log(`使用驾车规划，设置颜色: ${pathColor}`);
                }
                
                // 移除之前的map参数，避免自动在地图上绘制路径
                routePlanner.search(
                    new AMap.LngLat(start[0], start[1]), // 起点
                    new AMap.LngLat(end[0], end[1]),     // 终点
                    (status, result) => {
                        completedSegments++;
                        
                        if (status === 'complete' && result.routes && result.routes.length) {
                            // 获取路径数据
                            const route = result.routes[0];
                            const pathData = parseRouteToPath(route);
                            
                            console.log(`路径段 ${startIdx} 到 ${startIdx+1} 规划成功，路径点数: ${pathData.length}，使用颜色: ${pathColor}`);
                            
                            // 创建折线路径
                            const polyline = new AMap.Polyline({
                                path: pathData,
                                isOutline: true,
                                outlineColor: '#ffffff',
                                borderWeight: 2,
                                strokeColor: pathColor,
                                strokeWeight: isMobile ? CONFIG.ui.lineWidth - 1 : CONFIG.ui.lineWidth,
                                strokeOpacity: CONFIG.ui.lineOpacity,
                                strokeStyle: 'solid',
                                lineJoin: 'round',
                                lineCap: 'round',
                                zIndex: 50,
                                showDir: true
                            });
                            
                            // 强制覆盖颜色和样式
                            polyline.setOptions({
                                strokeColor: pathColor,
                                strokeWeight: isMobile ? CONFIG.ui.lineWidth - 1 : CONFIG.ui.lineWidth,
                                strokeOpacity: CONFIG.ui.lineOpacity
                            });
                            
                            // 添加到地图
                            polyline.setMap(map);
                            
                            // 保存路径引用
                            activePath.push(polyline);
                            
                            // 获取起点和终点路段的方向
                            if (pathData.length > 1) {
                                const startDir = calculateDirection(pathData[0], pathData[1]);
                                const endDir = calculateDirection(pathData[pathData.length - 2], pathData[pathData.length - 1]);
                                
                                // TODO: 可以根据方向添加箭头标记
                            }
                        } else {
                            console.warn(`路径段 ${startIdx} 到 ${startIdx + 1} 规划失败:`, status, result);
                            
                            // 备用方案：使用直线连接，但保持原来的颜色
                            const fallbackLine = new AMap.Polyline({
                                path: [start, end],
                                strokeColor: pathColor, // 使用与交通方式对应的颜色
                                strokeWeight: isMobile ? CONFIG.ui.lineWidth - 1 : CONFIG.ui.lineWidth,
                                strokeOpacity: 0.7,
                                strokeStyle: 'dashed',
                                lineJoin: 'round',
                                lineCap: 'round',
                                zIndex: 49
                            });
                            
                            fallbackLine.setMap(map);
                            activePath.push(fallbackLine);
                        }
                        
                        // 更新加载提示
                        loadingElement.innerHTML = `正在规划路线... (${completedSegments}/${totalSegments})`;
                        
                        // 处理下一对点
                        drawRouteBetweenPoints(startIdx + 1);
                    }
                );
            } catch (plannerError) {
                console.error(`创建路径规划器失败 (${transportMode}):`, plannerError);
                
                // 使用直线连接作为备用方案，保持原来的颜色
                const fallbackLine = new AMap.Polyline({
                    path: [start, end],
                    strokeColor: pathColor, // 使用与交通方式对应的颜色
                    strokeWeight: isMobile ? CONFIG.ui.lineWidth - 1 : CONFIG.ui.lineWidth,
                    strokeOpacity: 0.7,
                    strokeStyle: 'dashed',
                    lineJoin: 'round',
                    lineCap: 'round',
                    zIndex: 49
                });
                
                fallbackLine.setMap(map);
                activePath.push(fallbackLine);
                
                // 更新计数并处理下一段
                completedSegments++;
                loadingElement.innerHTML = `正在规划路线... (${completedSegments}/${totalSegments})`;
                setTimeout(() => drawRouteBetweenPoints(startIdx + 1), 100);
            }
        };
        
        // 解析路径数据
        const parseRouteToPath = (route) => {
            const path = [];
            
            if (route.steps) {
                route.steps.forEach(step => {
                    if (step.path) {
                        step.path.forEach(point => {
                            path.push([point.lng, point.lat]);
                        });
                    }
                });
            }
            
            return path;
        };
        
        // 计算两点之间的方向
        const calculateDirection = (point1, point2) => {
            return Math.atan2(point2[1] - point1[1], point2[0] - point1[0]) * 180 / Math.PI;
        };
        
        // 开始绘制第一个路径段
        drawRouteBetweenPoints(0);
        
    } catch (error) {
        console.error('创建路径失败:', error);
        
        // 出错时使用简单路径作为备用，但仍尝试区分不同交通方式的颜色
        try {
            // 为不同的交通方式创建不同颜色的路径
            const pathSegments = [];
            
            // 遍历每个点，创建相应颜色的路径
            for (let i = 0; i < points.length - 1; i++) {
                const transportMode = currentDaySpots[i + 1].transport || '自驾';
                let pathColor = CONFIG.ui.lineColor; // 默认蓝色
                
                if (transportMode === '步行') {
                    pathColor = '#4CAF50'; // 绿色表示步行
                } else if (transportMode === '骑行') {
                    pathColor = '#FF9800'; // 橙色表示骑行
                }
                
                // 创建这一段的路径
                const segment = new AMap.Polyline({
                    path: [points[i], points[i + 1]],
                    strokeColor: pathColor,
                    strokeWeight: CONFIG.ui.lineWidth,
                    strokeOpacity: CONFIG.ui.lineOpacity,
                    lineJoin: 'round',
                    lineCap: 'round',
                    zIndex: 50,
                    showDir: true
                });
                
                segment.setMap(map);
                pathSegments.push(segment);
            }
            
            activePath = pathSegments;
            console.log('使用备用方式创建了多段彩色路径');
        } catch (fallbackError) {
            console.error('创建备用路径也失败:', fallbackError);
        }
    }
}

/**
 * 清除地图上的覆盖物
 */
function clearMapOverlays() {
    // 清除标记点
    if (markers && markers.length > 0) {
        markers.forEach(marker => {
            marker.setMap(null);
        });
        markers = [];
    }
    
    // 清除路径
    if (activePath && activePath.length > 0) {
        activePath.forEach(path => {
            if (path) path.setMap(null);
        });
        activePath = [];
    } else if (activePath && !Array.isArray(activePath)) {
        // 兼容旧版路径对象
        activePath.setMap(null);
        activePath = [];
    }
    
    console.log('地图上的标记和路径已清除，准备显示新的日程');
}

/**
 * 根据景点信息获取对应的图标
 * @param {Object} spot - 景点数据
 * @param {number} index - 景点索引
 * @param {number} totalSpots - 总景点数
 * @returns {string} - 图标URL
 */
function getIconByCategory(spot, index, totalSpots) {
    // 第一个点作为出发点
    if (index === 0) {
        return CONFIG.icons.start;
    }
    
    // 最后一个点作为终点
    if (index === totalSpots - 1) {
        return CONFIG.icons.end;
    }
    
    // 根据名称判断类型
    const name = spot.name || '';
    
    if (name.includes('酒店') || name.includes('民宿') || name.includes('宾馆')) {
        return CONFIG.icons.hotel; // 住宿点
    } 
    
    if (name.includes('餐厅') || name.includes('美食') || name.includes('小吃') || 
        name.includes('午餐') || name.includes('晚餐')) {
        return CONFIG.icons.food; // 餐饮点
    } 
    
    if (name.includes('车站') || name.includes('码头') || name.includes('机场')) {
        return CONFIG.icons.transport; // 交通点
    }
    
    // 默认作为景点
    return CONFIG.icons.scenery;
}

/**
 * 显示信息窗口
 * @param {Object} marker - 标记点对象
 * @param {Object} spot - 景点数据
 */
function showInfoWindow(marker, spot) {
    try {
        // 创建信息窗口的内容
        const content = createInfoWindowContent(spot);
        
        // 创建信息窗口实例
        const infoWindow = new AMap.InfoWindow({
            content: content,
            anchor: 'bottom-center',
            offset: new AMap.Pixel(0, -10),
            closeWhenClickMap: true
        });
        
        // 在标记点上打开信息窗口
        if (marker && typeof marker.getPosition === 'function') {
            infoWindow.open(map, marker.getPosition());
        } else {
            // 如果无法获取标记位置，则在当前地图中心打开
            console.warn('无法获取标记位置，在地图中心打开信息窗口');
            infoWindow.open(map, map.getCenter());
        }
    } catch (error) {
        console.error('显示信息窗口时出错:', error);
        try {
            // 备用方式：在地图中心创建一个信息窗口
            const backupInfoWindow = new AMap.InfoWindow({
                content: `
                    <div class="info-window">
                        <div class="info-title">${spot.name}</div>
                        <div class="info-body">
                            <div class="info-desc">${spot.description}</div>
                        </div>
                    </div>
                `,
                anchor: 'bottom-center',
                closeWhenClickMap: true
            });
            backupInfoWindow.open(map, map.getCenter());
        } catch (e) {
            console.error('备用信息窗口也创建失败:', e);
        }
    }
}

/**
 * 聚焦到指定景点
 * @param {string} spotId - 景点ID
 */
function focusOnSpot(spotId) {
    // 找到当前激活天数的数据
    const dayData = tripData.dailySchedule.find(day => day.day === activeDay);
    if (!dayData) return;
    
    // 找到指定ID的景点
    const spot = dayData.spots.find(spot => spot.id === spotId);
    if (!spot) return;
    
    // 检查是否是移动设备且当前是行程视图
    const isMobile = window.innerWidth <= 768;
    const tripContainer = document.querySelector('.trip-container');
    if (isMobile && tripContainer && tripContainer.classList.contains('itinerary-view')) {
        // 自动切换到地图视图
        tripContainer.classList.remove('itinerary-view');
        tripContainer.classList.add('map-view');
        
        // 更新按钮状态
        const mapBtn = document.querySelector('.map-btn');
        const itineraryBtn = document.querySelector('.itinerary-btn');
        if (mapBtn && itineraryBtn) {
            mapBtn.classList.add('active');
            itineraryBtn.classList.remove('active');
        }
        
        // 延迟执行地图操作，确保地图容器已显示
        setTimeout(function() {
            focusMapOnSpot(spot, spotId);
        }, 300);
    } else {
        // 直接聚焦
        focusMapOnSpot(spot, spotId);
    }
}

/**
 * 在地图上聚焦指定景点
 * @param {Object} spot - 景点数据
 * @param {string} spotId - 景点ID
 */
function focusMapOnSpot(spot, spotId) {
    // 确保地图已初始化
    if (!map) return;
    
    // 如果有POI ID且配置允许使用POI查询，优先使用缓存或通过POI ID获取更精确的位置
    if (spot.poiId && CONFIG.api.usePOIQuery) {
        // 检查缓存中是否有该POI信息且配置允许使用缓存
        if (CONFIG.api.useCache && poiCache[spot.poiId]) {
            // 使用缓存的位置信息
            const poiInfo = poiCache[spot.poiId];
            
            // 调整地图中心
            map.setCenter([poiInfo.location.lng, poiInfo.location.lat]);
            
            // 继续处理标记和信息窗口
            processFocusOnMarker(spot, spotId);
            
            console.log(`使用缓存的POI信息进行聚焦: ${spot.name}`);
        } else if (CONFIG.api.usePOIQuery) {
            // 缓存中没有或不使用缓存，通过API查询
            const placeSearch = new AMap.PlaceSearch({
                pageSize: 1,
                pageIndex: 1
            });
            
            placeSearch.getDetails(spot.poiId, (status, result) => {
                if (status === 'complete' && result.info === 'OK' && result.poiList && result.poiList.pois && result.poiList.pois.length > 0) {
                    // 获取POI详情
                    const poi = result.poiList.pois[0];
                    
                    // 存入缓存（如果配置允许使用缓存）
                    if (CONFIG.api.useCache) {
                        poiCache[spot.poiId] = poi;
                        savePOICacheToStorage();
                    }
                    
                    // 调整地图中心
                    map.setCenter([poi.location.lng, poi.location.lat]);
                    
                    // 继续处理标记和信息窗口
                    processFocusOnMarker(spot, spotId);
                } else {
                    console.warn(`通过POI ID定位失败: ${spot.name}，回退到坐标定位`);
                    // 回退到坐标定位
                    focusUsingCoordinates(spot, spotId);
                }
            });
        } else {
            // 配置不允许使用POI查询，直接使用坐标定位
            focusUsingCoordinates(spot, spotId);
        }
    } else {
        // 没有POI ID或配置不允许使用POI查询，使用坐标定位
        focusUsingCoordinates(spot, spotId);
    }
}

/**
 * 使用坐标定位聚焦辅助函数
 * @param {Object} spot - 景点数据
 * @param {string} spotId - 景点ID
 */
function focusUsingCoordinates(spot, spotId) {
    try {
        // 设置地图中心
        map.setCenter([spot.coordinates.lng, spot.coordinates.lat]);
        
        // 继续处理标记和信息窗口
        processFocusOnMarker(spot, spotId);
        
        console.log(`使用坐标定位聚焦: ${spot.name}`);
    } catch (error) {
        console.error('使用坐标定位聚焦时出错:', error);
        
        // 出错时尝试直接显示信息窗口
        try {
            const content = createInfoWindowContent(spot);
            const infoWindow = new AMap.InfoWindow({
                content: content,
                anchor: 'bottom-center',
                closeWhenClickMap: true
            });
            infoWindow.open(map, map.getCenter());
        } catch (e) {
            console.error('显示备用信息窗口失败:', e);
        }
    }
}

/**
 * 处理聚焦标记和信息窗口的辅助函数
 * @param {Object} spot - 景点数据
 * @param {string} spotId - 景点ID
 */
function processFocusOnMarker(spot, spotId) {
    // 根据设备类型设置缩放级别
    const isMobile = window.innerWidth <= 768;
    map.setZoom(isMobile ? 14 : 15);
    
    // 移除所有活跃标记的状态
    document.querySelectorAll('.marker-content').forEach(el => {
        el.classList.remove('active');
    });
    
    // 添加活跃状态到当前标记
    const markerElement = document.querySelector(`.marker-content[data-spot-id="${spotId}"]`);
    if (markerElement) {
        markerElement.classList.add('active');
    }
    
    // 查找对应的标记点 - 使用多种方式尝试
    let marker = null;
    
    // 方法1: 通过spotId属性查找
    for (let i = 0; i < markers.length; i++) {
        try {
            // 安全检查get方法是否存在
            if (typeof markers[i].get === 'function' && markers[i].get('spotId') === spotId) {
                marker = markers[i];
                break;
            } else if (markers[i].spotId === spotId) {
                // 直接尝试访问属性
                marker = markers[i];
                break;
            }
        } catch (error) {
            console.warn('标记查找时出错:', error);
            // 出错时继续尝试下一个标记
            continue;
        }
    }
    
    // 方法2: 通过扩展数据查找
    if (!marker) {
        for (let i = 0; i < markers.length; i++) {
            try {
                // 安全检查getExtData方法是否存在
                if (typeof markers[i].getExtData === 'function') {
                    const extData = markers[i].getExtData();
                    if (extData && (extData.spotId === spotId || (extData.spot && extData.spot.id === spotId))) {
                        marker = markers[i];
                        break;
                    }
                }
            } catch (error) {
                console.warn('通过扩展数据查找标记时出错:', error);
                continue;
            }
        }
    }
    
    // 方法3: 如果前两种方法都失败，根据坐标查找最近的标记
    if (!marker && markers.length > 0) {
        console.log('通过属性无法找到标记，尝试通过坐标查找');
        // 找到坐标最接近的标记
        let minDistance = Infinity;
        let closestMarker = null;
        
        // 确定目标位置 - 如果存在更新后的位置则使用
        const targetPos = [spot.coordinates.lng, spot.coordinates.lat];
        
        for (let i = 0; i < markers.length; i++) {
            try {
                // 安全检查getPosition方法是否存在
                if (typeof markers[i].getPosition === 'function') {
                    const markerPos = markers[i].getPosition();
                    // 计算简单的欧几里得距离
                    const dx = markerPos.lng - targetPos[0];
                    const dy = markerPos.lat - targetPos[1];
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestMarker = markers[i];
                    }
                }
            } catch (error) {
                console.warn('通过坐标查找标记时出错:', error);
                continue;
            }
        }
        
        if (closestMarker) {
            marker = closestMarker;
        }
    }
    
    // 如果找到了标记，打开信息窗口
    if (marker) {
        showInfoWindow(marker, spot);
    } else {
        console.error('无法找到对应的标记点:', spotId);
    }
    
    // 调整地图大小（适应容器变化）
    setTimeout(function() {
        if (map) {
            map.resize();
        }
    }, 100);
}

/**
 * 高亮显示列表中的景点
 * @param {string} spotId - 景点ID
 */
function highlightSpotInList(spotId) {
    // 移除所有高亮
    document.querySelectorAll('.itinerary-card').forEach(item => {
        item.style.backgroundColor = 'white';
    });
    
    // 添加高亮到指定景点
    const spotElement = document.querySelector(`.itinerary-card[data-id="${spotId}"]`);
    if (spotElement) {
        spotElement.style.backgroundColor = '#f0f7ff';
        
        // 滚动到可视区域
        spotElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    try {
        console.log('绑定事件处理程序...');
        
        // 窗口大小变化时调整地图大小
        window.addEventListener('resize', function() {
            if (map) {
                map.resize();
            }
        });
        
        // 页面关闭或刷新前保存POI缓存
        window.addEventListener('beforeunload', function() {
            savePOICacheToStorage();
        });
        
        // 获取DOM元素
        const dayTabs = document.getElementById('dayTabs');
        const spotsContainer = document.getElementById('spotsContainer');
        
        // 切换日期事件
        if (dayTabs) {
            dayTabs.addEventListener('click', function(e) {
                // 查找当前点击的是否是日期标签
                const target = e.target.closest('.day-tab');
                if (target) {
                    const day = parseInt(target.dataset.day);
                    if (!isNaN(day) && day > 0 && day <= tripData.dailySchedule.length) {
                        // 移除所有标签的激活状态
                        const tabs = dayTabs.querySelectorAll('.day-tab');
                        tabs.forEach(tab => tab.classList.remove('active'));
                        
                        // 为当前点击的标签添加激活状态
                        target.classList.add('active');
                        
                        // 渲染对应日期的内容
                        renderDayContent(day);
                        
                        // 更新当前激活的天数
                        activeDay = day;
                        
                        // 检查是否需要滚动到顶部
                        const itineraryPanel = document.querySelector('.itinerary-panel');
                        if (itineraryPanel) {
                            itineraryPanel.scrollTop = 0;
                        }
                    }
                }
            });
        }
        
        // 点击景点事件
        if (spotsContainer) {
            spotsContainer.addEventListener('click', function(e) {
                // 查找当前点击的是否是景点项目
                const target = e.target.closest('.spot-item');
                if (target) {
                    const spotId = target.dataset.spotId;
                    if (spotId) {
                        focusOnSpot(spotId);
                    }
                }
            });
        }
        
        // 添加视图切换按钮事件
        const viewToggleButton = document.getElementById('viewToggleButton');
        if (viewToggleButton) {
            // 保存当前视图状态（默认为非全屏地图模式）
            let isMapFullscreenMode = false;
            
            // 添加点击事件处理程序
            viewToggleButton.addEventListener('click', function() {
                // 获取主容器元素
                const tripContainer = document.querySelector('.trip-container');
                
                if (tripContainer) {
                    // 切换全屏地图模式
                    isMapFullscreenMode = !isMapFullscreenMode;
                    
                    if (isMapFullscreenMode) {
                        // 切换到全屏地图模式
                        tripContainer.classList.add('map-fullscreen-mode');
                        viewToggleButton.setAttribute('title', '显示行程');
                    } else {
                        // 切换回常规视图模式
                        tripContainer.classList.remove('map-fullscreen-mode');
                        viewToggleButton.setAttribute('title', '全屏地图');
                    }
                    
                    // 强制刷新地图大小以适应新的容器大小
                    if (map) {
                        setTimeout(() => {
                            map.resize();
                        }, 300);
                    }
                    
                    // 修改图标显示
                    const toggleIcon = viewToggleButton.querySelector('.view-toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.textContent = isMapFullscreenMode ? '📋' : '🔄';
                    }
                }
            });
            
            // 设置初始提示文本
            viewToggleButton.setAttribute('title', '全屏地图');
        }
        
        // 设置按钮和面板
        const settingsButton = document.getElementById('settingsButton');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsClose = document.getElementById('settings-close');
        
        if (settingsPanel && settingsClose) {
            // 如果有独立的设置按钮
            if (settingsButton) {
                settingsButton.addEventListener('click', function() {
                    settingsPanel.classList.add('active');
                });
            }
            
            // 关闭设置面板
            settingsClose.addEventListener('click', function() {
                settingsPanel.classList.remove('active');
            });
            
            // 点击外部区域关闭设置面板
            document.addEventListener('click', function(event) {
                if (settingsPanel.classList.contains('active') && 
                    !settingsPanel.contains(event.target) && 
                    event.target !== settingsButton) {
                    settingsPanel.classList.remove('active');
                }
            });
        }
        
        // 设置面板中的事件绑定
        initWeatherSettingsEvents();
        
        console.log('事件处理程序绑定完成');
    } catch (error) {
        console.error('绑定事件错误:', error);
    }
}

/**
 * 搜索景点函数
 */
function searchSpots(term) {
    try {
        let found = false;
        const lowercaseTerm = term.toLowerCase();
        
        // 遍历所有日期的景点
        tripData.dailySchedule.forEach((day, dayIndex) => {
            const dayNumber = dayIndex + 1;
            day.spots.forEach(spot => {
                if (
                    spot.name.toLowerCase().includes(lowercaseTerm) || 
                    (spot.description && spot.description.toLowerCase().includes(lowercaseTerm))
                ) {
                    // 切换到对应日期
                    const dayTab = document.querySelector(`.day-tab[data-day="${dayNumber}"]`);
                    if (dayTab) {
                        dayTab.click();
                    }
                    
                    // 聚焦到景点
                    setTimeout(() => {
                        focusOnSpot(spot.id);
                        found = true;
                    }, 300);
                    
                    // 找到一个就返回，避免多次切换
                    return;
                }
            });
            
            // 如果已经找到，跳出循环
            if (found) return;
        });
        
        if (!found) {
            alert(`未找到包含"${term}"的景点`);
        }
    } catch (error) {
        console.error('搜索景点时出错:', error);
    }
}

/**
 * 初始化天气设置
 */
function initWeatherSettings() {
    try {
        // 从本地存储获取天气提供商设置，默认使用visualcrossing
        const savedProvider = localStorage.getItem('weatherProvider');
        if (savedProvider) {
            CONFIG.api.weatherProvider = savedProvider;
            // 更新配置对象
            if (CONFIG.api.weather) {
                CONFIG.api.weather.provider = savedProvider;
            }
        } else {
            // 如果没有保存的设置，确保默认使用Visual Crossing
            CONFIG.api.weatherProvider = 'visualcrossing';
            if (CONFIG.api.weather) {
                CONFIG.api.weather.provider = 'visualcrossing';
            }
            localStorage.setItem('weatherProvider', 'visualcrossing');
        }
        
        // 如果DOM已加载，更新选择框
        const weatherProviderSelect = document.getElementById('weather-provider');
        if (weatherProviderSelect) {
            weatherProviderSelect.value = CONFIG.api.weatherProvider;
        }
        
        // 从本地存储获取Visual Crossing API Key
        const savedApiKey = localStorage.getItem('visualCrossingApiKey');
        if (savedApiKey) {
            CONFIG.visualCrossingApiKey = savedApiKey;
            CONFIG.api.weather.key = savedApiKey;
            
            // 如果DOM已加载，更新输入框
            const visualCrossingApiKeyInput = document.getElementById('visual-crossing-api-key');
            if (visualCrossingApiKeyInput) {
                visualCrossingApiKeyInput.value = savedApiKey;
            }
        }
        
        // 确保Visual Crossing API Key输入框始终显示
        const apiKeyContainer = document.getElementById('visual-crossing-api-key-container');
        if (apiKeyContainer) {
            apiKeyContainer.style.display = 'block';
        }
        
        console.log('天气设置已初始化:', {
            provider: CONFIG.api.weatherProvider,
            visualCrossingApiKey: CONFIG.visualCrossingApiKey ? '已设置' : '未设置'
        });
    } catch (err) {
        console.error('初始化天气设置时发生错误:', err);
    }
}

/**
 * 初始化天气设置相关事件
 */
function initWeatherSettingsEvents() {
    try {
        // 加载保存的设置
        const usePOIQuerySwitch = document.getElementById('settings-use-poi-id');
        const useCacheSwitch = document.getElementById('settings-use-cache');
        
        // 读取本地存储的设置
        if (usePOIQuerySwitch) {
            const savedUsePOIQuery = localStorage.getItem('usePOIQuery');
            if (savedUsePOIQuery !== null) {
                const usePOI = savedUsePOIQuery === 'true';
                usePOIQuerySwitch.checked = usePOI;
                CONFIG.api.usePOIQuery = usePOI;
            }
        }
        
        if (useCacheSwitch) {
            const savedUseCache = localStorage.getItem('useCache');
            if (savedUseCache !== null) {
                const useCache = savedUseCache === 'true';
                useCacheSwitch.checked = useCache;
                CONFIG.api.useCache = useCache;
            }
        }
        
        // POI查询模式切换
        if (usePOIQuerySwitch) {
            usePOIQuerySwitch.addEventListener('change', function() {
                CONFIG.api.usePOIQuery = this.checked;
                localStorage.setItem('usePOIQuery', this.checked);
            });
        }
        
        // 缓存使用切换
        if (useCacheSwitch) {
            useCacheSwitch.addEventListener('change', function() {
                CONFIG.api.useCache = this.checked;
                localStorage.setItem('useCache', this.checked);
            });
        }
        
        // 天气API设置
        const weatherProviderSelect = document.getElementById('weather-provider');
        const visualCrossingApiKeyInput = document.getElementById('visual-crossing-api-key');
        const visualCrossingApiKeyContainer = document.getElementById('visual-crossing-api-key-container');
        const testAmapWeatherBtn = document.getElementById('test-amap-weather');
        const testVisualCrossingWeatherBtn = document.getElementById('test-visualcrossing-weather');
        const weatherCityInput = document.getElementById('weather-city');
        
        // 初始化天气提供商设置
        if (weatherProviderSelect && visualCrossingApiKeyContainer) {
            // 初始化选择状态，默认使用Visual Crossing
            const savedProvider = localStorage.getItem('weatherProvider') || CONFIG.api.weatherProvider || 'visualcrossing';
            weatherProviderSelect.value = savedProvider;
            CONFIG.api.weatherProvider = savedProvider;
            
            // 根据当前值显示/隐藏API Key输入框
            if (savedProvider === 'visualcrossing' && visualCrossingApiKeyContainer) {
                visualCrossingApiKeyContainer.style.display = 'block';
            } else if (visualCrossingApiKeyContainer) {
                visualCrossingApiKeyContainer.style.display = 'none';
            }
            
            // 切换事件
            weatherProviderSelect.addEventListener('change', function() {
                const provider = this.value;
                CONFIG.api.weatherProvider = provider;
                localStorage.setItem('weatherProvider', provider);
                
                // 显示/隐藏API Key输入框
                if (provider === 'visualcrossing' && visualCrossingApiKeyContainer) {
                    visualCrossingApiKeyContainer.style.display = 'block';
                } else if (visualCrossingApiKeyContainer) {
                    visualCrossingApiKeyContainer.style.display = 'none';
                }
                
                console.log(`已切换天气数据提供商: ${provider}`);
            });
        }
        
        // 初始化Visual Crossing API Key
        if (visualCrossingApiKeyInput) {
            // 从localStorage加载API Key
            const savedApiKey = localStorage.getItem('visualCrossingApiKey') || CONFIG.api.weather.key;
            if (savedApiKey) {
                visualCrossingApiKeyInput.value = savedApiKey;
                CONFIG.api.weather.key = savedApiKey;
                CONFIG.visualCrossingApiKey = savedApiKey;
            }
            
            // 保存API Key
            visualCrossingApiKeyInput.addEventListener('change', function() {
                const apiKey = this.value.trim();
                CONFIG.visualCrossingApiKey = apiKey;
                CONFIG.api.weather.key = apiKey;
                localStorage.setItem('visualCrossingApiKey', apiKey);
            });
        }
        
        // 在页面加载时自动显示Visual Crossing API Key输入框
        if (visualCrossingApiKeyContainer) {
            visualCrossingApiKeyContainer.style.display = 'block';
        }
        
        // 测试高德天气API
        if (testAmapWeatherBtn && weatherCityInput) {
            testAmapWeatherBtn.addEventListener('click', function() {
                const city = weatherCityInput.value.trim();
                if (!city) {
                    alert('请输入要测试的城市名称');
                    return;
                }
                
                const statusElement = document.getElementById('amap-weather-status');
                if (statusElement) {
                    statusElement.style.display = 'block';
                    statusElement.innerHTML = '<span class="weather-api-status-icon">⏳</span> 正在测试高德天气API...';
                    statusElement.className = 'weather-api-status';
                    
                    // 调用测试函数
                    testAmapWeatherApi(city, statusElement);
                }
            });
        }
        
        // 测试Visual Crossing天气API
        if (testVisualCrossingWeatherBtn && weatherCityInput && visualCrossingApiKeyInput) {
            testVisualCrossingWeatherBtn.addEventListener('click', function() {
                const city = weatherCityInput.value.trim();
                const apiKey = visualCrossingApiKeyInput.value.trim();
                
                if (!city) {
                    alert('请输入要测试的城市名称');
                    return;
                }
                
                const statusElement = document.getElementById('visualcrossing-weather-status');
                if (statusElement) {
                    statusElement.style.display = 'block';
                    statusElement.innerHTML = '<span class="weather-api-status-icon">⏳</span> 正在测试Visual Crossing API...';
                    statusElement.className = 'weather-api-status';
                    
                    // 调用测试函数
                    testVisualCrossingWeatherApi(city, apiKey, statusElement);
                }
            });
        }
    } catch (error) {
        console.error('初始化天气设置事件失败:', error);
    }
}

/**
 * 测试高德地图天气API
 * @param {string} city - 测试城市名称
 * @param {HTMLElement} statusElement - 显示状态的DOM元素
 */
function testAmapWeatherApi(city, statusElement) {
    try {
        statusElement.innerHTML = '<span class="weather-api-status-icon">⏳</span> 正在测试API连接...';
        statusElement.className = 'weather-api-status';
        statusElement.style.display = 'block';
        
        // 获取城市adcode
        const adcode = getCityAdcode(city);
        if (!adcode) {
            statusElement.innerHTML = `<span class="weather-api-status-icon">❌</span> 未找到城市"${city}"的编码`;
            statusElement.className = 'weather-api-status error';
            statusElement.style.display = 'block';
            return;
        }
        
        // 构建高德天气API请求
        const amapKey = CONFIG.api.key;
        const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${amapKey}&city=${adcode}&extensions=base`;
        
        // 发起请求
        fetch(weatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态码: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('高德天气API返回数据:', data);
                
                if (data.status === '1' && data.lives && data.lives.length > 0) {
                    const liveWeather = data.lives[0];
                    const weather = liveWeather.weather;
                    const temp = liveWeather.temperature;
                    const simpleWeather = getSimpleWeatherState(weather);
                    const icon = getWeatherIcon(weather);
                    
                    statusElement.innerHTML = `
                        <span class="weather-api-status-icon">✅</span> 
                        API连接成功! ${city}天气: ${simpleWeather}, ${temp}° ${icon}
                    `;
                    statusElement.className = 'weather-api-status success';
                    statusElement.style.display = 'block';
                } else {
                    statusElement.innerHTML = `
                        <span class="weather-api-status-icon">❌</span> 
                        ${data.info || '获取不到天气数据'}
                    `;
                    statusElement.className = 'weather-api-status error';
                    statusElement.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('测试高德天气API时发生错误:', error);
                statusElement.innerHTML = `
                    <span class="weather-api-status-icon">❌</span>
                    API请求失败: ${error.message}
                `;
                statusElement.className = 'weather-api-status error';
                statusElement.style.display = 'block';
            });
    } catch (error) {
        console.error('测试高德天气API时发生异常:', error);
        statusElement.innerHTML = `
            <span class="weather-api-status-icon">❌</span>
            测试过程发生错误: ${error.message}
        `;
        statusElement.className = 'weather-api-status error';
        statusElement.style.display = 'block';
    }
}

/**
 * 测试Visual Crossing天气API
 * @param {string} city - 测试城市名称
 * @param {string} apiKey - Visual Crossing API密钥
 * @param {HTMLElement} statusElement - 显示状态的DOM元素
 */
function testVisualCrossingWeatherApi(city, apiKey, statusElement) {
    try {
        if (!apiKey) {
            statusElement.innerHTML = '<span class="weather-api-status-icon">❌</span> 请输入API密钥';
            statusElement.className = 'weather-api-status error';
            statusElement.style.display = 'block';
            return;
        }
        
        statusElement.innerHTML = '<span class="weather-api-status-icon">⏳</span> 正在测试API连接...';
        statusElement.className = 'weather-api-status';
        statusElement.style.display = 'block';
        
        // 构建API URL
        const baseUrl = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
        const vcWeatherUrl = `${baseUrl}${encodeURIComponent(city)}/today?key=${apiKey}&unitGroup=metric&include=current&lang=zh`;
        
        // 发起请求
        fetch(vcWeatherUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP错误! 状态码: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Visual Crossing天气API返回数据:', data);
                
                if (data && data.currentConditions) {
                    const conditions = data.currentConditions;
                    const temp = conditions.temp;
                    const weather = conditions.conditions;
                    const simpleWeather = getSimpleWeatherState(weather);
                    const icon = getWeatherIconFromVisualCrossing(conditions.icon, weather);
                    
                    statusElement.innerHTML = `
                        <span class="weather-api-status-icon">✅</span> 
                        API连接成功! ${city}天气: ${simpleWeather}, ${Math.round(temp)}° ${icon}
                    `;
                    statusElement.className = 'weather-api-status success';
                    statusElement.style.display = 'block';
                    
                    // 保存有效的API密钥
                    CONFIG.api.weather.key = apiKey;
                    CONFIG.visualCrossingApiKey = apiKey;
                    localStorage.setItem('visualCrossingApiKey', apiKey);
                } else {
                    statusElement.innerHTML = `
                        <span class="weather-api-status-icon">❌</span> 
                        获取不到天气数据，请检查API Key或城市名称
                    `;
                    statusElement.className = 'weather-api-status error';
                    statusElement.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('测试Visual Crossing API时发生错误:', error);
                statusElement.innerHTML = `
                    <span class="weather-api-status-icon">❌</span>
                    API请求失败: ${error.message}
                `;
                statusElement.className = 'weather-api-status error';
                statusElement.style.display = 'block';
            });
    } catch (error) {
        console.error('测试Visual Crossing API时发生异常:', error);
        statusElement.innerHTML = `
            <span class="weather-api-status-icon">❌</span>
            测试过程发生错误: ${error.message}
        `;
        statusElement.className = 'weather-api-status error';
        statusElement.style.display = 'block';
    }
}

/**
 * 根据 Visual Crossing 的天气图标代码和天气状况返回对应的 Emoji
 * @param {string} iconCode - Visual Crossing 的图标代码
 * @param {string} conditions - 天气状况描述
 * @returns {string} Emoji 图标
 */
function getWeatherIconFromVisualCrossing(iconCode, conditions) {
    console.log('getWeatherIconFromVisualCrossing 参数:', { iconCode, conditions });
    
    // 修复空值处理，确保不将空字符串或undefined作为有效输入
    const validIconCode = iconCode && iconCode.trim ? iconCode.trim() : '';
    const validConditions = conditions && conditions.trim ? conditions.trim() : '';
    
    if (!validIconCode && !validConditions) {
        console.log('图标代码和条件都为空，返回默认图标');
        return '☀️'; // 默认使用晴天图标而不是彩虹
    }
    
    // 根据图标代码映射天气图标
    const iconMap = {
        'clear-day': '☀️',
        'clear-night': '🌙',
        'partly-cloudy-day': '⛅',
        'partly-cloudy-night': '☁️',
        'cloudy': '☁️',
        'rain': '🌧️',
        'snow': '❄️',
        'sleet': '🌨️',
        'wind': '💨',
        'fog': '🌫️',
        'thunder': '⚡',
        'thunder-rain': '⛈️',
        'thunder-showers-day': '⛈️',
        'thunder-showers-night': '⛈️',
        'showers-day': '🌦️',
        'showers-night': '🌦️'
    };
    
    // 如果有图标代码，优先使用图标映射
    if (validIconCode && iconMap[validIconCode]) {
        console.log(`找到匹配的图标代码 "${validIconCode}": ${iconMap[validIconCode]}`);
        return iconMap[validIconCode];
    }
    
    // 没有图标代码或找不到映射，尝试从天气状况文本判断
    if (validConditions) {
        const conditionsLower = validConditions.toLowerCase();
        console.log(`尝试从条件文本 "${conditionsLower}" 匹配图标`);
        
        if (conditionsLower.includes('thunder') || conditionsLower.includes('雷')) return '⚡';
        if (conditionsLower.includes('rain') || conditionsLower.includes('shower') || conditionsLower.includes('雨')) {
            if (conditionsLower.includes('light') || conditionsLower.includes('小雨')) return '🌦️';
            if (conditionsLower.includes('heavy') || conditionsLower.includes('大雨')) return '🌧️';
            return '🌧️';
        }
        if (conditionsLower.includes('snow') || conditionsLower.includes('雪')) return '❄️';
        if (conditionsLower.includes('sleet') || conditionsLower.includes('冰雹')) return '🌨️';
        if (conditionsLower.includes('fog') || conditionsLower.includes('haze') || 
            conditionsLower.includes('mist') || conditionsLower.includes('雾')) return '🌫️';
        if (conditionsLower.includes('cloud') || conditionsLower.includes('overcast') || 
            conditionsLower.includes('阴') || conditionsLower.includes('多云')) return '☁️';
        if (conditionsLower.includes('clear') || conditionsLower.includes('sunny') || 
            conditionsLower.includes('晴')) return '☀️';
        if (conditionsLower.includes('partly') && 
            (conditionsLower.includes('cloud') || conditionsLower.includes('sunny'))) return '⛅';
        if (conditionsLower.includes('wind') || conditionsLower.includes('gust') || 
            conditionsLower.includes('风')) return '💨';
    }
    
    // 没找到匹配项，返回默认图标（晴天）
    console.log('未找到匹配的天气图标，返回默认图标');
    return '☀️';
}

/**
 * 根据城市名称获取对应的adcode
 * @param {string} cityName - 城市名称
 * @returns {string} 城市adcode
 */
function getCityAdcode(cityName) {
    // 常用城市adcode对照表
    const cityAdcodes = {
        '北京': '110000',
        '上海': '310000',
        '广州': '440100',
        '深圳': '440300',
        '杭州': '330100',
        '南京': '320100',
        '成都': '510100',
        '重庆': '500000',
        '武汉': '420100',
        '西安': '610100',
        '天津': '120000',
        '苏州': '320500',
        '厦门': '350200',
        '青岛': '370200',
        '大连': '210200',
        '桂林': '450300',
        '三亚': '460200',
        '丽江': '530700',
        '香港': '810000',
        '澳门': '820000',
        '台北': '710000'
    };
    
    return cityAdcodes[cityName] || null;
}

/**
 * 创建地图标记
 * @param {Object} spot - 景点数据
 * @param {number} index - 索引
 * @param {Array} position - 位置坐标
 * @returns {Object} 标记点对象
 */
function createMarker(spot, index, position) {
    try {
        // 检测是否是移动设备
        const isMobile = window.innerWidth <= 768;
        
        // 获取当天的所有景点数据，用于确定总景点数
        const currentDaySpots = tripData.dailySchedule[activeDay - 1].spots;
        const totalSpots = currentDaySpots.length;
        
        // 创建标记点DOM内容
        const markerContent = document.createElement('div');
        markerContent.className = 'marker-content';
        markerContent.setAttribute('data-spot-id', spot.id);
        
        // 添加序号
        const indexElem = document.createElement('div');
        indexElem.className = 'marker-index';
        indexElem.textContent = index + 1;
        indexElem.style.width = isMobile ? '22px' : '24px';
        indexElem.style.height = isMobile ? '22px' : '24px';
        indexElem.style.fontSize = isMobile ? '11px' : '13px';
        markerContent.appendChild(indexElem);
        
        // 添加标签(移动端默认不显示)
        const labelElem = document.createElement('div');
        labelElem.className = 'marker-label';
        labelElem.textContent = spot.name;
        if (isMobile) {
            labelElem.style.fontSize = '10px';
            labelElem.style.padding = '2px 6px';
        }
        markerContent.appendChild(labelElem);
        
        // 创建高德地图标记点
        const marker = new AMap.Marker({
            position: position,
            content: markerContent,
            anchor: 'center',
            zIndex: 100 + index,
            spotId: spot.id  // 确保设置了正确的spotId属性
        });
        
        // 添加扩展数据(必要的情况下)
        try {
            if (typeof marker.setExtData === 'function') {
                marker.setExtData({
                    spotId: spot.id,
                    spot: spot
                });
            }
        } catch (extDataError) {
            console.warn('设置扩展数据失败:', extDataError);
            // 直接在marker对象上设置属性作为备用
            marker.spotId = spot.id;
            marker.spotData = spot;
        }
        
        // 绑定点击事件
        try {
            marker.on('click', function() {
                // 移除其他活跃标记的状态
                document.querySelectorAll('.marker-content').forEach(el => {
                    el.classList.remove('active');
                });
                
                // 添加活跃状态
                markerContent.classList.add('active');
                
                // 显示信息窗口
                showInfoWindow(marker, spot);
                
                // 高亮对应的列表项
                highlightSpotInList(spot.id);
            });
        } catch (eventError) {
            console.warn('绑定标记点击事件失败:', eventError);
            // 为markerContent添加点击事件作为备用
            markerContent.addEventListener('click', function() {
                // 移除其他活跃标记的状态
                document.querySelectorAll('.marker-content').forEach(el => {
                    el.classList.remove('active');
                });
                
                // 添加活跃状态
                markerContent.classList.add('active');
                
                // 显示信息窗口
                showInfoWindow(marker, spot);
                
                // 高亮对应的列表项
                highlightSpotInList(spot.id);
            });
        }
        
        // 添加到地图上
        if (map && marker) {
            try {
                if (typeof marker.setMap === 'function') {
                    marker.setMap(map);
                } else {
                    console.warn('标记没有setMap方法，使用map.add添加');
                    map.add(marker);
                }
            } catch (setMapError) {
                console.error('添加标记到地图失败:', setMapError);
            }
        }
        
        return marker;
    } catch (error) {
        console.error('创建标记时出错:', error);
        return null; // 返回null表示创建失败
    }
}

/**
 * 创建信息窗口内容
 * @param {Object} spot - 景点数据
 * @returns {string} - 信息窗口HTML内容
 */
function createInfoWindowContent(spot) {
    // 处理链接和小贴士部分
    let tipsHtml = '';
    let linksHtml = '';
    
    if (spot.links && spot.links.length > 0) {
        // 分类处理不同类型的链接
        const tipLinks = spot.links.filter(link => link.type === 'tip');
        const videoLinks = spot.links.filter(link => link.type === 'video' && link.url);
        const otherLinks = spot.links.filter(link => link.type !== 'tip' && link.type !== 'video' && link.url);
        
        // 处理小贴士
        if (tipLinks.length > 0) {
            tipsHtml = tipLinks.map(link => 
                `<div class="info-tip">💡 ${link.title}</div>`
            ).join('');
        }
        
        // 处理视频链接
        if (videoLinks.length > 0) {
            const videoLinksHtml = videoLinks.map(link => 
                `<a href="${link.url}" target="_blank" class="info-link video">🎬 ${link.title}</a>`
            ).join('');
            linksHtml += videoLinksHtml;
        }
        
        // 处理其他外部链接
        if (otherLinks.length > 0) {
            const otherLinksHtml = otherLinks.map(link => 
                `<a href="${link.url}" target="_blank" class="info-link ${link.type}">🔗 ${link.title}</a>`
            ).join('');
            linksHtml += otherLinksHtml;
        }
    }
    
    return `
        <div class="info-window">
            <div class="info-title">${spot.name}</div>
            <div class="info-body">
                <div class="info-desc">${spot.description}</div>
                <div class="info-time">⏱️ ${spot.time}</div>
                ${spot.transport ? `<div class="info-transport">🚗 ${spot.transport}</div>` : ''}
                ${spot.cost ? `<div class="info-cost">💰 ${spot.cost}</div>` : ''}
                ${tipsHtml ? `<div class="info-tips">${tipsHtml}</div>` : ''}
                ${linksHtml ? `<div class="info-links">${linksHtml}</div>` : ''}
            </div>
        </div>
    `;
}