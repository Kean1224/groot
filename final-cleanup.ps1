# Comprehensive cleanup script for All4You Auctioneers project
Write-Host "🧹 Starting comprehensive cleanup..." -ForegroundColor Cyan

$projectRoot = "c:\Users\keanm\OneDrive\Desktop\123"
Set-Location $projectRoot

# List of files to delete
$filesToDelete = @(
    # Markdown documentation files (keeping README.md)
    "ADMIN_SECURITY_IMPLEMENTATION.md",
    "AUCTION_COMPLETION_FEATURES.md", 
    "CUSTOM_DOMAIN_SETUP.md",
    "DEPLOYMENT.md",
    "DOMAIN_SETUP_SUMMARY.md",
    "EMAIL_SETUP_GUIDE.md",
    "EMAIL_VERIFICATION_SYSTEM.md",
    "github-sync-test.md",
    "GMAIL_SETUP_GUIDE.md",
    "IMAGE_IMPLEMENTATION_GUIDE.md",
    "NAVIGATION_ENHANCEMENT_COMPLETED.md",
    "PROFESSIONAL_EMAIL_INTEGRATION.md",
    "QUICK_BID_DROPDOWN_IMPLEMENTATION.md",
    "RENDER_DEPLOYMENT.md",
    "SMTP_EMAIL_SETUP_GUIDE.md",
    "SMTP_SETUP_GUIDE.md",
    "URGENT_RENDER_FIX.md",
    "WATCHLIST_AUTO_ADD_FEATURE.md",
    "WEBSITE_IMPROVEMENTS_SUMMARY.md",
    
    # Script files (no longer needed)
    "cleanup-markdown.ps1",
    "git-push.ps1",
    "push-to-github.bat",
    "push-to-github.ps1", 
    "push-to-github.sh",
    "git-push.cmd",
    "deploy-to-render.bat",
    "deploy-to-render.sh",
    "cleanup-all.bat",
    
    # Test/debug files
    "debug-connection.js",
    "test-backend.js",
    "test-cors.js"
)

$deletedCount = 0
$notFoundCount = 0

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        try {
            Remove-Item $fullPath -Force
            Write-Host "✅ Deleted: $file" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "❌ Failed to delete: $file" -ForegroundColor Red
        }
    } else {
        Write-Host "⚪ Not found: $file" -ForegroundColor Gray
        $notFoundCount++
    }
}

# Clean up backend markdown files
$backendPath = Join-Path $projectRoot "backend"
if (Test-Path $backendPath) {
    $backendMdFiles = Get-ChildItem -Path $backendPath -Filter "*.md" -ErrorAction SilentlyContinue
    foreach ($file in $backendMdFiles) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "✅ Deleted backend: $($file.Name)" -ForegroundColor Green
            $deletedCount++
        } catch {
            Write-Host "❌ Failed to delete backend: $($file.Name)" -ForegroundColor Red
        }
    }
}

Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Yellow
Write-Host "   Deleted: $deletedCount files" -ForegroundColor Green
Write-Host "   Not found: $notFoundCount files" -ForegroundColor Gray

Write-Host "`n📁 Files kept (important):" -ForegroundColor Blue
Write-Host "   ✅ README.md (project documentation)"
Write-Host "   ✅ package.json (project configuration)"
Write-Host "   ✅ render.yaml (deployment config)"
Write-Host "   ✅ .gitignore (git config)"
Write-Host "   ✅ frontend/ and backend/ directories"

Write-Host "`n🎉 Cleanup complete! Your project is now much cleaner." -ForegroundColor Cyan
Read-Host "Press Enter to continue"
