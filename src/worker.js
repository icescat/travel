/**
 * 处理跨域请求的中间件
 * @param {Request} request 请求对象
 * @returns {Response|Object} 响应对象或CORS头部对象
 */
function handleCORS(request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  return headers;
}

/**
 * 获取所有行程信息
 * @param {D1Database} db D1数据库实例
 * @returns {Promise<Object>} 行程数据
 */
async function getTrips(db) {
  const trips = await db.prepare('SELECT * FROM trips').all();
  return trips;
}

/**
 * 获取指定行程的详细信息
 * @param {D1Database} db D1数据库实例
 * @param {string} tripId 行程ID
 * @returns {Promise<Object>} 行程详细数据
 */
async function getTripDetails(db, tripId) {
  // 获取行程基本信息
  const trip = await db.prepare('SELECT * FROM trips WHERE id = ?').bind(tripId).first();
  if (!trip) {
    return null;
  }

  // 获取每日行程
  const schedules = await db.prepare('SELECT * FROM daily_schedules WHERE trip_id = ? ORDER BY day').bind(tripId).all();
  
  // 获取每日行程的景点信息
  const result = {
    tripInfo: {
      title: trip.title,
      date: trip.start_date,
      days: trip.days,
      totalDistance: trip.total_distance,
      description: trip.description
    },
    dailySchedule: []
  };

  for (const schedule of schedules.results) {
    // 获取景点信息
    const spots = await db.prepare('SELECT * FROM spots WHERE schedule_id = ? ORDER BY time').bind(schedule.id).all();
    
    // 获取每个景点的链接信息
    const dailySpots = [];
    for (const spot of spots.results) {
      const links = await db.prepare('SELECT * FROM spot_links WHERE spot_id = ?').bind(spot.id).all();
      dailySpots.push({
        id: spot.id,
        time: spot.time,
        name: spot.name,
        description: spot.description,
        location: spot.location,
        transport: spot.transport,
        cost: spot.cost,
        poiId: spot.poi_id,
        links: links.results.map(link => ({
          title: link.title,
          url: link.url,
          type: link.type
        }))
      });
    }

    result.dailySchedule.push({
      day: schedule.day,
      title: schedule.title,
      date: schedule.date,
      city: schedule.city,
      description: schedule.description,
      spots: dailySpots
    });
  }

  return result;
}

/**
 * 更新行程信息 - 简化版，减少数据库操作次数
 * @param {D1Database} db D1数据库实例
 * @param {string} tripId 行程ID
 * @param {Object} tripData 行程数据
 * @returns {Promise<Object>} 更新结果
 */
