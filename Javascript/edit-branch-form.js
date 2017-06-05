$(document).ready(function () {
    $('#gsc_regionid_name').siblings('.input-group-btn').addClass('hidden');
    $('#accountnumber').attr("readonly", "readonly");
    setTimeout(function () {
        $("#gsc_countryid").on('change', function () {
            $("#gsc_provinceid_name").val("");
            $("#gsc_provinceid").val("");
            $("#gsc_provinceid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $("#gsc_provinceid").trigger("change");
        });
        
        $("#gsc_provinceid").on('change', function () {
            $("#gsc_cityid_name").val("");
            $("#gsc_cityid").val("");
            $("#gsc_cityid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            
            var provinceId = $("#gsc_provinceid").val();
            
            if (provinceId != null && provinceId != "" && provinceId != "undefinded") {

                var odataUrl = "/_odata/gsc_cmn_province?$filter=gsc_cmn_provinceid eq (Guid'" + provinceId + "')";
                $.ajax({
                    type: "get",
                    async: true,
                    url: odataUrl,
                    success: function (data) {
                        var region = data.value[0].gsc_regionid;
                        $("#gsc_regionid_name").val(region.Name);
                        $("#gsc_regionid").val(region.Id);
                        $("#gsc_regionid_entityname").val("gsc_cmn_region");
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
            }
            else {
              $("#gsc_regionid_name").val("");
              $("#gsc_regionid").val("");
            }
        });
        
    }, 100);

});