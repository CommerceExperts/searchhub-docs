#!/bin/bash

cd $(basename $0)
docker build --tag "399621189843.dkr.ecr.eu-central-1.amazonaws.com/util/sphinx-docs:5.3.0" .
