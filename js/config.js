/**
 * 旅游攻略配置文件
 * 包含各项全局设置和API配置
 */

// 全局配置对象
const CONFIG = {
    // 数据配置
    dataPath: 'data/trip-data.json', // 行程数据的JSON文件路径
    
    // 高德地图API配置
    api: {
        key: '09bcdeabf70a1f466cbf766750c244bf', // 高德地图API Key
        securityJsCode: 'da122353acc05b7515f2c34dcdd5a753',
        useCache: true, // 是否使用API数据缓存
        usePOIQuery: false, // 不使用POI ID查询方式，仅使用坐标定位
        weather: {
            provider: 'visualcrossing', // 仅使用visualcrossing天气API
            key: 'XLH73AM2QFGG57GMSMJGXGXEW', // Visual Crossing API Key
        }
    },
    
    // 路径规划配置
    path: {
        lineColor: '#3b82f6', // 路径线颜色
        lineWidth: 4, // 路径线宽度
        showArrow: true, // 是否显示箭头指示方向
        lineStyle: 'solid', // 线条样式：solid / dashed
    },
    
    // 地图样式配置
    map: {
        zoom: 14, // 默认缩放级别
        center: [113.264531, 23.129163], // 默认中心点 [经度, 纬度]
        showScale: true, // 是否显示比例尺
        showMapType: true, // 是否显示地图类型切换控件
        fitViewOnPathCreated: true, // 创建路径后自动调整视野
    },
    
    // UI配置
    ui: {
        animateMarkers: true, // 动画标记点
        showSpotTime: true, // 显示景点时间
        responsiveLayout: true, // 响应式布局
        darkModeSupport: false, // 暗黑模式支持(待开发)
        lineColor: '#3b82f6', // 线路颜色
        lineWidth: 4, // 线路宽度
        lineOpacity: 0.8 // 线路透明度
    },

    // 图标配置
    icons: {
        start: './images/marker-start.png',
        end: './images/marker-end.png',
        hotel: './images/marker-hotel.png',
        food: './images/marker-food.png',
        scenery: './images/marker-scenery.png',
        transport: './images/marker-transport.png'
    }
}; 