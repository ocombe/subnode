:Top
echo off
cd %~dp0/../
cls
rd /s /q node_modules
npm install --production
pause
