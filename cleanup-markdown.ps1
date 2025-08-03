# List of markdown files to delete (keeping README.md)
$filesToDelete = @(
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
    "WEBSITE_IMPROVEMENTS_SUMMARY.md"
)

$basePath = "c:\Users\keanm\OneDrive\Desktop\123"

Write-Host "Deleting unnecessary markdown files..." -ForegroundColor Yellow

foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Host "Deleted: $file" -ForegroundColor Green
    } else {
        Write-Host "Not found: $file" -ForegroundColor Red
    }
}

# Also delete markdown files in backend (except README.txt)
$backendPath = Join-Path $basePath "backend"
$backendMdFiles = Get-ChildItem -Path $backendPath -Filter "*.md" -ErrorAction SilentlyContinue

foreach ($file in $backendMdFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "Deleted backend file: $($file.Name)" -ForegroundColor Green
}

Write-Host "Cleanup complete!" -ForegroundColor Cyan
Write-Host "Kept: README.md (main project documentation)" -ForegroundColor Blue
