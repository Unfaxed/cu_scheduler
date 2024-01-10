

DROP TABLE IF EXISTS users;
CREATE TABLE users (
	user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    premium_purchase TIMESTAMP,
    discord VARCHAR(255) NOT NULL
);


DROP TABLE IF EXISTS class_section;
CREATE TABLE class_section (
    section_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    class_code VARCHAR(15) NOT NULL,
    class_type VARCHAR(3) NOT NULL,
    refreshed TIMESTAMP NOT NULL,
    section VARCHAR(15) NOT NULL,
    instructor VARCHAR(255) NOT NULL,
    waitlisted BOOLEAN DEFAULT 0,
    meeting_times TEXT NOT NULL
);
DROP INDEX IF EXISTS class_code_index;
CREATE INDEX class_code_index
    ON class_section(class_code);


DROP TABLE IF EXISTS preschedule;
CREATE TABLE preschedule (
    user_id INT PRIMARY KEY NOT NULL,
    section_id INT NOT NULL,
    avoid_profs TEXT
);


DROP TABLE IF EXISTS avoid_times;
CREATE TABLE avoid_times(
    user_id INT PRIMARY KEY NOT NULL,
    day TINYINT NOT NULL,
    start_time TINYINT NOT NULL,
    end_time TINYINT NOT NULL
);


