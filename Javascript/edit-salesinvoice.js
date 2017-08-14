// Created By : Jerome Anthony Gerero, Created On : 5/18/2016
var checker = false;

$(document).ready(function () {
    var status = $(".record-status").html();
    $('#gsc_reasonforcancellation').attr("readonly", "readonly");

    if (status != "Cancelled") {
        $('label[for=gsc_reasonforcancellation], input#gsc_reasonforcancellation').hide();
    }

    var webRole = DMS.Settings.User.webRole;

    if (status != "Open" || webRole.indexOf("MSD Manager") >= 0) {
        $('#SubmitButton').hide();
        $('#UpdateButton').hide();
        $('.delete-link').hide();
        $('#name').attr("readonly", "true");
    }

    $('#InvoiceMonthlyAmortization_Subgrid').html('');
    $(document).trigger("initializeEditableGrid", monthlyAmortizationGridInstance);
    $('#InvoiceMonthlyAmortization_Subgrid .editable-grid-toolbar').hide();

    //Added By ARM_03172017
    var webRole = DMS.Settings.User.webRole;
    if (webRole == "Invoicer") {
        $('#SubmitButton').addClass("hidden");
        $('#UpdateButton').addClass("hidden");
        // Exception: Invoicer can only update sales invoice number (name)
        if (status == "Open")
            $('#name').attr("readonly", false);
    }

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
                                $('[data-name="CAB CHASSIS Add-ons"').parent().hide();
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

    //JGC_05302017
    //EXPORT BUTTON
    var wordIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-file-word-o');
    var exportWordBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary exportWord', '', ' EXPORT TO WORD', wordIcon);
    DMS.Helpers.AppendButtonToToolbar(exportWordBtn);

    exportWordBtn.click(function (e) {
        e.preventDefault();
        if (Page_ClientValidate("")) {
            var invoiceId = $('#name').val();
            var param1var = DMS.Helpers.GetUrlQueryString('id');
            var protocol = window.location.protocol;
            var host = window.location.host;
            var url = protocol + "//" + host + "/report/?reportname={5d57ff39-61d2-e611-80e7-00155d010e2c}&reportid=" + param1var
              + "&recordId=" + invoiceId + "&exportToWord=" + 1;
            window.location.href = url;
            //exportWindow.document.write("<p> Successfully downloaded ! </p>");      
        }
    });
    //End

    //Added by: JGC_12092016
    /*    if (DMS.Settings.User.positionName != 'Sales Manager' && DMS.Settings.User.positionName != 'Sales Executive' && DMS.Settings.User.positionName != 'System Administrator') {
            $(".nav.nav-tabs li:eq(3)").hide()
    
        }
        if (DMS.Settings.User.positionName != 'Sales Manager' && DMS.Settings.User.positionName != 'System Administrator') {
            $('#gsc_rate_label').hide();
            $('#gsc_rate').hide();
            $('#gsc_cost_label').hide();
            $('#gsc_cost').hide();
            $('#gsc_originaltotalpremium_label').hide();
            $('#gsc_originaltotalpremium').hide();
            $('#basic-addon1_label').hide();
            $('#basic-addon1').hide();
        }*/
    // end hide

    $(".section[data-name='HiddenSection']").closest("fieldset").hide();
    $("#gsc_posttransactiondate").next(".datetimepicker").children('input').attr("readOnly", "readOnly");
    $("#gsc_posttransactiondate").next(".datetimepicker").children('span').remove();


    var cancelReasonModal = document.createElement("div");
    cancelReasonModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Cancel Invoice</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<center><p>This Sales Invoice will be cancelled. Please select one of the reasons below: </p>' +
    '<select id="statusReason" >' +
    '</select>' +
    '<div id="cancelReason" style="display:none"><br/>Enter remarks here: <span style="color:red">*</span><br/><textarea id="disqualifyRemarks" style="margin: 0px; height: 50px; width: 300px;"></textarea></div>' +
    '</center></div>' +
    '<div class="modal-footer">' +
    '<a href="" data-toggle="modal" data-dismiss="modal"> <button id="continueBtn" type="button" class="btn btn-dialog button required">CONTINUE</button> </a>' +
    '<button type="button" class="btn btn-dialog button" data-dismiss="modal">CANCEL</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    cancelReasonModal.setAttribute("id", "myModal");
    cancelReasonModal.setAttribute("class", "modal fade");
    cancelReasonModal.setAttribute("tabindex", "-1");
    cancelReasonModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(cancelReasonModal);

    var cancelInvoiceModal = document.createElement("div");
    cancelInvoiceModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Cancel Invoice</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<center><p>Would you also like to cancel Vehicle Sales Order?</p>' +
    '</center></div>' +
    '<div class="modal-footer">' +
    '<button id="cancelOrderInvoiceBtn" type="submit" class="btn btn-primary btn-dialogue" >YES</button>' +
    '<button id="cancelInvoiceBtn" type="button" class="btn btn-default btn-dialogue">NO</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    cancelInvoiceModal.setAttribute("id", "confirmModal");
    cancelInvoiceModal.setAttribute("class", "modal fade");
    cancelInvoiceModal.setAttribute("tabindex", "-1");
    cancelInvoiceModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(cancelInvoiceModal);

    var postInvoiceModal = document.createElement("div");
    postInvoiceModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Post Invoice</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '' +
    ' <div class="form-group col-md-6"><label>Confirm Posting Date </label> <div class="input-group date" id="modalPostDate">' +
        '<input type="text" id="modalPostDateValue" class="form-control" placeholder="Please enter post date"/>' +
        '<span class="input-group-addon">' +
            '<span class="glyphicon glyphicon-calendar"></span>' +
        '</span> </div>' +
    '</div> ' +
    '</div>' +
    '<div class="modal-footer" style="margin-top:60px;">' +
    '<button id="postInvoiceBtn" type="button" class="btn btn-primary" >POST INVOICE</button>' +
    '<button type="button" class="btn btn-default" data-dismiss="modal">CANCEL</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    postInvoiceModal.setAttribute("id", "myModal2");
    postInvoiceModal.setAttribute("class", "modal fade");
    postInvoiceModal.setAttribute("tabindex", "-1");
    postInvoiceModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(postInvoiceModal);

    var reprintModal = document.createElement("div");
    reprintModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Cancel Invoice</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<center><p>This a reprint copy of this Sales Invoice report.</p>' +
    '</center></div>' +
    '<div class="modal-footer">' +
    '<button id="reprintBtn" type="submit" class="btn btn-primary btn-dialogue" >CONTINUE</button>' +
    '<button type="button" class="btn btn-default btn-dialogue">CANCEL</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    reprintModal.setAttribute("id", "myModal");
    reprintModal.setAttribute("class", "modal fade");
    reprintModal.setAttribute("tabindex", "-1");
    reprintModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(reprintModal);

    $('#modalPostDate').datetimepicker({
        pickTime: false,
        autoclose: true,
        setDate: new Date()
    });
    $("#modalPostDate").on("dp.change", function (e) {
        var postDate = new Date($('#modalPostDate').data('date'));
        postDate.setHours(0, 0, 0, 0);
        var dateFormat = "M/D/YYYY h:mm A";
        var formattedDate = moment(postDate).format(dateFormat);

        $("#gsc_posttransactiondate").next(".datetimepicker").children('input').val(formattedDate);
        $("#gsc_posttransactiondate").val(postDate.format('yyyy-MM-ddTHH:mm:ss.0000000Z'));

        $('#modalPostDate').data("DateTimePicker").setMaxDate(moment());
        checker = true;

        if ($("#modalPostDateValue").val() == "") {
            //alert("test");
            checker = false;
        }
    });



    $('td.datetime:nth-child(2) > div:nth-child(2)').css({ "pointer-events": "none", "cursor": "default" });

    //Print Button
    $printBtn = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT ', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $printBtn.attr("id", "printButton");
    $printBtn.attr("data-toggle", "modal");
    $printBtn.attr("data-target", "#printMessageModal");

    //Modal construction
    var printModal = document.createElement("div");
    printModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Print</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<center><p>You cannot change the sales invoice ID upon printing. Are you sure you want to print this record?</p>' +
    '</center></div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="primary btn btn-dialog btn-default" id="printBtn">PRINT</button>' +
    '<button type="button" class="primary btn btn-dialog btn-default" data-dismiss="modal">CANCEL</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    printModal.setAttribute("id", "printMessageModal");
    printModal.setAttribute("class", "modal fade");
    printModal.setAttribute("tabindex", "-1");
    printModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(printModal);

    //$(".form-action-container-left").append(printBtn);

    $('#printBtn').click(function (e) {
        e.preventDefault();
        var printCount = $("#gsc_print").val();
        if (printCount == "")
            printCount = 0;
        var print = parseInt(printCount) + 1;
        var invoiceID = $('#name').val();
        var button = $(this);
        var fields = [{ key: 'gsc_print', value: print },
                      { key: 'gsc_isdeliveryreceiptandgatepass', value: true, type: 'System.Boolean' },
                      { key: 'name', value: invoiceID }];
        var entityId = DMS.Helpers.GetUrlQueryString('id');
        recordArr = GetModelForSelectedRecords(fields, entityId);
        var that = $(this);
        var print_ = $('#printBtn').html();
        if (status != "Open") {
            PrintReport();
            $('#printMessageModal').modal('hide');
        }
        else {
            if (recordArr.length > 0) {
                that.html('<i class="fa fa-spinner fa-spin"></i>&nbsp;PROCESSING..');
                that.addClass('disabled');
                var url = "/api/EditableGrid/UpdateRecords";
                var json = JSON.stringify(recordArr);
                var service = Service('PUT', url, json, DMS.Helpers.DefaultErrorHandler);
                service.then(function () {
                    $("#UpdateButton").click();
                    PrintReport();

                }).always(function () {
                    that.html(print_);
                    that.removeClass('disabled');
                    $('#printMessageModal').modal('hide');
                });
                return;
            }
        }
        function GetModelForSelectedRecords(fields, entityId) {
            var result = [];
            var arr = { Id: null, Entity: null, Records: [] };
            arr.Entity = $('#EntityFormView_EntityLayoutConfig').data("form-layout").EntityName;
            arr.Id = entityId;
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
            return result;
        }
    });
    //End Print Button


    function PrintReport() {
        $("#name").addClass('permanent-disabled');
        var param1var = getQueryVariable("id");
        var protocol = window.location.protocol;
        var host = window.location.host;
        var url = protocol + "//" + host + "/report/?reportname={5d57ff39-61d2-e611-80e7-00155d010e2c}&reportid=" + param1var;
        window.open(url, 'blank', 'width=850,height=1000');
    }

    //Cancel Button
    $cancelInvoiceButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' CANCEL ', DMS.Helpers.CreateFontAwesomeIcon('fa-ban'));
    var cancelCtr = 0;
    $cancelInvoiceButton.click(function (evt) {
        evt.preventDefault();

        cancelCtr++;
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center loadingDiv";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);

        var reasonOdataUrl = "/_odata/reason?$filter=gsc_transactiontype/Value%20eq%20100000000";
        var reasonList = Service('GET', reasonOdataUrl, null, DMS.Helpers.DefaultErrorHandler);

        reasonList.then(function (data) {
            $.unblockUI();
            $(".loadingDiv").remove();
            if (data != null) {
                $.each(data.value, function (key, value) {
                    $('#statusReason').append($("<option></option>")
                                    .attr("value", value.gsc_reasonpn)
                                    .text(value.gsc_reasonpn));

                });
                if (cancelCtr != 0)
                    $('#statusReason').append($("<option></option>")
                                .attr("value", "Others")
                                .text("Others"));
            }
            else {
                $('#statusReason')
                    .append($("<option></option>")
                               .attr("value", "")
                               .text("No records to display."));
            }
            $('#myModal').modal();
        });

    });

    //Post Transaction Button
    $postTransactionButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' POST TRANSACTION', DMS.Helpers.CreateFontAwesomeIcon('fa-thumb-tack'));
    $postTransactionButton.attr("data-toggle", "modal");
    $postTransactionButton.attr("data-target", "#myModal2");
    $postTransactionButton.attr("id", "postTransactionButton");
    $postTransactionButton.click(function (evt) {
        evt.preventDefault();
    });

    var invoiceStatusCopy = $("#gsc_invoicestatuscopy").val();

    if (invoiceStatusCopy != '100000004' && webRole.indexOf("MSD Manager") < 0) {
        DMS.Helpers.AppendButtonToToolbar($printBtn);

    }
    if ((invoiceStatusCopy == '100000002' || invoiceStatusCopy == '100000003') && webRole.indexOf("MSD Manager") < 0) {
        DMS.Helpers.AppendButtonToToolbar($cancelInvoiceButton);
    }

    if (invoiceStatusCopy == '100000003') {
        DMS.Helpers.AppendButtonToToolbar($postTransactionButton);
    }

    $('#statusReason').on('change', function () {
        var selectedStatusReasonText = $("#statusReason option:selected").text();

        if (selectedStatusReasonText != 'Others') {
            $('#cancelReason').hide();
        }
        else {
            $('#cancelReason').show();
        }
    });

    //Modified by Ernest Sarmiento 02-02-2017
    if (typeof (Page_Validators) == 'undefined') return;

    var statusReasonRemarksValidator = document.createElement('span');
    statusReasonRemarksValidator.style.display = "none";
    statusReasonRemarksValidator.id = "statusReasonRemarksValidator";
    statusReasonRemarksValidator.errormessage = "Disqualify Remarks must not be empty.";
    statusReasonRemarksValidator.validationGroup = "";
    statusReasonRemarksValidator.initialvalue = "";
    statusReasonRemarksValidator.evaluationfunction = function () {
        if ($('#statusReason option:selected').text() == "Others" && $('#disqualifyRemarks').val().length <= 0) {
            return false;
        } else {
            return true;
        }
    };

    $('#continueBtn').click(function () {
        var reason = $('#statusReason option:selected').text();
        var disqualifyRemarks = $('#disqualifyRemarks').val();

        if (reason == "Others" && disqualifyRemarks.length <= 0) {
            Page_Validators.push(statusReasonRemarksValidator);
            Page_ClientValidate();
        } else {
            $("#gsc_reasonforcancellation").val(disqualifyRemarks);
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != statusReasonRemarksValidator;
            });
            Page_ClientValidate();
            $("#confirmModal").modal("toggle");
        }
    });
    // End of Continue Button

    $('#cancelOrderInvoiceBtn').click(function () {
        var cancelOrderCount = $("#gsc_cancelorder").val();
        if (cancelOrderCount == "")
            cancelOrderCount = 0;

        //$("#gsc_invoicestatuscopy").val(100000005);    
        $("#gsc_cancelorder").val(parseInt(cancelOrderCount) + 1);

        $("#UpdateButton").click();
    });

    $('#cancelInvoiceBtn').click(function () {
        $("#gsc_invoicestatuscopy").val(100000005);
        $("#UpdateButton").click();
    });

    $('#postInvoiceBtn').click(function () {

        if (!checker) {
            $('#postInvoiceBtn').parent().addClass('disabled');
            DMS.Notification.Error(" Please select a valid Date.", true, 5000);
        }
        else {
            $("#gsc_invoicestatuscopy").val(100000004);
            $("#UpdateButton").click();
        }
    });

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }

    setTimeout(disableTab, 3000);

    function disableTab() {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
});

