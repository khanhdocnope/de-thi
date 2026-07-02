# toggle-urls.ps1
# Script PowerShell chuyển đổi liên kết giữa Local (.html) và Production (URL sạch theo .htaccess)
# Đảm bảo giữ nguyên bảng mã UTF-8 tiếng Việt khi chạy

param (
    [string]$Mode = "toggle" # Lựa chọn: local, prod, toggle
)

# Tìm tất cả các file HTML và JS
$files = Get-ChildItem -Path . -Recurse -Include *.html, *.js -Exclude "toggle-urls.ps1"

# Danh sách các cặp thay thế
$replacements = @(
    # index.html <=> /
    @{ Local = 'href="index.html"'; Prod = 'href="/"' },
    @{ Local = "href='index.html'"; Prod = "href='/'" },
    @{ Local = '"index.html"'; Prod = '"/"' },
    @{ Local = "'index.html'"; Prod = "'/'" },
    @{ Local = 'href="index.html?'; Prod = 'href="/?' },
    @{ Local = '"index.html?'; Prod = '"/?' },
    @{ Local = "'index.html?"; Prod = "'/?" },
    
    # list-de.html <=> list-de
    @{ Local = 'href="list-de.html"'; Prod = 'href="list-de"' },
    @{ Local = "href='list-de.html'"; Prod = "href='list-de'" },
    @{ Local = 'href="list-de.html?'; Prod = 'href="list-de?' },
    @{ Local = "href='list-de.html?"; Prod = "href='list-de?" },
    @{ Local = '"list-de.html"'; Prod = '"list-de"' },
    @{ Local = "'list-de.html'"; Prod = "'list-de'" },
    @{ Local = '"list-de.html?'; Prod = '"list-de?' },
    @{ Local = "'list-de.html?"; Prod = "'list-de?" },
    @{ Local = 'window.location.href = "list-de.html?'; Prod = 'window.location.href = "list-de?' },
    @{ Local = "window.location.href = 'list-de.html?"; Prod = "window.location.href = 'list-de?" },
    @{ Local = 'href=`list-de.html?'; Prod = 'href=`list-de?' },
    
    # viewer.html <=> viewer
    @{ Local = 'href="viewer.html"'; Prod = 'href="viewer"' },
    @{ Local = "href='viewer.html'"; Prod = "href='viewer'" },
    @{ Local = 'href="viewer.html?'; Prod = 'href="viewer?' },
    @{ Local = "href='viewer.html?"; Prod = "href='viewer?" },
    @{ Local = '"viewer.html"'; Prod = '"viewer"' },
    @{ Local = "'viewer.html'"; Prod = "'viewer'" },
    @{ Local = '"viewer.html?'; Prod = '"viewer?' },
    @{ Local = "'viewer.html?"; Prod = "'viewer?" },
    @{ Local = 'window.location.href = "viewer.html?'; Prod = 'window.location.href = "viewer?' },
    @{ Local = "window.location.href = 'viewer.html?"; Prod = "window.location.href = 'viewer?" },
    @{ Local = 'href=`viewer.html?'; Prod = 'href=`viewer?' }
)

# Tự động phát hiện chế độ hiện tại dựa trên index.html với encoding UTF8
$currentMode = "prod"
if (Test-Path "index.html") {
    $indexContent = Get-Content "index.html" -Raw -Encoding UTF8
    if ($indexContent -match 'href="index.html"') {
        $currentMode = "local"
    }
}

# Xác định chế độ đích
$targetMode = $Mode
if ($targetMode -eq "toggle") {
    if ($currentMode -eq "local") {
        $targetMode = "prod"
    } else {
        $targetMode = "local"
    }
}

Write-Host "Che do URL hien tai: $currentMode" -ForegroundColor Cyan
Write-Host "Chuyen sang che do: $targetMode" -ForegroundColor Yellow

$updatedCount = 0
# Khởi tạo mã hóa UTF-8 không có ký hiệu BOM để tối ưu cho web
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

foreach ($file in $files) {
    if ($file.PSIsContainer) { continue }
    
    # Đọc file với encoding UTF-8
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $modified = $false
    
    foreach ($rep in $replacements) {
        if ($targetMode -eq "prod") {
            # Local -> Prod (Thay Local bằng Prod)
            if ($content.Contains($rep.Local)) {
                $content = $content.Replace($rep.Local, $rep.Prod)
                $modified = $true
            }
        } else {
            # Prod -> Local (Thay Prod bằng Local)
            if ($content.Contains($rep.Prod)) {
                $content = $content.Replace($rep.Prod, $rep.Local)
                $modified = $true
            }
        }
    }
    
    # Chỉ ghi đè khi nội dung thực sự thay đổi
    if ($modified -and ($content -ne $originalContent)) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        $relPath = Resolve-Path $file.FullName -Relative
        Write-Host "  Da cap nhat: $relPath" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host "Da hoan thanh! Da thay doi $updatedCount file(s). Du an dang chay o che do: $targetMode" -ForegroundColor Green
