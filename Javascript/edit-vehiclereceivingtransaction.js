//Created By : Jerome Anthony Gerero, Created On : 7/11/16
$(document).ready(function () {
    
    /* Actual Receipt Date and In-Transit Date Validation */
    setTimeout(function () {
    $('#gsc_actualreceiptdate').next('.datetimepicker').on("dp.change", function (e) {
        $('#gsc_intransitreceiptdate').next('.datetimepicker').data("DateTimePicker").setMaxDate(e.date);
    });

    $('#gsc_intransitreceiptdate').next('.datetimepicker').on("dp.change", function (e) {
        $('#gsc_actualreceiptdate').next('.datetimepicker').data("DateTimePicker").setMinDate(e.date);
    });
    },100);
	
    var actualReceiptValidator = document.createElement('span');
    actualReceiptValidator.style.display = "none";
    actualReceiptValidator.id = "RequiredFieldValidatorvaliduntil";
    actualReceiptValidator.errormessage = "Actual Receipt Date should not be less than the In-Transit Receipt Date.";
    actualReceiptValidator.validationGroup = "";
    actualReceiptValidator.initialvalue = "";
    actualReceiptValidator.evaluationfunction = function () {
        var actualReceiptDate = $("#gsc_actualreceiptdate").val() == "" ? 0 : $("#gsc_actualreceiptdate").val();
        var intransitReceiptDate = $("#gsc_intransitreceiptdate").val() == "" ? 0 : $("#gsc_intransitreceiptdate").val();

        if ((actualReceiptDate) >= (intransitReceiptDate)) {
            return true;
        } else {
            return false;
        }
    };
        Page_Validators.push(actualReceiptValidator);
   
	

    //Initialize editable grid
    $(document).trigger('initializeEditableGrid', vehicleComponentChecklistGridInstance);
    //Add readonly attribute to status fields
    $('#gsc_mmpcstatus').prop('readonly', true);
    $('#gsc_vpostatus').hide();
    $('#gsc_vpostatus_label').hide();
    var status = $('#gsc_receivingstatus').val();
    var isReceive = false;

    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;

    //Validator for Actual Receipt Date
    var actualReceiptDateValidator = document.createElement('span');
    actualReceiptDateValidator.style.display = "none";
    actualReceiptDateValidator.id = "RequiredFieldValidatorgsc_actualreceiptdate";
    actualReceiptDateValidator.controltovalidate = "gsc_actualreceiptdate";
    actualReceiptDateValidator.errormessage = "Please provide Actual Receipt Date before receiving.";
    actualReceiptDateValidator.validationGroup = "";
    actualReceiptDateValidator.initialvalue = "";
    actualReceiptDateValidator.evaluationfunction = function () {
        var value = $("#gsc_actualreceiptdate").val();

        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    //Validator for Pull-Out Date
    var pullOutDateValidator = document.createElement('span');
    pullOutDateValidator.style.display = "none";
    pullOutDateValidator.id = "RequiredFieldValidatorgsc_pulloutdate";
    pullOutDateValidator.controltovalidate = "gsc_pulloutdate";
    pullOutDateValidator.errormessage = "Please provide Pull Out Date before receiving.";
    pullOutDateValidator.validationGroup = "";
    pullOutDateValidator.initialvalue = "";
    pullOutDateValidator.evaluationfunction = function () {
        var value = $("#gsc_pulloutdate").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    //Validator for Destination Site
    var siteValidator = document.createElement('span');
    siteValidator.style.display = "none";
    siteValidator.id = "RequiredFieldValidatorgsc_siteid";
    siteValidator.controltovalidate = "gsc_siteid";
    siteValidator.errormessage = "Please provide Destination Site before receiving.";
    siteValidator.validationGroup = "";
    siteValidator.initialvalue = "";
    siteValidator.evaluationfunction = function () {
        var value = $("#gsc_siteid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var vpostatus = $('#gsc_vpostatus').val();
    if (vpostatus == "In-Transit") {
        createCancelInTransitButton();
    }

   setTimeout(function () {
     $("#gsc_purchaseorderid").siblings(".input-group-btn").hide();
     
        $('input[aria-describedby="gsc_actualreceiptdate_description"]').on('change', function () {
            $("#gsc_actualreceiptdate").val("");
        });

        $('input[aria-describedby="gsc_pulloutdate_description"]').on('change', function () {
            $("#gsc_pulloutdate").val("");
        });
    }, 100);

    //Create Cancel Button
    function createCancelInTransitButton() {
        var cancelIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-ban');
        var cancelBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary cancel', '', ' CANCEL IN-TRANSIT', cancelIcon);
        var cancelConfirmation = DMS.Helpers.CreateModalConfirmation({ id: 'cancelInTransitModal', headerIcon: 'fa fa-ban', headerTitle: ' Cancel In-Transit', Body: 'Are you sure you want to cancel this Vehicle Receiving Transaction?' });
        $(".crmEntityFormView").append(cancelConfirmation);
        cancelBtn.on('click', function (evt) {

            $('#gsc_siteid_label').parent("div").removeClass("required");
            $('#gsc_pulloutdate_label').parent("div").removeClass("required");
            $('#gsc_actualreceiptdate_label').parent("div").removeClass("required");

            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != actualReceiptDateValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != pullOutDateValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != siteValidator;
            });
             Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != actualReceiptValidator;
            });

            cancelConfirmation.find('.confirmModal').on('click', function () {
                cancelInTransit();
            });
            cancelConfirmation.modal('show');
        });

        DMS.Helpers.AppendButtonToToolbar(cancelBtn);
    }

    //Create Receive Button
    $receiveButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' RECEIVE', DMS.Helpers.CreateFontAwesomeIcon('fa-car'));
    $receiveButton.attr("id", "receiveButton");
    $receiveButton.attr("data-toggle", "modal");
    $receiveButton.attr("data-target", "#approveMessageModal");
    $receiveButton.click(function (evt) {
        evt.preventDefault();

        $('#gsc_siteid_label').parent("div").addClass("required");
        $('#gsc_pulloutdate_label').parent("div").addClass("required");
        $('#gsc_actualreceiptdate_label').parent("div").addClass("required");

        Page_Validators = jQuery.grep(Page_Validators, function (value) {
            return value != actualReceiptDateValidator;
        });
        Page_Validators = jQuery.grep(Page_Validators, function (value) {
            return value != pullOutDateValidator;
        });
        Page_Validators = jQuery.grep(Page_Validators, function (value) {
            return value != siteValidator;
        });

        Page_Validators.push(actualReceiptDateValidator);
        Page_Validators.push(pullOutDateValidator);
        Page_Validators.push(siteValidator);

        if (Page_ClientValidate("")) {
            $("#EntityFormView fieldset").attr("disabled", false);
            $("#EntityFormView fieldset").removeClass("disabled");
            showLoading();
            $("#gsc_receivingstatus").val(100000004);
            isReceive = true;
            $("#UpdateButton").click();
        }
        else {
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != actualReceiptDateValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != pullOutDateValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != siteValidator;
            });
            isReceive = false;
        }

    });

    if (vpostatus == "In-Transit") {
        DMS.Helpers.AppendButtonToToolbar($receiveButton);
    }

    //Create Print Button By: Artum Ramos
    $printBtn = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $printBtn.click(function (evt) {
        if (Page_ClientValidate("")) {
            var recordId = getQueryVariable('id');
            var protocol = window.location.protocol;
            var host = window.location.host;
            var url = protocol + '//' + host + '/report/?reportname={7d723b34-de52-e611-80da-00155d010e2c}&reportid=' + recordId;
            window.open(url, 'blank', 'width=1200,height=850');
            event.preventDefault();
        }
    });
    DMS.Helpers.AppendButtonToToolbar($printBtn);

    //Append buttons to form
    $('.form-action-container-left').append(' ');

    $("#UpdateButton").click(function () {
        if(!isReceive)
        {
            $('#gsc_siteid_label').parent("div").removeClass("required");
            $('#gsc_pulloutdate_label').parent("div").removeClass("required");
            $('#gsc_actualreceiptdate_label').parent("div").removeClass("required");
        }
    });

    //Function for Cancelling In-Transit Status
    function cancelInTransit() {

        $("#EntityFormView fieldset").attr("disabled", false);
        $("#EntityFormView fieldset").removeClass("disabled");
        $('#gsc_receivingstatus').val('100000000');
        $("#UpdateButton").click();

    }

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }

    //Disable form receiving status == received/Cancelled
    if (status == '100000004' || status == '100000000') {
        $('#ReceivingTransactionDetail_Subgrid table tbody td .dropdown.action a').html();
        $("#SubmitButton").addClass("permanent-disabled disabled");
        $("#UpdateButton").addClass("permanent-disabled disabled");
        $('button.delete-link').addClass("permanent-disabled disabled");
        $('#receiveButton').addClass("permanent-disabled disabled");
        $('.cancel').addClass("permanent-disabled disabled");
        $('#gsc_intransitsiteid').siblings('.input-group-btn').addClass('hidden');
        $('#gsc_intransitsiteid').siblings('.input-group-btn').addClass('hidden');
        $("#gsc_invoiceno").attr("readonly", true);
        $('#gsc_intransitreceiptdate').siblings(".datetimepicker").children("span").addClass("hidden");
        $('#gsc_intransitreceiptdate').siblings(".datetimepicker").children("input").attr("readonly", true);
        $('#gsc_actualreceiptdate').siblings(".datetimepicker").children("span").addClass("hidden");
        $('#gsc_actualreceiptdate').siblings(".datetimepicker").children("input").attr("readonly", true);
        $('#gsc_invoicedate').siblings(".datetimepicker").children("span").addClass("hidden");
        $('#gsc_invoicedate').siblings(".datetimepicker").children("input").attr("readonly", true);
        $('#gsc_pulloutdate').siblings(".datetimepicker").children("span").addClass("hidden");
        $('#gsc_pulloutdate').siblings(".datetimepicker").children("input").attr("readonly", true);
        $('#gsc_siteid').siblings('.input-group-btn').addClass('hidden');
        $(".datetimepicker input").attr("disabled", "disabled");
        $('#ReceivingTransactionDetail_Subgrid  .entity-grid.subgrid').on('loaded', function () { $('.btn-default.btn-xs').addClass("permanent-disabled disabled"); });
    }
    //End

    //Disable form receiving status == In-Transit
    if (status == '100000003') {
        $('#ReceivingTransactionDetail_Subgrid table tbody td .dropdown.action a').html();
        $('button.delete-link').addClass("permanent-disabled disabled");
        $('#gsc_intransitsiteid').siblings('.input-group-btn').addClass('hidden');
        $("#gsc_invoiceno").attr("readonly", true);
        $('#gsc_intransitreceiptdate').siblings(".datetimepicker").children("span").addClass("hidden");
        $('#gsc_intransitreceiptdate').siblings(".datetimepicker").children("input").attr("readonly", true);
        $('#gsc_invoicedate').siblings(".datetimepicker").children("span").addClass("hidden");
        $('#gsc_invoicedate').siblings(".datetimepicker").children("input").attr("readonly", true);
    }
    //End

    if (status != 100000001) {
        checkReceivingItem();
    }

    function checkReceivingItem() {
        if ($('#ReceivingTransactionDetail_Subgrid tbody').is(':visible')) {
            $('#ReceivingTransactionDetail_Subgrid table tbody td .dropdown.action a').addClass("permanent-disabled");
        } else {
            setTimeout(checkReceivingItem, 100);
        }
    }

    checkComponentChecklist();
    function checkComponentChecklist() {
        if ($('#vehiclecomponentchecklist-editablegrid table tr td input.htCheckboxRendererInput').is(':visible')) {
            if (status != 100000003 && status != 100000004) {
                setTimeout(function () { $('.section[data-name="VehicleComponentChecklist"]').parent().attr("disabled", "true"); }, 1000);
            }
        } else {
            setTimeout(checkComponentChecklist, 100);
        }
    }

    function showLoading() {

        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);
    }
    var isFromClose = false;
    $("#ReceivingTransactionDetail_Subgrid section.modal button.close").on("click", function () {
        isFromClose = true;
    });

    $("#ReceivingTransactionDetail_Subgrid section.modal").on("hidden.bs.modal", function () {
        if (!isFromClose) {
            $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

            var div = document.createElement("DIV");
            div.className = "view-loading message text-center";
            div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
            var span = document.createElement("SPAN");
            span.className = "fa fa-2x fa-spinner fa-spin";
            div.appendChild(span);
            $(".content-wrapper").append(div);

            location.reload();
        }
        isFromClose = false;
    });

    setTimeout(disableTab, 300);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
    }
    // Create Print Button in  Vehicle Component Checklist
    //btnPrint = DMS.Helpers.CreateButton('button', "btn-primary btn printVCC", '', ' PRINT A COPY', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    //$('.section')[16].append(btnPrint);
    // End
});


