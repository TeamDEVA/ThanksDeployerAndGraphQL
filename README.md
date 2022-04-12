Haven't checked after merging yet, please continue to use your old graph-schema and mapping until it's all ok

# thanksGraph with Graphql
```
npm install --global @graphprotocol/graph-cli@latest
npm install --save @graphprotocol/graph-ts@latest
```

docker compose-up will need to be run in separate terminal to see the logs and errors (other wise you should pass -d flag to it)


```bash
cd dockerThings
docker-compose up 
cd ..
yarn codegen
yarn create-local
yarn build
yarn deploy-local
```

then see on termial which link should open to do a GUI query interface
