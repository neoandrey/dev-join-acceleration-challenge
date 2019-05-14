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
 
