DROP KEYSPACE IF EXISTS test_hist_data;

CREATE KEYSPACE test_hist_data
WITH REPLICATION = { 
                    'class' : 'SimpleStrategy', 
                    'replication_factor' : 3 
                   };

USE test_hist_data;

CREATE TABLE test_data ( 
  time_interval INT,
  day INT,
  city TEXT,
  avg_surge FLOAT,
  avg_drivers INT, 
  PRIMARY KEY ((day, time_interval), city)
);

CREATE TABLE test_drivers_count (   
  city TEXT,
  availableDrivers INT,  
  PRIMARY KEY (city)
);

-- DROP KEYSPACE IF EXISTS historical_data;

-- CREATE KEYSPACE historical_data
-- WITH REPLICATION = { 
--                     'class' : 'SimpleStrategy', 
--                     'replication_factor' : 3 
--                    };

-- USE historical_data;

-- CREATE TABLE aggregated_data ( 
--   time_interval INT,
--   day INT,
--   city TEXT,
--   avg_surge FLOAT,
--   avg_drivers INT, 
--   PRIMARY KEY ((time_interval, day), city)
-- ) WITH CLUSTERING ORDER BY (city ASC);
