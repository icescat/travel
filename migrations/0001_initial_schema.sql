-- 删除现有表
DROP TABLE IF EXISTS spot_links;
DROP TABLE IF EXISTS spots;
DROP TABLE IF EXISTS daily_schedules;
DROP TABLE IF EXISTS trips;

-- 创建trips表
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  days INTEGER NOT NULL,
  total_distance TEXT,
  description TEXT
);

-- 创建daily_schedules表
CREATE TABLE IF NOT EXISTS daily_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  city TEXT,
  description TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- 创建spots表
CREATE TABLE IF NOT EXISTS spots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  schedule_id INTEGER NOT NULL,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  transport TEXT,
  cost TEXT,
  poi_id TEXT,
  FOREIGN KEY (schedule_id) REFERENCES daily_schedules(id) ON DELETE CASCADE
);

-- 创建spot_links表
CREATE TABLE IF NOT EXISTS spot_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id INTEGER NOT NULL,
  title TEXT,
  url TEXT,
  type TEXT,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- 插入测试数据
INSERT INTO trips (id, title, start_date, days, total_distance, description) 
VALUES ('4c76652e-4cc3-437e-9721-8d4a5f607fe8', '桂林五一行程', '2025-05-01', 4, '约600公里', '桂林山水甲天下，风景秀丽');

-- 插入示例日程
INSERT INTO daily_schedules (trip_id, day, title, date, description, city)
VALUES ('4c76652e-4cc3-437e-9721-8d4a5f607fe8', 1, '长沙~桂林', '2025-05-01', '从长沙出发前往桂林', '桂林');

-- 打开外键约束
PRAGMA foreign_keys = ON; 