# Cleanup script to remove unnecessary files from main directory
$rootPath = "c:\Users\keanm\OneDrive\Desktop\123"

# Files to keep
$keepFiles = @(
    "README.md",
    "package.json", 
    "render.yaml",
    ".gitignore"
)

# Directories to keep
$keepDirs = @(
    "frontend",
    "backend", 
    ".git",
    ".vscode"
)

Write-Host "Starting cleanup of unnecessary files..."

# Remove all .md files except README.md
Get-ChildItem -Path $rootPath -Filter "*.md" | Where-Object { $_.Name -notin $keepFiles } | ForEach-Object {
    Write-Host "Removing: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Remove all .js files except essential ones
Get-ChildItem -Path $rootPath -Filter "*.js" | Where-Object { $_.Name -notin $keepFiles } | ForEach-Object {
    Write-Host "Removing: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Remove all .bat files
Get-ChildItem -Path $rootPath -Filter "*.bat" | ForEach-Object {
    Write-Host "Removing: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Remove all .ps1 files
Get-ChildItem -Path $rootPath -Filter "*.ps1" | ForEach-Object {
    Write-Host "Removing: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Remove all .sh files
Get-ChildItem -Path $rootPath -Filter "*.sh" | ForEach-Object {
    Write-Host "Removing: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Remove all .cmd files
Get-ChildItem -Path $rootPath -Filter "*.cmd" | ForEach-Object {
    Write-Host "Removing: $($_.Name)"
    Remove-Item $_.FullName -Force
}

# Remove .next directory if it exists in root (it should be in frontend)
$nextDir = Join-Path $rootPath ".next"
if (Test-Path $nextDir) {
    Write-Host "Removing .next directory from root..."
    Remove-Item $nextDir -Recurse -Force
}

Write-Host "Cleanup completed!"
