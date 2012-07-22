PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE body (logDate Varchar(255) PRIMARY KEY DEFAULT NULL, weight Float, bmi Float, fat Float);
CREATE TABLE sleep (logDate Varchar(255) PRIMARY KEY DEFAULT NULL, startTime integer DEFAULT NULL, timeInBed integer DEFAULT NULL, minutesAsleep integer DEFAULT NULL, awakeningsCount integer DEFAULT NULL, minutesAwake integer DEFAULT NULL, minutesToFallAsleep integer DEFAULT NULL, minutesAfterWakeup integer DEFAULT NULL, efficiency Float DEFAULT NULL);
CREATE TABLE foods (logDate Varchar(255) PRIMARY KEY DEFAULT NULL, caloriesIn integer, water integer);
CREATE TABLE activities (logDate Varchar(255) PRIMARY KEY DEFAULT NULL, calories integer DEFAULT NULL, steps integer DEFAULT NULL, distance Float, floors integer, elevation integer, minutesSedentary integer, minutesLightlyActive integer, minutesFairlyActive integer, minutesVeryActive integer, activeScore integer, activityCalories integer);
COMMIT;
