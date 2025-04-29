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