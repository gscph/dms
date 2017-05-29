// Created by: Jessica Casupanan 11/22/2016
// Description: Custom button for Close as Won and Close as Lost
$(document).ready(function () {
  $(document).trigger("enableBulkDelete");
  
$(document).bind('DOMNodeInserted', function (evt) {
        if ($(evt.target).hasClass('view-toolbar grid-actions')) {
		//Create buttons
		$btnLost = DMS.Helpers.CreateButton('button',"btn-primary btn CloseAsLost", '', ' CLOSE AS LOST', DMS.Helpers.CreateFontAwesomeIcon('fa-unlink'));
		$btnWon = DMS.Helpers.CreateButton('button',"btn-primary btn CloseAsWon", '', ' CLOSE AS WON', DMS.Helpers.CreateFontAwesomeIcon('fa-trophy'));
		//Onclick Functions
		$btnLost.click(function(evt){
		evt.preventDefault();
		var recordArr = [];
		recordArr = getSelectedRecords();
		if (recordArr.length == 0) {DMS.Notification.Error("Please select a record first.",true,5000);return false;}
		if (statusValidator(recordArr) == 2 || statusValidator(recordArr) == 1) {DMS.Notification.Error("Opportunity already closed.",true,5000); return false;}
		for (var x = 0; x < recordArr.length; x++)
		{
		var entityId = recordArr[x];
        var workflowName = "Opportunity - Close as Lost";

        $.ajax({
            type: "PUT",
            url: "/api/Service/RunWorkFlow/?workflowName=" + workflowName + "&entityId=" + entityId,
            success: function (response) {
               // DMS.Notification.Success("Record(s) Updated!", true, 5000);
                var url = document.location.protocol + '//' +
                    document.location.host + (document.location.host.indexOf("demo.adxstudio.com") != -1
                    ? document.location.pathname.split("/").slice(0, 3).join("/")
                    : "") + '/Cache.axd?Message=InvalidateAll&d=' +
                    (new Date()).valueOf();
                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.send(null); window.location.reload(true);
                console.log("success");
				
            }
        }).error(function (xhr, textStatus, errorMessage) { alert(errorMessage); DMS.Notification.Error(errorMessage,true,5000);
        console.log(errorMessage); });
		}});
		
		$btnWon.click(function(evt){
		evt.preventDefault();
		var recordArr = [];
		recordArr = getSelectedRecords();
		if (recordArr.length == 0) {DMS.Notification.Error("Please select a record first.",true,5000);return false;}
		if (statusValidator(recordArr) == 2 || statusValidator(recordArr) == 1) {DMS.Notification.Error("Opportunity already closed.",true,5000); return false;}
		for (var x = 0; x < recordArr.length; x++)
		{
		var entityId = recordArr[x];
        var workflowName = "Opportunity - Close as Won";

        $.ajax({
            type: "PUT",
            url: "/api/Service/RunWorkFlow/?workflowName=" + workflowName + "&entityId=" + entityId,
            success: function (response) {
              	//DMS.Notification.Success("Record(s) Updated!", true, 5000);
                var url = document.location.protocol + '//' +
                    document.location.host + (document.location.host.indexOf("demo.adxstudio.com") != -1
                    ? document.location.pathname.split("/").slice(0, 3).join("/")
                    : "") + '/Cache.axd?Message=InvalidateAll&d=' +
                    (new Date()).valueOf();
                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.send(null); window.location.reload(true); console.log("success");
            }
        }).error(function (errormsg) { console.log(errormsg) 
		 DMS.Notification.Error(errormsg, true, 5000);
		});
		}});
	 $(evt.target).append($btnWon);
	 $(evt.target).append($btnLost);
	 }});
function getSelectedRecords() {
    var arr = []

    $('.entity-grid .view-grid table tbody tr').each(function () {
        var isRowSelected = $(this).find('td:first').data('checked');
        if (isRowSelected == "true") {
            arr.push($(this).data('id'));
        }
    });
    return arr;
}

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

});
//END