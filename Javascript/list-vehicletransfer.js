$(document).ready(function() {
  $(document).trigger('createFilter', [[['gsc_transferdate', 'Transfer Date']]]);
  $(document).trigger('enableBulkDelete');
  //Cancel Button
  var cancelIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-ban');
  var cancelBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary cancel', '', ' CANCEL', cancelIcon);
  DMS.Helpers.AppendButtonToToolbar(cancelBtn);
  //Post Button
  var postIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-thumb-tack');
  var postBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary post', '', ' POST', postIcon);
  DMS.Helpers.AppendButtonToToolbar(postBtn);
  
  //Functions
  var cancel = '100000002';
  var posted = '100000000';
  var openStatus = '100000001';
  var recordArr = [];
  var recordValidator = [];
  var message = '';
  
  cancelBtn.click(function () {
    var that = $(this);
    var html = that.html();
    recordArr = GetModelForSelectedRecords(cancel);
    recordValidator = getSelectedRecords();
    message = 'Record(s) cancelled!';
    
    if (statusValidator(recordValidator, openStatus) > 0) {
      DMS.Notification.Error('You can only cancel record(s) with open status', true, 5000);
      return false;
    }
    updateRecords(that, html, recordArr, message);
  });
  
  postBtn.click(function() {
    var that = $(this);
    var html = that.html();
    recordArr = GetModelForSelectedRecords(posted);
    recordValidator = getSelectedRecords();
    message = 'Record(s) posted!';
    
    if (statusValidator(recordValidator, openStatus) > 0) {
      DMS.Notification.Error('You can only post record(s) with open status', true, 5000);
      return false;
    }
    updateRecords(that, html, recordArr, message);
  });
  
  function GetModelForSelectedRecords(transferStatus) {
    var result = [];
    
    // get configuration from adx layout config.
    var _layouts = $('.entitylist[data-view-layouts]').data('view-layouts');
    
    $('.entity-grid .view-grid table tbody tr').each(function () {
      var that = $(this);
      var isRowSelected = that.find('td:first').data('checked');
      
      // row is approved
      if (isRowSelected === 'true') {
        var arr = { Id: null, Entity: null, Records: [] };
        arr.Entity = _layouts[0].Configuration.EntityName;
        arr.Id = that.data('id');
        
        var row = {
          Attr: 'gsc_transferstatus',
          Value: transferStatus,
          Type: 'Microsoft.Xrm.Sdk.OptionSetValue'
        };
        arr.Records.push(row);
        result.push(arr);
      }
    });
    return result;
  }
  
  function getSelectedRecords() {
    var arr = [];
    
    $('.entity-grid .view-grid table tbody tr').each(function () {
      var isRowSelected = $(this).find('td:first').data('checked');
      
      if (isRowSelected === 'true') {
        arr.push($(this).data('id'));
      }
    });
    return arr;
  }
  
  function statusValidator(records, transferStatus) {
    var count = 0;
    for(x = 0; x < records.length; x += 1) {
      var status, td = $('tr[data-id=' + records[x] + '] td[data-attribute="gsc_transferstatus"]');
      
      if (typeof td !== 'undefined') {
        status = td.data('value').Value;
        
        if(status != transferStatus) {
          count = count + 1;
        }
      }
      return count;
    }
  }
  
  function updateRecords(that, html, recordArr, message) {
    if (recordArr.length > 0) {
      that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
      that.addClass('disabled');
      var url = '/api/EditableGrid/UpdateRecords';
      var json = JSON.stringify(recordArr);
      var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
      
      service.then(function () {
        DMS.Helpers.RefreshEntityList();
        DMS.Notification.Success(message);
      }).always(function () {
        that.html(html);
        that.removeClass('disabled');
      });
      return;
    }
    DMS.Notification.Error('Select valid records.');
  }
});