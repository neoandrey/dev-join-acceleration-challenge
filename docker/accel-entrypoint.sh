#!/bin/bash
function  start_app (){
        
        res=$1 
	while [  3 -gt 2 ];	
        do
	      echo "$res"	
              if [ "$res" == "Something wrong"  ] ||  [ "$res" == "something wrong"  ];
		   then
		   pgrep node | xargs -n1 kill
		   yarn "${APP_START_TYPE}" & 
                fi; 
                sleep $2
                if  [ "${WEB_PORT}" == '3002' ]; then
                 res=$( curl 'http://127.0.0.1:3002/a?dv=200&t=5' );
                elif [ "${WEB_PORT}" == '3001' ]; then 
                   res=$( curl 'http://127.0.0.1:3001/dv?vf=200&vi=5');
                elif [ "${WEB_PORT}" == '3000' ]; then
                   res=$( curl 'http://127.0.0.1:3000/calc?vf=200&vi=5&t=123' );
                fi
   done		

}
if [ "${WEB_PORT}" == '3000' ]; then
      cd  /opt/app/acceleration-calc
      yarn "${APP_START_TYPE}" &
      sleep 20s
      res=$( curl 'http://127.0.0.1:3000/calc?vf=200&vi=5&t=123' );
      start_app "$res"  "18s";
elif  [ "${WEB_PORT}" == '3002' ]; then
      cd  /opt/app/acceleration-a 
      yarn "${APP_START_TYPE}" &
      sleep 10s
      res=$( curl 'http://127.0.0.1:3002/a?dv=200&t=5' );		
      start_app "$res"  "4s";
elif [ "${WEB_PORT}" == '3001' ]; then
       cd  /opt/app/acceleration-dv
         yarn "${APP_START_TYPE}" &
      sleep 10s
	res=$( curl 'http://127.0.0.1:3001/dv?vf=200&vi=5')
	start_app "$res"  "4s";
fi
