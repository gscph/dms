var Service = function (type, url, params, errorHandler, successHandler) {

    var options = {
        type: type,
        url: url,
        contentType: "application/json; charset=utf-8",    
        async: true,
        cache: false
    }

    if (typeof params != null) {
        options.data = params;
    }

    var ajax = $.ajax(options);

    if (typeof errorHandler !== 'undefined') {
        ajax.error(errorHandler);
    }
   

    return ajax;
}


