:Top
echo off
cls
if defined ProgramFiles(x86) (
	"%~dp0\app\node\x64\node.exe" app "%userinp%"
) else (
	"%~dp0\app\node\x86\node.exe" app "%userinp%"
)