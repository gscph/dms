$(document).ready(function (e) {
    $('#gsc_isdeactivated').closest('td').hide();

    var status = $(".record-status").html(); 
    $('#gsc_publish').css({ "pointer-events": "none", "cursor": "default" });
    var entityId = getQueryVariable('id');
    var workflowName = 'Price List - Change Status';
    $("#gsc_publish").hide();
    $("#gsc_publish_label").hide();

    if (status == "Inactive") {
        checkSubgrid();
    }

    function checkSubgrid() {
        if ($('table[data-name="tab_4_section_2"]').is(":visible")) {
            $('table[data-name="tab_4_section_2"]').parent().addClass("permanent-disabled");
            $('table[data-name="tab_4_section_2"]').parent().attr("disabled", "disabled");
        }
        else {
            setTimeout(function () { checkSubgrid(); }, 50);
        }
    }

    $activateButton = DMS.Helpers.CreateAnchorButton("btn-primary btn activatePromo", '', ' ACTIVATE', DMS.Helpers.CreateFontAwesomeIcon('fa-check-circle'));
    $deactivateButton = DMS.Helpers.CreateAnchorButton("btn-primary btn deactivatePromo", '', ' DEACTIVATE', DMS.Helpers.CreateFontAwesomeIcon('fa-times-circle'));

    $activateButton.click(function (evt) {
        evt.preventDefault();

        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);

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
                req.send(null); window.location.reload(true);
            }
        }).error(function (errormsg) { console.log(errormsg) });
    });

    $deactivateButton.click(function (evt) {
        evt.preventDefault();

        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);

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
                req.send(null); window.location.reload(true);
            }
        }).error(function (errormsg) { console.log(errormsg) });
    });
    
    $publishButton = DMS.Helpers.CreateAnchorButton("btn-primary btn publishPromo", '', ' PUBLISH', DMS.Helpers.CreateFontAwesomeIcon('fa-book'));
    $publishButton.click(function (evt) {
        showLoading();
        $("#gsc_publish").prop("checked", true);
        $("#UpdateButton").click();
    });
    
    if($("#gsc_publishenabled").prop("checked") == true)
    {
      DMS.Helpers.AppendButtonToToolbar($publishButton);
      $("#gsc_publish").show();
      $("#gsc_publish_label").show();
    }

    if (status == 'Inactive') {
        DMS.Helpers.AppendButtonToToolbar($activateButton);
        $publishButton.addClass("permanent-disabled disabled");
    }
    else if (status == 'Active') {
        DMS.Helpers.AppendButtonToToolbar($deactivateButton);
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

    //Added by Ernest Sarmiento 02-01-2017
    $('#begindate').next('.datetimepicker').on("dp.change", function (e) {
        var beginDate = $('#begindate').next('.datetimepicker').data("DateTimePicker").date;
        var endDate = $('#enddate').next('.datetimepicker').data("DateTimePicker").date;

        if (endDate > beginDate) {
           $('#enddate').next('.datetimepicker').data("DateTimePicker").setMinDate(e.date);
        }
    });
    
   $('#enddate').next('.datetimepicker').datetimepicker({
            useCurrent: false
        });
        
    $('#enddate').next('.datetimepicker').on("dp.change", function (e) {
        var beginDate = $('#begindate').next('.datetimepicker').data("DateTimePicker").date;
        var endDate = $('#enddate').next('.datetimepicker').data("DateTimePicker").date;

        if (endDate > beginDate) {
           $('#begindate').next('.datetimepicker').data("DateTimePicker").setMaxDate(e.date);
        }
    });

    if (typeof (Page_Validators) == 'undefined') return;

    var effectiveDatesValidator = document.createElement('span');
    effectiveDatesValidator.style.display = "none";
    effectiveDatesValidator.id = "effectiveDatesValidator";
    effectiveDatesValidator.errormessage = "Effective Date To must not be less than Effective Date From.";
    effectiveDatesValidator.validationGroup = "";
    effectiveDatesValidator.initialvalue = "";
    effectiveDatesValidator.evaluationfunction = function () {
        var beginDate = $('#begindate').next('.datetimepicker').data("DateTimePicker").date;
        var endDate = $('#enddate').next('.datetimepicker').data("DateTimePicker").date;

        if (endDate < beginDate) {
            return false;
        } else {
            return true;
        }
    };

    Page_Validators.push(effectiveDatesValidator);

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

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
});