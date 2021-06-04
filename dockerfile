FROM node:10-alpine AS BUILD_IMAGE

# couchbase sdk requirements
RUN apk update && apk add curl bash python g++ make && rm -rf /var/cache/apk/*
# install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin


WORKDIR /apps/metis
COPY package*.json ./
RUN npm install
COPY . .

# remove development dependencies
# RUN npm prune --production
# run node prune
# RUN /usr/local/bin/node-prune
# remove unused dependencies
RUN rm -rf node_modules/rxjs/src/
RUN rm -rf node_modules/rxjs/bundles/
RUN rm -rf node_modules/rxjs/_esm5/
RUN rm -rf node_modules/rxjs/_esm2015/
RUN rm -rf node_modules/swagger-ui-dist/*.map
RUN rm -rf node_modules/couchbase/src/


FROM node:10-alpine

WORKDIR /apps/metis

# copy from build image
COPY --from=BUILD_IMAGE /apps/metis/ .
RUN npm install -g concurrently nodemon webpack plop 
EXPOSE 4000
CMD ["npm", "run", "dev"]
