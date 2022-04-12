$myshell = New-Object -com "Wscript.Shell"

$p1=$args[0]
#$p2=$args[1]

if( $p1 ) {
  python .\replaceAdrress.py $p1
  Write-Host "just replace the address with " $p1
}

$x = (graph create --node http://localhost:8020/ realint2k/int2kthanks)
if(-not ($x) ){
  throw "yarn create-local failed"
} else {
  Write-Host $x
}

$x1 = (graph build)
if(-not ($x1)) {
  throw "yarn build failed"
} else {
  Write-Host $x1
}

$x2 = (yarn deploy-local)
if(-not ($x2)) {
  throw "yarn deploy-local failed"
} else {
  Write-Host $x2
  Write-Host "go to http://localhost:8000/subgraphs/name/realint2k/int2kthanks/graphql"
}

Write-Host "Done!"
#$myshell.sendkeys("{ENTER}")
