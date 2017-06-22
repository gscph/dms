$(document).ready(function () {
    $('#gsc_recordownerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_dealerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_branchid_name').siblings('.input-group-btn').addClass('hidden');
    $('label[for=productnumber], input#productnumber').hide();
    $("#defaultuomscheduleid").parent("div").addClass("hidden");
    $("#defaultuomscheduleid_label").parent("div").addClass("hidden");

    createValidators();

    function createValidators()
    {
        var expiryDaysValidator = document.createElement('span');
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

        var warrantyMileageValidator = document.createElement('span');
        warrantyMileageValidator.style.display = "none";
        warrantyMileageValidator.id = "RequiredFieldValidatorgsc_warrantymileage";
        warrantyMileageValidator.controltovalidate = "gsc_warrantymileage";
        warrantyMileageValidator.errormessage = "<a href='#gsc_warrantymileage'>Warranty mileage must be numeric.</a>";
        warrantyMileageValidator.validationGroup = "";
        warrantyMileageValidator.initialvalue = "";
        warrantyMileageValidator.evaluationfunction = function () {
            var value = $("#gsc_warrantymileage").val();
            var regex = /^[0-9.,]+$/;

            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };

        Page_Validators.push(expiryDaysValidator);
        Page_Validators.push(warrantyMileageValidator);
    }
    
});