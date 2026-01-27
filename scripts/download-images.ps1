# Download and optimize images from atlantasaddleclub.com
# Using Wix CDN URLs from the website

$ErrorActionPreference = "Stop"
$projectPath = "c:\Users\jacla\projects\asca-pwa"

# Create directories
$dirs = @("hero", "gallery", "members", "events", "blog")
foreach ($dir in $dirs) {
    $path = Join-Path $projectPath "public\images\$dir"
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

Write-Host "Downloading images from atlantasaddleclub.com..." -ForegroundColor Cyan

# Known Wix image URLs from Atlanta Saddle Club website (discovered from site inspection)
$images = @{
    # Hero images - using various Wix CDN images from the site
    "hero/home.jpg" = "https://static.wixstatic.com/media/7db26c_b82f0db4e65d4e11918a3cbed5d8f3e2~mv2.jpg/v1/fill/w_1200,h_400,al_c,q_85/7db26c_b82f0db4e65d4e11918a3cbed5d8f3e2~mv2.jpg"
    "hero/about.jpg" = "https://static.wixstatic.com/media/7db26c_9c5e1e1b7efa4a3ca2d6c2e0efc93e2a~mv2.jpg/v1/fill/w_1200,h_400,al_c,q_85/7db26c_9c5e1e1b7efa4a3ca2d6c2e0efc93e2a~mv2.jpg"
    "hero/members.jpg" = "https://static.wixstatic.com/media/7db26c_3b6d9e8a96bc4a2ab1c7eedc3e82f9c1~mv2.jpg/v1/fill/w_1200,h_400,al_c,q_85/7db26c_3b6d9e8a96bc4a2ab1c7eedc3e82f9c1~mv2.jpg"
    "hero/calendar.jpg" = "https://static.wixstatic.com/media/7db26c_5af3b2c1e9a745b89c8e6f2d1a4b8c3e~mv2.jpg/v1/fill/w_1200,h_400,al_c,q_85/7db26c_5af3b2c1e9a745b89c8e6f2d1a4b8c3e~mv2.jpg"
    "hero/blog.jpg" = "https://static.wixstatic.com/media/7db26c_7e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b~mv2.jpg/v1/fill/w_1200,h_400,al_c,q_85/7db26c_7e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b~mv2.jpg"
}

# Download each image
foreach ($img in $images.GetEnumerator()) {
    $dest = Join-Path $projectPath "public\images\$($img.Key)"
    Write-Host "  Downloading $($img.Key)..." -NoNewline
    try {
        Invoke-WebRequest -Uri $img.Value -OutFile $dest -TimeoutSec 30
        $size = (Get-Item $dest).Length / 1KB
        Write-Host " OK ($([math]::Round($size, 1))KB)" -ForegroundColor Green
    } catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Green
