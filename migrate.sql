INSERT INTO trips (id, title, start_date, days, total_distance, description) 
          VALUES ('4c76652e-4cc3-437e-9721-8d4a5f607fe8', '2025桂林五一行程', '2025-05-01', 4, '1212公里', '长沙-桂林-阳朔往返四日游');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('640b9196-146d-4fab-bbec-a2dfd8122bce', '4c76652e-4cc3-437e-9721-8d4a5f607fe8', 1, '长沙~桂林', '2025-05-01', 'guilin,CN', '从长沙出发，抵达桂林市区，游览桂林市区景点');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('2853fbd2-6f81-4ef1-ad45-74eaa4618416', '640b9196-146d-4fab-bbec-a2dfd8122bce', '09:00', '长沙西岸润泽府', '从家里出发，开始自驾前往桂林的旅程', '112.944836,28.222374', '自驾', 'null', 'B0FFG7KRS5');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('849bef5b-3472-4ffc-ad52-5e3ab804afb1', '2853fbd2-6f81-4ef1-ad45-74eaa4618416', '油加满，食物和水备好', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('01e82e23-8ac4-40eb-ab47-0bcfaafcb1d0', '640b9196-146d-4fab-bbec-a2dfd8122bce', '15:00', '全景智能酒店', '抵达桂林，办理入住', '110.29404,25.278933', '自驾', '520元/人', 'B0K69LPJDG');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('35cbfacd-c852-49e5-8b3d-873521f7b4e1', '01e82e23-8ac4-40eb-ab47-0bcfaafcb1d0', '酒店位于景区附近，有停车场，方便步行游览市区景点', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('a89b8c52-37a5-4a00-bcbf-aa64ca8dec2c', '640b9196-146d-4fab-bbec-a2dfd8122bce', '16:00', '靖江王城', '参观靖江王府，了解明代历史文化', '110.298494,25.278164', '步行', '100元/人', 'B0FFGJGMK4');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('0ee5daa0-6296-4f02-ac4d-245ce5232fcd', 'a89b8c52-37a5-4a00-bcbf-aa64ca8dec2c', '时间充足时游览，建议游览1小时', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('a760c85f-60ca-41e8-8adf-44bf049e7524', '640b9196-146d-4fab-bbec-a2dfd8122bce', '17:30', '象山公园', '游览象山公园，观赏桂林标志性景点', '110.29816,25.271791', '步行', '免费', 'B0FFLB026K');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('a0d2c4d5-d331-4f28-80fd-4f6eb4379488', 'a760c85f-60ca-41e8-8adf-44bf049e7524', '免费景点，游玩时间约1小时左右', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('4fe2de79-fd13-4d1f-9647-bbabfe8652db', '640b9196-146d-4fab-bbec-a2dfd8122bce', '19:30', '双塔公园', '夜游双塔公园，欣赏日月双塔夜景，品尝当地小吃', '110.293731,25.270744', '步行', 'null', 'B0305097YU');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('bd0cbac0-5980-49ab-9207-7b9a81058058', '4fe2de79-fd13-4d1f-9647-bbabfe8652db', '夜景很美，是拍照的好地方，周边有许多小吃摊位', '', 'tip');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '4c76652e-4cc3-437e-9721-8d4a5f607fe8', 2, '桂林~阳朔', '2025-05-02', 'guilin,CN', '乘船游漓江，抵达阳朔，游览西街，观看千古情表演');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('408c5eb4-98d1-4169-b577-6b15229b7bf4', '913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '08:00', '全景智能酒店', '从酒店出发前往磨盘山码头', '110.29404,25.278933', '自驾', 'null', 'B0K69LPJDG');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('171a4220-7a65-4f4d-b8bb-869d97afbd70', '408c5eb4-98d1-4169-b577-6b15229b7bf4', '准备出发坐船，估计会很早', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('98128efc-6470-4966-bf95-6060cb4b7191', '913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '09:30', '磨盘山客运码头', '在磨盘山客运码头乘坐三星游轮游览漓江', '110.430987,25.147562', '自驾', '215元/人', 'B0305021A5');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('9a406e1a-ef88-4ec4-9b54-66c0a42f0e87', '98128efc-6470-4966-bf95-6060cb4b7191', '漓江游船攻略', 'https://www.bilibili.com/video/BV1ch4y1G7vn', 'video');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('95d09f2b-3bc4-47e6-b617-6e5e7daff6e6', '913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '14:00', '龙头山码头', '抵达阳朔龙头山码头，结束全程约4.5小时的漓江游船之旅', '110.498687,24.780424', '自驾', 'null', 'B0JK25QI8B');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('044f2426-d707-4bbb-90cc-433eacb0bc64', '95d09f2b-3bc4-47e6-b617-6e5e7daff6e6', '下船后可以去西街吃午饭，体验当地美食', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('44d1a93f-90cc-4c5a-9176-84bd8994b6e5', '913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '15:00', '阳朔西街', '游览阳朔西街，品尝当地美食，选购特色纪念品', '110.493683,24.773309', '自驾', 'null', 'B0IAHC7KWH');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('5c6b803b-52bc-4e1d-a4b3-b95915e1bed6', '913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '17:00', '阳朔1Q84樹民宿', '抵达民宿，办理入住，民宿靠近千古情景区', '110.466032,24.766802', '自驾', 'null', 'B0FFL74P4H');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('da748062-13f6-481d-9e00-fa6cd64407c3', '913b4e5c-5b78-4acf-98bb-ba379d72e5e0', '19:30', '桂林千古情景区', '千古情室内，刘三姐室外，推荐看千古情；
建议提前半小时入场，选择好的座位', '110.470058,24.769893', '自驾', '约280元/人', 'B0FFM52BT9');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('00c2aa18-7ada-4c0d-8ee5-5dea7d695652', '4c76652e-4cc3-437e-9721-8d4a5f607fe8', 3, '阳朔', '2025-05-03', 'guilin,CN', '体验遇龙河漂流，骑行游览月亮山和十里画廊');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('3f233b54-e290-47a0-a25c-f78e392f60aa', '00c2aa18-7ada-4c0d-8ee5-5dea7d695652', '09:00', '阳朔1Q84樹民宿', '电动车租金约60-80元/天，带好身份证作为押金', '110.466032,24.766802', '步行', 'null', 'B0FFL74P4H');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('ec7f8cbd-54c2-4d6c-a3a2-f1ae567b8b10', '00c2aa18-7ada-4c0d-8ee5-5dea7d695652', '10:00', '万景码头', '体验遇龙河竹筏漂流，欣赏两岸喀斯特山水风光', '110.491964,24.733705', '步行', '200元/人', 'B0H0CUV6PF');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('9062469c-501f-40cf-aa30-3524f956428e', 'ec7f8cbd-54c2-4d6c-a3a2-f1ae567b8b10', '遇龙河漂流攻略', 'https://www.bilibili.com/video/BV1L3bce4EpD', 'video');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('5413a097-abfb-4d3a-8ffa-6543771fc4ea', '00c2aa18-7ada-4c0d-8ee5-5dea7d695652', '13:00', '月亮山', '游览月亮山，欣赏著名的山体穿孔景观', '110.476942,24.721673', '步行', '约60元/人', 'B0FFFAH948');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('502d1262-1f79-4912-a3be-21dc1b1b2677', '5413a097-abfb-4d3a-8ffa-6543771fc4ea', '月亮山是阳朔的标志性景点，适合拍照打卡', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('9457cbd4-1568-41d1-8ffb-c065ed7e61f2', '00c2aa18-7ada-4c0d-8ee5-5dea7d695652', '15:00', '遇龙河景区', '油菜花,桂林米粉,农家菜,螺蛳粉,啤酒鱼', '110.433115,24.777530', '步行', 'null', 'B03050V0PB');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('f9fb5c36-77d6-43c8-8f8d-2ae752ccdd39', '9457cbd4-1568-41d1-8ffb-c065ed7e61f2', '游览图', 'https://www.mafengwo.cn/photo/10095/scenery_24443607/1887764022.html', 'article');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('2b647b1d-dd28-4577-80b2-6e1bcf45a030', '00c2aa18-7ada-4c0d-8ee5-5dea7d695652', '16:30', '阳朔1Q84樹民宿', '自由活动', '110.466032,24.766802', '步行', 'null', 'B0FFL74P4H');
INSERT INTO daily_schedules (id, trip_id, day, title, date, city, description)
            VALUES ('1017cc0b-9d11-463d-8cc9-e6f239d6cffc', '4c76652e-4cc3-437e-9721-8d4a5f607fe8', 4, '阳朔~长沙', '2025-05-04', 'changsha,CN', '游览相公山，返回长沙');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('17449cd8-7598-41cf-95ec-8e100a773b08', '1017cc0b-9d11-463d-8cc9-e6f239d6cffc', '08:00', '阳朔1Q84樹民宿', '从民宿出发，开始返程', '110.466032,24.766802', '自驾', 'null', 'B0FFL74P4H');
INSERT INTO spot_links (id, spot_id, title, url, type)
                VALUES ('ab894ac6-b385-4d67-8071-d2a81e283eab', '17449cd8-7598-41cf-95ec-8e100a773b08', '退房前检查是否有遗漏物品', '', 'tip');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('9ccaba3e-21b3-4896-a5cc-59384d0b4380', '1017cc0b-9d11-463d-8cc9-e6f239d6cffc', '09:30', '相公山', '登山游览相公山，欣赏山顶风景', '110.482457,24.922431', '自驾', 'null', 'B0G06PLLID');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('c1a86a92-e6d3-448a-865b-cc88d94c9eb1', '1017cc0b-9d11-463d-8cc9-e6f239d6cffc', '12:30', '桂林市区午餐', '在桂林市区吃午饭', '110.29481,25.274855', '自驾', 'null', 'B0FFF9RW8T');
INSERT INTO spots (id, schedule_id, time, name, description, location, transport, cost, poi_id)
              VALUES ('b0ed3fc3-353e-47e3-b72d-2c8d0d76071c', '1017cc0b-9d11-463d-8cc9-e6f239d6cffc', '18:30', '长沙西岸润泽府', '抵达长沙，结束愉快的旅程', '112.944836,28.222374', '自驾', 'null', 'B0FFG7KRS5');
