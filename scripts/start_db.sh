#!/bin/bash

if [ "${PWD##*/}" == "Up2Date" ]
then
    mkdir -p ./db/data
    mkdir -p ./db/log
	mongod --dbpath ./db/data --logpath ./db/log/log.txt
else
	echo ERROR: Run .sh from Up2Date using scripts/start_db.sh instead.
fi