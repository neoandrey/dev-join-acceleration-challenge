### Challenge Summary 
	Using Helm, write the necessary Kubernetes deployment and service files that can be used to create the full application, 
	running 2 instances of each microservice. Only the calc of acceleration-calc microservices can be available outside of the kubernetes cluster.
	Run the application on a kubernetes cluster like Minikube or Docker for Mac.
	Make sure the application is stable.

### Proposed Solution
This solution is based on a container (neoandrey/join-accel-challenge) that was built from node:alpine to run any single one of the microservices depending on the environment variable passed to the container at run time. In this container, node:alpine loaded with curl, yarn, a copy of the join acceleration challenge repository  and a HEALTHCHECK feature written with node which helps to confirm the status of the nodes, an entrypoint script which determines the  type of application that is run and monitors the containers to make sure they are healthy. (i.e. accel-div, accel-calc,accel-diff ; where accel-div = accel-a).

#### Dockerfile
```
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

RUN  apk add --no-cache --virtual .build-deps curl unzip yarn  \
     && mkdir -p  /opt \
     && mkdir -p  /opt/repo
     
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

COPY  ./accel-entrypoint.sh ./
.js /opt/app/

EXPOSE $APP_PORT

HEALTHCHECK --interval=3s --timeout=2s --start-period=8s CMD node /opt/app/accel                                            _health_check.js

CMD  ["sh","/opt/app/accel-entrypoint.sh"]

```
##### Health Check Nodejs script: 
*accel_health_check.js
``` 
var http = require("http");
const port = process.env.WEB_PORT;
const checkInterval = process.env.CHECK_INTERVAL?process.env.CHECK_INTERVAL:1000 ;
var   reqUrl = '';
var   request = '';

switch(port){
case  '3000':
reqUrl = 'http://127.0.0.1:3000/calc?vf=200&vi=5&t=123';

request = http.get(reqUrl, res => {
	res.setEncoding("utf8");
	let body = "";
	res.on("data", data => {
			  body += data;
	});
	res.on("end", () => {
			if(body.toString().toLowerCase()=='something wrong'){
			  console.log('There is something wrong with the calc module. Returned: '+body.toString()+'. Exiting now...');
			  process.exit(1);
			}else{

					var returnedData  = JSON.parse(body);
					if( returnedData.a=="1.5853658536585367"){
							console.log('Calc module returned '+returnedData.a);
									 process.exit(0);
							}


			}

	});
});

request.setTimeout( checkInterval, function( ) {
process.exit(1);
});

break;
case  '3001':
reqUrl = 'http://127.0.0.1:3001/dv?vf=200&vi=5';

request = http.get(reqUrl, res => {
	res.setEncoding("utf8");
	let body = "";
	res.on("data", data => {
			  body += data;
	});
	res.on("end", () => {
			if(body.toString().toLowerCase()=='something wrong'){
					console.log('There is something wrong with the difference module. Exiting now...');
					 process.exit(1);
			}else{
					var returnedData  = JSON.parse(body);
					if( returnedData.dv==195){
							console.log('Div module returned '+returnedData.a);
											  process.exit(0);
							}

			}

	});
});
break;
case '3002':

reqUrl  =  'http://127.0.0.1:3002/a?dv=200&t=5';

request = http.get(reqUrl, res => {
	res.setEncoding("utf8");
	let body = "";
	res.on("data", data => {
			  body += data;
	});
	res.on("end", () => {
			if(body.toString().toLowerCase()=='something wrong'){
					console.log('There is something wrong with the div module. Exiting now...');
					 process.exit(1);
			}else{
					var returnedData  = JSON.parse(body);
					if( returnedData.a==40){
							console.log('Accel module returned '+returnedData.a);
											  process.exit(0);
							   }

			}

	});
});

request.setTimeout( checkInterval, function( ) {
process.exit(1);
});
break;
default:
reqUrl='http://127.0.0.1:3000/calc?vf=200&vi=5&t=123'

request = http.get(reqUrl, res => {
	res.setEncoding("utf8");
	let body = "";
	res.on("data", data => {
			  body += data;
	});
	res.on("end", () => {
			if(body.toString().toLowerCase()=='something wrong'){
					console.log('There is something wrong with the calc module. Exiting now...');
					 process.exit(0);
			}else{
					var returnedData  = JSON.parse(body);
					if( returnedData.a){
							console.log('cal module returned '+returnedData.a);
											  process.exit(0);
							}

			}

	});
});

request.setTimeout( checkInterval, function( ) {
process.exit(1);
});

}
```
_Container Entry Script:  accel-entrypoint.sh_
```
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

```
Docker Build Command
```
docker build   --build-arg APP_TYPE_1=acceleration-a \
               --build-arg APP_TYPE_2=acceleration-calc \
               --build-arg APP_TYPE_3=acceleration-dv   \
               --build-arg APP_PORT="3000 3001 3002"  \
               --build-arg APP_BASE_FOLDER=devops-challenge-master \
               --build-arg APP_REPO_SRC="https://codeload.github.com/join-com/devops-challenge/zip/master" \
               -t join-accel-challenge .
```
Docker Run Command
```
docker run -d  -p3001:3001  --name accel_dif -e APP_START_TYPE=start -e WEB_PORT=3001 -e APP_TYPE=acceleration-dv  neoandrey/join-accel-challenge
docker run -d  -p3002:3002 --name accel_div -e APP_START_TYPE=start  -e WEB_PORT=3002  -e APP_TYPE=acceleration-a  neoandrey/join-accel-challenge`
docker run -d  --name accel_calc  -p3000:3000 -e APP_START_TYPE=dev   -e WEB_PORT=3000  -e DV_URL='http://172.17.0.3:3001/dv' -e A_URL='http://172.17.0.2:3002/a'  -e APP_TYPE=acceleration-calc join-accel-challenge
#note that the ip of the other containers should be used for the manual run of accel_calc
```
##### 1. Using Docker-compose
A possible solution can be achieved with Docker Compose ochestration since the accel-entrypoint.sh entry point of the containers monitors the health status of the containers and restarts th containers that are not producing desired results:
_Docker Compose_
```
version: '3'
services:
  accel_div:
    image: neoandrey/join-accel-challenge
    restart: always
    ports:
     - "3002:3002"
    env_file:
     - ./div.env
    environment:
      - production
  accel_diff:
    image: neoandrey/join-accel-challenge
    restart: always
    ports:
     - "3001:3001"
    env_file:
     - ./diff.env
    environment:
      - production
  accel_calc:
    image: neoandrey/join-accel-challenge
    ports:
     - "3000:3000"
    env_file:
     - ./calc.env
    environment:
      - production
    depends_on:
      - accel_div
      - accel_diff
   ```
 cronjob for restarting uhealthy containers
 ```
 #!/bin/bash
