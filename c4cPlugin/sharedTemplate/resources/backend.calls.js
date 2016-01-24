/*
 Invoke back-end call.
 Responsible for getting the CSRF token and reuse it.
 */
var BackendCall = {

    /*
     Perform the back-end call itself
     opts:
     successCallback: success callback function
     errorCallback: error callback function
     completeCallback: complete callback function
     method: HTTP Method (GET/POST/PUT/DELETE)
     url: Url to call the back-end
     data: back-end call parameters
     contentType: response content type (e.g. xml, json)
     */
    doCall: function doCall(opts) {
        opts.url = BackendCall.getPrefixUrl() + opts.url;
        $.ajax({
            url: opts.url,
            type: opts.method,
            data: opts.data,
            async: typeof(opts.async) === 'undefined' ? true : !!opts.async,
            headers: {
                "x-csrf-token": BackendCall.getCsrfHeaderValue(opts.method)
            },
            contentType: opts.contentType,
            success: function (data, textStatus, jqXHR) {
                var csrfToken = jqXHR.getResponseHeader("x-csrf-token");
                if (csrfToken) {
                    window.csrfToken = csrfToken;
                }
                opts.successCallback(data, textStatus, jqXHR);
            },
            error: function (jqXHR,textStatus,errorThrown) {
                if (jqXHR.getResponseHeader("x-csrf-token") === "Required") {
                    BackendCall.reExecuteWithNewToken(opts);
                } else {
                    opts.errorCallback(jqXHR,textStatus,errorThrown);
                }
            },
            complete: function(jqXHR,textStatus) {
                if (typeof opts.completeCallback === "function") {
                    opts.completeCallback(jqXHR, textStatus);
                }
            }
        });
    },
    
    /*
        Gets here if csrf token was required but missing, or was invalid (i.e. expired)
    */
    reExecuteWithNewToken: function reExecuteWithNewToken(opts) {
        $.ajax({
            url: BackendCall.getPrefixUrl() + window._generalNameSpace.appService + "/$metadata",
            headers: {
                "x-csrf-token":"Fetch"
            },
            success: function (data, textStatus, jqXHR) {
                var newToken = jqXHR.getResponseHeader("x-csrf-token");
                $.ajax({
                    url: opts.url,
                    type: opts.method,
                    data: opts.data,
                    headers: {
                        "x-csrf-token": newToken
                    },
                    contentType: opts.contentType,
                    success: function (data, textStatus, jqXHR) {
                        window.csrfToken = newToken;
                        opts.successCallback(data, textStatus, jqXHR);
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        opts.errorCallback(jqXHR,textStatus,errorThrown);
                    }
                });
                return;
            },
            error: function(jqXHR,textStatus,errorThrown){
                opts.errorCallback(jqXHR,textStatus,errorThrown);
            }
        });
        
    },

    /*
     Supports Preview or Runtime scenarios
     */

    getPrefixUrl: function getPrefixUrl(){
        try {
            if (sap.ushell && sap.ushell.services && sap.ushell.services.AppConfiguration) {
                return window._generalNameSpace.pathToDestination;
            }
        }catch(e){
        }
        return "/";
    },

    /*
     for GET method - request a new token
     for all others (PUT/POST/DELETE) use the cached csrf token
     */
    getCsrfHeaderValue: function getCsrfHeaderValue(method) {
        if (method === "GET") {
            return "Fetch";
        } else {
            return window.csrfToken || "";
        }

    }

};