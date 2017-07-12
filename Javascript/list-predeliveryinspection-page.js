$(document).on("completePdi", function (event, fieldsIncluded) {
  var recordArr = [];
  $pdiButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PDI COMPLETED', DMS.Helpers.CreateFontAwesomeIcon('fa-shopping-bag'));
  $pdiButton.attr('data-toggle', 'modal');
  $pdiButton.attr('data-target', '#completeModal');
  $pdiButton.click(function (evt) {
    evt.preventDefault();
  });
  DMS.Helpers.AppendButtonToToolbar($pdiButton);
  
  var completeModal = document.createElement('div');
  completeModal.innerHTML = '<div class="modal-dialog">' +
  '<div class="modal-content">' +
  '<div class="modal-header">' +
  '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span class="close" aria-hidden="true">&times;</span></button>' +
  '<h4 class="modal-body" class="modal-body">Complete PDI</h4>' +
  '</div>' +
  '<div id="modal-body" class="modal-body">' +
  '<center><p>Proceed in completing the PDI?<br>' +
  '<div class="modal-footer">' +
  '<button id="completeBtn" type="submit" class="primary btn btn-dialogue btn-default">CONTINUE</button>' +
  '<button type="button" class="primary btn btn-dialogue btn-default" data-dismiss="modal"></i> CANCEL</button>' +
  '</div>' +
  '</div><!-- /.modal-content -->' +
  '</div><!-- /.modal-dialog -->';
  completeModal.setAttribute('id', 'completeModal');
  completeModal.setAttribute('class', 'modal fade');
  completeModal.setAttribute('tabindex', '-1');
  completeModal.setAttribute('role', 'dialog');
  $('.entitylist').append(completeModal);
  
  $('#completeBtn').click(function (evt) {
    evt.preventDefault();
    var that = $(this);
    var html = that.html();
    recordArr = GetModelForSelectedRecords(fieldsIncluded);
    
    if (recordArr.length == 0) {
      $('#completeModal').modal('hide');
      DMS.Notification.Error('Please select a valid record to be PDI completed.');
    }
    else {
      that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
      that.addClass('disabled');
      var url = "/api/EditableGrid/UpdateRecords";
      var json = JSON.stringify(recordArr);
      var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
      
      service.then(function () {
        $('#completeModal').modal('toggle');
        DMS.Helpers.RefreshEntityList();
        DMS.Notification.Success('Valid records were completed!');
      }).always(function () {
        that.html(html);
        that.removeClass('disabled');
      });
      return;
    }
  });
  
  function GetModelForSelectedRecords(fields) {
    var result = [];    
    
    // get configuration from adx layout config.
    var _layouts = $('.entitylist[data-view-layouts]').data("view-layouts");    
    
    $('.entity-grid .view-grid table tbody tr').each(function () {
      var that = $(this);
      var isRowSelected = that.find('td:first').data('checked');
      var isCompleted = that.find('td[data-attribute="gsc_completed"]').data('value');
      
      // row is approved
      if (isRowSelected == "true" && isCompleted == false) {
        var arr = { Id: null, Entity: null, Records: [] };
        arr.Entity = _layouts[0].Configuration.EntityName;
        arr.Id = that.data('id');
        
        for (x = 0 ; x < 3 ; x++) {
          var row = {
            Attr: fields[x].key,
            Value: fields[x].value,
            Type: fields[x].type,
            Reference: fields[x].reference
          }
          arr.Records.push(row);
          result.push(arr);
        }
      }
    });
    return result;
  }
});

