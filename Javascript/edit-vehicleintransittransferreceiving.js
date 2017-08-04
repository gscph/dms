//Created By : Raphael Herrera, Created On : 9/02/16
$(document).ready(function () {
  var intransitStatus = $('#gsc_intransitstatus').val();


  if (intransitStatus == 100000000) {
    drawCancelButton();
    drawReceiveButton();
  }
  drawPrintButton();

  $('#gsc_intransitstatus').attr('readOnly', true);
  $('#gsc_intransitstatus').css({ "pointer-events": "none", "cursor": "default" });

  //Initialize editable grid
  $(document).trigger('initializeEditableGrid', vehicleComponentChecklistGridInstance);

   setTimeout(function(){
    if(intransitStatus == 100000001 || intransitStatus == 100000002)
      {
        $('form fieldset').attr('disabled', true);
        $(".datetimepicker input").attr('disabled', true);
      }
   },3000);
});

var vehicleComponentChecklistGridInstance = {
  initialize: function () {
    /* - Editable Grid - Vehicle Component Checklist Subgrid*/
    $('<div id="vehiclecomponentchecklist-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');
    var $container = document.getElementById('vehiclecomponentchecklist-editablegrid');
    var idQueryString = DMS.Helpers.GetUrlQueryString('id');
    var oDataQuery = '/_odata/gsc_sls_vehiclecomponentchecklist?$filter=gsc_vehicleintransittransferreceivingid/Id%20eq%20(Guid%27' + idQueryString + '%27)';
    var screenSize = $(window).width() - 100;
    var options = {
      dataSchema: {
        gsc_vehicleintransittransferreceivingid: { Id: null, Name: null }, gsc_included: null,
        gsc_vehiclecomponentchecklistpn: ''
      },
      colHeaders: [
        'Included', 'Vehicle Checklist'
      ],
      columns: [
        { data: 'gsc_included', type: 'checkbox', renderer: checkboxRenderer, className: 'htCenter htMiddle', width: 80 },
        { data: 'gsc_vehiclecomponentchecklistpn', readOnly: true, className: 'htCenter htMiddle', width: 200 }
      ],
      gridWidth: screenSize,
      addNewRows: false,
      deleteRows: false
    }

    var sectionName = 'VehicleComponentChecklist';
    var attributes = [{ key: 'gsc_included', type: 'System.Boolean' }, { key: 'gsc_vehiclecomponentchecklistpn', type: 'System.String' }];
    var model = { id: 'gsc_sls_vehiclecomponentchecklistid', entity: 'gsc_sls_vehiclecomponentchecklist', attr: attributes };
    var hotInstance = EditableGrid(options, $container, sectionName, oDataQuery, model);
  }
}

function preventDefault(event) {
  event.preventDefault();
}

function drawCancelButton() {

  $cancelButtonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-ban');

  $cancelButton = DMS.Helpers.CreateButton('button', true, 'cancel', ' CANCEL', $cancelButtonIcon);

  $cancelButton.click(function () {
    $('#gsc_intransitstatus').val('100000002');
    $('#UpdateButton').click();

  });

  DMS.Helpers.AppendButtonToToolbar($cancelButton);
}

function drawReceiveButton() {
  $buttonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-truck');
  $button = DMS.Helpers.CreateButton('button', true, 'receive', ' RECEIVE', $buttonIcon);

  $button.click(function () {
    $('#gsc_intransitstatus').val('100000001');
    $('#UpdateButton').click();
  });

  DMS.Helpers.AppendButtonToToolbar($button);
}

function drawPrintButton() {
  $buttonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-print');
  $button = DMS.Helpers.CreateButton('button', true, 'print', ' PRINT', $buttonIcon);

  $button.click(function () {
    printInTransitReceiving();
    event.preventDefault();
  });

  DMS.Helpers.AppendButtonToToolbar($button);
}

function printInTransitReceiving() {
  var param1var = getQueryVariable("id");
  var protocol = window.location.protocol;
  var host = window.location.host;
  var url = protocol + "//" + host + "/report/?reportname={82439C4C-4973-E611-80DC-00155D010E2C}&reportid=" + param1var;
  window.open(url, 'blank', 'width=500,height=400');

}