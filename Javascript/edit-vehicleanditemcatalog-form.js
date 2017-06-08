$(document).ready(function () {
    $("#gsc_modelcode").attr("readonly", "readonly");
    $("#gsc_optioncode").attr("readonly", "readonly");

    var bodyTypeId = $('#gsc_bodytypeid').val();

    if (bodyTypeId != null || bodyTypeId != "") {
        var bodyTypeOdataUrl = "/_odata/bodytype?$filter=gsc_sls_bodytypeid eq (Guid'" + bodyTypeId + "')";
        $.ajax({
            type: "get",
            async: true,
            url: bodyTypeOdataUrl,
            success: function (data) {
                var isCabChassis = data.value[0].gsc_cabchassis;

                if (isCabChassis == true) {
                    $("#CabChassis .btn-primary").removeClass("disabled");
                }
                else {
                    $("#CabChassis .btn-primary").addClass("disabled");
                }
            },
            error: function (xhr, textStatus, errorMessage) {
                console.log(errorMessage);
            }
        });
    }

    if (typeof (Page_Validators) === "undefined") {
        return;
    }

    createValidators();

    Page_Validators.push(expiryDaysValidator);
    Page_Validators.push(warrantyMileageValidator);

    function createValidators() {
        var expiryDaysValidator = document.createElement("span");
        expiryDaysValidator.style.display = "none";
        expiryDaysValidator.id = "RequiredFieldValidatorgsc_warrantyexpirydays";
        expiryDaysValidator.controltovalidate = "gsc_warrantyexpirydays";
        expiryDaysValidator.errormessage = "<a href='#gsc_warrantyexpirydays'>Warranty expiry days must be numeric.</a>";
        expiryDaysValidator.validationGroup = "";
        expiryDaysValidator.initialvalue = "";
        expiryDaysValidator.evaluationfunction = function () {
            var value = $("#gsc_warrantyexpirydays").val();
            var regex = /^[\d]*$/;

            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };

        var warrantyMileageValidator = document.createElement("span");
        warrantyMileageValidator.style.display = "none";
        warrantyMileageValidator.id = "RequiredFieldValidatorgsc_warrantymileage";
        warrantyMileageValidator.controltovalidate = "gsc_warrantymileage";
        warrantyMileageValidator.errormessage = "<a href='#gsc_warrantymileage'>Warranty mileage must be numeric.</a>";
        warrantyMileageValidator.validationGroup = "";
        warrantyMileageValidator.initialvalue = "";
        warrantyMileageValidator.evaluationfunction = function () {
            var value = $("#gsc_warrantymileage").val();
            var regex = /^[\d]*$/;
            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };
    }
});