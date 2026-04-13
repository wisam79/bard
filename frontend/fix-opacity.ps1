$srcPath = 'E:\projects\bard\frontend\src'
$files = Get-ChildItem -Recurse -Include *.tsx -Path "$srcPath\pages", "$srcPath\components\features" | Where-Object { $_.FullName -notmatch 'node_modules' }

$replacements = [ordered]@{
    'text-brand-accent/15' = 'text-brand-muted/35'
    'text-brand-accent/20' = 'text-brand-muted/40'
    'text-brand-accent/25' = 'text-brand-muted/45'
    'text-brand-accent/30' = 'text-brand-muted/50'
    'text-brand-accent/40' = 'text-brand-muted/60'
    'placeholder:text-brand-accent/10' = 'placeholder:text-brand-muted/30'
    'bg-brand-surface/15' = 'bg-brand-surface/30'
    'bg-brand-surface/20' = 'bg-brand-surface/35'
    'bg-brand-surface/25' = 'bg-brand-surface/40'
    'bg-brand-dark/10' = 'bg-brand-dark/25'
    'bg-brand-dark/20' = 'bg-brand-dark/35'
    'bg-brand-dark/30' = 'bg-brand-dark/45'
    'border-brand-border/10' = 'border-brand-border/25'
    'border-brand-border/15' = 'border-brand-border/30'
    'border-brand-border/20' = 'border-brand-border/35'
    'text-white/10' = 'text-white/25'
    'text-white/15' = 'text-white/30'
    'bg-white/[0.02]' = 'bg-white/[0.04]'
    'bg-white/[0.03]' = 'bg-white/[0.05]'
    'bg-white/[0.04]' = 'bg-white/[0.06]'
    'border-white/[0.03]' = 'border-white/[0.06]'
    'border-white/[0.04]' = 'border-white/[0.07]'
    'border-white/[0.05]' = 'border-white/[0.08]'
    'border-white/[0.06]' = 'border-white/[0.09]'
}

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName)
    $original = $content
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content.Replace($old, $new)
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done!"
