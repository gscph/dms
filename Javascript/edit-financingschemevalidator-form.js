$(document).ready(function (e) {
    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;

    // Create new validator
    var dpFromValidator = document.createElement('span');
    dpFromValidator.style.display = "none";
    dpFromValidator.id = "RequiredFieldValidatorgsc_downpaymentfrom";
    dpFromValidator.controltovalidate = "gsc_downpaymentfrom";
    dpFromValidator.errormessage = "<a href='#gsc_downpaymentfrom'>Down Payment From is a required field.</a>";
    dpFromValidator.validationGroup = "";
    dpFromValidator.initialvalue = "";
    dpFromValidator.evaluationfunction = function () {
        var value = $("#gsc_downpaymentfrom").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    // Create new validator
    var dpToValidator = document.createElement('span');
    dpToValidator.style.display = "none";
    dpToValidator.id = "RequiredFieldValidatorgsc_downpaymentto";
    dpToValidator.controltovalidate = "gsc_downpaymentto";
    dpToValidator.errormessage = "<a href='#gsc_downpaymentto'>Down Payment To is a required field.</a>";
    dpToValidator.validationGroup = "";
    dpToValidator.initialvalue = "";
    dpToValidator.evaluationfunction = function () {
        var value = $("#gsc_downpaymentto").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

	// Create new validator
    var dpAddOnRate = document.createElement('span');
    dpAddOnRate.style.display = "none";
    dpAddOnRate.id = "RequiredFieldValidatorgsc_addonrate";
    dpAddOnRate.controltovalidate = "gsc_addonrate";
    dpAddOnRate.errormessage = "<a href='#gsc_addonrate'>Add on Rate is a required field.</a>";
    dpAddOnRate.validationGroup = "";
    dpAddOnRate.initialvalue = "";
    dpAddOnRate.evaluationfunction = function () {
        var value = $("#gsc_addonrate").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

	//START: set add-on rate required by default
	Page_Validators.push(dpAddOnRate); 
	$('label[for=gsc_addonrate]').parent("div").addClass("required");
	//END setting of add-on rate
	
    setTimeout(function () {
        var isZIP = $('#gsc_zerointerest').is(":checked");

            if (!isZIP)
            {
				    NotZipValidator();
			      }
			      
        $('#gsc_zerointerest').on('change', function () {
            var isZIP = $('#gsc_zerointerest').is(":checked");

            if(isZIP)
            {
                $('label[for=gsc_downpaymentfrom]').parent("div").addClass("required");
                $('label[for=gsc_downpaymentto]').parent("div").addClass("required");
                $("#gsc_downpaymentfrom").removeAttr('disabled', 'disabled');
                $("#gsc_downpaymentto").removeAttr('disabled', 'disabled');
                Page_Validators.push(dpToValidator);
                Page_Validators.push(dpFromValidator);
				
				//Additional requirement: Created by Christell Ann Mataac 1/31/2017
				//START
				$("#gsc_addonrate").attr('readonly', true);
				$("#gsc_addonrate").val(0);
                $('label[for=gsc_addonrate]').parent("div").removeClass("required");
				
				Page_Validators = jQuery.grep(Page_Validators, function (value) {
				return value != dpAddOnRate;
				});	
				//END
            }
            else {
                  NotZipValidator();
			     }
        });
        function NotZipValidator()
        {
          $('label[for=gsc_downpaymentfrom]').parent("div").removeClass("required");
          $('label[for=gsc_downpaymentto]').parent("div").removeClass("required");
          $("#gsc_downpaymentfrom").attr('disabled', 'disabled');
          $("#gsc_downpaymentto").attr('disabled', 'disabled');
          $("#gsc_downpaymentfrom").val("");
          $("#gsc_downpaymentto").val("");

          // Remove the new validator to the page validators array:
          Page_Validators = jQuery.grep(Page_Validators, function (value) {
          return value != dpToValidator;
          });
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != dpFromValidator;
                });
            
				//Additional requirement: Created by Christell Ann Mataac 1/31/2017
				//START
				$("#gsc_addonrate").attr('readonly', false);
				$('label[for=gsc_addonrate]').parent("div").addClass("required");
				$("#gsc_addonrate").val(null);
				Page_Validators.push(dpAddOnRate); 
				//END
        }
    }, 100);
});