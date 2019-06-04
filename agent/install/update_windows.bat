:: update script for windrunner

:: -----------------------------------------------------------------------------
:: touch the updated file
:: -----------------------------------------------------------------------------
echo.> updated.txt

:: -----------------------------------------------------------------------------
:: extract windrunner update into updates directory
:: -----------------------------------------------------------------------------
:: %~dp0 refers to the full path to the batch file's directory (static)
set WINDRUNNER_ROOT=%cd%

@echo off
setlocal
cd /d %WINDRUNNER_ROOT%
for /R %%i in (*.zip) DO (
	set filename=%%i
	echo %%i
	goto Main
)
echo "No Update Files Found"
timeout 3 >nul
exit

:Main
echo "Processing %filename%"
Call :UnZipFile "%WINDRUNNER_ROOT%\updates\" "%filename%"
exit /b

:UnZipFile <ExtractTo> <newzipfile>
echo "extracting %2 to %1"
set vbs="%temp%\_.vbs"
if exist %vbs% del /f /q %vbs%
>%vbs%  echo Set fso = CreateObject("Scripting.FileSystemObject")
>>%vbs% echo If NOT fso.FolderExists(%1) Then
>>%vbs% echo fso.CreateFolder(%1)
>>%vbs% echo End If
>>%vbs% echo set objShell = CreateObject("Shell.Application")
>>%vbs% echo set FilesInZip=objShell.NameSpace(%2).items
>>%vbs% echo objShell.NameSpace(%1).CopyHere(FilesInZip)
>>%vbs% echo Set fso = Nothing
>>%vbs% echo Set objShell = Nothing
cscript //nologo %vbs%
if exist %vbs% del /f /q %vbs%

:: -----------------------------------------------------------------------------
:: stop the windrunner service
:: -----------------------------------------------------------------------------
:: on windows we'll handle this inside the main program by simply quitting
:: do a check here to make sure it's not running
wmic process get ProcessID,ExecutablePath 2>NUL | find /I /N "%WINDRUNNER_ROOT%\agent.exe">NUL
if "%ERRORLEVEL%"=="0" (
	echo "Windrunner is still running"
	exit 1
)

:: -----------------------------------------------------------------------------
:: copy binaries and configs
:: -----------------------------------------------------------------------------
echo "delete agent.exe"
del "%WINDRUNNER_ROOT%\agent.exe"
echo "backup config.json"
rename "%WINDRUNNER_ROOT%\config.json" "config.json.old"
echo "copy new updated files from update dir"
copy "%WINDRUNNER_ROOT%\updates\agent.exe" "%WINDRUNNER_ROOT%\agent.exe"
copy "%WINDRUNNER_ROOT%\updates\config.json" "%WINDRUNNER_ROOT%\config.json"

:: -----------------------------------------------------------------------------
:: clear update dir
:: -----------------------------------------------------------------------------
echo "clean update dir"
rd /s /q "%WINDRUNNER_ROOT%\updates"

:: -----------------------------------------------------------------------------
:: restart windrunner
:: -----------------------------------------------------------------------------
timeout 3 >nul
start "" "%WINDRUNNER_ROOT%\agent.exe"
echo "done in %WINDRUNNER_ROOT%"
