#!/bin/bash
if [ "${WEB_PORT}" == '3002' ]; then 
      cd  /opt/app/acceleration-a
fi
if [ "${WEB_PORT}" == '3001' ]; then 
        cd  /opt/app/acceleration-dv  
fi
if [ "${WEB_PORT}" == '3000' ]; then 
     cd  /opt/app/acceleration-calc
fi
yarn "${APP_START_TYPE}";

