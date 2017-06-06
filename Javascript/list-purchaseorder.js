$(document).ready(function () { 
  $(document).trigger('createFilter', [[['gsc_vpodate', 'VPO Date']]]);
  $(document).trigger('enableBulkDelete');
  var approverSetupId = filterApproverSetup();

  //Submit Button
  var submitIcn = DMS.Helpers.CreateFontAwesomeIcon('fa-paper-plane');
  var submitBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary cancel', '', ' SUBMIT', submitIcn);
  DMS.Helpers.AppendButtonToToolbar(submitBtn);
  //For Apporval
  var approvalIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-files-o');
  var approvalBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary post', '', ' FOR APPROVAL', approvalIcon);
  DMS.Helpers.AppendButtonToToolbar(approvalBtn);
  
  //Functions
  var printed = '100000001';
  var ordered = '100000002';
  var forApproval = '100000003';
  var approve = '100000000';
  var disapprove = '100000001';
  var recordArr = [];
  
  submitBtn.click(function () {
    var that = $(this);
    var html = that.html();
    var recordArrValidated = getSelectedRecords();
    recordArr = GetModelForSelectedRecords(ordered, 'gsc_vpostatus');
    
    if (statusValidator(recordArrValidated, printed) > 0) {
      DMS.Notification.Error('Only records with printed vpo status can be submitted.', true, 5000);
      return false;
    }
    
    if (recordArr.length > 0) {
      that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
      that.addClass('disabled');
      
      var url = '/api/EditableGrid/UpdateRecords';
      var json = JSON.stringify(recordArr);
      var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
      
      service.then(function () {
        DMS.Helpers.RefreshEntityList();
        DMS.Notification.Success('Record(s) submitted!');
      }).always(function () {
        that.html(html);
        that.removeClass('disabled');
      });
      return;
    }
    DMS.Notification.Error('Select valid records.');
  });
  
  approvalBtn.click(function() {
    var that = $(this);
    var html = that.html();
    var approverCount = filterApprovalCount(approverSetupId);
    recordArr = GetModelForSelectedRecords(forApproval, 'gsc_approvalstatus');
    
    if (approverCount > 0) {
      if (recordArr.length > 0) {
        that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
        that.addClass('disabled');
        
        var url = '/api/EditableGrid/UpdateRecords';
        var json = JSON.stringify(recordArr);
        var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
        
        service.then(function () {
          DMS.Helpers.RefreshEntityList();
          DMS.Notification.Success('Record(s) submitted for approval!');
        }).always(function () {
          that.html(html);
          that.removeClass('disabled');
        });
        return;
      }
      DMS.Notification.Error('Select valid records.');
    }
    else {
      DMS.Notification.Error('There is no approver maintained in approver setup. Transaction cannot proceed');
    }
  });
  
  function DrawApprovalButtons() {
    //Approve
    var approveIcon = DMS.Helpers.CreateFontAwesomeIcon('fa fa-thumbs-up');
    var approveBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary post', '', ' APPROVE', approveIcon);
    DMS.Helpers.AppendButtonToToolbar(approveBtn);
    //Disapprove
    var disapproveIcon = DMS.Helpers.CreateFontAwesomeIcon('fa fa-thumbs-down');
    var disapproveBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary post', '', ' DISAPPROVE', disapproveIcon);
    DMS.Helpers.AppendButtonToToolbar(disapproveBtn);
    
    approveBtn.click(function() {
      var that = $(this);
      var html = that.html();
      recordArr = GetModelForSelectedRecords(approve, 'gsc_approvalstatus');
      
      if (recordArr.length > 0) {
        that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
        that.addClass('disabled');
        
        var url = '/api/EditableGrid/UpdateRecords';
        var json = JSON.stringify(recordArr);
        var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
        
        service.then(function () {
          DMS.Helpers.RefreshEntityList();
          DMS.Notification.Success('Record(s) approved!');
        }).always(function () {
          that.html(html);
          that.removeClass('disabled');
        });
        return;
      }
      DMS.Notification.Error('Select valid records.');
    });
    
    disapproveBtn.click(function() {
      var that = $(this);
      var html = that.html(); 
      recordArr = GetModelForSelectedRecords(disapprove, 'gsc_approvalstatus');
      
      if (recordArr.length > 0) {
        that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
        that.addClass('disabled');
        var url = '/api/EditableGrid/UpdateRecords';
        var json = JSON.stringify(recordArr);
        var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
        
        service.then(function () {
          DMS.Helpers.RefreshEntityList();
          DMS.Notification.Success('Record(s) disapproved!');
        }).always(function () {
          that.html(html);
          that.removeClass('disabled');
        });
        return;
      }
      DMS.Notification.Error('Select valid records.');
    });
  }
  
  function GetModelForSelectedRecords(triggerStatus, optionSet) {
    var result = [];
    var isValid = false;
    
    // get configuration from adx layout config.
    var _layouts = $('.entitylist[data-view-layouts]').data('view-layouts');
    
    $('.entity-grid .view-grid table tbody tr').each(function () {
      var that = $(this);
      var isRowSelected = that.find('td:first').data('checked');
      var status = that.find('td[data-attribute="gsc_vpostatus"]').data('value');
      var approvalStatus = that.find('td[data-attribute="gsc_approvalstatus"]').data('value');
      var branchId = that.find('td[data-attribute="gsc_branchid"]').data('value');
      
      // row is approved
      if (isRowSelected === 'true' && typeof status !== 'undefined' && typeof approvalStatus !== 'undefined') {
        if(optionSet === 'gsc_approvalstatus') {
          //validation for approval status
          if(triggerStatus === '100000003' && (approvalStatus.Value === '100000002' || approvalStatus.Value === '100000001') && status.Value === '100000000')//for approval
          isValid = true;
          
          else if(triggerStatus === '100000000' && approvalStatus.Value === '100000003')//approve
          isValid = true;
          
          else if(triggerStatus === '100000001'  && approvalStatus.Value === '100000003')//disapprove
          isValid = true;
        }
        
        if(isValid === true || optionSet === 'gsc_vpostatus') {
          var arr = { Id: null, Entity: null, Records: [] };
          arr.Entity = _layouts[0].Configuration.EntityName;
          arr.Id = that.data('id');
          var row = {
            Attr:  optionSet,
            Value: triggerStatus,
            Type: 'Microsoft.Xrm.Sdk.OptionSetValue'
          }
          arr.Records.push(row);
          result.push(arr);
        }
      }
    });
    return result;
  }
  
  //check if there is an existing approver setup for branch
  function filterApproverSetup() {
    var odataUrl = "/_odata/approversetup?$filter=statecode/Value eq 0 and gsc_transactiontype/Value eq 100000000 and gsc_branchid/Id eq (Guid'" + DMS.Settings.User.branchId + "')";
    var approverSetupId;
    $.ajax({
      type: 'get',
      async: false,
      url: odataUrl,
      success: function (approverSetup) {
        if (approverSetup.value.length != 0) {
          filterApproval(approverSetup.value[0].gsc_cmn_approversetupid);
          approverSetupId = approverSetup.value[0].gsc_cmn_approversetupid;
        }
      },
      error: function (xhr, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
    return approverSetupId;
  }
  
  function filterApproval(approverSetupId) {
    var odataUrl = "/_odata/approver?$filter=gsc_contactid/Id eq (guid'" + DMS.Settings.User.Id + "') and gsc_approversetupid/Id eq (Guid'" + approverSetupId + "')";
    $.ajax({
      type: 'get',
      async: true,
      url: odataUrl,
      success: function (approver) {
        if (approver.value.length != 0 ) {
          DrawApprovalButtons();
        }
      },
      error: function (xhr, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
  }
  
  function filterApprovalCount(approverSetupId) {
    var odataUrl = "/_odata/approver?$filter=gsc_approversetupid/Id eq (Guid'" + approverSetupId + "')";
    var approverCount;
    
    $.ajax({
      type: 'get',
      async: false,
      url: odataUrl,
      success: function (approver) {
        approverCount = approver.value.length;
      },
      error: function (xhr, textStatus, errorMessage) {
        console.log(errorMessage);
      }
    });
    return approverCount;
  }
  
  function statusValidator(records, vpoStatus) {
    var count = 0;
    
    for(x=0; x<records.length; x++) {
      var status, td = $('tr[data-id=' + records[x] + '] td[data-attribute="gsc_vpostatus"]');
      
      if (typeof td !== 'undefined') {
        status = td.data('value').Value;
        if(status != vpoStatus) {
          count++;
        }
      }
    }
    return count;
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
});