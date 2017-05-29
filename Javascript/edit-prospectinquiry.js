$(document).ready(function () {
    var status = $(".record-status").html();

    if (status != "Open") {
        $('#EntityFormView fieldset:eq(12)').attr('disabled', true);
        $('#EntityFormView fieldset:eq(12)').addClass('permanent-disabled');
    }

    if (status != "Disqualified")
    {
        $('#gsc_disqualificationreason').hide();
        $('#gsc_disqualificationreason_label').hide();
    }

    if (typeof (Page_ClientValidate) == 'function') {
    }

    $(".row.form-custom-actions > .col-sm-6.clearfix").removeClass('col-sm-6');
    $(".row.form-custom-actions > .clearfix").addClass('col-sm-12');
    var QualifyClicked = false;

    //Add Custom Qualify Button
    $qualifyButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' QUALIFY', DMS.Helpers.CreateFontAwesomeIcon('fa-thumbs-up'));
    $qualifyButton.click(function (evt) {
        evt.preventDefault();

        var isValid = Page_ClientValidate();
        if (isValid) {
            $qualifyButton.attr("data-toggle", "modal");
            $qualifyButton.attr("data-target", "#myQualifyModal");
        }
    });
  

    //Disqualify Button
    $disqualifyButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' DISQUALIFY', DMS.Helpers.CreateFontAwesomeIcon('fa-thumbs-down'));
    $disqualifyButton.click(function (evt) {
        evt.preventDefault();

        var isValid = Page_ClientValidate();
        if (isValid) {
            $disqualifyButton.attr("data-toggle", "modal");
            $disqualifyButton.attr("data-target", "#myModal");
        }
    });

    if (status == 'Open') {
        DMS.Helpers.AppendButtonToToolbar($qualifyButton);
        DMS.Helpers.AppendButtonToToolbar($disqualifyButton);
    }

    //ReOpen Button
    $reopenButton = DMS.Helpers.CreateAnchorButton("btn-primary btn", '', ' REOPEN INQUIRY', DMS.Helpers.CreateFontAwesomeIcon('fa-edit'));
    $reopenButton.click(function (evt) {
        evt.preventDefault();

        //Loading Image
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);

        var entityId = getQueryVariable("id");
        var workflowName = "Prospect Inquiry - ReOpen";
        $.ajax({
            type: "PUT",
            url: "/api/Service/RunWorkFlow/?workflowName=" + workflowName + "&entityId=" + entityId,
            success: function (response) {
                var url = document.location.protocol + '//' +
                    document.location.host + (document.location.host.indexOf("demo.adxstudio.com") != -1
                    ? document.location.pathname.split("/").slice(0, 3).join("/")
                    : "") + '/Cache.axd?Message=InvalidateAll&d=' +
                    (new Date()).valueOf();
                    
                var req = new XMLHttpRequest();
                req.open('GET', url, false);
                req.send(null); 
                window.location.reload(true);
            }
        }).error(function (errormsg) { console.log(errormsg) });
        
        
    });

    if (status == 'Disqualified') {
        DMS.Helpers.AppendButtonToToolbar($reopenButton);
    }

    //Created By : Jerome Anthony Gerero, Created On : 3/30/2016, Modified On : 9/13/2016 
    var disqualifyModal = document.createElement("div");
    disqualifyModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Disqualify Inquiry</h4>' +
    '</div>' +
    '<div id="modal-body" class="modal-body">' +
    '<center><p>This Prospect Inquiry will be disqualified. Please select one of the reasons below: </p>' +
    '<select id="statusReason" ><option value="4">Lost</option><option value="5">Cannot Contact</option>' +
    '<option value="6">No Longer Interested</option><option value="7">Canceled</option>' +
    '<option value="7">Others</option></select>' +
    //'<div id="disqualifyRemarksDiv" style="display:none"><br/>Remarks : <input type="text" id="disqualifyRemarks" name="disqualifyRemarks"></div>' +
    '<div id="disqualifyRemarksDiv" style="display:none"><br/>Enter remarks here:<br/><textarea id="disqualifyRemarks"></textarea></div>' +
    '</center></div>' +
    '<div class="modal-footer">' +
    '<button id="disqualifyBtn" type="submit" class="btn btn-dialog btn-default button" data-dismiss="modal">DISQUALIFY</button>' +
    '<button type="button" class="btn btn-dialog btn-default button" data-dismiss="modal"></i> CANCEL</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    disqualifyModal.setAttribute("id", "myModal");
    disqualifyModal.setAttribute("class", "modal fade");
    disqualifyModal.setAttribute("tabindex", "-1");
    disqualifyModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(disqualifyModal);

    function preventDefault(event) {
        event.preventDefault();
    }

    $('#statusReason').on('change', function () {
        var selectedStatusReasonText = $("#statusReason option:selected").text();

        if (selectedStatusReasonText != 'Others') {
            $('#disqualifyRemarksDiv').hide();
        }
        else {
            $('#disqualifyRemarksDiv').show();
        }
    });

    $('#disqualifyBtn').click(function () {
        showLoading();
        
        var selectedStatusReason = $("#statusReason option:selected").val();
        var disqualifyRemarksValue = $('#disqualifyRemarks').val();

        $("#gsc_disqualifyremarks").val(disqualifyRemarksValue);
        $("#gsc_disqualifiedstatusreason").val(selectedStatusReason);
        $("#gsc_disqualificationreason").val(DisqualificationReason(selectedStatusReason, disqualifyRemarksValue));
        $('#gsc_disqualified_0').prop('checked', false);
        $('#gsc_disqualified_1').prop('checked', true);
        $("#UpdateButton").click();
    });

    var qualifyModal = document.createElement("div");
    qualifyModal.innerHTML = '<div class="modal-dialog">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
    '<h4 class="modal-title">Qualify Inquiry</h4>' +
    '</div>' +
    '<div class="modal-body">' +
    '<center><p>Are you sure you want to qualify this record?</p>' +
    '<p>Upon qualifying, you will be redirected to Opportunity List and prospect record will be created.</p>' +
    '</center></div>' +
    '<div class="modal-footer">' +
    '<button id="qualifyBtn" type="submit" class="btn btn-dialog btn-default button" data-dismiss="modal">QUALIFY</button>' +
    '<button type="button" class="btn btn-dialog btn-default button" data-dismiss="modal">CANCEL</button>' +
    '</div>' +
    '</div><!-- /.modal-content -->' +
    '</div><!-- /.modal-dialog -->';
    qualifyModal.setAttribute("id", "myQualifyModal");
    qualifyModal.setAttribute("class", "modal fade");
    qualifyModal.setAttribute("tabindex", "-1");
    qualifyModal.setAttribute("role", "dialog");
    $(".crmEntityFormView").append(qualifyModal);

    $('#qualifyBtn').click(function (e) {
        showLoading();
        QualifyClicked = true;
        $("#UpdateButton").click();
    });

    $("#UpdateButton").click(function (e) {
        if (QualifyClicked == true) {
            $('#gsc_qualified_0').prop('checked', false);
            $('#gsc_qualified_1').prop('checked', true);

            var pathname = window.location.pathname;
            var param1var = getQueryVariable("id");

            $.ajax({
                url: pathname + "/?" + param1var,
                data: 'navigation=save&autosave=true&' + jQuery(this).serialize(),
                type: 'POST',
                success: function (response) {
                    setTimeout(RedirecttoOpporunity(), 1000);
                }
            });
        }
    });

    setTimeout(function () {
        $("#gsc_vehiclebasemodelid").on('change', function () {

            if($("#gsc_vehiclebasemodelid").val()=="")
            {
              $("#gsc_vehicletypeid").val("");
              $("#gsc_vehicletypeid_name").val("");
            }
            else
            {
               var vehiclemodelid = $("#gsc_vehiclebasemodelid").val();
                var productOdataQuery = "/_odata/basemodel?$filter=gsc_iv_vehiclebasemodelid eq (Guid'" + vehiclemodelid + "')";
                $.ajax({
                    type: 'get',
                    async: true,
                    url: productOdataQuery,
                    success: function (data) {
                        if (data.value.length != 0) {
                            var basemodellist = data.value[0];
                            $("#gsc_vehicletypeid").val(basemodellist.gsc_vehicletypeid.Id);
                            $("#gsc_vehicletypeid_name").val(basemodellist.gsc_vehicletypeid.Name);
                            $("#gsc_vehicletypeid_entityname").val("gsc_iv_vehicletype");
                        }
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
            }
        });

    }, 100);
    
    function RedirecttoOpporunity() {
        var host = window.location.host;
        var protocol = window.location.protocol;
        var opportunityUrl = protocol + "//" + host + "/transactions/opportunity";
        window.location.replace(opportunityUrl);
    }

    function showLoading(){
      $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

      var div = document.createElement("DIV");
      div.className = "view-loading message text-center";
      div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
      var span = document.createElement("SPAN");
      span.className = "fa fa-2x fa-spinner fa-spin";
      div.appendChild(span);
      $(".content-wrapper").append(div);
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

    //Created By : Artum Ramos, Created On : 4/26/2017, 
    function DisqualificationReason(selectedStatusReason, disqualifyRemarksValue){
        var disqualificationReasonText = $("#statusReason option:selected").text();
        if (selectedStatusReason >= 4){
            if(selectedStatusReason == 7 && disqualificationReasonText == "Others"){
                return disqualificationReasonText + ": " + disqualifyRemarksValue;
            }
            return disqualificationReasonText;
        }
        else{
            return null;
        }
    }
    setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
});