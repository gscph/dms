$(document).ready(function () {
    $(".section[data-name='hiddenfields']").closest("fieldset").hide();
    $('#gsc_vehicletypepn').attr("readonly", true);

    if (typeof (Page_Validators) == 'undefined') return;

    createValidators();

    function createValidators() {
        var vehicleTypeValidator = document.createElement('span');
        vehicleTypeValidator.style.display = "none";
        vehicleTypeValidator.id = "RequiredFieldValidatorgsc_vehicletypepn";
        vehicleTypeValidator.controltovalidate = "gsc_vehicletypepn";
        vehicleTypeValidator.errormessage = "<a href='#gsc_vehicletypepn'>Vehicle Type name not in correct format.</a>";
        vehicleTypeValidator.validationGroup = "";
        vehicleTypeValidator.initialvalue = "";
        vehicleTypeValidator.evaluationfunction = function () {
            var value = $("#gsc_vehicletypepn").val();
            var regex = /[a-zA-Z]/;

            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };

        Page_Validators.push(vehicleTypeValidator);
    }
});