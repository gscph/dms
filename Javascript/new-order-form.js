$(document).ready(function () {
    $('#gsc_recordownerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_dealerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_branchid_name').siblings('.input-group-btn').addClass('hidden');

    setTimeout(function () {

       if(DMS.Settings.User.positionName.indexOf("Sales Executive") == 0)
            SetSalesExecutive();

        $('#gsc_productid').on('change', function () {
            $("#gsc_vehiclecolorid1").val("");
            $("#gsc_vehiclecolorid1_name").val("");
            $("#gsc_vehiclecolorid1").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $("#gsc_vehiclecolorid2").val("");
            $("#gsc_vehiclecolorid2_name").val("");
            $("#gsc_vehiclecolorid2").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $("#gsc_vehiclecolorid3").val("");
            $("#gsc_vehiclecolorid3_name").val("");
            $("#gsc_vehiclecolorid3").siblings('div.input-group-btn').children('.clearlookupfield').hide();
        });

        $('#gsc_vehiclecolorid1').on('change', function () {
            if (checkPreferredColor(1)) {
                clearColorField("gsc_vehiclecolorid1");
            }
        });

        $('#gsc_vehiclecolorid2').on('change', function () {
            if (checkPreferredColor(2)) {
                clearColorField("gsc_vehiclecolorid2");
            }
        });

        $('#gsc_vehiclecolorid3').on('change', function () {
            if (checkPreferredColor(3)) {
                clearColorField("gsc_vehiclecolorid3");
            }
        });

        $("#customerid").on('change', function () {
            CheckifGovernment();
        });
    }, 100);



    //Check for duplicate preffered color
    function clearColorField(colorFieldName) {
        $("#" + colorFieldName + "_name").val("");
        $("#" + colorFieldName).val("");
        setTimeout(function () {
            $("#" + colorFieldName).siblings('div.input-group-btn').children('.clearlookupfield').hide();
        }, 100);
        DMS.Notification.Error("Error: Cannot select preferred color twice.", true, 5000);
    }

    function SetSalesExecutive() {
		$("#gsc_salesexecutiveid").siblings('div.input-group-btn').children('.launchentitylookup').hide();
        $("#gsc_salesexecutiveid_entityname").val("contact");
        $("#gsc_salesexecutiveid").val(DMS.Settings.User.Id);
        var fullName = $("#userFullname").html();
        $("#gsc_salesexecutiveid_name").val(fullName);
    }

    function checkPreferredColor(index) {
        var colorNum = index;
        var color1 = $('#gsc_vehiclecolorid1').val();
        var color2 = $('#gsc_vehiclecolorid2').val();
        var color3 = $('#gsc_vehiclecolorid3').val();
        var isDuplicate = false;

        if (colorNum == 1) {
            if (color1 == color2 && color1 != "" && color2 != "")
                isDuplicate = true;
            else if (color1 == color3 && color3 != "")
                isDuplicate = true;
        }
        else if (colorNum == 2) {
            if (color2 == color1 && color1 != "" && color2 != "")
                isDuplicate = true;
            else if (color2 == color3 && color3 != "")
                isDuplicate = true;
        }
        else if (colorNum == 3) {
            if (color3 == color1 && color1 != "" && color3 != "")
                isDuplicate = true;
            else if (color3 == color2 && color2 != "")
                isDuplicate = true;
        }
        else
            console.log("Unknown color");

        return isDuplicate;
    }


    function CheckifGovernment() {
        showLoading();
        if ($("#customerid_entityname").val() == "account") {
            var accountid = $("#customerid").val();
            var odataUrl = "/_odata/account?$filter=accountid eq (Guid'" + accountid + "')";

            $.ajax({
                type: "get",
                async: true,
                url: odataUrl,
                success: function (data) {
                    if (data == null || data.value.length == 0) {
                        HideMakup();
                    }
                    else {
                        $.each(data.value, function (key, obj) {
                            if (obj.gsc_customertype.Name == "Corporate") {
                                HideMakup();
                            }
                            else {
                                $("#customerid_name").closest("td").attr("colspan", 3);
                                $('label[for=gsc_markup], input#gsc_markup').show();
                            }
                        });
                    }
                    $.unblockUI();
                    $(".loadingDiv").remove();
                },
                error: function (xhr, textStatus, errorMessage) {
                    console.log(errorMessage);
                }
            });
        }
        else {
            HideMakup();
            $.unblockUI();
            $(".loadingDiv").remove();
        }
    }
    
    function HideMakup()
    {
        $("#customerid_name").closest("td").attr("colspan", 4);
        $("#gsc_markup").val("");
        $('label[for=gsc_markup], input#gsc_markup').hide();
    }

    function showLoading() {
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center loadingDiv";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);
    }
});