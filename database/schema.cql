-- DROP KEYSPACE IF EXISTS test_hist_data;

-- CREATE KEYSPACE test_hist_data
-- WITH REPLICATION = { 
--                     'class' : 'SimpleStrategy', 
--                     'replication_factor' : 3 
--                    };

USE test_hist_data;

-- CREATE TABLE test_data_with_decimal ( 
--   time_interval INT,
--   day INT,
--   city TEXT,
--   avg_surge DECIMAL,
--   avg_drivers INT, 
--   PRIMARY KEY ((day, time_interval), city)
-- );

-- CREATE TABLE test_drivers_count (   
--   city TEXT,
--   availableDrivers INT,  
--   PRIMARY KEY (city)
-- );

-- copy test_data_with_decimal from '/Users/shubhra/Desktop/HackReactor/Pricing-Service/dataFiles/file30.txt' with delimiter = ',';
-- copy test_data_with_decimal from '/Users/shubhra/Desktop/HackReactor/Pricing-Service/dataFiles/file21.txt' with delimiter = ',';
-- copy test_data_with_decimal from '/Users/shubhra/Desktop/HackReactor/Pricing-Service/dataFiles/file22.txt' with delimiter = ',';
-- copy test_data_with_decimal from '/Users/shubhra/Desktop/HackReactor/Pricing-Service/dataFiles/file23.txt' with delimiter = ',';
-- copy test_data_with_decimal from '/Users/shubhra/Desktop/HackReactor/Pricing-Service/dataFiles/file24.txt' with delimiter = ',';
-- copy test_data_with_decimal from '/Users/shubhra/Desktop/HackReactor/Pricing-Service/dataFiles/file25.txt' with delimiter = ',';