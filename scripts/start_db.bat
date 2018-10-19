@echo off
for %%I in (.) do set CurrDirName=%%~nxI
IF "%CurrDirName%"=="Up2Date" (
    echo. && echo Starting MongoDB... && echo.
    mkdir .\db\data
    mkdir .\db\log
    @echo on
    mongod --dbpath db\data --logpath db\log\log.txt
) ELSE (
    echo. && echo ERROR: Run .bat from Up2Date using scripts\start_db.bat instead. && echo.
)