INSERT INTO trips (id, title, start_date, days, total_distance, description) 
          VALUES ('004081da-687e-4f22-86b3-ae08054ad058', '2025桂林五一行程', '2025-05-01', 4, '1212公里', '长沙-桂林-阳朔往返四日游');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('a5c93ad3-f711-431c-9b80-25a91cacfc44', '004081da-687e-4f22-86b3-ae08054ad058', 1, '长沙~桂林', '2025-05-01', 'guilin,CN', '从长沙出发，抵达桂林市区，游览桂林市区景点');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('2113cada-bd42-47f9-b2bb-7dfb2467bc7a', 'a5c93ad3-f711-431c-9b80-25a91cacfc44', '09:00', '长沙西岸润泽府', '从家里出发，开始自驾前往桂林的旅程', '112.944836,28.222374', '自驾', 'null', 'B0FFG7KRS5');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('77171e9d-0d74-4937-b359-aa8d3a01a6ce', '2113cada-bd42-47f9-b2bb-7dfb2467bc7a', '油加满，食物和水备好', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('79904e5f-0974-47ea-a3f4-489d1cc15106', 'a5c93ad3-f711-431c-9b80-25a91cacfc44', '15:00', '全景智能酒店', '抵达桂林，办理入住', '110.29404,25.278933', '自驾', '520元/人', 'B0K69LPJDG');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('ff842e59-c6b5-4076-a47a-8be4c24609f5', '79904e5f-0974-47ea-a3f4-489d1cc15106', '酒店位于景区附近，有停车场，方便步行游览市区景点', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('ff9bf31b-08d5-470d-891c-b1602b48d8bd', 'a5c93ad3-f711-431c-9b80-25a91cacfc44', '16:00', '靖江王城', '参观靖江王府，了解明代历史文化', '110.298494,25.278164', '步行', '100元/人', 'B0FFGJGMK4');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('f4ad69e0-3c13-4520-9e1b-e5b22e1f3737', 'ff9bf31b-08d5-470d-891c-b1602b48d8bd', '时间充足时游览，建议游览1小时', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('aa67e6bf-19e9-48ab-b160-d766764ba488', 'a5c93ad3-f711-431c-9b80-25a91cacfc44', '17:30', '象山公园', '游览象山公园，观赏桂林标志性景点', '110.29816,25.271791', '步行', '免费', 'B0FFLB026K');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('bc293b3a-c6e7-41dd-84ae-780e0c0ffbec', 'aa67e6bf-19e9-48ab-b160-d766764ba488', '免费景点，游玩时间约1小时左右', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('633e00cf-46bc-4c55-80ac-606e16a137c2', 'a5c93ad3-f711-431c-9b80-25a91cacfc44', '19:30', '双塔公园', '夜游双塔公园，欣赏日月双塔夜景，品尝当地小吃', '110.293731,25.270744', '步行', 'null', 'B0305097YU');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('5d5a026d-fc7e-4f24-b3c5-36949e215fc2', '633e00cf-46bc-4c55-80ac-606e16a137c2', '夜景很美，是拍照的好地方，周边有许多小吃摊位', '', 'tip');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('a755d075-f473-4b6e-b4d2-0c950e764a3a', '004081da-687e-4f22-86b3-ae08054ad058', 2, '桂林~阳朔', '2025-05-02', 'guilin,CN', '乘船游漓江，抵达阳朔，游览西街，观看千古情表演');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('7a5e0920-483e-4fd6-a2ea-27737d4b4ffa', 'a755d075-f473-4b6e-b4d2-0c950e764a3a', '08:00', '全景智能酒店', '从酒店出发前往磨盘山码头', '110.29404,25.278933', '自驾', 'null', 'B0K69LPJDG');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('5a1fdcc8-af51-4624-8388-86c1a20be280', '7a5e0920-483e-4fd6-a2ea-27737d4b4ffa', '准备出发坐船，估计会很早', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('c9d45c35-5daa-4e5a-b5f7-105d207ff080', 'a755d075-f473-4b6e-b4d2-0c950e764a3a', '09:30', '磨盘山客运码头', '在磨盘山客运码头乘坐三星游轮游览漓江', '110.430987,25.147562', '自驾', '215元/人', 'B0305021A5');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('42ea51b1-2332-4b9c-8ec4-77c6a73968be', 'c9d45c35-5daa-4e5a-b5f7-105d207ff080', '漓江游船攻略', 'https://www.bilibili.com/video/BV1ch4y1G7vn', 'video');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('1ff8aeb3-8a53-4610-8b5d-171b2fb975d6', 'a755d075-f473-4b6e-b4d2-0c950e764a3a', '14:00', '龙头山码头', '抵达阳朔龙头山码头，结束全程约4.5小时的漓江游船之旅', '110.498687,24.780424', '自驾', 'null', 'B0JK25QI8B');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('932bcb66-d3f5-4884-b689-1e0cea691ff3', '1ff8aeb3-8a53-4610-8b5d-171b2fb975d6', '下船后可以去西街吃午饭，体验当地美食', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('f01a1a0f-719c-4374-9c27-ef25f686ae0f', 'a755d075-f473-4b6e-b4d2-0c950e764a3a', '15:00', '阳朔西街', '游览阳朔西街，品尝当地美食，选购特色纪念品', '110.493683,24.773309', '自驾', 'null', 'B0IAHC7KWH');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('8564ed96-8c35-4894-aba5-7cf11d9aa696', 'a755d075-f473-4b6e-b4d2-0c950e764a3a', '17:00', '阳朔1Q84樹民宿', '抵达民宿，办理入住，民宿靠近千古情景区', '110.466032,24.766802', '自驾', 'null', 'B0FFL74P4H');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('905ae5e6-2a2b-42ba-87c6-a51e9fa141e6', 'a755d075-f473-4b6e-b4d2-0c950e764a3a', '19:30', '桂林千古情景区', '千古情室内，刘三姐室外，推荐看千古情；
建议提前半小时入场，选择好的座位', '110.470058,24.769893', '自驾', '约280元/人', 'B0FFM52BT9');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('feb7a811-a833-4a94-98de-1bfd20ece7f0', '004081da-687e-4f22-86b3-ae08054ad058', 3, '阳朔', '2025-05-03', 'guilin,CN', '体验遇龙河漂流，骑行游览月亮山和十里画廊');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('4106e1d8-7df6-414d-88c4-2cec35642f6e', 'feb7a811-a833-4a94-98de-1bfd20ece7f0', '09:00', '阳朔1Q84樹民宿', '电动车租金约60-80元/天，带好身份证作为押金', '110.466032,24.766802', '步行', 'null', 'B0FFL74P4H');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('b7c2a8d9-bc38-4dae-875e-aa588654979a', 'feb7a811-a833-4a94-98de-1bfd20ece7f0', '10:00', '万景码头', '体验遇龙河竹筏漂流，欣赏两岸喀斯特山水风光', '110.491964,24.733705', '步行', '200元/人', 'B0H0CUV6PF');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('af760ded-15a4-4db1-a55a-24d15d161cab', 'b7c2a8d9-bc38-4dae-875e-aa588654979a', '遇龙河漂流攻略', 'https://www.bilibili.com/video/BV1L3bce4EpD', 'video');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('7d2112c7-75a8-4ded-9efe-1b4c4f00bb2a', 'feb7a811-a833-4a94-98de-1bfd20ece7f0', '13:00', '月亮山', '游览月亮山，欣赏著名的山体穿孔景观', '110.476942,24.721673', '步行', '约60元/人', 'B0FFFAH948');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('976132e7-09c9-4766-b857-042117c512f6', '7d2112c7-75a8-4ded-9efe-1b4c4f00bb2a', '月亮山是阳朔的标志性景点，适合拍照打卡', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('bd37f31b-0010-4f7c-a712-94e62c4323f7', 'feb7a811-a833-4a94-98de-1bfd20ece7f0', '15:00', '遇龙河景区', '油菜花,桂林米粉,农家菜,螺蛳粉,啤酒鱼', '110.433115,24.777530', '步行', 'null', 'B03050V0PB');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('3762ec42-7bea-4926-b7c4-5230fea80cd8', 'bd37f31b-0010-4f7c-a712-94e62c4323f7', '游览图', 'https://www.mafengwo.cn/photo/10095/scenery_24443607/1887764022.html', 'article');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('63bf5ca0-5c5c-42e2-bfb9-6ed8ff7b06f9', 'feb7a811-a833-4a94-98de-1bfd20ece7f0', '16:30', '阳朔1Q84樹民宿', '自由活动', '110.466032,24.766802', '步行', 'null', 'B0FFL74P4H');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('48a06393-cebb-4d1a-9654-0e81a8b407b2', '004081da-687e-4f22-86b3-ae08054ad058', 4, '阳朔~长沙', '2025-05-04', 'changsha,CN', '游览相公山，返回长沙');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('7cf14129-8566-4405-b190-bbbc3e4d5a89', '48a06393-cebb-4d1a-9654-0e81a8b407b2', '08:00', '阳朔1Q84樹民宿', '从民宿出发，开始返程', '110.466032,24.766802', '自驾', 'null', 'B0FFL74P4H');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('7c7efed9-0b38-4f5b-9b61-9dc618de510b', '7cf14129-8566-4405-b190-bbbc3e4d5a89', '退房前检查是否有遗漏物品', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('fc343dd2-983b-4f74-8f0b-90b8ff08159d', '48a06393-cebb-4d1a-9654-0e81a8b407b2', '09:30', '相公山', '登山游览相公山，欣赏山顶风景', '110.482457,24.922431', '自驾', 'null', 'B0G06PLLID');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('22bc38f8-11c0-492d-a17c-9447a57a3f24', '48a06393-cebb-4d1a-9654-0e81a8b407b2', '12:30', '桂林市区午餐', '在桂林市区吃午饭', '110.29481,25.274855', '自驾', 'null', 'B0FFF9RW8T');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('3ba77c86-b29d-4ced-8ba5-b1c8df0c6e4c', '48a06393-cebb-4d1a-9654-0e81a8b407b2', '18:30', '长沙西岸润泽府', '抵达长沙，结束愉快的旅程', '112.944836,28.222374', '自驾', 'null', 'B0FFG7KRS5');
