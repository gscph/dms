$(document).ready(function () {
    $("#gsc_regionid_name").siblings(".input-group-btn").addClass("hidden");
    $("#accountnumber").attr("readOnly", "readOnly");
    setTimeout(function () {

    var salesContactValidator = document.createElement("span");
    salesContactValidator.style.display = "none";
    salesContactValidator.id = "RequiredFieldValidatoraddress2_telephone1";
    salesContactValidator.controltovalidate = "address2_telephone1";
    salesContactValidator.errormessage = "<a href='#address2_telephone1'>Sales Contact Number should only contain numeric values.</a>";
    salesContactValidator.validationGroup = "";
    salesContactValidator.initialvalue = "";
    salesContactValidator.evaluationfunction = function () {
        var value = $("#address2_telephone1").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
        {
            return false;
        }
    };
    Page_Validators.push(salesContactValidator);

    var serviceContactValidator = document.createElement("span");
    serviceContactValidator.style.display = "none";
    serviceContactValidator.id = "RequiredFieldValidatoraddress2_telephone2";
    serviceContactValidator.controltovalidate = "address2_telephone2";
    serviceContactValidator.errormessage = "<a href='#address2_telephone2'>Service Contact Number should only contain numeric values.</a>";
    serviceContactValidator.validationGroup = "";
    serviceContactValidator.initialvalue = "";
    serviceContactValidator.evaluationfunction = function () {
        var value = $("#address2_telephone2").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };
    Page_Validators.push(serviceContactValidator);

    var faxOneValidator = document.createElement("span");
    faxOneValidator.style.display = "none";
    faxOneValidator.id = "RequiredFieldValidatorfax";
    faxOneValidator.controltovalidate = "fax";
    faxOneValidator.errormessage = "<a href='#fax'>Fax Number 1 should only contain numeric values.</a>";
    faxOneValidator.validationGroup = "";
    faxOneValidator.initialvalue = "";
    faxOneValidator.evaluationfunction = function () {
        var value = $("#fax").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };
    Page_Validators.push(faxOneValidator);

    var faxTwoValidator = document.createElement("span");
    faxTwoValidator.style.display = "none";
    faxTwoValidator.id = "RequiredFieldValidatorgsc_fax";
    faxTwoValidator.controltovalidate = "gsc_fax";
    faxTwoValidator.errormessage = "<a href='#gsc_fax'>Fax Number 2 should only contain numeric values.</a>";
    faxTwoValidator.validationGroup = "";
    faxTwoValidator.initialvalue = "";
    faxTwoValidator.evaluationfunction = function () {
        var value = $("#gsc_fax").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };
    Page_Validators.push(faxTwoValidator);

    var phoneOneValidator = document.createElement("span");
    phoneOneValidator.style.display = "none";
    phoneOneValidator.id = "RequiredFieldValidatoraddress1_telephone1";
    phoneOneValidator.controltovalidate = "address1_telephone1";
    phoneOneValidator.errormessage = "<a href='#address1_telephone1'>Phone Number 1 should only contain numeric values.</a>";
    phoneOneValidator.validationGroup = "";
    phoneOneValidator.initialvalue = "";
    phoneOneValidator.evaluationfunction = function () {
        var value = $("#address1_telephone1").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };
    Page_Validators.push(phoneOneValidator);

   var phoneTwoValidator = document.createElement("span");
    phoneTwoValidator.style.display = "none";
    phoneTwoValidator.id = "RequiredFieldValidatoraddress1_telephone2";
    phoneTwoValidator.controltovalidate = "address2_telephone1";
    phoneTwoValidator.errormessage = "<a href='#address1_telephone2'>Phone Number 2 should only contain numeric values.</a>";
    phoneTwoValidator.validationGroup = "";
    phoneTwoValidator.initialvalue = "";
    phoneTwoValidator.evaluationfunction = function () {
        var value = $("#address1_telephone2").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };
    Page_Validators.push(phoneTwoValidator);

    var phoneThreeValidator = document.createElement("span");
    phoneThreeValidator.style.display = "none";
    phoneThreeValidator.id = "RequiredFieldValidatoraddress1_telephone3";
    phoneThreeValidator.controltovalidate = "address1_telephone3";
    phoneThreeValidator.errormessage = "<a href='#address1_telephone3'>Phone Number 3 should only contain numeric values.</a>";
    phoneThreeValidator.validationGroup = "";
    phoneThreeValidator.initialvalue = "";
    phoneThreeValidator.evaluationfunction = function () {
        var value = $("#address1_telephone3").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };
    Page_Validators.push(phoneThreeValidator);

        $("#gsc_countryid").on('change', function () {
            $("#gsc_provinceid_name").val("");
            $("#gsc_provinceid").val("");
            $("#gsc_provinceid").siblings("div.input-group-btn").children(".clearlookupfield").hide();
            $("#gsc_provinceid").trigger("change");
        });
        
        $("#gsc_provinceid").on("change", function () {
            $("#gsc_cityid_name").val("");
            $("#gsc_cityid").val("");
            $("#gsc_cityid").siblings("div.input-group-btn").children(".clearlookupfield").hide();
            
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