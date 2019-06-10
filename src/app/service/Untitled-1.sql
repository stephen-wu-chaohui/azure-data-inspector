--INSERT INTO Company([Name], [LastUpdated], [Deleted], [Description])
--VALUES (N'Demo Project', 0, 'False', N'This is a demo app to merely show the capability of updating field data to Azure and vierwing the updates in realtime.')
--GO

DELETE FROM Site;
GO

DELETE FROM Sensor;
GO

DELETE FROM Sample;
GO

SELECT * FROM Company;
GO

SELECT * FROM Site;
GO

SELECT * FROM Sensor;
GO

