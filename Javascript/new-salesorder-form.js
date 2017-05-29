$(document).ready(function () {
    $('#gsc_recordownerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_dealerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_branchid_name').siblings('.input-group-btn').addClass('hidden');

    setTimeout(function () {
        
        if(DMS.Settings.User.positionName == "Sales Executive")
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

    function SetSalesExecutive(){
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
            if (color1 == color2)
                isDuplicate = true;
            else if (color1 == color3)
                isDuplicate = true;
        }
        else if (colorNum == 2) {
            if (color2 == color1)
                isDuplicate = true;
            else if (color2 == color3)
                isDuplicate = true;
        }
        else if (colorNum == 3) {
            if (color3 == color1)
                isDuplicate = true;
            else if (color3 == color2)
                isDuplicate = true;
        }
        else
            console.log("Unknown color");

        return isDuplicate;
    }

});