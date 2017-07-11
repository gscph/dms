$(document).ready(function () {

    $('#gsc_recordownerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_dealerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_branchid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_age').attr('readonly', true);
    $('#gsc_regionid_name').siblings('.input-group-btn').addClass('hidden');

    var branchId = $('#gsc_branchid').val();
    var addressOdataQuery = "/_odata/branchAddress?$filter=accountid eq (Guid'" + branchId + "')";
    $.ajax({
        type: 'get',
        async: true,
        url: addressOdataQuery,
        success: function (data) {
            var country = data.value[0].gsc_countryid;
            var province = data.value[0].gsc_provinceid;
            var city = data.value[0].gsc_cityid;
            var region = data.value[0].gsc_regionid;

            if (country != null) {
                $("#gsc_countryid").val(country.Id);
                $("#gsc_countryid_name").val(country.Name);
                $("#gsc_countryid_entityname").val("gsc_cmn_country");
                $("#gsc_countryid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
            if (province != null) {
                $("#gsc_provinceid").val(province.Id);
                $("#gsc_provinceid_name").val(province.Name);
                $("#gsc_provinceid_entityname").val("gsc_cmn_province");
                $("#gsc_provinceid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
            if (city != null) {
                $("#gsc_cityid").val(city.Id);
                $("#gsc_cityid_name").val(city.Name);
                $("#gsc_cityid_entityname").val("gsc_cmn_city");
                $("#gsc_cityid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
            if (region != null) {
                $("#gsc_regionid_name").val(region.Name);
                $("#gsc_regionid").val(region.Id);
                $("#gsc_regionid_entityname").val("gsc_cmn_region");
            }
        },
        error: function (xhr, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });

    if (typeof (Page_Validators) == 'undefined') return;

    var financingValidator = document.createElement('span');
    financingValidator.style.display = "none";
    financingValidator.id = "RequiredFieldValidatorgsc_financingtermid";
    financingValidator.controltovalidate = "gsc_financingtermid";
    financingValidator.errormessage = "<a href='#gsc_financingtermid'>Financing Term is a required field</a>";
    financingValidator.validationGroup = "";
    financingValidator.initialvalue = "";
    financingValidator.evaluationfunction = function () {
        var value = $("#gsc_financingtermid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    setTimeout(function () {
        requirementLevel()
        $('#gsc_birthday').next('.datetimepicker').children('input').mask('00/00/0000');
    }, 100);

    setTimeout(function () {

        if (DMS.Settings.User.positionName == "Sales Executive" || DMS.Settings.User.webRole == "Sales Executive")
            SetSalesExecutive();

        $('#gsc_birthday').next('.datetimepicker').data("DateTimePicker").setMaxDate(new Date());
        $('#gsc_inquirydate').next('.datetimepicker').data("DateTimePicker").setMaxDate(new Date());

        $("#gsc_vehicletypeid").on('change', function () {
            $("#gsc_vehiclebasemodelid_name").val("");
            $("#gsc_vehiclebasemodelid").val("");
        });

        $("#gsc_paymentmode").on('change', function () {
            var paymentmode = $("#gsc_paymentmode").val();

            if (paymentmode == '100000001') {
                $('#gsc_financingtermid_label').parent("div").addClass("required");
                $('#gsc_financingtermid_name').siblings('.input-group-btn').removeClass('hidden');

                Page_Validators.push(financingValidator);
            }
            else {
                $('#gsc_financingtermid').val(null);
                $('#gsc_financingtermid_name').val(null);
                $('#gsc_financingtermid_label').parent("div").removeClass("required");
                $('#gsc_financingtermid_name').siblings('.input-group-btn').addClass('hidden');

                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != financingValidator;
                });
            }
        });

        //Scripts from Prospect Entity Form
        $('#gsc_birthday').next('.datetimepicker').on('dp.change', function (e) {
            var diff = moment().diff(e.date, 'years');
            $('#gsc_age').val(Math.max(0, diff));
        });

        $('#gsc_prospecttype').change(requirementLevel);


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

    //Variable used to validate requirement level
    var customerTypeLastValue = 0;

    //Set page validators
    if (typeof (Page_Validators) == 'undefined') return;

    //Create new validator
    var companyValidator = document.createElement('span');
    companyValidator.style.display = "none";
    companyValidator.id = "RequiredFieldValidatorcompanyname";
    companyValidator.controltovalidate = "companyname";
    companyValidator.errormessage = "<a href='#companyname'>Company Name is a required field.</a>";
    companyValidator.validationGroup = "";
    companyValidator.initialvalue = "";
    companyValidator.evaluationfunction = function () {
        var value = $("#companyname").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var phoneValidator = document.createElement('span');
    phoneValidator.style.display = "none";
    phoneValidator.id = "RequiredFieldValidatortelephone1";
    phoneValidator.controltovalidate = "telephone1";
    phoneValidator.errormessage = "<a href='#telephone1'>Phone is a required field.</a>";
    phoneValidator.validationGroup = "";
    phoneValidator.initialvalue = "";
    phoneValidator.evaluationfunction = function () {
        var value = $("#telephone1").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var genderValidator = document.createElement('span');
    genderValidator.style.display = "none";
    genderValidator.id = "RequiredFieldValidatorgsc_gender";
    genderValidator.controltovalidate = "gsc_gender";
    genderValidator.errormessage = "<a href='#gsc_gender'>Gender is a required field.</a>";
    genderValidator.validationGroup = "";
    genderValidator.initialvalue = "";
    genderValidator.evaluationfunction = function () {
        var value = $("#gsc_gender").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var birthdayValidator = document.createElement('span');
    birthdayValidator.style.display = "none";
    birthdayValidator.id = "RequiredFieldValidatorgsc_birthday";
    birthdayValidator.controltovalidate = "gsc_birthday";
    birthdayValidator.errormessage = "<a href='#gsc_birthday'>Birthday is a required field.</a>";
    birthdayValidator.validationGroup = "";
    birthdayValidator.initialvalue = "";
    birthdayValidator.evaluationfunction = function () {
        var value = $("#gsc_birthday").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var mobilePhoneValidator = document.createElement('span');
    mobilePhoneValidator.style.display = "none";
    mobilePhoneValidator.id = "RequiredFieldValidatormobilephone";
    mobilePhoneValidator.controltovalidate = "mobilephone";
    mobilePhoneValidator.errormessage = "<a href='#mobilephone'>Mobile phone should only contain numeric values.</a>";
    mobilePhoneValidator.validationGroup = "";
    mobilePhoneValidator.initialvalue = "";
    mobilePhoneValidator.evaluationfunction = function () {
        var value = $("#mobilephone").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };

    var alternateContactValidator = document.createElement('span');
    alternateContactValidator.style.display = "none";
    alternateContactValidator.id = "RequiredFieldValidatorgsc_alternatecontactno";
    alternateContactValidator.controltovalidate = "gsc_alternatecontactno";
    alternateContactValidator.errormessage = "<a href='#gsc_alternatecontactno'>Alternate contact number should only contain numeric values.</a>";
    alternateContactValidator.validationGroup = "";
    alternateContactValidator.initialvalue = "";
    alternateContactValidator.evaluationfunction = function () {
        var value = $("#gsc_alternatecontactno").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);


        if (matches != null || value == "" || value == null) {
            return true;
        }
        else
            return false;
    };

    var faxValidator = document.createElement('span');
    faxValidator.style.display = "none";
    faxValidator.id = "RequiredFieldValidatorfax";
    faxValidator.controltovalidate = "fax";
    faxValidator.errormessage = "<a href='#fax'>Fax number should only contain numeric values.</a>";
    faxValidator.validationGroup = "";
    faxValidator.initialvalue = "";
    faxValidator.evaluationfunction = function () {
        var value = $("#fax").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null || value == "" || value == null) {
            return true;
        }
        else
            return false;
    };

    function SetSalesExecutive() {
        $("#gsc_salesexecutiveid_entityname").val("contact");
        $("#gsc_salesexecutiveid").val(DMS.Settings.User.Id);
        var fullName = $("#userFullname").html();
        $("#gsc_salesexecutiveid_name").val(fullName);
    }

    //Set requirement level of fields according to selected prospect type
    function requirementLevel() {
        if ($('#gsc_prospecttype').val() == "100000001" || $('#gsc_prospecttype').val() == "100000002") {
            $('#gsc_birthday').next('div').css('display', 'none');
            $('#gsc_birthday').val('');
            document.getElementById('gsc_birthday').style.display = 'block';

            if (customerTypeLastValue != 0) {
                customerTypeLastValue = 0;

                //Add asterisk to each required field
                $('label[for=companyname]').parent('div').addClass('required');
                $('label[for=telephone1]').parent('div').addClass('required');

                $('label[for=gsc_gender]').parent('div').removeClass('required');
                $('label[for=gsc_birthday]').parent('div').removeClass('required');

                //Add the new validator to the page validators array
                Page_Validators.push(companyValidator);
                Page_Validators.push(phoneValidator);
                Page_Validators.push(faxValidator);
                Page_Validators.push(alternateContactValidator);

                //Remove the new validator to the page validators array
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != genderValidator;
                });
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != birthdayValidator;
                });

                $("a[href='#companyname']").on("click", function () { scrollToAndFocus('companyname_label', 'companyname'); });
                $("a[href='#telephone1']").on("click", function () { scrollToAndFocus('telephone1_label', 'telephone1'); });

                //Disable fields
                document.getElementById("gsc_birthday").disabled = true;
                document.getElementById("gsc_gender").disabled = true;
                document.getElementById("gsc_maritalstatus").disabled = true;
                document.getElementById("gsc_age").disabled = true;
                document.getElementById("companyname").disabled = false;
                document.getElementById("telephone1").disabled = false;
                document.getElementById("websiteurl").disabled = false;

                //Clear values of individual fields
                $('#gsc_birthday').val('');
                $('#gsc_gender').val('');
                $('#gsc_maritalstatus').val('');
                $('#gsc_age').val('');
            }

        }
        else if ($('#gsc_prospecttype').val() == '100000000') {
            if (customerTypeLastValue != 1) {
                customerTypeLastValue = 1;

                //Show datepicker
                $('#gsc_birthday').next('div').css('display', '');
                document.getElementById('gsc_birthday').style.display = 'none';

                //Remove span created that contains the asterisk
                $('label[for=companyname]').parent('div').removeClass('required');
                $('label[for=telephone1]').parent('div').removeClass('required');

                //Add asterisk symbol to define requirement level
                $('label[for=gsc_gender]').parent('div').addClass('required');
                $('label[for=gsc_birthday]').parent('div').addClass('required');

                //Add the new validator to the page validators array
                Page_Validators.push(genderValidator);
                Page_Validators.push(birthdayValidator);
                Page_Validators.push(mobilePhoneValidator);
                Page_Validators.push(faxValidator);
                Page_Validators.push(alternateContactValidator);

                //Remove the new validator to the page validators array
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != companyValidator;
                });
                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != phoneValidator;
                });

                $('a[href="#gsc_gender"]').on('click', function () { scrollToAndFocus('gsc_gender_label', 'gsc_gender'); });
                $('a[href="#gsc_birthday"]').on('click', function () { scrollToAndFocus('gsc_birthday_label', 'adx:datetimepicker'); });

                //Disable fields
                document.getElementById('gsc_birthday').disabled = false;
                document.getElementById('gsc_gender').disabled = false;
                document.getElementById('gsc_maritalstatus').disabled = false;
                document.getElementById('gsc_age').disabled = false;
                document.getElementById('companyname').disabled = true;
                document.getElementById('telephone1').disabled = true;
                document.getElementById('websiteurl').disabled = true;

                //Clear values of corporate fields
                $('#companyname').val('');
                $('#telephone1').val('');
                $('#websiteurl').val('');
            }
        }
        else {
            customerTypeLastValue = 2;
        }
    }
});