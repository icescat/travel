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
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  day INTEGER NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  city TEXT,
  description TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

-- 创建spots表
CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  transport TEXT,
  cost TEXT,
  poi_id TEXT,
  FOREIGN KEY (schedule_id) REFERENCES daily_schedules(id)
);

-- 创建spot_links表
CREATE TABLE IF NOT EXISTS spot_links (
  id TEXT PRIMARY KEY,
  spot_id TEXT NOT NULL,
  title TEXT,
  url TEXT,
  type TEXT,
  FOREIGN KEY (spot_id) REFERENCES spots(id)
); 