var monthlyAmortizationGridInstance = {
    initialize: function () {
        $('<div id="monthlyamortization-editablegrid" class="editable-grid"></div>').appendTo('.content-wrapper');
        var $container = document.getElementById('monthlyamortization-editablegrid');
        var idQueryString = DMS.Helpers.GetUrlQueryString('id');
        var odataQuery = '/_odata/invoiceMonthlyAmortization?$filter=gsc_invoiceid/Id%20eq%20(Guid%27' + idQueryString + '%27)';
        var screenSize = ($(window).width() / 2) - 100;
        var options = {
            dataSchema: {
                gsc_selected: null, gsc_invoiceid: { Id: null, Name: null },
                //gsc_financingtermid: { Id: null, Name: null },
                gsc_financingtermid: null,
                gsc_invoicemonthlyamortizationpn: null
            },
            colHeaders: [
                'Select Term *',
                'Financing Term',
                'Monthly Amortization'
            ],
            columns: [
                { data: 'gsc_selected', type: 'checkbox', renderer: checkboxRenderer, readOnly: true, className: "htCenter htMiddle", width: 50 },
                { data: 'gsc_financingtermid.Name', type: 'numeric', readOnly: true, className: "htCenter htMiddle", width: 100 },
                { data: 'gsc_invoicemonthlyamortizationpn', renderer: stringRenderer, readOnly: true, className: "htCenter htMiddle", width: 100 }
            ],
            columnSorting: {
                column: 1,
                sortOrder: true
            },
            gridWidth: screenSize,
            addNewRows: false,
            deleteRows: false
        }

        var sectionName = "InvoiceMonthlyAmortization_Subgrid";
        var attributes = [{ key: 'gsc_selected', type: 'System.Boolean' }];
        var model = { id: 'gsc_sls_invoicemonthlyamortizationid', entity: 'gsc_sls_invoicemonthlyamortization', attr: attributes };
        var hotInstance = EditableGrid(options, $container, sectionName, odataQuery, model,
            {
            }
        );

    }
}