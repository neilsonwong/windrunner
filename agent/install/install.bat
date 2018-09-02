:: makes a windrunner link and copies to startup file
:: windows service + local account integration was too 
:: annoying and this seemed like the best solution

echo "adding windrunner agent to startup"

:: to lazy to find a generate shortcut script so using this one
set SCRIPT="%TEMP%\%RANDOM%-%RANDOM%-%RANDOM%-%RANDOM%.vbs"

echo Set oWS = WScript.CreateObject("WScript.Shell") >> %SCRIPT%
echo sLinkFile = "%USERPROFILE%\Start Menu\Programs\Startup\windrunnerAgent.lnk" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "%CD%\..\bin\agent.exe" >> %SCRIPT%
echo oLink.WorkingDirectory  = "%CD%\..\bin" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

cscript /nologo %SCRIPT%
del %SCRIPT%

echo "done"