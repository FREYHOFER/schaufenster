$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$edgePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path -LiteralPath $edgePath)) { $edgePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' }
$browserName = [IO.Path]::GetFileName($edgePath)
$profilePath = Join-Path $root ('browser-profile-' + [IO.Path]::GetFileNameWithoutExtension($edgePath))
$nodePath = Join-Path $root 'runtime\node.exe'
$serverPath = Join-Path $root 'server.mjs'
$baseUrl = 'http://127.0.0.1:4186'
$logPath = Join-Path $root 'watcher.log'
$created = $false
$mutex = [Threading.Mutex]::new($true, 'Local\SchaufensterOfflineKiosk', [ref]$created)
if (-not $created) { $mutex.Dispose(); exit 0 }

function Write-KioskLog([string]$message) {
    try {
        if ((Get-Item -LiteralPath $logPath -ErrorAction SilentlyContinue).Length -gt 2MB) { Move-Item -LiteralPath $logPath -Destination "$logPath.old" -Force }
        Add-Content -LiteralPath $logPath -Value ("{0:o} {1}" -f (Get-Date), $message)
    } catch {}
}

Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class KioskWindow {
    [DllImport("kernel32.dll")] private static extern uint SetThreadExecutionState(uint flags);
    public static void KeepAwake() { SetThreadExecutionState(0x80000003u); }
    public static void ReleaseAwake() { SetThreadExecutionState(0x80000000u); }
    [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr value);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr hwnd);
    [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hwnd, int command);
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hwnd, IntPtr after, int x, int y, int width, int height, uint flags);
}
'@
[void][KioskWindow]::SetProcessDpiAwarenessContext([IntPtr](-4))
Add-Type -AssemblyName System.Windows.Forms

function Get-DisplayBrowser {
    @(Get-CimInstance Win32_Process -Filter "Name='$browserName'" | Where-Object { $_.CommandLine -match ([regex]::Escape($profilePath) + '(?:"|\s|$)') -and $_.CommandLine -notlike '*--type=*' })
}

function Stop-DisplayBrowser {
    Get-DisplayBrowser | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
}

$missingSince = $null
$lastMonitor = ''
$healthFailures = 0
try {
    Write-KioskLog 'Watcher started.'
    while ($true) {
        try {
            [KioskWindow]::KeepAwake()
            $servers = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like "*$serverPath*" })
            if (-not $servers.Count) {
                Start-Process -FilePath $nodePath -ArgumentList @(('"{0}"' -f $serverPath)) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'server.stdout.log') -RedirectStandardError (Join-Path $root 'server.stderr.log')
                Write-KioskLog 'Local server restarted.'
                Start-Sleep -Seconds 2
            }
            try {
                $health = Invoke-RestMethod -Uri "$baseUrl/__kiosk/health" -TimeoutSec 4
                $healthFailures = 0
            } catch {
                $healthFailures++
                if ($healthFailures -ge 3) {
                    $servers | ForEach-Object { Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue }
                    $healthFailures = 0
                    Write-KioskLog 'Unresponsive local server stopped for recovery.'
                }
                throw
            }
            if (-not $health.ready) { throw 'No complete local release ready yet.' }
            $screens = @([System.Windows.Forms.Screen]::AllScreens | Where-Object { -not $_.Primary })
            $screen = $screens | Sort-Object DeviceName | Select-Object -First 1
            if (-not $screen) {
                if ($lastMonitor -ne 'absent') { Stop-DisplayBrowser; Write-KioskLog 'Waiting for a secondary monitor; leaving primary screen alone.'; $lastMonitor = 'absent' }
                Start-Sleep -Seconds 5
                continue
            }
            $bounds = $screen.Bounds
            $monitorKey = '{0}:{1},{2},{3},{4}' -f $screen.DeviceName,$bounds.X,$bounds.Y,$bounds.Width,$bounds.Height
            if ($lastMonitor -ne $monitorKey) { Write-KioskLog "Display target $monitorKey"; $lastMonitor = $monitorKey }
            $browser = Get-DisplayBrowser | Select-Object -First 1
            $process = if ($browser) { Get-Process -Id $browser.ProcessId -ErrorAction SilentlyContinue } else { $null }
            if ($process -and $process.MainWindowHandle -eq 0) {
                if (-not $missingSince) { $missingSince = Get-Date }
                if (((Get-Date) - $missingSince).TotalSeconds -gt 35) { Stop-DisplayBrowser; $process = $null; $missingSince = $null; Write-KioskLog 'Browser without a window restarted.' }
            } else { $missingSince = $null }
            if ($process -and ($health.heartbeatAge -gt 120000 -or $health.progressAge -gt 180000 -or (-not $process.Responding -and $health.heartbeatAge -gt 30000))) {
                Write-KioskLog "Display stalled: heartbeat=$($health.heartbeatAge), progress=$($health.progressAge). Restarting kiosk browser."
                Stop-DisplayBrowser
                $process = $null
            }
            if (-not $process) {
                Invoke-RestMethod -Method Post -Uri "$baseUrl/__kiosk/reset" -TimeoutSec 4 | Out-Null
                $arguments = @(
                    ('--user-data-dir="{0}"' -f $profilePath), '--no-first-run', '--kiosk', $baseUrl,
                    '--edge-kiosk-type=fullscreen', '--no-first-run', '--no-default-browser-check', '--noerrdialogs', '--disable-session-crashed-bubble',
                    ('--window-position={0},{1}' -f $bounds.X,$bounds.Y), ('--window-size={0},{1}' -f $bounds.Width,$bounds.Height)
                )
                # The kiosk is the visible display; hiding it prevents MainWindowHandle discovery.
                Start-Process -FilePath $edgePath -ArgumentList $arguments -WindowStyle Normal
                $missingSince = Get-Date
                Write-KioskLog 'Kiosk browser launched with local content.'
                Start-Sleep -Seconds 3
                $browser = Get-DisplayBrowser | Select-Object -First 1
                $process = if ($browser) { Get-Process -Id $browser.ProcessId -ErrorAction SilentlyContinue } else { $null }
            }
            if ($process -and $process.MainWindowHandle -ne 0) {
                if ([KioskWindow]::IsIconic($process.MainWindowHandle)) { [void][KioskWindow]::ShowWindowAsync($process.MainWindowHandle, 9) }
                [void][KioskWindow]::SetWindowPos($process.MainWindowHandle, [IntPtr](-1), $bounds.X, $bounds.Y, $bounds.Width, $bounds.Height, 0x0050)
            }
        } catch { Write-KioskLog "Recoverable error: $($_.Exception.Message)" }
        Start-Sleep -Seconds 5
    }
} finally { [KioskWindow]::ReleaseAwake(); $mutex.ReleaseMutex(); $mutex.Dispose() }
