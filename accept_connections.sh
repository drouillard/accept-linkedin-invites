#!/bin/bash

# Install the Selenium server, Chromedriver connect if they don't already exist
if [[ ! -f node_modules/.bin/start_selenium_with_chromedriver ]]; then
    echo "Installing selenum/webdriver server"
    node_modules/.bin/install_selenium
    node_modules/.bin/install_chromedriver
fi

#Run the selenium server with chromedriver:
echo "Launching webdriver process with default settings..."
node_modules/.bin/start_selenium_with_chromedriver &

#Get pid of webdriver/selenium server process
webdriver_process_pid=$!
echo "Webdriver process id"
echo $webdriver_process_pid

#wait for server to start
sleep 20

#run process to drive chrome to accept connections
echo "Accepting LinkedIn Invites..."
node index.js

#kill webdriver server
#TODO: access sub process pid or kill all chromedriver processes
#ps -o pid,command | grep chromedriver | grep -v grep | awk -F" " '{print $1}'

echo "Killing webdriver server."
kill -9 $webdriver_process_pid

echo "Done."

