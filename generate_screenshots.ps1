Add-Type -AssemblyName System.Drawing

$artifactDir = "C:\Users\Freelancer\.gemini\antigravity\brain\ba09486f-44f7-4e98-9fd1-8532c3ef8084"
$outDir = "H:\SEO Monk\screenshots"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir }

$files = @("media__1784441437038.png", "media__1784441400248.png", "media__1784441356018.png")

for ($i = 0; $i -lt $files.Length; $i++) {
    $file = $files[$i]
    $srcPath = Join-Path $artifactDir $file
    
    if (Test-Path $srcPath) {
        $srcImg = [System.Drawing.Image]::FromFile($srcPath)
        
        $bmp = New-Object System.Drawing.Bitmap(1280, 800)
        $gfx = [System.Drawing.Graphics]::FromImage($bmp)
        $gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        
        # Draw background
        $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0f172a"))
        $gfx.FillRectangle($bgBrush, 0, 0, 1280, 800)
        
        $targetHeight = 650
        $scale = $targetHeight / $srcImg.Height
        $targetWidth = [int]($srcImg.Width * $scale)
        
        $x = [int]((1280 - $targetWidth) / 2)
        $y = [int]((800 - $targetHeight) / 2) + 20
        
        # Draw text at the top
        $font = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold)
        $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#ffffff"))
        
        $titles = @("Comprehensive SEO Dashboard", "Export Professional PDF Reports", "Configure Advanced Settings")
        $title = $titles[$i]
        
        $textSize = $gfx.MeasureString($title, $font)
        $textX = [int]((1280 - $textSize.Width) / 2)
        $gfx.DrawString($title, $font, $textBrush, $textX, 40)
        
        # Border
        $borderBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#334155"))
        $gfx.FillRectangle($borderBrush, $x - 2, $y - 2, $targetWidth + 4, $targetHeight + 4)
        
        $gfx.DrawImage($srcImg, $x, $y, $targetWidth, $targetHeight)
        
        $outFile = Join-Path $outDir "store_screenshot_$($i+1).png"
        $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $gfx.Dispose()
        $bmp.Dispose()
        $srcImg.Dispose()
        $bgBrush.Dispose()
        $borderBrush.Dispose()
        $font.Dispose()
        $textBrush.Dispose()
        
        Write-Output "Saved store_screenshot_$($i+1).png"
    }
}