cd  /home/ec2-user/docker/join/
docker-compose-restart(){
    sudo docker-compose stop $@
    sudo docker-compose rm -f -v $@
    sudo docker-compose create --force-recreate $@
    sudo docker-compose start $@
}

res=$( docker inspect join_accel_diff_1  | grep Status.*h )
res=$(cut -d':' -f2 <<<"$res")
res=$(cut -d',' -f1 <<<"$res")
echo  "accel_diff: ${res}"
if [ $res != '"healthy"' ]
   then
   $( docker-compose-restart accel_diff);
fi

res=$( docker inspect join_accel_div_1 | grep Status.*h )
res=$(cut -d':' -f2 <<<"$res")
res=$(cut -d',' -f1 <<<"$res")
echo  "accel_div - ${res}"

if [ $res != '"healthy"' ]
   then
    $( docker-compose-restart accel_div );
fi
 ```
 _ENV Files_
##### 1. calc.env
```
 APP_START_TYPE=start
 WEB_PORT=3000
 APP_TYPE=acceleration-calc
 DV_URL=http://accel_diff:3001/dv
 A_URL=http://accel_div:3002/a
 ```

##### 2. dif.env
```
 APP_START_TYPE=start
 WEB_PORT=3001
 APP_TYPE=acceleration-dv
