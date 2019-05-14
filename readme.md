#Challenge Summary 
	Using Helm, write the necessary Kubernetes deployment and service files that can be used to create the full application, 
	running 2 instances of each microservice. Only the calc of acceleration-calc microservices can be available outside of the kubernetes cluster.
	Run the application on a kubernetes cluster like Minikube or Docker for Mac.
	Make sure the application is stable.

### Proposed Solution

	This solution is based on a container (neoandrey/join-accel-challenge) that was built from node:alpine to run any single one of the
	microservices depending on the environment variable passed to the container at run time. In this container, node:alpine loaded with curl, yarn,
	a copy of the join acceleration challenge repository  and a HEALTHCHECK feature written with node which helps to confirm the status of the nodes,
	an entrypoint script which determines the  type of application that is run (i.e. accel-div, accel-calc,accel-diff ; where accel-div = accel-a).
	- **_Dockerfile_**
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

COPY  ./accel-entrypoint.sh ./
.js /opt/app/

EXPOSE $APP_PORT

HEALTHCHECK --interval=3s --timeout=2s --start-period=8s CMD node /opt/app/accel                                                                                                                                                             _health_check.js

CMD  ["sh","/opt/app/accel-entrypoint.sh"]
```
- **_ Health Check Nodejs script: accel_health_check.js _**

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
			  process.exit(0);
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
- **_ Container Entry Script:  accel-entrypoint.sh _**
```
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
```
- **_ Docker build command  _**
```
docker build   --build-arg APP_TYPE_1=acceleration-a \
               --build-arg APP_TYPE_2=acceleration-calc \
               --build-arg APP_TYPE_3=acceleration-dv   \
               --build-arg APP_PORT="3000 3001 3002"  \
               --build-arg APP_BASE_FOLDER=devops-challenge-master \
               --build-arg APP_REPO_SRC="https://codeload.github.com/join-com/devops-challenge/zip/master" \
               -t join-accel-challenge .
```
- **_ Docker run command  _**
```
docker run -d  -p3000:3000 --name accel_calc -e APP_START_TYPE=start -e WEB_PORT=3000  -e APP_TYPE=acceleration-calc neoandrey/join-accel-challenge
docker run -d  -p3001:3001  --name accel_dif -e APP_START_TYPE=start -e WEB_PORT=3001 -e APP_TYPE=acceleration-dv  neoandrey/join-accel-challenge
docker run -d  -p3002:3002 --name accel_div -e APP_START_TYPE=start  -e WEB_PORT=3002  -e APP_TYPE=acceleration-a  neoandrey/join-accel-challenge
```

##### 1. Using Docker-compose
         A possible solution can be achieved with Docker Compose ochestration by adding  an Autoheal container (e.g. willfarrell/autoheal) to a the join acceleration containers
- **_ Docker Compose  _** 
		```
version: '3.7'
services:
  accel_div:
    image: neoandrey/join-accel-challenge
    ports:
     - "3002:3002"
    env_file:
     - ./div.env
    environment:
      - production
  accel_diff:
    image: neoandrey/join-accel-challenge
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
  autoheal:
    restart: always
    image: willfarrell/autoheal
    environment:
       - AUTOHEAL_CONTAINER_LABEL=all
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
		```
- **_ ENV Files  _** 
#####1. calc.env
>APP_START_TYPE=start
>WEB_PORT=3000
>APP_TYPE=acceleration-calc
>DV_URL=http://accel_diff:3001/dv
>A_URL=http://accel_div:3002/a
#####2. dif.env
>APP_START_TYPE=start
>WEB_PORT=3001
>APP_TYPE=acceleration-dv
#####3. div.env
>APP_START_TYPE=start
>WEB_PORT=3002
>APP_TYPE=acceleration-a

The docker compose calc service  can be accessed via an aws ec2 instance through the following link: [calc](http://ec2-34-220-62-218.us-west-2.compute.amazonaws.com:3000/calc?vf=200&vi=5&t=123)
Please change the  parameters in the URL bar of the browser to test for different values.

##### 2. Using Kubernetes
- **_join-accel-deployment.yaml_** 
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: join-accel-deployment
spec:
  replicas: 2
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
        livenessProbe:
         exec:
          command:
           - node
           - /opt/app/accel_health_check.js
         initialDelaySeconds: 10
         periodSeconds: 5
         failureThreshold: 100
         timeoutSeconds: 3
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
        livenessProbe:
         exec:
          command:
           - node
           - /opt/app/accel_health_check.js
         initialDelaySeconds: 10
         periodSeconds: 5
         failureThreshold: 100
         timeoutSeconds: 3
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
- ** _ join-accel-service.yaml _** 
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
####Running 
** kubectl create  -f  join-accel-service.yaml **
** kubectl create  -f  join-accel-deployment.yaml **
**Helm: helm install ./join-accel-challenge"
**_ Calc Service Test command: curl 'http://192.168.39.112:30000/calc?vf=200&vi=5&t=1243' _**

