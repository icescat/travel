/**
 * 处理跨域请求的中间件
 * @param {Request} request 请求对象
 * @returns {Response} 响应对象
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
 * 更新行程信息
 * @param {D1Database} db D1数据库实例
 * @param {string} tripId 行程ID
 * @param {Object} tripData 行程数据
 * @returns {Promise<Object>} 更新结果
 */
async function updateTripDetails(db, tripId, tripData) {
  // 开始事务
  await db.exec('BEGIN TRANSACTION');
  
  try {
    // 1. 更新行程基本信息
    await db.prepare(
      'UPDATE trips SET title = ?, start_date = ?, days = ?, total_distance = ?, description = ? WHERE id = ?'
    ).bind(
      tripData.tripInfo.title,
      tripData.tripInfo.date,
      tripData.tripInfo.days,
      tripData.tripInfo.totalDistance,
      tripData.tripInfo.description,
      tripId
    ).run();
    
    // 2. 处理每日行程
    for (const day of tripData.dailySchedule) {
      // 查找此天行程是否存在
      const existingSchedule = await db.prepare(
        'SELECT id FROM daily_schedules WHERE trip_id = ? AND day = ?'
      ).bind(tripId, day.day).first();
      
      let scheduleId;
      
      if (existingSchedule) {
        // 更新已有日程
        scheduleId = existingSchedule.id;
        await db.prepare(
          'UPDATE daily_schedules SET title = ?, date = ?, description = ?, city = ? WHERE id = ?'
        ).bind(
          day.title,
          day.date,
          day.description,
          day.city || '',
          scheduleId
        ).run();
        
        // 删除此日程下的所有景点，后面重新插入
        const existingSpots = await db.prepare(
          'SELECT id FROM spots WHERE schedule_id = ?'
        ).bind(scheduleId).all();
        
        // 删除景点链接
        for (const spot of existingSpots.results) {
          await db.prepare(
            'DELETE FROM spot_links WHERE spot_id = ?'
          ).bind(spot.id).run();
        }
        
        // 删除景点
        await db.prepare(
          'DELETE FROM spots WHERE schedule_id = ?'
        ).bind(scheduleId).run();
      } else {
        // 插入新日程
        const result = await db.prepare(
          'INSERT INTO daily_schedules (trip_id, day, title, date, description, city) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(
          tripId,
          day.day,
          day.title,
          day.date,
          day.description,
          day.city || ''
        ).run();
        
        scheduleId = result.meta.last_row_id;
      }
      
      // 3. 处理景点
      if (day.spots && Array.isArray(day.spots)) {
        for (const spot of day.spots) {
          // 插入景点
          const spotResult = await db.prepare(
            'INSERT INTO spots (schedule_id, time, name, description, location, transport, cost, poi_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            scheduleId,
            spot.time,
            spot.name,
            spot.description || '',
            spot.location || '',
            spot.transport || '自驾',
            spot.cost || '',
            spot.poiId || ''
          ).run();
          
          const spotId = spotResult.meta.last_row_id;
          
          // 4. 处理链接
          if (spot.links && Array.isArray(spot.links)) {
            for (const link of spot.links) {
              await db.prepare(
                'INSERT INTO spot_links (spot_id, title, url, type) VALUES (?, ?, ?, ?)'
              ).bind(
                spotId,
                link.title,
                link.url,
                link.type || 'article'
              ).run();
            }
          }
        }
      }
    }
    
    // 提交事务
    await db.exec('COMMIT');
    
    return { success: true, message: '行程数据更新成功' };
  } catch (error) {
    // 回滚事务
    await db.exec('ROLLBACK');
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
  const corsHeaders = handleCORS(request);
  if (request.method === 'OPTIONS') {
    return corsHeaders;
  }

  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path === '/api/trips') {
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
      
      // GET请求 - 获取行程详情
      if (request.method === 'GET') {
        const tripDetails = await getTripDetails(env.DB, tripId);
        
        if (!tripDetails) {
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
        const tripData = await request.json();
        
        // 验证必要字段
        if (!tripData.tripInfo || !tripData.dailySchedule) {
          return new Response(JSON.stringify({ error: '数据格式不正确' }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 更新行程详情
        const result = await updateTripDetails(env.DB, tripId, tripData);
        
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }

    return new Response(JSON.stringify({ error: '接口不存在' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
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