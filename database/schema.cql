CREATE KEYSPACE IF NOT EXISTS test_hist_data
WITH REPLICATION = { 
                    'class' : 'SimpleStrategy', 
                    'replication_factor' : 3 
                   };

USE test_hist_data;

CREATE TABLE test_data_with_decimal ( 
  time_interval INT,
  day INT,
  city TEXT,
  avg_surge DECIMAL,
  avg_drivers INT, 
  PRIMARY KEY ((day, time_interval), city)
);

CREATE TABLE test_drivers_count (   
  city TEXT,
  availableDrivers INT,  
  PRIMARY KEY (city)
);

copy test_data_with_decimal from '/usr/src/cassandra/file30.txt' with delimiter = ',';
copy test_drivers_count from '/usr/src/cassandra/file31.txt' with delimiter = ',';