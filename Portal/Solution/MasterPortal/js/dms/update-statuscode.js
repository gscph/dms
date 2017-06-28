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
        var statusVal = 0;
        recordArr = getSelectedRecords();

        if (statusValidator(recordArr, statusVal) > 0)
        { DMS.Notification.Error(statusValidator(recordArr, statusVal) +  " record(s) already active. Please select inactive records only.", true, 5000); return false; }


        recordArr = updatePermissionValidator(recordArr);
        if (recordArr.length <= 0) {
            DMS.Notification.Error('You are unauthorized to delete this record.');
            return false;
        }

        updateStatus(recordArr, "enable", $(this), deActivateButton);
    });
    // identifier for activate button
    activateButton.addClass('activate');

    deActivateButton.on('click', function (evt) {
        var recordArr = [];
        var statusVal = 1;
        recordArr = getSelectedRecords();

        if (statusValidator(recordArr,statusVal) > 0) 
        { DMS.Notification.Error(statusValidator(recordArr, statusVal) + " record(s) already inactive. Please select active records only.", true, 5000); return false; }

        recordArr = updatePermissionValidator(recordArr);
        if (recordArr.length <= 0) {
            DMS.Notification.Error('You are unauthorized to delete this record.');
            return false;
        }

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

function statusValidator(records,statusVal) {
    //data-attribute="statecode"
    var count = 0;
    for (x = 0 ; x < records.length ; x++) {
        var status, td = $('tr[data-id=' + records[x] + '] td[data-attribute="statecode"]');
        if (typeof td !== 'undefined') {
            status = td.data('value').Value;
            if (status == statusVal)
                count++;
        }
    }
        return count;
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

function updatePermissionValidator(records) {
    if (DMS.Settings.Permission.UpdateScope !== 756150000) {
        records.forEach(function (value, index) {
            var $tr = $('tr[data-id=' + value + ']');
            var tdGlobalRecord = $tr.find('td[data-attribute="gsc_isglobalrecord"]');

            if (typeof tdGlobalRecord !== 'undefined') {
                if (tdGlobalRecord.data('value') == true) {
                    records.splice(index, 1);
                    return true;
                }
            }

            if (DMS.Settings.Permission.UpdateScope == 756150002) {
                var tdBranchId = $tr.find('td[data-attribute="gsc_branchid"]');
                if (typeof tdBranchId !== 'undefined') {
                    var value = tdBranchId.data('value');
                    if (value !== "undefined" && value != null) {
                        if (value.Id != DMS.Settings.User.branchId)
                            records.splice(index, 1);
                    }
                    return true;
                }
            }
            else if(DMS.Settings.Permission.UpdateScope == 756150001)
            {
                var tdOwnerId = $tr.find('td[data-attribute="gsc_recordownerid"]');
                if (typeof tdOwnerId !== 'undefined') {
                    var value = tdOwnerId.data('value');
                    if (value !== "undefined" && value != null) {
                        if (value.Id != DMS.Settings.User.Id)
                            records.splice(index, 1);
                    }
                    return true;
                }
            }

        });
    }
    return records;
}



