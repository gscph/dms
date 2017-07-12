//Created By : Jerome Anthony Gerero, Created On : 3/28/2016
var hasAllocatedItems = false;

$(document).ready(function () {

    checkRefreshButton();

    function checkRefreshButton() {

        if ($('a:contains("REFRESH")').is(':visible')) {
            $('a:contains("REFRESH")').attr("id", "refresh");
            document.getElementById('refresh').addEventListener('click', DMS.Helpers.Debounce(function (e) {
                e.preventDefault();
                $(document).on('click', '#Inventory tbody tr', AddEventtoInventoryClick);
                $("#Inventory").children(".subgrid").trigger("refresh");
                checkTDColumn();
            }, 500));
            ClearFirstData();
        } else {
            setTimeout(checkRefreshButton, 50);
        }
    }

    function ClearFirstData() {
        if ($('#Inventory tbody tr td:first-child').is(':visible')) {
            $('#Inventory table tbody').html('');
            $('#Inventory .btn-primary')[0].click();
        }
        else {
            setTimeout(ClearFirstData, 50);
        }
    }

    function checkTDColumn() {
        if ($('#Inventory tbody tr td:first-child').is(':visible')) {
            $('#Inventory tbody tr td:first-child').click(function () {
                AddEventtoInventoryClick();
            });
        }
        else {
            setTimeout(checkTDColumn, 50);
        }
    }

    //JGC DocumentChecklist
    //Create Submit Button
    $btnSubmit = DMS.Helpers.CreateButton('button', "btn-primary btn submit", 'margin-left:5px', ' SUBMIT', DMS.Helpers.CreateFontAwesomeIcon('fa-paper-plane'));
    $('#DocumentChecklistSubgrid .view-toolbar.grid-actions.clearfix').append($btnSubmit);
    $('#DocumentChecklistSubgrid .entity-grid.subgrid').on('loaded', function () {

        if (DMS.Settings.User.positionName == 'Cashier' || $('#gsc_documentstatus').val() == "100000001") {
            $('#DocumentChecklistSubgrid .add-margin-right').addClass("disabled");
            $('#DocumentChecklistSubgrid .submit').removeClass("disabled");
            //RestrictedRecords
            var recordArr = [];
            for (x = 0; x < recordArr.length; x++) {
                $('tr[data-id=' + recordArr[x] + ']').find(".dropdown.action").hide();
                $('#gsc_bankid_name').siblings('.input-group-btn').addClass('hidden');
                $('#gsc_financingschemeid_name').siblings('.input-group-btn').addClass('hidden');
            }
        }
        //Submit Button OnClick Function
        $btnSubmit.click(function (evt) {
            var recordArray = [];
            recordArray = getSelectedRecordsId("#DocumentChecklistSubgrid");
            for (x = 0; x < recordArray.length; x++) {
                $('tr[data-id=' + recordArray[x] + '] td[data-attribute="gsc_submitted"]').html("Yes");
            }
            updateSubmitted(recordArray, "True", $(this), $btnSubmit)
            event.preventDefault();
        });

        //Functions

        function getAllRecordsId(subgridId) {
            var arr = []

            $(subgridId + ' .entity-grid.subgrid .view-grid table tbody tr').each(function () {
                arr.push($(this).data('id'));
            });
            return arr;
        }

        function updateSubmitted(records, submitted, button) {

            var html = button.html();
            var logicalName = button.closest('div[data-view-layouts]').data("view-layouts")[0].Configuration.EntityName;
            var json = DMS.Helpers.CreateModel(records, logicalName, { attr: "gsc_submitted", Value: submitted, type: "System.Boolean" });
            var url = "/api/EditableGrid/UpdateRecords";

            button.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');

            var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);

            service.then(function () {
                DMS.Notification.Success("Record(s) Updated!", true, 5000);
            }).always(function () {
                button.html(html);
                window.location.reload();
            });
        }

    });
    //End

    //Added by Ernest Sarmiento 02-21-2017
    var bank = $("#gsc_bankid").val();
    var scheme = $("gsc_financingschemeid").val();
    var payment = $("#gsc_paymentmode").val();
    var status = $(".record-status").html();
    var webRole = DMS.Settings.User.webRole;

    if (webRole == 'Cashier' || webRole.contains("Vehicle Allocator") || webRole == "CC Manager" || webRole.contains("MSD Manager")) {
        $("#UpdateButton").addClass("hidden");
    }

    if ((bank == "" || scheme == "") && payment == "100000001" && status == "Open") {
        $("#DocumentChecklistSubgrid .grid-actions .submit").attr("disabled", true);
    } else {
        $("#DocumentChecklistSubgrid .grid-actions .submit").attr("disabled", false);
    }

    // on bank changed event hooked to auto populate related fields
    setTimeout(function () {
        $('#gsc_bankid').on('change', function () {
            var bankId = $(this).val();
            if (bankId !== "") {
                var oDataUrl = '/_odata/chattelfee?$filter=gsc_bankid/Id%20eq%20(Guid%27' + bankId + '%27)';
                $.ajax({
                    type: 'get',
                    async: true,
                    url: oDataUrl,
                    success: function (data) {
                        if (data.value.length > 0) {
                            $('#gsc_chattelfeeeditable').val(eval(data.value[0].gsc_chattelfeeamount).toFixed(2));
                        }
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.error(errorMessage);
                    }
                });
            }
        });

    }, 100);

    // hide 
    $('#OrderMonthlyAmortizationSubgrid').html('');
    // end hide

    $(document).trigger("initializeEditableGrid", AccessroiessGridInstance);
    $(document).trigger("initializeEditableGrid", CabChasisGridInstance);
    $(document).trigger("initializeEditableGrid", monthlyAmortizationGridInstance);

    //JGC_01182016
    $('#OrderMonthlyAmortizationSubgrid .save').hide();
    $btnSaveCopy = DMS.Helpers.CreateButton('button', "btn-primary btn", 'margin-right:5px', ' SAVE', DMS.Helpers.CreateFontAwesomeIcon('fa-floppy-o'));
    $btnSaveCopy.addClass('btnSaveCopy');
    $btnSaveCopy.attr('disabled', true);
    $('#OrderMonthlyAmortizationSubgrid .editable-grid-toolbar').find($('.delete')).before($btnSaveCopy);
    $btnSaveCopy.click(function (e) {
        e.preventDefault();
        var counter = 0;
        var count = $('#monthlyamortization-editablegrid .htCheckboxRendererInput').length;
        for (var x = 0 ; x < count ; x++) {
            if ($('#monthlyamortization-editablegrid .htCheckboxRendererInput')[x].checked == true)
                counter++;
        }
        if (counter > 1 || counter == 0) {
            DMS.Notification.Error(" You can only select one financing term", true, 5000);
            //$btnSaveCopy.addClass("disabled");
        }
        else {
            $('#OrderMonthlyAmortizationSubgrid .save').click();
            location.reload();
            //$btnSaveCopy.addClass("disabled");
        }
    });
    //END

    var requestdate = $("#gsc_requestedallocationdate").val();
    var isPrintOrder = false;

    $('#gsc_status').closest('td').hide();

    var odataUrl = "/_odata/vehicleallocation?$filter=gsc_salesorderid/Id eq (Guid'" + DMS.Helpers.GetUrlQueryString('id') + "')";

    //Recalculate Button
    $btnRecalculate = DMS.Helpers.CreateAnchorButton("btn-primary btn btnReCalculate", '', ' RECALCULATE', DMS.Helpers.CreateFontAwesomeIcon('fa-refresh'));
    $btnRecalculate.click(function (evt) {
        location.reload();
    });
    if (webRole != 'Cashier' && !webRole.contains("Vehicle Allocator") && webRole != "CC Manager" && !webRole.contains("MSD Manager"))
        DMS.Helpers.AppendButtonToToolbar($btnRecalculate);

    //Print Order Button
    $btnPrint = DMS.Helpers.CreateAnchorButton("btn-primary btn printOrder", '', ' PRINT ', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $btnPrint.click(function (evt) {
        evt.preventDefault();

        var param1var = DMS.Helpers.GetUrlQueryString('id');
        var protocol = window.location.protocol;
        var host = window.location.host;
        var url = protocol + "//" + host + "/report/?reportname={4e217836-b0af-e611-80e1-00155d010e2c}&reportid=" + param1var;
        window.open(url, 'blank', 'scrollbars=1,resizable=1,width=850,height=1000');

    });
    if (webRole != 'Cashier' && !webRole.contains("Vehicle Allocator") && webRole != "CC Manager" && !webRole.contains("MSD Manager"))
        DMS.Helpers.AppendButtonToToolbar($btnPrint);

    //Request for Vehicle Allocation Button
    var isrequest = $("#gsc_isrequestforallocation").is(":checked")

    $vehicleAllocationButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' REQUEST VEHICLE FOR ALLOCATION', DMS.Helpers.CreateFontAwesomeIcon('fa-taxi'));
    $vehicleAllocationButton.click(function (evt) {
        if (Page_ClientValidate("")) {
            evt.preventDefault();
            $("#gsc_isrequestforallocation").prop("checked", true);
            $("#UpdateButton").click();
        }
    });
    if (status == 'For Allocation' && webRole != 'Cashier' && !webRole.contains("Vehicle Allocator") && webRole != "CC Manager" && !webRole.contains("MSD Manager")) {
        DMS.Helpers.AppendButtonToToolbar($vehicleAllocationButton);
    }
    if (status == 'For Allocation' && isrequest == true) {
        $vehicleAllocationButton.attr("class", "request-link btn-primary btn permanent-disabled disabled");
    }
    else {
        $vehicleAllocationButton.attr("class", "request-link btn-primary btn");
    }

    //For Invoicing Button
    $btnTransfer = DMS.Helpers.CreateAnchorButton("btn-primary btn transferInvoice", '', ' TRANSFER FOR INVOICE', DMS.Helpers.CreateFontAwesomeIcon('fa-credit-card'));
    $btnTransfer.click(function (evt) {
        evt.preventDefault();

        $('#gsc_status').val("100000004");
        $('#gsc_istransferforinvoicing').prop("checked", true);
        $("#UpdateButton").click();
    });
    if (status == 'Allocated') {
        DMS.Helpers.AppendButtonToToolbar($btnTransfer);
    }
    
    if($("#gsc_netmonthlyamortization").html() == "₱0.00" && $("#gsc_paymentmode").val() == "100000001")
      $(".transferInvoice").attr("disabled", "disabled");

    if ((status == 'Open' || status == 'For Allocation' || status == 'Allocated' || status == 'Reserved') && webRole != "CC Manager") {
        $('#gsc_placeofrelease').prop("readOnly", false);
        $('#gsc_deliverytermsremarks').prop("readOnly", false);
        $('#gsc_promiseddeliverydate').next().children().first().prop("disabled", false);
        $('#gsc_requesteddeliverydate').next().children().first().prop("disabled", false);
    }

    else {
        $('#gsc_placeofrelease').prop("readOnly", true);
        $('#gsc_deliverytermsremarks').prop("readOnly", true);
        $('#gsc_promiseddeliverydate').next().children().first().prop("disabled", true);
        $('#gsc_requesteddeliverydate').next().children().first().prop("disabled", true);
    }

    //Allocate Button
    var allocateButton = document.createElement("BUTTON");
    var allocate = document.createElement("SPAN");
    allocate.className = "fa fa-crosshairs";
    allocateButton.appendChild(allocate);
    var allocateButtonLabel = document.createTextNode(" ALLOCATE");
    allocateButton.appendChild(allocateButtonLabel);
    allocateButton.className = "allocate-link btn btn-primary action disabled";
    allocateButton.addEventListener("click", AllocateVehicle);

    if (status == 'For Allocation') {
        $("#Inventory").find(".view-toolbar.grid-actions.clearfix").append(allocateButton);
    }

    //Ready for PDI Button
    $pdiButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' READY FOR PDI', DMS.Helpers.CreateFontAwesomeIcon('fa-arrow-circle-o-right'));
    $pdiButton.click(function (evt) {
        evt.preventDefault();
        showLoading();

        $("#gsc_isreadyforpdi").prop("checked", true);
        $("#UpdateButton").click();
    });

    if ((status == 'Allocated' || status == 'For Invoicing' || status == 'Pro-forma Invoice' || status == 'Completed') && webRole != "Cashier" && webRole != "CC Manager") {
        if (!$('#gsc_isreadyforpdi').is(":checked")) {
            DMS.Helpers.AppendButtonToToolbar($pdiButton);
        }
    }

    //Cancel Button 
    $btnCancel = DMS.Helpers.CreateAnchorButton("btn-primary btn btnCancel", '', ' CANCEL ', DMS.Helpers.CreateFontAwesomeIcon('fa-ban'));
    $btnCancel.click(function (evt) {
        evt.preventDefault();
    });
    $btnCancel.attr('data-toggle', 'modal');
    $btnCancel.attr('data-target', '#cancelOrderModal');

    if (status != 'Cancelled' && webRole != 'Cashier' && !webRole.contains("Vehicle Allocator") && webRole != "Invoicer" && webRole != "Invoice Generator by Dealer" && webRole != "CC Manager" && !webRole.contains("MSD Manager")) {
        DMS.Helpers.AppendButtonToToolbar($btnCancel);

        var cancelOrderModal = document.createElement('div');
        var modalHtml = '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h4 class="modal-body" class="modal-body">Cancel Order</h4>' +
            '</div>' +
            '<div id="modal-body" class="modal-body">' +
            '<center><p>Cancel Sales Order?</p></center>';

        if (status == 'Allocated' || status == 'For Invoicing')
            modalHtml = modalHtml + '<center><p>Note: Allocated vehicles will be unallocated.</p></center>';

        modalHtml = modalHtml + '<div class="modal-footer">' +
            '<button id="cancelOrderButton" type="submit" class="btn btn-dialog button">OK</button>' +
            '<button type="button" class="btn btn-dialog button" data-dismiss="modal"></i> CANCEL</button>' +
            '</div>' +
            '</div><!-- /.modal-content -->' +
            '</div><!-- /.modal-dialog -->';

        cancelOrderModal.innerHTML = modalHtml;
        cancelOrderModal.setAttribute('id', 'cancelOrderModal');
        cancelOrderModal.setAttribute('class', 'modal fade');
        cancelOrderModal.setAttribute('tabindex', '-1');
        cancelOrderModal.setAttribute('role', 'dialog');
        $('.crmEntityFormView').append(cancelOrderModal);
    }

    $('#cancelOrderButton').click(function () {
        event.preventDefault();
        $('#gsc_status').val("100000006");
        $("#UpdateButton").click();
    });


    //Action EVents
    $("#UpdateButton").click(function () {
        if ($('#gsc_isrequestforallocation').is(":checked")) { //if submit is from request for allocation
            if (Page_IsValid) {
                showLoading();
            }
        }
    });

    //Disable fields/buttons based on status
    if (status != 'Open') {
        $(".delete-link").addClass("permanent-disabled disabled");
    }
    if (status == 'Completed') {
        $(".btnCancel").addClass("permanent-disabled disabled");
    }
    if (status == 'For Invoicing' || status == "Completed" || status == "Pro-forma Invoice") {
        $("#gsc_free").attr('disabled', true);
        $("#gsc_freechattelfee").attr('disabled', true);
        $('.control > input').attr('readonly', true);
        $('.control > .input-group > input').attr('readonly', true);
        $('.control > select').attr('readonly', true);
        $(".datetimepicker > input").attr("disabled", "true");
        $('.clearlookupfield').remove();
        $('.launchentitylookup').remove();
        checkSubgrid("tabbed-DISCOUNTS");
        checkSubgrid("tabbed-CHARGES");
        checkSubgrid("AVAILABLEITEMS");
        checkSubgrid("ALLOCATEDITEM");
        checkSubgrid("documentchecklistsubgrid");
        checkSubgrid("CABCHASSIS");
        checkSubgrid("ACCESSORIES");

        $('#OrderMonthlyAmortizationSubgrid .delete').hide();
        $btnCancelCopy = DMS.Helpers.CreateButton('button', "btn-primary btn", 'margin-right:5px', ' CANCEL', DMS.Helpers.CreateFontAwesomeIcon('fa-times-circle'));
        $btnCancelCopy.attr('disabled', 'disabled');
        $('#OrderMonthlyAmortizationSubgrid .editable-grid-toolbar').find($('.delete')).before($btnCancelCopy);
        $('#UpdateButton').addClass('permanent-disabled disabled');
        $('.btnReCalculate').addClass('permanent-disabled disabled');
        //checkSubgrid("tabbed-AUTOFINANCING");

        setTimeout(function () {
            $('.control > textarea').attr('readonly', true);
        }, 100);
    }
    else if (status == "Cancelled") {
        $('#UpdateButton').addClass("permanent-disabled disabled");
        $('.delete-link').addClass('permanent-disabled disabled');
        $('.btnReCalculate').addClass("permanent-disabled disabled");
        $('.printOrder').addClass("permanent-disabled disabled");
        $('form fieldset').attr('disabled', true);
        $('form fieldset').addClass('permanent-disabled');
        $(".datetimepicker > input").attr("disabled", "true");
    }

    //show convert order to invoice button if status = "For Invoicing"
    if (status != "For Invoicing") {
        $(".convert-order-link").remove();
    }

    function checkSubgrid(tableDataName) {
        if ($('table[data-name="' + tableDataName + '"]').is(":visible")) {
            $('table[data-name="' + tableDataName + '"]').parent().addClass("permanent-disabled");
            $('table[data-name="' + tableDataName + '"]').parent().attr("disabled", "disabled");
        }
        else {
            setTimeout(function () { checkSubgrid(tableDataName); }, 50);
        }
    }

    function AddEventtoInventoryClick() {
        var count = getSelectedRecordsId('#Inventory').length;
        var countallocated = $('#AllocatedItems div.view-grid table tbody tr').length;
        if (count == 0 || DMS.Settings.User.positionName == 'Cashier') {//Cashier web role restrict allocation
            $("#allocationNotif").remove();
            $(".allocate-link").addClass("disabled");
        }
        else if (count == 1) {
            if (countallocated > 0) {
                $("#allocationNotif").remove();
                $(".allocate-link").addClass("disabled");
            }
            else {
                $("#allocationNotif").remove();
                $(".allocate-link").removeClass("disabled");
            }
        }
    }

    function AllocateVehicle(event) {
        var count = 0;
        var id = "";

        $('#Inventory tbody tr td.multi-select-cbx').each(function () {
            if ($(this).data('checked') == "true") {
                count += 1;
                id = $(this).closest('tr').data('id');
            }
        });

        if (count == 1) {
            //Loading Image
            showLoading();

            $("#gsc_inventoryidtoallocate").val(id);
            $("#UpdateButton").click();
        }
        else {
            DMS.Notification.Error(" You can only allocate one vehicle per transaction.", true, 5000);
        }
        event.preventDefault();
    }

    /*if (DMS.Settings.User.positionName == 'Sales Executive') {
        $('#gsc_originaltotalpremium_label').hide();
        $('#gsc_originaltotalpremium').hide();
    }*/

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

    $('.text.money').mask("#,##0.00", { reverse: true });

    //Added JGC_04102017 : Enhancement Of Insurance Tab
    $("#gsc_totalpremium").on('change', function () {
        var totalpremium = 0;
        var ctpl = 0;
        if ($("#gsc_totalpremium").val() != "")
            totalpremium = parseFloat($("#gsc_totalpremium").cleanVal());
        if ($("#gsc_ctpl").val() != "")
            ctpl = parseFloat($("#gsc_ctpl").cleanVal());
        $("#gsc_totalinsurancecharges").val(totalpremium + ctpl);
        maskTotalInsuranceCharge();
    });
    $("#gsc_ctpl").on('change', function () {
        var totalpremium = 0;
        var ctpl = 0;
        if ($("#gsc_totalpremium").val() != "")
            totalpremium = parseFloat($("#gsc_totalpremium").cleanVal());
        if ($("#gsc_ctpl").val() != "")
            ctpl = parseFloat($("#gsc_ctpl").cleanVal());
        $("#gsc_totalinsurancecharges").val(totalpremium + ctpl);
        maskTotalInsuranceCharge();
    });
    function maskTotalInsuranceCharge() {
        $('#gsc_totalinsurancecharges').mask('000,000,000,000,000.00', { reverse: true });
    }

    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;
    var totalPremiumValidator = document.createElement('span');
    totalPremiumValidator.style.display = "none";
    totalPremiumValidator.id = "RequiredFieldValidatorgsc_totalpremium";
    totalPremiumValidator.controltovalidate = "gsc_totalpremium";
    totalPremiumValidator.errormessage = "<a href='#gsc_totalpremium'>Total Premium is a required field</a>";
    totalPremiumValidator.validationGroup = "";
    totalPremiumValidator.initialvalue = "";
    totalPremiumValidator.evaluationfunction = function () {
        var value = $("#gsc_totalpremium").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var insuranceCoverageValidator = document.createElement('span');
    insuranceCoverageValidator.style.display = "none";
    insuranceCoverageValidator.id = "RequiredFieldValidatorgsc_insurancecoverage";
    insuranceCoverageValidator.controltovalidate = "gsc_insurancecoverage";
    insuranceCoverageValidator.errormessage = "<a href='#gsc_insurancecoverage'>Insurance Coverage is a required field</a>";
    insuranceCoverageValidator.validationGroup = "";
    insuranceCoverageValidator.initialvalue = "";
    insuranceCoverageValidator.evaluationfunction = function () {
        var value = $("#gsc_insurancecoverage").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var insuranceCoverage = $("#gsc_insurancecoverage").val();
    var provider = $("#gsc_providercompanyid").val();

    if (provider != "") {
        Page_Validators.push(insuranceCoverageValidator);
        $('#gsc_insurancecoverage_label').parent("div").addClass("required");
    }

    if (insuranceCoverage == "100000001" || insuranceCoverage == "100000000") //Contains Value
    {
        Page_Validators.push(totalPremiumValidator);
        $('#gsc_totalpremium_label').parent("div").addClass("required");
    }

    setTimeout(function () {
        $("#gsc_insurancecoverage").on('change', function () {
            var insuranceCoverage = $("#gsc_insurancecoverage").val();
            if (insuranceCoverage == "100000001" || insuranceCoverage == "100000000") // Non Inventory
            {
                Page_Validators.push(totalPremiumValidator);
                $('#gsc_totalpremium_label').parent("div").addClass("required");
            }
            else {
                $('#gsc_totalpremium_label').parent("div").removeClass("required");
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != totalPremiumValidator;
                });
            }
        });

        $("#gsc_providercompanyid").on('change', function () {
            var provider = $("#gsc_providercompanyid").val();
            if (provider != "") {
                Page_Validators.push(insuranceCoverageValidator);
                $('#gsc_insurancecoverage_label').parent("div").addClass("required");
            }
            else {
                $('#gsc_insurancecoverage_label').parent("div").removeClass("required");
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != insuranceCoverageValidator;
                });
            }
        });
    }, 100);

    //Added By: Jerome Anthony Gerero
    //Purpose : Hide Cab Chassis Subgrid
    setTimeout(function () {
        var productId = $('#gsc_productid').val();

        if (productId == null) {
            productId = '00000000-0000-0000-0000-000000000000';
        }
        var productOdataUrl = "/_odata/vehicleanditemcatalog?$filter=productid eq (Guid'" + productId + "')";

        $.ajax({
            type: 'get',
            async: true,
            url: productOdataUrl,
            success: function (data) {
                var bodyType = data.value[0].gsc_bodytypeid;

                if (bodyType != null) {
                    var bodyTypeOdataUrl = "/_odata/bodytype?$filter=gsc_sls_bodytypeid eq (Guid'" + bodyType.Id + "')";
                    $.ajax({
                        type: 'get',
                        async: true,
                        url: bodyTypeOdataUrl,
                        success: function (data) {
                            var isCabChassis = data.value[0].gsc_cabchassis;

                            if (isCabChassis == false) {
                                $('[data-name="CABCHASSIS"').parent().hide();
                            }
                        },
                        error: function (xhr, textStatus, errorMessage) {
                            console.log(errorMessage);
                        }
                    });
                }
            },
            error: function (xhr, textStatus, errorMessage) {
                console.log(errorMessage);
            }
        });
    }, 1000);

    setTimeout(disableTab, 3000);

    function disableTab() {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
    //End
});


