#!/bin/bash

clear

echo "Now install git and node.js......."

sudo apt-get update

clear

echo ""
echo "Now installing git version control..."
echo ""

sudo apt-get install git -y

clear

echo ""
echo "Now installing curl and node.js..."
echo ""

sudo apt-get install curl -y
sudo curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh 
sudo bash nodesource_setup.sh
sudo apt-get install nodejs -y

clear

echo ""
echo "Now installing Gravity's Dependencies..."
echo ""
echo "$PWD"

#!/bin/bash
npm install
echo "."
echo "Installation Complete"
echo "Gravity is now installed, run 'npm start' to launch the Gravity Platform"
echo "."
echo "."
exec bash
