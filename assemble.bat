@echo off

echo Compiling project... && echo.
dotnet publish -c Release -r win-x64 --self-contained false -p:DebugType=None

echo. && echo Compiling done. Packing project...
7z a -mx5 -r0 publish.7z C:\SPA\Prostoi\bin\Release\netcoreapp3.1\win-x64\publish\*.*

echo. && echo Packing done. Moving package to the production folder...
move /Y publish.7z \\10.2.6.118\prostoi-new

echo. && echo Assembling done... && echo.