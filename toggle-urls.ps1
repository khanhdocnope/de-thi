# toggle-urls.ps1
# Script PowerShell chuyển đổi liên kết giữa Local (.html) và Production (URL sạch theo .htaccess)
# Đảm bảo giữ nguyên bảng mã UTF-8 tiếng Việt khi chạy và dùng đường dẫn tương đối

param (
    [string]$Mode = "toggle" # Lựa chọn: local, prod, toggle
)

# Xác định thư mục chứa kịch bản để hoạt động theo đường dẫn tương đối
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = $PSScriptRoot
}
if ([string]::IsNullOrEmpty($scriptDir)) {
    $scriptDir = "."
}

# Đồng bộ thư mục làm việc của PowerShell và hệ thống .NET về thư mục chứa kịch bản
Set-Location -Path $scriptDir
[System.IO.Directory]::SetCurrentDirectory($scriptDir)

# Tìm tất cả các file HTML và JS bằng đường dẫn tương đối
$files = Get-ChildItem -Path "." -Recurse -Include *.html, *.js -Exclude "toggle-urls.ps1"

# Danh sách các cặp thay thế
$replacements = @(
    # index.html <=> ./
    @{ Local = 'href="index.html"'; Prod = 'href="./"' },
    @{ Local = "href='index.html'"; Prod = "href='./'" },
    @{ Local = '"index.html"'; Prod = '"./"' },
    @{ Local = "'index.html'"; Prod = "'./'" },
    @{ Local = 'href="index.html?'; Prod = 'href="./?' },
    @{ Local = '"index.html?'; Prod = '"./?' },
    @{ Local = "'index.html?"; Prod = "'./?" },
    @{ Local = '`index.html?'; Prod = '`./?' },
    
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
    @{ Local = '`list-de.html?'; Prod = '`list-de?' },
    
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
    @{ Local = 'href=`viewer.html?'; Prod = 'href=`viewer?' },
    @{ Local = '`viewer.html?'; Prod = '`viewer?' },

    # game-lat-the.html <=> game-lat-the
    @{ Local = 'href="game-lat-the.html"'; Prod = 'href="game-lat-the"' },
    @{ Local = "href='game-lat-the.html'"; Prod = "href='game-lat-the'" },
    @{ Local = '"game-lat-the.html"'; Prod = '"game-lat-the"' },
    @{ Local = "'game-lat-the.html'"; Prod = "'game-lat-the'" },
    @{ Local = '`game-lat-the.html`'; Prod = '`game-lat-the`' },

    # game-sudoku.html <=> game-sudoku
    @{ Local = 'href="game-sudoku.html"'; Prod = 'href="game-sudoku"' },
    @{ Local = "href='game-sudoku.html'"; Prod = "href='game-sudoku'" },
    @{ Local = '"game-sudoku.html"'; Prod = '"game-sudoku"' },
    @{ Local = "'game-sudoku.html'"; Prod = "'game-sudoku'" },
    @{ Local = '`game-sudoku.html`'; Prod = '`game-sudoku`' }
)

# Tự động phát hiện chế độ hiện tại dựa trên index.html với đường dẫn tương đối
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
    
    # Lấy đường dẫn tương đối của tệp tin
    $relPath = Resolve-Path $file.FullName -Relative
    
    # Đọc file bằng đường dẫn tương đối
    $content = Get-Content $relPath -Raw -Encoding UTF8
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
    
    # Chỉ ghi đè khi nội dung thực sự thay đổi bằng đường dẫn tương đối
    if ($modified -and ($content -ne $originalContent)) {
        [System.IO.File]::WriteAllText($relPath, $content, $utf8NoBom)
        Write-Host "  Da cap nhat: $relPath" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host "Da hoan thanh! Da thay doi $updatedCount file(s). Du an dang chay o che do: $targetMode" -ForegroundColor Green
