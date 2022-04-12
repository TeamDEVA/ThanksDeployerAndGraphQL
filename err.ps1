if (-not (Test-Path -Path C:\DoesNotExist.txt)) {
      throw 'The file does not exist'
} else {
      Write-Host 'The file does exist'
}
Write-Host 'Continuing script regardless if file exists or not...'