//Editable grid
var vehicleComponentChecklistGridInstance = {
    initialize: function () {
        $('<div id="vehiclecomponentchecklist-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');

        var $container = document.getElementById('vehiclecomponentchecklist-editablegrid');
        $container.style.display = 'none';
        var idQueryString = DMS.Helpers.GetUrlQueryString('id');
        var odataQuery = '/_odata/receivingvehiclecomponents?$filter=gsc_receivingtransactionid/Id%20eq%20(Guid%27' + idQueryString + '%27)';

        var screenSize = ($(window).width() / 2) - 80;

        if($('#gsc_receivingstatus').val() == '100000000')
        var options = {
            dataSchema: {
                gsc_cmn_receivingtransactionchecklistid: null,
                gsc_included: false,
                gsc_receivingtransactionchecklistpn: ''
            },
            colHeaders: [
              'Included', 'Vehicle Checklist'
            ],
            columns: [
              { data: 'gsc_included', type: 'checkbox', renderer: checkboxRenderer, readOnly: true, className: 'htCenter htMiddle', width: 80 },
              { data: 'gsc_receivingtransactionchecklistpn', renderer: stringRenderer, readOnly: true, className: 'htCenter htMiddle', width: 200 }
            ],
            gridWidth: 1000,
            addNewRows: false,
            deleteRows: false
        }
        else
        var options = {
            dataSchema: {
                gsc_cmn_receivingtransactionchecklistid: null,
                gsc_included: false,
                gsc_receivingtransactionchecklistpn: ''
            },
            colHeaders: [
              'Included', 'Vehicle Checklist'
            ],
            columns: [
              { data: 'gsc_included', type: 'checkbox', renderer: checkboxRenderer, className: 'htCenter htMiddle', width: 80 },
              { data: 'gsc_receivingtransactionchecklistpn', renderer: stringRenderer, readOnly: true, className: 'htCenter htMiddle', width: 200 }
            ],
            gridWidth: 1000,
            addNewRows: false,
            deleteRows: false
        }

        var sectionName = "VehicleComponentChecklist";
        var attributes = [{ key: 'gsc_included', type: 'System.Boolean' },
        { key: 'gsc_receivingtransactionchecklistpn', type: 'System.String' },
        { key: 'gsc_receivingtransactionid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'gsc_cmn_receivingtransaction', value: idQueryString }];
        var model = { id: 'gsc_cmn_receivingtransactionchecklistid', entity: 'gsc_cmn_receivingtransactionchecklist', attr: attributes };
        var hotInstance = EditableGrid(options, $container, sectionName, odataQuery, model, {
            gsc_cmn_receivingtransactionchecklistid: null,
            gsc_included: false,
            gsc_receivingtransactionchecklistpn: ''
        });
    }
}