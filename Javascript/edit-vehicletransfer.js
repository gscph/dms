//Created By : Raphael Herrera, Created On : 8/1/2016
$(document).ready(function () {
    //transfer status
    var transferStatus = $('#gsc_transferstatus').val();
    var status = $(".record-status").html();

    if (status == "Cancelled" || status == "Posted") {
        checkSubgrid();
    }

    function checkSubgrid() {
        if ($('table[data-name="tab_5_section_4"]').is(":visible")) {
            $('table[data-name="tab_5_section_4"]').parent().addClass("permanent-disabled");
            $('table[data-name="tab_5_section_4"]').parent().attr("disabled", "disabled");
        }
        else {
            setTimeout(function () { checkSubgrid(); }, 50);
        }
    }

    checkPermission();
    function checkPermission() {
        if (DMS.Settings.Permission.Update == null) {
            setTimeout(function () {
                checkPermission();
            }, 100);
        }
        else {
            if (DMS.Settings.Permission.Update == true)
                drawAllocateButton();
        }
    }

    if ($('a:contains("DISPLAY")').is(':visible'))
        $('a:contains("DISPLAY")').click();

    // comment here please
    //if(transferStatus != 100000000 || $('.record-status').html() == "")  
    drawPostButton();

    $('#AllocatedVehicles .entity-grid.subgrid').on('loaded', function () {
        if ($('#AllocatedVehicles tr').length > 1 && status == "Open") {
            if ($('.post').length == 1)
                $('.post').removeClass("permanent-disabled disabled");
        }
    });

    if (transferStatus != 100000001) {
        setTimeout(function () {
            // DMS.Helpers.DisableEntityForm();
        }, 500);
        setTimeout(function () {
            //   DMS.Helpers.DisableEntityForm();
        }, 1000);
    }
    if (status == "Open") createCancelButton();

    $('#gsc_inventoryidtoallocate').hide();
    $('#gsc_inventoryidtoallocate_label').hide();
    $('#gsc_inventoryidtoallocate').val('');

    $('#gsc_transferstatus').hide();
    $('#gsc_transferstatus_label').hide();

    /*transferStatus == Posted*/
    if (status != "Open")
        disableFields();


    checkRefreshButton();

    function checkRefreshButton() {

        if ($('a:contains("REFRESH")').is(':visible')) {
            $('a:contains("REFRESH")').attr("id", "refresh");
            document.getElementById('refresh').addEventListener('click', DMS.Helpers.Debounce(function (e) {
                e.preventDefault();
                $(document).on('click', '#Inventory tbody tr', AddEventInventory);
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
                AddEventInventory();
            });
        }
        else {
            setTimeout(checkTDColumn, 50);
        }
    }

    //Create Print Button By: Artum Ramos
    $printBtn = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' PRINT', DMS.Helpers.CreateFontAwesomeIcon('fa-print'));
    $printBtn.click(function (evt) {
        if (Page_ClientValidate("")) {
            var recordId = getQueryVariable('id');
            var protocol = window.location.protocol;
            var host = window.location.host;
            var url = protocol + '//' + host + '/report/?reportname={3E749607-955F-E611-80DB-00155D010E2C}&reportid=' + recordId;
            window.open(url, 'blank', 'width=1200,height=850');
            event.preventDefault();
        }
    });
    DMS.Helpers.AppendButtonToToolbar($printBtn);

    //Custom Buttons
    function drawAllocateButton() {

        var allocateButton = document.createElement("BUTTON");
        var allocate = document.createElement("SPAN");
        allocate.className = "fa fa-plus";
        allocateButton.appendChild(allocate);
        allocateButton.style = "margin-left:5px";
        var allocateButtonLabel = document.createTextNode(" TRANSFER VEHICLE");
        allocateButton.appendChild(allocateButtonLabel);

        /*transferStatus == Unposted*/
        //if(transferStatus == 100000001 || $('.record-status').html() == "")
        //allocateButton.className = "allocate-link btn btn-primary action";
        //else
        allocateButton.className = "allocate-link btn btn-primary action disabled";
        allocateButton.addEventListener("click", AllocateVehicle);
        $("#Inventory").find(".view-toolbar.grid-actions.clearfix").append(allocateButton);
    }

    function drawPostButton() {
        var postButton = document.createElement("BUTTON");
        var post = document.createElement("SPAN");
        post.className = "fa fa-thumb-tack";
        postButton.appendChild(post);
        var postButtonLabel = document.createTextNode(" POST");
        postButton.className = "post btn btn-primary permanent-disabled disabled";
        postButton.appendChild(postButtonLabel);
        postButton.addEventListener("click", postTransaction);

        DMS.Helpers.AppendButtonToToolbar(postButton);
    }

    //Functions
    function postTransaction() {
        showLoading();
        $('#gsc_transferstatus').val('100000000')
        $("#UpdateButton").click();
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
            showLoading();

            $("#gsc_inventoryidtoallocate").val(id);
            $("#UpdateButton").click();
        }
        else {
            DMS.Notification.Error(" You can only allocate one vehicle per transaction.", true, 5000);
        }
        //event.preventDefault();
    }

    //set fields to readonly
    function disableFields() {
        $('#UpdateButton').addClass('permanent-disabled disabled');
        $('.delete-link').addClass('permanent-disabled disabled');
        $('.control > input').attr('readOnly', true);
        $('.control > textarea').attr('readOnly', true);
        $('.datetimepicker > .form-control').attr('readOnly', true);
        $('.add-margin-right').addClass('permanent-disabled disabled');

        $('.clearlookupfield').remove();
        $('.launchentitylookup').remove();
        $('.input-group-addon').remove();

        $('#gsc_transferstatus').hide();
        $('#gsc_transferstatus_label').hide();
    }

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

    //Cancel
    function createCancelButton() {
        var cancelIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-ban');
        var cancelBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary cancel', '', ' CANCEL', cancelIcon);
        var cancelConfirmation = DMS.Helpers.CreateModalConfirmation({ id: 'cancelModal', headerIcon: 'fa fa-ban', headerTitle: ' Cancel ', Body: 'Are you sure you want to canncel vehicle sransfer?' });
        $(".crmEntityFormView").append(cancelConfirmation);
        cancelBtn.on('click', function (evt) {
            cancelConfirmation.find('.confirmModal').on('click', function () {
                $('#gsc_transferstatus').val('100000002');
                $("#UpdateButton").click();
                cancelConfirmation.modal('hide');
                //  showLoading();
            });
            cancelConfirmation.modal('show');
        });

        DMS.Helpers.AppendButtonToToolbar(cancelBtn);
    }

    //    $(document).on('click', '#Inventory .view-grid table tbody tr', AddEventInventory);

    /* setTimeout(function () {
         //$('#Inventory .allocate-link').addClass('disabled');
         $('#Inventory .view-grid table tbody td.multi-select-cbx').click(function () {
             AddEventInventory();
         });
     }, 3000);*/

    function AddEventInventory() {
        var id;
        var counter = 0;

        $('#Inventory tbody tr td.multi-select-cbx').each(function () {
            if ($(this).data('checked') == "true") {
                counter++;
            }
        });

        if (counter > 0) {
            if (transferStatus == 100000001 || $('.record-status').html() == "")
                $('#Inventory .allocate-link').removeClass('disabled');
        } else {
            $('#Inventory .allocate-link').addClass('disabled');
        }
    }

    function preventDefault(event) {
        event.preventDefault();
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
    setTimeout(disableTab, 3000);

    function disableTab() {
        $('.disabled').attr("tabindex", "-1");
    }
});