
FROM node:10-alpine AS BUILD_IMAGE

# couchbase sdk requirements
RUN apk update && apk add curl bash python g++ make && rm -rf /var/cache/apk/*
# install node-prune (https://github.com/tj/node-prune)
# RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
COPY . .

RUN npm install -g concurrently nodemon webpack jest plop webpack-cli
