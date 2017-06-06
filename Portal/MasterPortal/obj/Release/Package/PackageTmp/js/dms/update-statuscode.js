$(document).on("enableActivateDeactivate", function (event) {    
    var classes = 'btn btn-primary action disabled';   

    // create string icon = <i class="fa fa-check-cricle"><i/> 
    var activateIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-check');
    // create string icon = <i class="fa fa-times-cricle"><i/> 
    var deactivateIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-times');

    
    var activateButton = DMS.Helpers.CreateButton('button', classes, '', ' ACTIVATE', activateIcon);
    var deActivateButton = DMS.Helpers.CreateButton('button', classes, '', ' DEACTIVATE', deactivateIcon);

    activateButton.on('click', function (evt) {
        var recordArr = [];
        recordArr = getSelectedRecords();

      if(statusValidator(recordArr) == 0) return false;        

        updateStatus(recordArr, "enable", $(this), deActivateButton);
    });
    // identifier for activate button
    activateButton.addClass('activate');

    deActivateButton.on('click', function (evt) {
        var recordArr = [];
        recordArr = getSelectedRecords();

        if (statusValidator(recordArr) == 1) return false;

        updateStatus(recordArr, "disable", $(this), activateButton);
    });

    // identifier for deactivate button
    deActivateButton.addClass('deactivate');

    // bind event to rows
    $(document).bind('DOMNodeInserted', function (evt) {

        if ($(evt.target).hasClass('view-toolbar grid-actions')) {
            $(evt.target).append(activateButton);
            $(evt.target).append(deActivateButton);

            $(document).on("click", ".entity-grid.entitylist .view-grid table tbody tr", function (evt) {
                var recordArr = [];
                recordArr = getSelectedRecords();

                var element = $(this);

                activateButton.removeClass('disabled');
                deActivateButton.removeClass('disabled');

                if (recordArr.length == 0) {
                    activateButton.addClass('disabled');
                    deActivateButton.addClass('disabled');
                }
            });
        }       
        
    });   

});

function statusValidator(records) {
    //data-attribute="statecode"
    if (records.length == 1) {
        var status, td = $('tr[data-id=' + records[0] + '] td[data-attribute="statecode"]');
        if (typeof td !== 'undefined') {
            status = td.data('value').Value;
        }
        return status;
    }
}


function updateStatus(records, status, button, sibling) {
    var html = button.html();
    var logicalName = $('.entity-grid.entitylist').data("view-layouts")[0].Configuration.EntityName;
    var json = DMS.Helpers.CreateModel(records, logicalName, { Value: status });
    var url = "/api/Service/UpdateEntityStatus";
    

    button.addClass('disabled');
    button.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
    sibling.addClass('disabled');

    var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);   

    service.then(function () {      
        DMS.Notification.Success("Record(s) Updated!", true, 5000);
        $('.entity-grid.entitylist').trigger('refresh');
    }).always(function () {
        button.html(html);      
    });
}



