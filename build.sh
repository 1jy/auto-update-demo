rm -rf ./build ./dist ./app/build
npm run build
mv ./build ./app/
electron-builder -m