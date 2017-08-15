//Created By : Raphael Herrera, Created On : 9/02/16
$(document).ready(function () {

  var intransitStatus = $('#gsc_intransitstatus').val();

  if (intransitStatus == 100000000) {
    drawCancelButton();
    drawReceiveButton();
  }

  drawPrintButton();
  drawComponentsButton();

  $('#gsc_intransitstatus').attr('readOnly', true);
  $('#gsc_intransitstatus').css({ "pointer-events": "none", "cursor": "default" });

  setTimeout(function () {
    if (intransitStatus == 100000001 || intransitStatus == 100000002) //Received || Cancelled
    {
      $('form fieldset').attr('disabled', true);
      $(".datetimepicker input").attr('disabled', true);
      if (intransitStatus == 100000001) {
        $('*[data-name="VehicleComponentChecklist"]').parent().removeAttr("disabled");
      }
    }

    if (intransitStatus == 100000000)
      $('*[data-name="VehicleComponentChecklist"]').parent().attr("disabled", "disabled");
  }, 3000);
});


function preventDefault(event) {
  event.preventDefault();
}

function drawCancelButton() {

  var $cancelButtonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-ban');

  var $cancelButton = DMS.Helpers.CreateButton('button', true, 'cancel', ' CANCEL', $cancelButtonIcon);

  $cancelButton.click(function () {
    $('#gsc_intransitstatus').val('100000002');
    $('#UpdateButton').click();

  });

  DMS.Helpers.AppendButtonToToolbar($cancelButton);
}

function drawReceiveButton() {
  var $buttonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-truck');
  var $button = DMS.Helpers.CreateButton('button', true, 'receive', ' RECEIVE', $buttonIcon);

  $button.click(function () {
    $('#gsc_intransitstatus').val('100000001');
    $('#UpdateButton').click();
  });

  DMS.Helpers.AppendButtonToToolbar($button);
}

function drawPrintButton() {
  var $buttonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-print');
  var $button = DMS.Helpers.CreateButton('button', true, 'print', ' PRINT', $buttonIcon);

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

function drawComponentsButton() {
  var $container = $('<div class="view-toolbar grid-actions clearfix"></div>');
  var $buttonIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-wrench');

  var $button = DMS.Helpers.CreateButton('button', true, 'components', ' COMPONENTS', $buttonIcon);

  var modalOptions = { id: 'componentsModal', headerIcon: 'fa fa-car', headerTitle: ' Vehicle Component Checklist', Body: createEditableGridSection() };



  $button.click(function () {
    $('.editable-grid-toolbar').remove();
    $('#vehiclecomponentchecklist-editablegrid').remove();


  var vehicleComponentChecklistGridInstance = {
    initialize: function () {
      /* - Editable Grid - Vehicle Component Checklist Subgrid*/
      $('<div id="vehiclecomponentchecklist-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');
      var $container = document.getElementById('vehiclecomponentchecklist-editablegrid');
      var detailId = getSelectedRecordsId("#VehicleInTransitTransferReceivingDetail");
      var oDataQuery = '/_odata/gsc_iv_vehicleintransitreceivingchecklist?$filter=gsc_vehicleintransitreceivingdetailid/Id%20eq%20(Guid%27' + detailId + '%27)';
      var options = {
        dataSchema: {
          gsc_iv_vehicleintransitreceivingchecklistid: { Id: null, Name: null },
          gsc_included: null,
          gsc_vehicleintransitreceivingchecklistpn: ''
        },
        colHeaders: [
          'Included', 'Vehicle Checklist'
        ],
        columns: [
          { data: 'gsc_included', type: 'checkbox', renderer: checkboxRenderer, className: 'htCenter htMiddle', width: 80 },
          { data: 'gsc_vehicleintransitreceivingchecklistpn', renderer: stringRenderer, readOnly: true, className: 'htCenter htMiddle', width: 200 }
        ],
        gridWidth: 550,
        addNewRows: false,
        deleteRows: false
      }

      var sectionName = 'VehicleComponentChecklistGrid';
      var attributes = [{ key: 'gsc_included', type: 'System.Boolean' },
      { key: 'gsc_vehicleintransitreceivingchecklistpn', type: 'System.String' },
      { key: 'gsc_vehicleintransitreceivingdetailid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'gsc_iv_vehicleintransitreceivingdetail', value: detailId }];
      var model = { id: 'gsc_iv_vehicleintransitreceivingchecklistid', entity: 'gsc_iv_vehicleintransitreceivingchecklist', attr: attributes };
      var hotInstance = new EditableGrid(options, $container, sectionName, oDataQuery, model, {
        gsc_iv_vehicleintransitreceivingchecklistid: null,
        gsc_included: false,
        gsc_vehicleintransitreceivingchecklistpn: ''
      });
    }
  }

    // Initialize editable grid
    $(document).trigger('initializeEditableGrid', vehicleComponentChecklistGridInstance);

    $('#' + modalOptions.id).modal('show');
  });

  $container.append($button);

  $modal = DMS.Helpers.CreateModalConfirmation(modalOptions);

  $('#VehicleInTransitTransferReceivingDetail .subgrid').append($modal);
  $('#VehicleInTransitTransferReceivingDetail .subgrid').prepend($container);
}

function createEditableGridSection() {
  var $container = $('<div class="container"></div>');

  var $section = `<table role="presentation" data-name="VehicleComponentChecklistGrid" class="section">
                          <colgroup>
                          <col style="width:100%;">
                          <col>
                          </colgroup>
                    <tbody>
                      <tr>
                          <td colspan="1" rowspan="1" class="clearfix cell subgrid-cell">
                          </td>
                          <td class="cell zero-cell"></td>
                        </tr>
                    </tbody>
                  </table>`;

  $container.append($section);
  return $container.html();
}
