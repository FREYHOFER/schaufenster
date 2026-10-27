param([Parameter(Mandatory=$true)][string]$NodeExecutable, [Parameter(Mandatory=$true)][string]$BuiltSite)
$ErrorActionPreference = 'Stop'
$target = Join-Path $env:USERPROFILE 'SchaufensterKiosk'
$legacy = Join-Path $env:LOCALAPPDATA 'SchaufensterLauncher'
$backup = Join-Path $target ('backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $backup -Force | Out-Null
Get-ChildItem -LiteralPath $target -Filter '*.ps1' | Copy-Item -Destination $backup
if (Test-Path -LiteralPath $legacy) {
    Get-ChildItem -LiteralPath $legacy -Filter '*.ps1' | Copy-Item -Destination $backup -Force
    if (Test-Path -LiteralPath (Join-Path $legacy 'schaufenster.ico')) { Copy-Item (Join-Path $legacy 'schaufenster.ico') (Join-Path $target 'schaufenster.ico') -Force }
}
New-Item -ItemType Directory -Path (Join-Path $target 'runtime') -Force | Out-Null
Copy-Item -LiteralPath $NodeExecutable -Destination (Join-Path $target 'runtime\node.exe') -Force
foreach ($file in @('server.mjs','client.js','supervisor.mjs','Start-Kiosk.vbs','Watch-Kiosk.ps1')) { Copy-Item -LiteralPath (Join-Path $PSScriptRoot $file) -Destination (Join-Path $target $file) -Force }
$manifestPath = Join-Path $BuiltSite 'offline-manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($manifest.version -notmatch '^[a-f0-9]{64}$') { throw 'Invalid local release version' }
$release = Join-Path $target ('releases\' + $manifest.version)
New-Item -ItemType Directory -Path $release -Force | Out-Null
foreach ($file in $manifest.files) {
    if ($file.path -match '(^/|\.\.|:|\\)') { throw 'Unsafe manifest path' }
    $source = Join-Path $BuiltSite $file.path
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLower() -ne $file.sha256) { throw "Bad source hash: $($file.path)" }
    $destination = Join-Path $release $file.path
    New-Item -ItemType Directory -Path (Split-Path $destination) -Force | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
}
Copy-Item -LiteralPath $manifestPath -Destination (Join-Path $release 'offline-manifest.json') -Force
$statePath = Join-Path $target 'active.json'
if (Test-Path -LiteralPath $statePath) { Copy-Item -LiteralPath $statePath -Destination $backup }
@{ active=$manifest.version; previous=@() } | ConvertTo-Json -Compress | Set-Content -LiteralPath $statePath -Encoding UTF8
# Keep the existing Desktop and Startup links compatible.
$wrapper = "& '" + (Join-Path $target 'Watch-Kiosk.ps1').Replace("'","''") + "'"
if (Test-Path -LiteralPath $legacy) { Set-Content -LiteralPath (Join-Path $legacy 'Keep-SchaufensterVisible.ps1') -Value $wrapper -Encoding UTF8 }
$powershell = Join-Path $env:WINDIR 'System32\WindowsPowerShell\v1.0\powershell.exe'
$arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $target 'Watch-Kiosk.ps1') + '"'
$action = New-ScheduledTaskAction -Execute (Join-Path $env:WINDIR 'System32\wscript.exe') -Argument ('//B //NoLogo "' + (Join-Path $target 'Start-Kiosk.vbs') + '"')
$logon = New-ScheduledTaskTrigger -AtLogOn -User ([Security.Principal.WindowsIdentity]::GetCurrent().Name)
$retry = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$settings = New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId ([Security.Principal.WindowsIdentity]::GetCurrent().User.Value) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'Schaufenster - Offline Kiosk' -Action $action -Trigger @($logon,$retry) -Settings $settings -Principal $principal -Description 'Lokale Schaufenster-Diashow auf dem zweiten Monitor, mit geprüften Updates und Wiederherstellung.' -Force | Out-Null
$shell = New-Object -ComObject WScript.Shell
foreach ($folder in @([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Startup'))) {
    $link = Join-Path $folder 'Schaufenster - Monitor 2.lnk'
    if (Test-Path -LiteralPath $link) { Copy-Item -LiteralPath $link -Destination (Join-Path $backup ((Split-Path $folder -Leaf) + '.lnk')) }
    $shortcut = $shell.CreateShortcut($link)
    $shortcut.TargetPath = Join-Path $env:WINDIR 'System32\wscript.exe'
    $shortcut.Arguments = '//B //NoLogo "' + (Join-Path $target 'Start-Kiosk.vbs') + '"'
    $shortcut.WorkingDirectory = $target
    $shortcut.IconLocation = Join-Path $target 'schaufenster.ico'
    $shortcut.Save()
}
Write-Output "Installed verified release $($manifest.version) in $target. Backup: $backup"
