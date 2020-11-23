create user 'kbj_node_backend' identified by 'kbj_node_backend' password expire never;
grant all privileges on *.* to 'kbj_node_backend' with grant option;

-- 생성된 User 확인
SELECT user FROM mysql.user;

-- 생성된 User 제거
drop user 'kbj_node_backend';