async function updateTripDetails(db, tripId, tripData) {
  console.log(`更新行程 ${tripId} 的详细信息`);
  console.log('接收到的tripData结构:', JSON.stringify({
    hasInfo: !!tripData.tripInfo,
    hasDailySchedule: !!tripData.dailySchedule,
    infoKeys: tripData.tripInfo ? Object.keys(tripData.tripInfo) : [],
    daysCount: tripData.dailySchedule ? tripData.dailySchedule.length : 0
  }));
  
  // 验证数据的完整性
  if (!tripData.tripInfo) {
    throw new Error('tripInfo字段缺失或为空');
  }
  
  if (!tripData.dailySchedule || !Array.isArray(tripData.dailySchedule) || tripData.dailySchedule.length === 0) {
    throw new Error('dailySchedule字段缺失、非数组或为空数组');
  }
  
  // 清理和准备安全的数据结构
  const safeTrip = {
    tripInfo: {
      title: tripData.tripInfo.title || '未命名行程',
      date: tripData.tripInfo.date || new Date().toISOString().split('T')[0],
      days: tripData.tripInfo.days || 1,
      totalDistance: tripData.tripInfo.totalDistance || '0公里',
      description: tripData.tripInfo.description || ''
    },
    dailySchedule: tripData.dailySchedule
      .filter(day => day) // 过滤掉null或undefined
      .map((day, index) => ({
        day: day.day || (index + 1),
        title: day.title || `第${day.day || (index + 1)}天`,
        date: day.date || '',
        description: day.description || '',
        city: day.city || '',
        spots: Array.isArray(day.spots) 
          ? day.spots
              .filter(spot => spot) // 过滤掉null或undefined
              .map(spot => ({
                name: spot.name || '未命名景点',
                time: spot.time || '',
                description: spot.description || '',
                location: spot.location || '',
                transport: spot.transport || '自驾',
                cost: spot.cost || '',
                poiId: spot.poiId || '',
                links: Array.isArray(spot.links) 
                  ? spot.links
                      .filter(link => link && link.title && link.url)
                      .map(link => ({
                        title: link.title || '',
                        url: link.url || '',
                        type: link.type || 'article'
                      }))
                  : []
              }))
          : []
      }))
  };
  
  // 开始事务
  console.log('开始数据库事务');
  try {
    // 每个操作都作为独立事务处理，避免长事务
    
    // 1. 更新行程基本信息
    console.log('更新行程基本信息');
    const tripUpdateResult = await db.prepare(
      'UPDATE trips SET title = ?, start_date = ?, days = ?, total_distance = ?, description = ? WHERE id = ?'
    ).bind(
      safeTrip.tripInfo.title,
      safeTrip.tripInfo.date,
      safeTrip.tripInfo.days,
      safeTrip.tripInfo.totalDistance,
      safeTrip.tripInfo.description,
      tripId
    ).run();
    
    if (!tripUpdateResult.success) {
      throw new Error('更新行程基本信息失败');
    }
    
    // 2. 获取现有日程列表
    const existingSchedules = await db.prepare(
      'SELECT id, day FROM daily_schedules WHERE trip_id = ?'
    ).bind(tripId).all();
    
    const scheduleMap = new Map();
    if (existingSchedules.results) {
      existingSchedules.results.forEach(schedule => {
        scheduleMap.set(schedule.day, schedule.id);
      });
    }
    
    // 3. 处理每个日程
    for (const day of safeTrip.dailySchedule) {
      let scheduleId;
      
      // 3.1 更新或插入日程
      if (scheduleMap.has(day.day)) {
        // 更新现有日程
        scheduleId = scheduleMap.get(day.day);
        await db.prepare(
          'UPDATE daily_schedules SET title = ?, date = ?, description = ?, city = ? WHERE id = ?'
        ).bind(
          day.title,
          day.date,
          day.description,
          day.city,
          scheduleId
        ).run();
      } else {
        // 插入新日程
        const insertResult = await db.prepare(
          'INSERT INTO daily_schedules (trip_id, day, title, date, description, city) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          tripId,
          day.day,
          day.title,
          day.date,
          day.description,
          day.city
        ).run();
        
        if (!insertResult.meta || !insertResult.meta.last_row_id) {
          throw new Error(`插入日程失败: 第${day.day}天`);
        }
        
        scheduleId = insertResult.meta.last_row_id;
      }
      
      // 3.2 删除该日程的所有现有景点及链接 (使用级联删除)
      await db.prepare('DELETE FROM spots WHERE schedule_id = ?').bind(scheduleId).run();
      
      // 3.3 为该日程插入新景点
      if (day.spots && day.spots.length > 0) {
        for (const spot of day.spots) {
          // 插入景点
          const spotInsertResult = await db.prepare(
            'INSERT INTO spots (schedule_id, time, name, description, location, transport, cost, poi_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            scheduleId,
            spot.time,
            spot.name,
            spot.description,
            spot.location,
            spot.transport,
            spot.cost,
            spot.poiId
          ).run();
          
          if (!spotInsertResult.meta || !spotInsertResult.meta.last_row_id) {
            throw new Error(`插入景点失败: ${spot.name}`);
          }
          
          const spotId = spotInsertResult.meta.last_row_id;
          
          // 插入链接
          if (spot.links && spot.links.length > 0) {
            for (const link of spot.links) {
              await db.prepare(
                'INSERT INTO spot_links (spot_id, title, url, type) VALUES (?, ?, ?, ?)'
              ).bind(
                spotId,
                link.title,
                link.url,
                link.type
              ).run();
            }
          }
        }
      }
    }
    
    return { success: true, message: '行程数据更新成功' };
  } catch (error) {
    console.error('更新行程失败:', error);
    throw error;
  }
}

