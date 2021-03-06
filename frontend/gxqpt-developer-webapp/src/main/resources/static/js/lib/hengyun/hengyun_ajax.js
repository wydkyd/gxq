//使用闭包，避免与外部函数有命名冲突
(function (){

		/***************************拦截器配置中心  start**************************************/
		//调用前拦截器
		var invokeBeforeInterceptor = [loginTimeoutCheck,addResubmitIfNeed];
		//Ajax请求成功后   没有响应用户的success前的调用拦截器
		var responseSuccessBeforeInterceptor = [webSessionTimeoutCheck];
		//Ajax请求成功后   响应用户的success后的调用拦截器
		var responseSuccessAfterInterceptor = [];
		
		//Ajax请求错误后   没有响应用户的error前的调用拦截器
		var responseErrorBeforeInterceptor = [];
		//Ajax请求错误后   响应用户的error后的调用拦截器
		var responseErrorAfterInterceptor = [defaultErrorHandler];
		
		//Ajax请求返回后（不管成功失败），调用完所有的方法后   最后的调用工作   
		var invokeAfterInterceptor = [delResubmitIfNeed];
		/****************************拦截器配置中心  end**************************************/
		
		
		
		/**
		 * 中科恒运的Ajax方法，所有的Ajax请求方法必须使用此来做请求。
		 * 
		 * 在这里统一使用的好处是：我们可以使用aop切面编程。比如经常遇见的是用户在填写表单，但是在提交的时刻session失效了，
		 * 那么此时我们可以再这里做统一的处理，比如打开另外的界面，让用户登陆后在进行表单的提交。好处多多啊！想想都兴奋、
		 * 还可以做防止表单的重复提交
		 * @param setting 参数和jquery的ajax请求参数是一模一样的哦。
		 */
		function ajaxHengyun(setting){
			//Ajax请求前调用
			if(!invokeBefore(setting))
				//不允许调用
				return ;
			var successFunction = setting["success"];
			
			//追加请求头
			var headers = setting["headers"];
			setting["headers"] = addHeaders(headers);
			
			setting["success"] = function (data, textStatus, jqXHR){
				//Ajax请求处理成功后，在回调用户处前的调用
				if(!responseSuccessBefore(setting,data, textStatus, jqXHR))
					return ;
				if(successFunction){
					//回调用户响应成功的方法
					////在调用原始success方法时，替换包装类，给其一个this上下文空间     因为在ajax请求中，jquery给了这么一个上下文空间
					var warpSuccess = setting["success"];
					setting["success"] = successFunction;
					setting.success(data, textStatus, jqXHR);
					setting["success"] = warpSuccess;
				}
				//用户在响应成功调用后的方法调用
				if(!responseSuccessAfter(setting,data, textStatus, jqXHR))
					return ;
				//不管是错误返回  还是正确返回   都会在最后调用一次
				invokeAfter(setting);
			};
			var errorFunction = setting["error"];
			setting["error"] = function (XMLHttpRequest, textStatus, errorThrown){
				if(!responseErrorBefore(setting,XMLHttpRequest, textStatus, errorThrown))
					return ;
				if(errorFunction){
					//在调用原始error方法时，替换包装类，给其一个this上下文空间     因为在ajax请求中，jquery给了这么一个上下文空间
					var warpError = setting["error"];
					setting["error"] = errorFunction;
					setting.error(XMLHttpRequest, textStatus, errorThrown);
					setting["error"] = warpError;
				}
				if(!responseErrorAfter(setting,XMLHttpRequest, textStatus, errorThrown))
					return ;
				invokeAfter(setting);
			};
			$.ajax(setting);
		}
	
		function addHeaders(headers){
			
			if(!headers){
				headers = {};
			}
			
			if(!headers["token"]){
				headers["token"] = getCurToken();
			}
			return headers;
		}
	
	
		function getCurToken() {
			return $.cookie("_token");
		}
	
	
	
		//需要定义的全局变量
		//记录正在提交的表单表示   为防止表单重复提交
		var submitingAjaxTag = new Object();
		var isDebug = false;
	
	
		/**
		 * 掉用前处理    可以判断是否允许Ajax请求调用
		 * @param setting
		 * @returns {Boolean}  true 表示允许    false 表示拒绝
		 */
		function invokeBefore(setting){
			//
			
			printLog(setting);
			return invokeInterceptor(invokeBeforeInterceptor, setting);
			
		}
	
		function printLog(setting){
			
			if(isDebug)
				console.log(setting);
		}
	
		function responseSuccessBefore(setting,data, textStatus, jqXHR){
			
			printLog("responseSuccessBefore:" + data);
			return invokeInterceptor(responseSuccessBeforeInterceptor, setting,data, textStatus, jqXHR);
		}
		function responseSuccessAfter(setting,data, textStatus, jqXHR){
			
			printLog("responseSuccessAfter:" + data);
			return invokeInterceptor(responseSuccessAfterInterceptor, setting,data, textStatus, jqXHR);
		}
		function invokeAfter(setting){
			//delResubmitIfNeed(setting)
			printLog("invokeAfter :" + setting);
			return invokeInterceptor(invokeAfterInterceptor, setting);
		}
		function responseErrorBefore(setting,XMLHttpRequest, textStatus, errorThrown){
			
			printLog("responseErrorBefore:" + textStatus);
			return invokeInterceptor(responseErrorBeforeInterceptor, setting,XMLHttpRequest, textStatus, errorThrown);
		}
		function responseErrorAfter(setting,XMLHttpRequest, textStatus, errorThrown){
			
			printLog("responseErrorAfter :" + textStatus);
			return invokeInterceptor(responseErrorAfterInterceptor, setting,XMLHttpRequest, textStatus, errorThrown);
		}
	
	
		//写拦截器链   
		/***invokeBefore(setting)调用的拦截器   start***/
		//记录正在提交的表单表示   为防止表单重复提交
		function addResubmitIfNeed(setting){
			
			var submitId = getSubmitTag(setting);
			if(submitId == null){
				//不存在表单提交id   那么说明不需要防止表单重复提交    所以永远允许提交
				return true;
			}
			
			var exist = submitingAjaxTag.hasOwnProperty(submitId);
			if(exist){
				printLog(submitId+"已经在提交中了，请耐心等待哈");
				return false;
			}
			submitingAjaxTag[submitId] = 1;
			return true;
		}
		/***invokeBefore(setting)调用的拦截器   end***/
	
		/***invokeAfter(setting)调用的拦截器    start***/
		/**
		 * 解除禁止Ajax请求调用的表单提交
		 */
		function delResubmitIfNeed(setting){
			
			var submitId = getSubmitTag(setting);
			if(submitId == null){
				return ;
			}
			printLog("解除Ajax表单："+submitId+"的禁止提交功能");
			delete submitingAjaxTag[submitId];
		}
		/***invokeAfter(setting)调用的拦截器    end***/
	
	
		/***responseSuccessBefore(setting,data, textStatus, jqXHR)调用的拦截器    start***/
		//在提交表单的时候，用户长时间没有与服务器交流    我们可以让用户在新打开界面去登陆    然后再来提交表单
		function webSessionTimeoutCheck(setting,data, textStatus, jqXHR){
			
			if(!data)
				return true;
			var jsdata = data;
			
			if((typeof data) == 'string'){
				try{
					jsdata = eval("("+data+")");
				} catch(e){
					return true;
				}
			};
			
			if(data["errcode"] == 40001 || data["errcode"] == -9999 || data["errcode"] == 40003 || data["errcode"] == 40005){
		        $.ajax({
		            type:"POST",
		            async:false,
		            url: $.cookie("_cp") + "/refreshToken",
		            data:JSON.stringify(data),
		            success:function(rows){
		                if (rows){
							//写cookie
		                    $.cookie("_token", rows);
		                } else {
		                	toLoginout();
						}
		            }
				});
				return false;
			}
			return true;
		}
	
		function toLoginout(){
			
			location.href = "/gxqpt-center/logout";
		}
		/***responseSuccessBefore调用的拦截器    end***/
	
	
	
		/***通用方法   将被上面多个方法调用 start****/
		function getSubmitTag(setting){
			
			var submitId = setting["submitId"];
			if(!submitId && submitId != 0){
				//不存在表单提交id   那么说明不需要防止表单重复提交    所以永远允许提交
				return null;
			}
			return submitId;
		}
	
		function invokeInterceptor(interceptors,parms1,parms2,parms3,parms4,parms5,parms6,parms7,parms9,parms8){
			
			if(interceptors.length == 0)
				return true;
			var isContinue = true;
			for (var i = 0; i < interceptors.length; i++) {
				 isContinue = interceptors[i](parms1,parms2,parms3,parms4,parms5,parms6,parms7,parms9,parms8);
				 if(!isContinue)
					 return false;
			}
			return isContinue;
		}
		function loginTimeoutCheck(){
			var token = getCurToken();
			var isLogin = (token != null && token);
			var login_time_out = 30*60*1000;
			var currentDatetime = new Date().getTime();
			var next_time_out = localStorage.getItem("login_time_out");
			if(!next_time_out){
				var update_next_time_out = currentDatetime + login_time_out;
				localStorage.setItem("login_time_out",update_next_time_out+"");
				return true;
			} else {
				next_time_out = parseFloat(next_time_out);
				if(currentDatetime > next_time_out && isLogin){
					
					alert("登录超时！请重新登录");
					localStorage.removeItem("login_time_out");
					toLoginout(); //去登录
					return false;
				} else {
					
					var update_next_time_out = currentDatetime + login_time_out;
					localStorage.setItem("login_time_out",update_next_time_out+"");
					return true;
				}
			}
		}
		/***通用方法   将被上面多个方法调用 end****/
		/*************兜底的错误处理者*********************/
		function defaultErrorHandler(setting,XMLHttpRequest, textStatus, errorThrown){
	
			try{
				if(XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.result && XMLHttpRequest.responseJSON.result.errmsg)
					alert(XMLHttpRequest.responseJSON.result.errmsg);
			} catch(e){
			}
		}
		window.ajaxHengyun = ajaxHengyun;
})();