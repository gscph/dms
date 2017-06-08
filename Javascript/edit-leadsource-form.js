$(document).ready(function () {
    $(".section[data-name=\"hiddenfields\"]").closest("fieldset").hide();

    if (typeof (Page_Validators) === "undefined") {
        return;
    }

    createValidators();

    function createValidators() {
        var leadIdValidator = document.createElement("span");
        leadIdValidator.style.display = "none";
        leadIdValidator.id = "RequiredFieldValidatorgsc_leadsourcepn";
        leadIdValidator.controltovalidate = "gsc_leadsourcepn";
        leadIdValidator.errormessage = "<a href='#gsc_leadsourcepn'>Lead Id not in correct format.</a>";
        leadIdValidator.validationGroup = "";
        leadIdValidator.initialvalue = "";
        leadIdValidator.evaluationfunction = function () {
            var value = $("#gsc_leadsourcepn").val();
            var regex = /[a-zA-Z]/;
            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else {
                return false;
            }
        };

        Page_Validators.push(leadIdValidator);
    }
});