/**
 * 处理API请求
 * @param {Request} request 请求对象
 * @param {Object} env 环境变量
 * @returns {Promise<Response>} 响应对象
 */
async function handleRequest(request, env) {
  console.log(`处理请求: ${request.method} ${request.url}`);
  
  const corsHeaders = handleCORS(request);
  if (request.method === 'OPTIONS') {
    return corsHeaders;
  }

  const url = new URL(request.url);
  const path = url.pathname;
  console.log(`请求路径: ${path}`);

  try {
    if (path === '/api/trips') {
      console.log('获取所有行程列表');
      const trips = await getTrips(env.DB);
      return new Response(JSON.stringify(trips), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
    
    if (path.startsWith('/api/trips/')) {
      const tripId = path.split('/')[3];
      console.log(`操作行程ID: ${tripId}`);
      
      // GET请求 - 获取行程详情
      if (request.method === 'GET') {
        console.log('GET请求 - 获取行程详情');
        const tripDetails = await getTripDetails(env.DB, tripId);
        
        if (!tripDetails) {
          console.log('行程不存在');
          return new Response(JSON.stringify({ error: '行程不存在' }), {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

        return new Response(JSON.stringify(tripDetails), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
      
      // PUT请求 - 更新行程详情
      if (request.method === 'PUT') {
        console.log('PUT请求 - 更新行程详情');
        
        // 读取请求正文
        let tripData;
        let requestText = '';
        
        try {
          // 首先尝试获取原始请求文本，用于调试
          const clonedRequest = request.clone();
          requestText = await clonedRequest.text();
          console.log('原始请求文本(部分):', requestText.substring(0, 500) + '...');
          
          // 解析JSON
          try {
            tripData = JSON.parse(requestText);
          } catch(parseError) {
            console.error('JSON解析错误:', parseError);
            return new Response(JSON.stringify({ 
              error: '无效的JSON数据格式', 
              message: parseError.message,
              partialText: requestText.substring(0, 200) + '...'
            }), {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }
          
          console.log('接收到的数据结构：', JSON.stringify({
            hasInfo: !!tripData.tripInfo,
            hasDailySchedule: !!tripData.dailySchedule,
            daysCount: tripData.dailySchedule ? tripData.dailySchedule.length : 0
          }));
        } catch (error) {
          console.error('请求读取或解析失败:', error);
          return new Response(JSON.stringify({ 
            error: '读取请求数据失败', 
            message: error.message 
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 验证必要字段
        if (!tripData.tripInfo || !tripData.dailySchedule) {
          console.log('数据格式不正确，缺少必要字段');
          return new Response(JSON.stringify({ 
            error: '数据格式不正确，缺少tripInfo或dailySchedule',
            receivedData: {
              hasInfo: !!tripData.tripInfo,
              hasDailySchedule: !!tripData.dailySchedule
            }
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        try {
          // 更新行程详情
          console.log('开始更新数据库');
          const result = await updateTripDetails(env.DB, tripId, tripData);
          console.log('数据库更新结果:', result);
          
          return new Response(JSON.stringify(result), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        } catch (updateError) {
          console.error('更新数据库失败:', updateError);
          let errorResponse = {
            error: `更新数据库失败: ${updateError.message}`,
            message: updateError.message
          };
          
          // 安全地添加堆栈跟踪，避免过大的响应
          if (updateError.stack) {
            const stackLines = updateError.stack.split('\n');
            errorResponse.stack = stackLines.slice(0, 5).join('\n');
          }
          
          return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      }
    }

    console.log('接口不存在');
    return new Response(JSON.stringify({ error: '接口不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('处理请求时出错:', error);
    return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

export default {
  fetch: handleRequest
}; 