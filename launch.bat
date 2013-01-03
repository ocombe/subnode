:Top
echo off
cls
:MAINMENU choose option from menu
set /p userinp=Enter the path to your video files (ex: D:/Series TV/) then press enter:   
set userinp=%userinp%
if "%userinp%"=="" goto All

:SINGLE
node app "%userinp%"

:ALL
echo You have to enter a path...
pause