$(document).on("cancelPdi", function (event, fieldsIncluded) {
  var recordArr = [];
  $cancelButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' CANCEL', DMS.Helpers.CreateFontAwesomeIcon('fa-ban'));
  $cancelButton.attr('data-toggle', 'modal');
  $cancelButton.attr('data-target', '#cancelModal');
  $cancelButton.click(function (evt) {
    evt.preventDefault();
  });
  DMS.Helpers.AppendButtonToToolbar($cancelButton);
  
  var cancelModal = document.createElement('div');
  cancelModal.innerHTML = '<div class="modal-dialog">' +
  '<div class="modal-content">' +
  '<div class="modal-header">' +
  '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
  '<h4 class="modal-body" class="modal-body">Cancel PDI</h4>' +
  '</div>' +
  '<div id="modal-body" class="modal-body">' +
  '<center><p>Proceed in cancelling the PDI?<br>' +
  '<div class="modal-footer">' +
  '<button id="cancelBtn" type="submit" class="primary btn btn-dialogue btn-default">CONTINUE</button>' +
  '<button type="button" class="primary btn btn-dialogue btn-default" data-dismiss="modal"></i> CANCEL</button>' +
  '</div>' +
  '</div><!-- /.modal-content -->' +
  '</div><!-- /.modal-dialog -->';
  cancelModal.setAttribute('id', 'cancelModal');
  cancelModal.setAttribute('class', 'modal fade');
  cancelModal.setAttribute('tabindex', '-1');
  cancelModal.setAttribute('role', 'dialog');
  $('.entitylist').append(cancelModal);
  
  $('#cancelBtn').click(function (evt) {
    evt.preventDefault();
    var that = $(this);
    var html = that.html();
    recordArr = GetModelForSelectedRecords(fieldsIncluded);
    
    if (recordArr.length > 0) {
      that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
      that.addClass('disabled');
      var url = "/api/EditableGrid/UpdateRecords";
      var json = JSON.stringify(recordArr);
      var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
      
      service.then(function () {
        $('#cancelModal').modal('toggle');
        DMS.Helpers.RefreshEntityList();
        DMS.Notification.Success('Valid records were cancelled!');
      }).always(function () {
        that.html(html);
        that.removeClass('disabled');
      });
      return;
    }
    $('#cancelModal').modal('hide');
    DMS.Notification.Error('Please select a valid record to cancel.');
  });
  DMS.Helpers.AppendButtonToToolbar($pdiButton);
  
  function GetModelForSelectedRecords(fields) {
    var result = [];    
    
    // get configuration from adx layout config.
    var _layouts = $('.entitylist[data-view-layouts]').data("view-layouts");    
    
    $('.entity-grid .view-grid table tbody tr').each(function () {
      var that = $(this);
      var isRowSelected = that.find('td:first').data('checked');
      var isCompleted = that.find('td[data-attribute="gsc_completed"]').data('value');
      var pdiStatus = that.find('td[data-attribute="gsc_pdistatus"]').data('value');
      var status = "";
      
      if(pdiStatus != undefined)
        status = pdiStatus.Value;
        
      // row is approved
      if (isRowSelected == "true" && status != 100000001) {
        var arr = { Id: null, Entity: null, Records: [] };
        arr.Entity = _layouts[0].Configuration.EntityName;
        arr.Id = that.data('id');
        for (x = 0 ; x < 3 ; x++) {
          if(fields[x] != undefined) {
            var row = {
              Attr: fields[x].key,
              Value: fields[x].value,
              Type: fields[x].type,
              Reference: fields[x].reference
            }
            arr.Records.push(row);
            result.push(arr);
          }
        }
      }
    });
    return result;
  }
});

$(document).ready(function () {
  //PDI Completed Button
  var currentDate = new Date();
  var userId = DMS.Settings.User.Id;
  var fields = [{ key: 'gsc_completed', value: true, type: 'System.Boolean' },
  { key: 'gsc_pdiinspectorid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'contact', value: userId },
  { key: 'gsc_datecompleted', value: currentDate, type: 'System.DateTime' }];
  var cancelFields = [{ key: 'gsc_isreadyforpdi', value: false, type: 'System.Boolean' },
  { key: 'gsc_pdistatus', value: 100000001, type: 'Microsoft.Xrm.Sdk.OptionSetValue' }];
  
  setTimeout(function () {
    $(document).trigger("completePdi", [fields]);
    $(document).trigger("cancelPdi", [cancelFields]);
  },100);
  
  setTimeout(function () {
    //Added by Christell Ann Mataac - 03/10/2017
    /*Need to disable PDI Completed Button on selected web roles*/
    if (DMS.Settings.User.positionName == 'MSD Manager' || DMS.Settings.User.positionName == 'C and C Manager' || DMS.Settings.User.positionName == 'Invoice Generator' || DMS.Settings.User.positionName == 'Sales Manager' || DMS.Settings.User.positionName == 'Vehicle Allocator' || DMS.Settings.User.positionName == 'MMPC System Admin' || DMS.Settings.User.positionName == 'MMPC System Administrator') {
      $('a.btn-primary.btn').eq(3).attr('disabled', true);
    }
  }, 250);
});