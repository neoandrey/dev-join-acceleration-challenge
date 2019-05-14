FROM node:alpine

MAINTAINER Bolaji Aina <neoandey@yahoo.com>

ARG APP_TYPE
ARG APP_PORT
ARG APP_TYPE_1
ARG APP_TYPE_2
ARG APP_TYPE_3
ARG APP_BASE_FOLDER
ARG APP_REPO_SRC
ENV APP_START_TYPE=""
ENV APP_TYPE=""

WORKDIR /opt/app

RUN  apk add --no-cache --virtual .build-deps curl unzip  \
     && curl  -o yarn_latest.tar.gz  https://yarnpkg.com/latest.tar.gz \
     && mkdir -p  /opt \
     && mkdir -p  /opt/repo

ADD yarn_latest.tar.gz /opt/
ENV PATH "$PATH:/opt/yarn/bin"

RUN curl  -o repo.zip  "${APP_REPO_SRC}"  \
        &&  unzip -o  repo.zip -d /opt/repo/ \
        &&  cp -r /opt/repo/$APP_BASE_FOLDER/* /opt/app/ \
        &&  if [ -e /opt/app/$APP_TYPE_1  ]; then cd /opt/app/$APP_TYPE_1; fi \
        &&  if [ -e /opt/app/$APP_TYPE_1  ]; then yarn install; fi \
        &&  if [ -e /opt/app/$APP_TYPE_1  ]; then yarn build; fi \
        &&  if [ -e /opt/app/$APP_TYPE_2  ]; then cd /opt/app/$APP_TYPE_2; fi  \
        &&  if [ -e /opt/app/$APP_TYPE_2  ]; then yarn install; fi \
        &&  if [ -e /opt/app/$APP_TYPE_2  ]; then yarn build; fi\
        &&  if [ -e /opt/app/$APP_TYPE_3  ]; then cd /opt/app/$APP_TYPE_3; fi  \
        &&  if [ -e /opt/app/$APP_TYPE_3  ]; then yarn install; fi \
        &&  if [ -e /opt/app/$APP_TYPE_3  ]; then yarn build; fi \
        &&  rm -rf /opt/repo/

COPY  ./accel-entrypoint.sh ./accel_health_check.js /opt/app/

EXPOSE $APP_PORT

HEALTHCHECK --interval=3s --timeout=2s --start-period=8s CMD node /opt/app/accel_health_check.js

CMD  ["sh","/opt/app/accel-entrypoint.sh"]