var optionsList = DMS.Helpers.GetOptionListSet('/_odata/gsc_sls_financingterm', 'gsc_sls_financingtermid', 'gsc_financingtermpn');;


/*var classOdataUrl = "/_odata/gsc_class?$filter=gsc_classmaintenancepn eq 'Accessory'";
var classData = Service('GET', classOdataUrl, null, DMS.Helpers.DefaultErrorHandler);
var classId = "";
var accessoriesSelectData;

classData.then(function (data) {
    if (data != null) {
        classId = data.value[0].gsc_cmn_classmaintenanceid;

        accessoriesSelectData = DMS.Helpers.GetOptionListSet('/_odata/item?$filter=gsc_classmaintenanceid/Id%20eq%20(Guid%27' + classId + '%27)', "productid", "name");
        console.log(accessoriesSelectData);
        $(document).trigger("initializeEditableGrid", AccessroiessGridInstance);
    }
});*/


var productId = $("#gsc_productid").val();
var accessoriesSelectData = DMS.Helpers.GetOptionListSet('/_odata/vehicleaccessory?$filter=gsc_productid/Id%20eq%20(Guid%27' + productId + '%27)', "gsc_itemid.Id", "gsc_itemid.Name,gsc_vehicleaccessorypn");


var AccessroiessGridInstance = {
    initialize: function () {
        $('<div id="accessories-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');

        var $container = document.getElementById('accessories-editablegrid');
        var idQueryString = DMS.Helpers.GetUrlQueryString('id');
        $container.style.display = 'none';
        var odataQuery = '/_odata/gsc_sls_orderaccessory?$filter=gsc_orderid/Id%20eq%20(Guid%27' + idQueryString + '%27)';
        var screenSize = ($(window).width() / 2) - 80;

        /* - Read Only Permission for Cashier Role*/
        if (DMS.Settings.User.positionName == 'Cashier')
            var options = {
                dataSchema: {
                    gsc_sls_orderaccessoryid: null, gsc_free: false,
                    gsc_itemnumber: '', gsc_productid: { Id: null, Name: null }
                },
                colHeaders: [
                    'Free', 'Item Number',
                    'Item Description'
                ],
                columns: [
                    { data: 'gsc_free', type: 'checkbox', renderer: checkboxRenderer, className: "htCenter htMiddle", width: 50 },
                    { data: 'gsc_itemnumber', renderer: stringRenderer, readOnly: true, className: "htCenter htMiddle", width: 100 },
                    {
                        data: 'gsc_productid', className: "htCenter htMiddle", width: 100, renderer: function (instance, td, row, col, prop, value, cellProperties) {
                            return lookupRenderer(accessoriesSelectData, instance, td, row, col, prop, value, cellProperties);
                        },
                        readOnly: true,
                        editor: 'select2',
                        select2Options: { // these options are the select2 initialization options 
                            data: accessoriesSelectData,
                            dropdownAutoWidth: true,
                            allowClear: true,
                            width: 'resolve'
                        }
                    }
                ],
                gridWidth: screenSize,
                addNewRows: false,
                deleteRows: false
            }
        else
            var options = {
                dataSchema: {
                    gsc_sls_orderaccessoryid: null, gsc_free: false,
                    gsc_itemnumber: '', gsc_productid: { Id: null, Name: null }
                },
                colHeaders: [
                    'Free', 'Item Number',
                    'Item Description'
                ],
                columns: [
                    { data: 'gsc_free', type: 'checkbox', renderer: checkboxRenderer, className: "htCenter htMiddle", width: 50 },
                    { data: 'gsc_itemnumber', renderer: stringRenderer, readOnly: false, className: "htCenter htMiddle", width: 100 },
                    {
                        data: 'gsc_productid', className: "htCenter htMiddle", width: 100, renderer: function (instance, td, row, col, prop, value, cellProperties) {
                            return lookupRenderer(accessoriesSelectData, instance, td, row, col, prop, value, cellProperties);
                        },
                        readOnly: false,
                        editor: 'select2',
                        select2Options: { // these options are the select2 initialization options 
                            data: accessoriesSelectData,
                            dropdownAutoWidth: true,
                            allowClear: true,
                            width: 'resolve'
                        }
                    }
                ],
                gridWidth: screenSize,
                addNewRows: true,
                deleteRows: true
            }

        var sectionName = "ACCESSORIES";
        var attributes = [{ key: 'gsc_free', type: 'System.Boolean' },
        { key: 'gsc_productid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'product' },
        { key: 'gsc_orderid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'salesorder', value: idQueryString }];
        var model = { id: 'gsc_sls_orderaccessoryid', entity: 'gsc_sls_orderaccessory', attr: attributes };
        var hotInstance = EditableGrid(options, $container, sectionName, odataQuery, model,
            {
                gsc_sls_orderaccessoryid: null, gsc_free: false,
                gsc_itemnumber: '', gsc_productid: { Id: null, Name: null }
            }
        );
    }
}

var cabChassisSelectData = DMS.Helpers.GetOptionListSet('/_odata/gsc_sls_vehiclecabchassis?$filter=gsc_productid/Id%20eq%20(Guid%27' + productId + '%27)', "gsc_sls_vehiclecabchassisid", "gsc_vehiclecabchassispn,gsc_itemid.Name");

var CabChasisGridInstance = {
    initialize: function () {
        $('<div id="cabchassis-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');

        var $container = document.getElementById('cabchassis-editablegrid');
        var idQueryString = DMS.Helpers.GetUrlQueryString('id');
        $container.style.display = 'none';
        var odataQuery = '/_odata/gsc_sls_ordercabchassis?$filter=gsc_orderid/Id%20eq%20(Guid%27' + idQueryString + '%27)';
        var screenSize = ($(window).width() / 2) - 80;

        /* - Read Only Permission for Cashier Role*/
        if (DMS.Settings.User.positionName == 'Cashier')
            var options = {
                dataSchema: {
                    gsc_sls_ordercabchassisid: null, gsc_financing: null,
                    gsc_itemnumber: 0, gsc_vehiclecabchassisid: { Id: null, Name: null }
                },
                colHeaders: [
                    'Financing', 'Item Number',
                    'Item Description'
                ],
                columns: [
                    { data: 'gsc_financing', type: 'checkbox', renderer: checkboxRenderer, readOnly: true, className: "htCenter htMiddle", width: 50 },
                    { data: 'gsc_itemnumber', renderer: stringRenderer, readOnly: true, className: "htCenter htMiddle", width: 100 },
                    {
                        data: 'gsc_vehiclecabchassisid', className: "htCenter htMiddle", width: 100, renderer: function (instance, td, row, col, prop, value, cellProperties) {
                            return lookupRenderer(cabChassisSelectData, instance, td, row, col, prop, value, cellProperties);
                        },
                        editor: 'select2',
                        readOnly: true,
                        select2Options: { // these options are the select2 initialization options 
                            data: cabChassisSelectData,
                            dropdownAutoWidth: true,
                            allowClear: true,
                            width: 'resolve'
                        }
                    }
                ],
                gridWidth: screenSize,
                addNewRows: false,
                deleteRows: false
            }
        else
            var options = {
                dataSchema: {
                    gsc_sls_ordercabchassisid: null, gsc_financing: null,
                    gsc_itemnumber: 0, gsc_vehiclecabchassisid: { Id: null, Name: null }
                },
                colHeaders: [
                    'Financing', 'Item Number',
                    'Item Description'
                ],
                columns: [
                    { data: 'gsc_financing', type: 'checkbox', renderer: checkboxRenderer, readOnly: true, className: "htCenter htMiddle", width: 50 },
                    { data: 'gsc_itemnumber', renderer: stringRenderer, readOnly: true, className: "htCenter htMiddle", width: 100 },
                    {
                        data: 'gsc_vehiclecabchassisid', className: "htCenter htMiddle", width: 100, renderer: function (instance, td, row, col, prop, value, cellProperties) {
                            return lookupRenderer(cabChassisSelectData, instance, td, row, col, prop, value, cellProperties);
                        },
                        editor: 'select2',
                        select2Options: { // these options are the select2 initialization options 
                            data: cabChassisSelectData,
                            dropdownAutoWidth: true,
                            allowClear: true,
                            width: 'resolve'
                        }
                    }
                ],
                gridWidth: screenSize,
                addNewRows: true,
                deleteRows: true
            }

        var sectionName = "CABCHASSIS";
        var attributes = [{ key: 'gsc_financing', type: 'System.Boolean' },
        { key: 'gsc_orderid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'salesorder', value: idQueryString },
        { key: 'gsc_vehiclecabchassisid', type: 'Microsoft.Xrm.Sdk.EntityReference', reference: 'gsc_sls_vehiclecabchassis' }];
        var model = { id: 'gsc_sls_ordercabchassisid', entity: 'gsc_sls_ordercabchassis', attr: attributes };
        var hotInstance = EditableGrid(options, $container, sectionName, odataQuery, model,
            {
                gsc_sls_quotecabchassisid: null, gsc_financing: false,
                gsc_itemnumber: '', gsc_vehiclecabchassisid: { Id: null, Name: null }
            }
        );
    }
}


var monthlyAmortizationGridInstance = {
    initialize: function () {
        $('<div id="monthlyamortization-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');
        var $container = document.getElementById('monthlyamortization-editablegrid');
        var idQueryString = DMS.Helpers.GetUrlQueryString('id');
        var odataQuery = '/_odata/gsc_sls_ordermonthlyamortization?$filter=gsc_orderid/Id%20eq%20(Guid%27' + idQueryString + '%27)';
        // var odataQuery = '/_odata/gsc_sls_ordermonthlyamortization?$filter=gsc_orderid/Id%20eq%20(Guid%27' + idQueryString + '%27)';
        var screenSize = ($(window).width() / 2) - 100;
        /* - Read Only Permission for Cashier Role*/
        if (DMS.Settings.User.positionName == 'Cashier') {
            var options = {
                dataSchema: {
                    gsc_selected: null, gsc_orderid: { Id: null, Name: null },
                    //gsc_financingtermid: { Id: null, Name: null },
                    gsc_financingtermid: null,
                    gsc_ordermonthlyamortizationpn: null
                },
                colHeaders: [
                  '', 'Financing Term',
                  'Monthly Amortization'
                ],
                columns: [
                  { data: 'gsc_selected', type: 'checkbox', renderer: checkboxRenderer, readOnly: true, className: "htCenter htMiddle", width: 50 },
                  { data: 'gsc_financingtermid.Name', type: 'numeric', readOnly: true, className: "htCenter htMiddle", width: 100 },
                  { data: 'gsc_ordermonthlyamortizationpn', renderer: stringRenderer, readOnly: true, className: "htCenter htMiddle", width: 100 }
                ],
                columnSorting: {
                    column: 1,
                    sortOrder: true
                },
                gridWidth: screenSize,
                addNewRows: false,
                deleteRows: false
            }
        }
        else {
            var options = {
                dataSchema: {
                    gsc_selected: null, gsc_orderid: { Id: null, Name: null },
                    //gsc_financingtermid: { Id: null, Name: null },
                    gsc_financingtermid: null,
                    gsc_ordermonthlyamortizationpn: null
                },
                colHeaders: [
                  'Select Term *',
                  'Financing Term',
                  'Monthly Amortization'
                ],
                columns: [
                  { data: 'gsc_selected', type: 'checkbox', renderer: checkboxRenderer, className: "htCenter htMiddle", width: 50 },
                  { data: 'gsc_financingtermid.Name', type: 'numeric', readOnly: true, className: "htCenter htMiddle", width: 100 },
                  { data: 'gsc_ordermonthlyamortizationpn', renderer: stringRenderer, readOnly: true, className: "htCenter htMiddle", width: 100 }
                ],
                columnSorting: {
                    column: 1,
                    sortOrder: true
                },
                gridWidth: screenSize,
                addNewRows: false,
                deleteRows: false
            }
        }

        var sectionName = "OrderMonthlyAmortizationSubgrid";
        var attributes = [{ key: 'gsc_selected', type: 'System.Boolean' }];
        var model = { id: 'gsc_sls_ordermonthlyamortizationid', entity: 'gsc_sls_ordermonthlyamortization', attr: attributes };
        var hotInstance = EditableGrid(options, $container, sectionName, odataQuery, model,
          {
              gsc_sls_ordermonthlyamortizationid: null, gsc_selected: false,
              gsc_financingtermid: { Id: null, Name: null }, gsc_ordermonthlyamortizationpn: null
              // gsc_orderid: { Id: null, Name: null },
          }
        );

        hotInstance.addHook('afterLoadData', function () {
            var status = $(".record-status").html();
            if (hotInstance.countRows() > 0 && (status != "For Invoicing" && status != "Completed")) {
                $(".btnSaveCopy").removeAttr("disabled");
            }
        });
    }
}

$(document).bind('DOMNodeInserted', function (evt) {
    var table = $(evt.target).closest("#AllocatedItems");
    if (evt.target.nodeName == 'TBODY' && evt.relatedNode.nodeName == 'TABLE' && (typeof table.html() !== 'undefined')) {
        hasAllocatedItems = true;
    }
});