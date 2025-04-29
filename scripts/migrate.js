const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * 从JSON文件读取数据并转换为数据库格式
 * @returns {Object} 转换后的数据
 */
function readAndTransformData() {
  const data = JSON.parse(fs.readFileSync('./data/trip-data.json', 'utf8'));
  const tripId = uuidv4();
  
  // 转换trip数据
  const trip = {
    id: tripId,
    title: data.tripInfo.title,
    start_date: data.tripInfo.date,
    days: data.tripInfo.days,
    total_distance: data.tripInfo.totalDistance,
    description: data.tripInfo.description
  };

  // 转换daily_schedules数据
  const schedules = data.dailySchedule.map(schedule => {
    const scheduleId = uuidv4();
    return {
      id: scheduleId,
      trip_id: tripId,
      day: schedule.day,
      title: schedule.title,
      date: schedule.date,
      city: schedule.city,
      description: schedule.description,
      spots: schedule.spots.map(spot => {
        const spotId = uuidv4();
        return {
          spot: {
            id: spotId,
            schedule_id: scheduleId,
            time: spot.time,
            name: spot.name,
            description: spot.description,
            location: spot.location,
            transport: spot.transport,
            cost: spot.cost,
            poi_id: spot.poiId
          },
          links: (spot.links || []).map(link => ({
            id: uuidv4(),
            spot_id: spotId,
            title: link.title,
            url: link.url,
            type: link.type
          }))
        };
      })
    };
  });

  return { trip, schedules };
}

/**
 * 生成SQL语句
 * @param {Object} data 转换后的数据
 * @returns {string} SQL语句
 */
function generateSQL(data) {
  const { trip, schedules } = data;
  let sql = '';

  // 插入trip
  sql += `INSERT INTO trips (id, title, start_date, days, total_distance, description) 
          VALUES ('${trip.id}', '${trip.title}', '${trip.start_date}', ${trip.days}, '${trip.total_distance}', '${trip.description}');\n`;

  // 插入schedules和相关数据
  schedules.forEach(schedule => {
    sql += `INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('${schedule.id}', '${trip.id}', ${schedule.day}, '${schedule.title}', '${schedule.date}', '${schedule.city}', '${schedule.description}');\n`;

    schedule.spots.forEach(({ spot, links }) => {
      sql += `INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('${spot.id}', '${schedule.id}', '${spot.time}', '${spot.name}', '${spot.description}', '${spot.location}', '${spot.transport}', '${spot.cost || null}', '${spot.poi_id}');\n`;

      links.forEach(link => {
        sql += `INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('${link.id}', '${spot.id}', '${link.title}', '${link.url}', '${link.type}');\n`;
      });
    });
  });

  return sql;
}

/**
 * 执行数据迁移
 */
async function migrate() {
  try {
    const data = readAndTransformData();
    const sql = generateSQL(data);
    
    // 将SQL写入文件
    fs.writeFileSync('migrate.sql', sql, 'utf8');
    console.log('SQL文件已生成到 migrate.sql');
    
  } catch (error) {
    console.error('迁移失败:', error);
  }
}

migrate(); 