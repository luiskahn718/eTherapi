#/bin/bash

echo "-----------------------------"
echo "Install Bower components"
echo "-----------------------------"
bower install

echo "-----------------------------"
echo "Build min main.js to app.js"
echo "-----------------------------"
cd app/assets/javascripts/build
node r.js -o ../build.js