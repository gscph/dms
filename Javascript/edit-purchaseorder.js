//Created By : Raphael Herrera, Created On : 6/30/2016
$(document).ready(function () {
    var vpostatus = $("#gsc_vpostatus option:selected").val();
    var approvalstatus = $("#gsc_approvalstatus").val();
    var branchId = $("#gsc_branchid").val();

    //Hide CFO field
    if ($("#gsc_vpotype").val() != "100000000") {
        $("#gsc_cfonumber_label").hide();
        $("#gsc_cfonumber").hide();
    }

    setTimeout(function () {
        hideDevField();
    }, 1000);

    /*   != Cancel     */
    if (vpostatus == 100000005) {
        $("#UpdateButton").addClass("permanent-disabled disabled");
        $("button.delete-link").addClass("permanent-disabled disabled");
        $("#EntityFormView fieldset").attr("disabled", "disabled");
        $("#EntityFormView fieldset").addClass("permanent-disabled");
        $("#gsc_vpostatus").css({ "pointer-events": "none", "cursor": "default" });
        $("#gsc_approvalstatus").css({ "pointer-events": "none", "cursor": "default" });
        $("#gsc_remarks").css("resize", "none");
    }
    else {
        if (DMS.Settings.User.webRole.indexOf("MMPC") === -1)
            createCancelButton();
    }


    /*   != Open     */
    if (vpostatus !== 100000000 || approvalstatus === 100000000)
        setReadOnly();

    /*   != Open     */
    if (vpostatus != 100000000 && approvalstatus != 100000000) {
        $("button.delete-link").addClass("disabled");
        $("button.delete-link").addClass("permanent-disabled disabled");
    }

    /* == Ordered || In Transit || Received   */
    if (vpostatus == 100000002 || vpostatus == 100000003 || vpostatus == 100000004 || DMS.Settings.User.webRole.indexOf("MMPC") >= 0) {
        DisableForm();
    }

    /*   == Printed     */
    if (vpostatus == 100000001) {
        createSubmitButton();
        DisableForm();
    }

    if (vpostatus == "100000002") {
        if (DMS.Settings.User.webRole.indexOf("MMPC") >= 0) {
            var receiptDate = $("#gsc_mmpcreceiptdate").siblings(".datetimepicker");
            receiptDate.children(".form-control").removeAttr("readonly");
            receiptDate.children(".form-control").removeAttr("disabled");
            receiptDate.addClass("input-append input-group");
            receiptDate.children("span").children("span").addClass("glyphicon glyphicon-calendar");
            receiptDate.children(".input-group-addon").show();
            $("#gsc_mmpcreceiptdate").removeAttr("readonly");
            $("#EntityFormView").removeClass("form-readonly");
        }
    }

    function DisableForm() {
        //JGC_01262017 : Disable Form
        $("#PurchaseOrderItem .action.add-margin-right").attr("disabled", "disabled");
        $("#PurchaseOrderItem .entity-grid.subgrid").on("loaded", function () { $(".btn-default.btn-xs").addClass("permanent-disabled disabled"); });
        $(".textarea.form-control").attr("disabled", "disabled");
        $(".delete-link").hide();
        if (vpostatus != 100000002 || DMS.Settings.User.webRole != "MMPC System Administrator") {
            $(".submit-btn").hide();
        }

        $("#gsc_remarks").css("resize", "none");
        //END
    }

    /*   == Unapproved / !Cancelled / == Open   */
    if (approvalstatus == 100000003 || (vpostatus != 100000005 && approvalstatus == 100000002 || approvalstatus == 100000001) || (vpostatus != 100000005 && approvalstatus == 100000000)) {
        if (DMS.Settings.User.webRole.indexOf("MMPC") == -1)
            filterApproverSetup();
    }

    /*  == Approved       */
    if (approvalstatus == 100000000)
        DMS.Helpers.DisableEntityForm();

    if (vpostatus == 100000002 && DMS.Settings.User.webRole == "MMPC System Administrator") {
        $(".submit-btn").removeClass("hidden");
        $(".submit-btn").removeAttr("style");
    }


    //check if there is an existing approver setup for branch
    function filterApproverSetup() {
        var odataUrl = "/_odata/approversetup?$filter=statecode/Value eq 0 and gsc_transactiontype/Value eq 100000000 and gsc_branchid/Id eq (Guid'" + branchId + "')";
        $.ajax({
            type: "get",
            async: true,
            url: odataUrl,
            success: function (approverSetup) {
                if (approverSetup.value.length != 0) {
                    if (vpostatus == 100000000 && (approvalstatus == 100000002 || approvalstatus == 100000001)) {
                        createForApprovalButton(approverSetup.value[0].gsc_cmn_approversetupid);
                    }
                    else if (approvalstatus == 100000003) {
                        filterApproval(approverSetup.value[0].gsc_cmn_approversetupid);
                    }
                    else if (approvalstatus == 100000000) {
                        createPrintButton();
                    }
                }
                else {
                    $("#gsc_approvalstatus").hide();
                    $("#gsc_approvalstatus_label").hide();
                    if (vpostatus != 100000005)
                        createPrintButton();
                }
            },
            error: function (xhr, textStatus, errorMessage) {
                console.log(errorMessage);
            }
        });

    }

    function filterApproval(approverSetupId) {
        var odataUrl = "/_odata/approver?$filter=gsc_contactid/Id eq (Guid'" + userId + "') and gsc_approversetupid/Id eq (Guid'" + approverSetupId + "')";
        $.ajax({
            type: "get",
            async: true,
            url: odataUrl,
            success: function (approver) {
                var approverLevel = parseInt(approver.value[0].gsc_approverlevel.Value);
                var approverName = approver.value[0].gsc_approverpn;
                var vpoApproverLevel = $("#gsc_approverlevel").val();

                if (approver.value.length != 0) {
                    if (approverLevel == parseInt(vpoApproverLevel) + 1 || vpoApproverLevel == "") {
                        createApproveButton(approverLevel, approverName);
                        createDisapproveButton(approverLevel, approverName);
                    }
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
            type: "get",
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

    //For Approval
    function createForApprovalButton(approverSetupId) {
        var forApprovalBtn = DMS.Helpers.CreateButton("button", "btn btn-primary permanent-disabled disabled", "", " FOR APPROVAL", DMS.Helpers.CreateFontAwesomeIcon("fa-files-o"));
        forApprovalBtn.attr("id", "forApprovalButton");
        var forApprovalModal = DMS.Helpers.CreateModalConfirmation({
            id: "forApprovalModal",
            headerTitle: " For Approval - Purchase Order",
            Body: "<p>Set purchase order for approval?</p>",
            headerIcon: "fa fa-files-o"
        });
        $(".crmEntityFormView").append(forApprovalModal);

        forApprovalBtn.on("click", function (evt) {
            var approverCount = filterApprovalCount(approverSetupId);
            forApprovalModal.find(".confirmModal").on("click", function () {
                if (approverCount > 0) {
                    $("#gsc_approvalstatus").val("100000003");
                    $("#gsc_approverlevel").val("1");
                    $("#gsc_approverguid").val(approverSetupId);
                    $("#UpdateButton").click();
                    forApprovalModal.modal("hide");
                    showLoading();
                }
                else if (approverCount == 0) {
                    forApprovalModal.modal("hide");
                    DMS.Notification.Error("There is no approver maintained in Approver Setup. Transaction cannot proceed");
                }

            });
            forApprovalModal.modal("show");
        });
        DMS.Helpers.AppendButtonToToolbar(forApprovalBtn);
    }
    //Approve
    function createApproveButton(approverLevel, approverName) {
        var approveIcon = DMS.Helpers.CreateFontAwesomeIcon("fa-thumbs-up");
        var approveBtn = DMS.Helpers.CreateButton("button", "btn btn-primary approveBtn", "", " APPROVE", approveIcon);
        var approveConfirmation = DMS.Helpers.CreateModalConfirmation({ id: "approveModal", headerIcon: "fa fa-thumbs-up", headerTitle: " Approve Purchase Order", Body: "Approve purchase order?" });
        $(".crmEntityFormView").append(approveConfirmation);
        approveBtn.on("click", function (evt) {
            approveConfirmation.find(".confirmModal").on("click", function () {
                $("#gsc_approvalstatus").val("100000000");
                $("#gsc_approverlevel").val(approverLevel);
                $("#gsc_approvername").val(approverName);
                $("#UpdateButton").click();
                approveConfirmation.modal("hide");
                showLoading();
            });
            approveConfirmation.modal("show");
        });
        DMS.Helpers.AppendButtonToToolbar(approveBtn);
    }
    //Disapprove
    function createDisapproveButton(approverLevel, approverName) {
        var disapproveIcon = DMS.Helpers.CreateFontAwesomeIcon("fa-thumbs-down");
        var disapproveBtn = DMS.Helpers.CreateButton("button", "btn btn-primary disapproveBtn", "", " DISAPPROVE", disapproveIcon);
        var disapproveConfirmation = DMS.Helpers.CreateModalConfirmation({ id: "disapproveModal", headerIcon: "fa fa-thumbs-down", headerTitle: " Disapprove Purchase Order", Body: "Disapprove purchase order?" });
        $(".crmEntityFormView").append(disapproveConfirmation);
        disapproveBtn.on("click", function (evt) {
            disapproveConfirmation.find(".confirmModal").on("click", function () {
                $("#gsc_approvalstatus").val("100000001");
                $("#gsc_approverlevel").val(approverLevel);
                $("#gsc_approvername").val(approverName);
                $("#UpdateButton").click();
                disapproveConfirmation.modal("hide");
                showLoading();
            });
            disapproveConfirmation.modal("show");
        });
        DMS.Helpers.AppendButtonToToolbar(disapproveBtn);
    }

    //JGC_01252017 : Create Print Button 
    function createPrintButton() {
        var printIcon = DMS.Helpers.CreateFontAwesomeIcon("fa-print");
        var printBtn = DMS.Helpers.CreateButton("button", "btn btn-primary printPO permanent-disabled disabled", "", " PRINT ", printIcon);
        var printConfirmation = DMS.Helpers.CreateModalConfirmation({ id: "printModal", headerIcon: "fa fa-print", headerTitle: " Print ", Body: "Print purchase order?" });
        $(".crmEntityFormView").append(printConfirmation);
        printBtn.on("click", function (evt) {
            printConfirmation.find(".confirmModal").on("click", function () {
                printVPO();
                printConfirmation.modal("hide");
            });
            printConfirmation.modal("show");
        });

        if (DMS.Settings.User.webRole.indexOf("MMPC") == -1) {
            DMS.Helpers.AppendButtonToToolbar(printBtn);
        }
    };

    function printVPO() {
        if ($("#gsc_vpostatus").val() == "100000000") {
            $("#gsc_vpostatus").val("100000001");
            $("#UpdateButton").click();
        }
        var param1var = getQueryVariable("id");
        var protocol = window.location.protocol;
        var host = window.location.host;
        var url = protocol + "//" + host + "/report/?reportname={7D9B4E64-7442-E611-80DA-00155D010E2C}&reportid=" + param1var;
        window.open(url, "blank", "width=850,height=1000");
    }
    //END

    //Cancel
    function createCancelButton() {
        var cancelIcon = DMS.Helpers.CreateFontAwesomeIcon("fa-ban");
        var cancelBtn = DMS.Helpers.CreateButton("button", "btn btn-primary cancel", "", " CANCEL", cancelIcon);
        var cancelConfirmation = DMS.Helpers.CreateModalConfirmation({ id: "cancelModal", headerIcon: "fa fa-ban", headerTitle: " Cancel ", Body: "Cancel purchase order?" });
        $(".crmEntityFormView").append(cancelConfirmation);
        cancelBtn.on("click", function (evt) {
            cancelConfirmation.find(".confirmModal").on("click", function () {
                $("#gsc_vpostatus").val("100000005");
                $("#UpdateButton").click();
                cancelConfirmation.modal("hide");
                showLoading();
            });
            cancelConfirmation.modal("show");
        });

        if (vpostatus != 100000000 && vpostatus != 100000001 && vpostatus != 100000002) {
            cancelBtn.addClass("permanent-disabled disabled");
        }

        DMS.Helpers.AppendButtonToToolbar(cancelBtn);
    }

    //Submit
    function createSubmitButton() {
        var submitIcon = DMS.Helpers.CreateFontAwesomeIcon("fa-paper-plane");
        var submitBtn = DMS.Helpers.CreateButton("button", "btn btn-primary submit", "", " SUBMIT", submitIcon);
        var submitConfirmation = DMS.Helpers.CreateModalConfirmation({ id: "submitModal", headerIcon: "fa fa-paper-plane", headerTitle: " Submit Purchase Order", Body: "Submit purchase order?" });
        $(".crmEntityFormView").append(submitConfirmation);
        submitBtn.on("click", function (evt) {
            submitConfirmation.find(".confirmModal").on("click", function () {
                $("#gsc_vpostatus").val("100000002");
                $("#UpdateButton").click();
                submitConfirmation.modal("hide");
                showLoading();
            });
            submitConfirmation.modal("show");
        });
        DMS.Helpers.AppendButtonToToolbar(submitBtn);
    }
    //End Submit Button

    function hideDevField() {
        $("[data-name=\"hideSection\"]").hide();
        //$("#gsc_approverguid_label").hide();
        //$("#gsc_approverguid").hide();

        $("#gsc_approvalstatus").css({ "pointer-events": "none", "cursor": "default" });
        $("#gsc_vpostatus").css({ "pointer-events": "none", "cursor": "default" });
        $("#gsc_approvalstatus").attr("readOnly", true);
        $("#gsc_vpostatus").attr("readOnly", true);
    }

    function setReadOnly() {
        //clears pointer for required elements
        //$("#gsc_vpotype").attr("style", "pointerEvents: none;");
        document.getElementById("gsc_vpotype").style.pointerEvents = "none";
        document.getElementById("gsc_mannerofpayment").style.pointerEvents = "none";

        //sets input, dates and ddl to readOnly
        $(".picklist ").addClass(".permanent-disabled");
        $(".picklist ").attr("readOnly", true);
        $(".datetimepicker > .form-control").attr("readOnly", true);
        $(".control > .text").attr("readOnly", true);

        //clears button add ons
        $(".clearlookupfield").remove();
        $(".launchentitylookup").remove();
        $(".input-group-addon").hide();

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

    function preventDefault(event) {
        event.preventDefault();
    }

    /* VPO Date / Desired Date Validation */

    $("#gsc_vpodate").next(".datetimepicker").on("dp.change", function (e) {
        $("#gsc_desireddate").next(".datetimepicker").data("DateTimePicker").setMinDate(e.date);
    });

    $("#gsc_desireddate").next(".datetimepicker").on("dp.change", function (e) {
        $("#gsc_vpodate").next(".datetimepicker").data("DateTimePicker").setMaxDate(e.date);
    });

    //Allow Only one Item 

    var checker = 0;
    checkAddButton();

    function checkAddButton() {
        if ($("#PurchaseOrderItem div.grid-actions a").is(":visible")) {
            $("#PurchaseOrderItem div.grid-actions a").addClass("permanent-disabled disabled");
            checkPOItem();
        } else {
            setTimeout(checkAddButton, 50);
        }
    }

    function checkPOItem() {
        if (!$("#PurchaseOrderItem tbody tr").is(":visible")) {
            if (checker != 10) {
                setTimeout(checkPOItem, 100);
            } else {
                $("#PurchaseOrderItem div.grid-actions a").removeClass("disabled");
            }
        }
        checker++;
    }

    var isFromClose = false;
    $("#PurchaseOrderItem section.modal button.close").on("click", function () {
        isFromClose = true;
    });

    $("#PurchaseOrderItem section.modal").on("hidden.bs.modal", function () {
        if (!isFromClose) {
            $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

            var div = document.createElement("DIV");
            div.className = "view-loading message text-center";
            div.style.cssText = "position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;";
            var span = document.createElement("SPAN");
            span.className = "fa fa-2x fa-spinner fa-spin";
            div.appendChild(span);
            $(".content-wrapper").append(div);

            location.reload();
        }
        isFromClose = false;
    });

    //JGC_01252017: Show|Hide PrintButton
    $("#PurchaseOrderItem .entity-grid.subgrid").on("loaded", function () {
        if ($("#PurchaseOrderItem tr").length > 1) {
            if ($(".printPO").length == 1)
                $(".printPO").removeClass("permanent-disabled disabled");
            if ($("#forApprovalButton").length == 1)
                $("#forApprovalButton").removeClass("permanent-disabled disabled");
        }
    });

    function showLoading() {
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = "position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;";
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);
    }

    //for status copty add by Tom 4/18/2017
    var vpoStatusText = $("#gsc_vpostatus option:selected").text();
    $(".record-status").text(vpoStatusText);

    setTimeout(disableTab, 300);

    function disableTab() {
        $(".permanent-disabled").attr("tabindex", "-1");
    }
});