```
##### 3. div.env
```
APP_START_TYPE=start
 WEB_PORT=3002
 APP_TYPE=acceleration-a
```
The docker compose calc service  can be accessed via an aws ec2 instance through the following link:

>[calc](http://ec2-54-70-85-109.us-west-2.compute.amazonaws.com:3000/calc?vf=200&vi=5&t=123)

Please change the  parameters in the URL bar of the browser to test for different values.

##### 2. Using Kubernetes
_join-accel-deployment.yaml_
```apiVersion: apps/v1
kind: Deployment
metadata:
  name: join-accel-deployment
spec:
  replicas: {{ $.Values.replicas }}
  selector:
    matchLabels:
      app: join-accel-challenge-app
  template:
    metadata:
      labels:
        app: join-accel-challenge-app
    spec:
      containers:
      - image: neoandrey/join-accel-challenge
        name: accel-diff
        env:
        - name: APP_START_TYPE
          value: "start"
        - name: WEB_PORT
          value: "3001"
        - name: APP_TYPE
          value: "acceleration-dv"
        ports:
        - containerPort: 3001
        readinessProbe:
         tcpSocket:
          port: 3001
         initialDelaySeconds: {{ $.Values.readinessInitialDelaySeconds }}
         periodSeconds: {{ $.Values.readinessPeriodSeconds }}
         failureThreshold: {{ $.Values.readinessFailureThreshold }}
         timeoutSeconds: {{ $.Values.readinessTimeSeconds }}
        livenessProbe:
         exec:
          command:
           - node
           - /opt/app/accel_health_check.js
         initialDelaySeconds: {{ $.Values.livenessInitialDelaySeconds }}
         periodSeconds: {{ $.Values.livenessPeriodSeconds }}
         failureThreshold: {{ $.Values.livenessFailureThreshold }}
         timeoutSeconds: {{ $.Values.livenessTimeSeconds }}
      - image: neoandrey/join-accel-challenge
        name: accel-div
        env:
         - name: APP_START_TYPE
           value: "start"
         - name: WEB_PORT
           value: "3002"
         - name: APP_TYPE
           value: "acceleration-a"
        ports:
        - containerPort: 3002
        readinessProbe:
         tcpSocket:
          port: 3002
         initialDelaySeconds: {{ $.Values.readinessInitialDelaySeconds }}
         periodSeconds: {{ $.Values.readinessPeriodSeconds }}
         failureThreshold: {{ $.Values.readinessFailureThreshold }}
         timeoutSeconds: {{ $.Values.readinessTimeSeconds }}
        livenessProbe:
         exec:
          command:
           - node
           - /opt/app/accel_health_check.js
         initialDelaySeconds: {{ $.Values.livenessInitialDelaySeconds }}
         periodSeconds: {{ $.Values.livenessPeriodSeconds }}
         failureThreshold: {{ $.Values.livenessFailureThreshold }}
         timeoutSeconds: {{ $.Values.livenessTimeSeconds }}
      - image: neoandrey/join-accel-challenge
        name: accel-calc
        env:
        - name: APP_START_TYPE
          value: "start"
        - name: WEB_PORT
          value: "3000"
        - name: APP_TYPE
          value: "acceleration-calc"
        - name: DV_URL
          value: "http://127.0.0.1:3001/dv"
        - name: A_URL
          value: "http://127.0.0.1:3002/a"
        ports:
        - containerPort: 3000


```
_join-accel-service.yaml_

```
apiVersion: v1
kind: Service
metadata:
 labels:
   run: join-accel-service
 name: join-accel-service
spec:
  externalTrafficPolicy: Cluster
  selector:
   app: join-accel-challenge-app
  type: NodePort
  ports:
   - protocol: TCP
     nodePort: 30000
     port: 3000
     targetPort: 3000
```
#### Running 
```
kubectl create  -f  join-accel-service.yaml
kubectl create  -f  join-accel-deployment.yaml
Helm: helm install ./join-accel-challenge
```
Calc Service Test command:
```
minikubeIp=192.168.39.112
curl "http://${minikubeIp}:30000/calc?vf=200&vi=5&t=1243"
```
