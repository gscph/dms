$(document).ready(function () {
    //$('label[for=gsc_recordtype], select#gsc_recordtype').hide();
    $('#gsc_recordownerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_dealerid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_branchid_name').siblings('.input-group-btn').addClass('hidden');
    $(".section[data-name='HideSection']").closest("fieldset").hide();
    $('#gsc_age').attr('readonly', true);
    $('#gsc_regionid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_regionbillingid_name').siblings('.input-group-btn').addClass('hidden');

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
                $("#gsc_countrybillingid").val(country.Id);
                $("#gsc_countrybillingid_name").val(country.Name);
                $("#gsc_countrybillingid_entityname").val("gsc_cmn_country");
                $("#gsc_countrybillingid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
            if (province != null) {
                $("#gsc_provinceid").val(province.Id);
                $("#gsc_provinceid_name").val(province.Name);
                $("#gsc_provinceid_entityname").val("gsc_cmn_province");
                $("#gsc_provinceid").siblings('div.input-group-btn').children('.clearlookupfield').show();
                $("#gsc_provincebillingid").val(province.Id);
                $("#gsc_provincebillingid_name").val(province.Name);
                $("#gsc_provincebillingid_entityname").val("gsc_cmn_province");
                $("#gsc_provincebillingid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
            if (city != null) {
                $("#gsc_cityid").val(city.Id);
                $("#gsc_cityid_name").val(city.Name);
                $("#gsc_cityid_entityname").val("gsc_cmn_city");
                $("#gsc_cityid").siblings('div.input-group-btn').children('.clearlookupfield').show();
                $("#gsc_citybillingid").val(city.Id);
                $("#gsc_citybillingid_name").val(city.Name);
                $("#gsc_citybillingid_entityname").val("gsc_cmn_city");
                $("#gsc_citybillingid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
            if (region != null) {
                $("#gsc_regionid_name").val(region.Name);
                $("#gsc_regionid").val(region.Id);
                $("#gsc_regionid_entityname").val("gsc_cmn_region");
                $("#gsc_regionbillingid_name").val(region.Name);
                $("#gsc_regionbillingid").val(region.Id);
                $("#gsc_regionbillingid_entityname").val("gsc_cmn_region");
            }
        },
        error: function (xhr, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });

    var taxOdataUrl = "/_odata/gsc_cmn_taxmaintenance?$filter=gsc_isdefault eq true and gsc_branchid/Id eq (Guid'" + DMS.Settings.User.branchId + "')";
    $.ajax({
        type: "get",
        async: true,
        url: taxOdataUrl,
        success: function (data) {
            if (data.value.length != 0) {
                var tax = data.value[0];
                $("#gsc_taxid_name").val(tax.gsc_taxname);
                $("#gsc_taxid").val(tax.gsc_cmn_taxmaintenanceid);
                $("#gsc_taxid_entityname").val("gsc_cmn_taxmaintenance");
                $("#gsc_taxid").siblings('div.input-group-btn').children('.clearlookupfield').show();
            }
        },
        error: function (xhr, textStatus, errorMessage) {
            console.log(errorMessage);
        }
    });

    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;

    // Create new validator
    var billingZipCodeValidator = document.createElement('span');
    billingZipCodeValidator.style.display = "none";
    billingZipCodeValidator.id = "RequiredFieldValidatoraddress2_postalcode";
    billingZipCodeValidator.controltovalidate = "address2_postalcode";
    billingZipCodeValidator.errormessage = "<a href='#address2_postalcode'>Zip Code (Billing Address) is a required field.</a>";
    billingZipCodeValidator.validationGroup = "";
    billingZipCodeValidator.initialvalue = "";
    billingZipCodeValidator.evaluationfunction = function () {
        var value = $("#address2_postalcode").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    // Create new validator
    var billingStreetValidator = document.createElement('span');
    billingStreetValidator.style.display = "none";
    billingStreetValidator.id = "RequiredFieldValidatoraddress2_line1";
    billingStreetValidator.controltovalidate = "address2_line1";
    billingStreetValidator.errormessage = "<a href='#address2_line1'>Street (Billing Address) is a required field.</a>";
    billingStreetValidator.validationGroup = "";
    billingStreetValidator.initialvalue = "";
    billingStreetValidator.evaluationfunction = function () {
        var value = $("#address2_line1").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    // Create new validator
    var billingCountryValidator = document.createElement('span');
    billingCountryValidator.style.display = "none";
    billingCountryValidator.id = "RequiredFieldValidatorgsc_countrybillingid";
    billingCountryValidator.controltovalidate = "gsc_countrybillingid";
    billingCountryValidator.errormessage = "<a href='#gsc_countrybillingid'>Country (Billing Address) is a required field.</a>";
    billingCountryValidator.validationGroup = "";
    billingCountryValidator.initialvalue = "";
    billingCountryValidator.evaluationfunction = function () {
        var value = $("#gsc_countrybillingid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    // Create new validator
    var billingProvinceValidator = document.createElement('span');
    billingProvinceValidator.style.display = "none";
    billingProvinceValidator.id = "RequiredFieldValidatorgsc_provincebillingid";
    billingProvinceValidator.controltovalidate = "gsc_provincebillingid";
    billingProvinceValidator.errormessage = "<a href='#gsc_provincebillingid'>Province (Billing Address) is a required field.</a>";
    billingProvinceValidator.validationGroup = "";
    billingProvinceValidator.initialvalue = "";
    billingProvinceValidator.evaluationfunction = function () {
        var value = $("#gsc_provincebillingid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    // Create new validator
    var billingCityValidator = document.createElement('span');
    billingCityValidator.style.display = "none";
    billingCityValidator.id = "RequiredFieldValidatorgsc_citybillingid";
    billingCityValidator.controltovalidate = "gsc_citybillingid";
    billingCityValidator.errormessage = "<a href='#gsc_citybillingid'>City (Billing Address) is a required field.</a>";
    billingCityValidator.validationGroup = "";
    billingCityValidator.initialvalue = "";
    billingCityValidator.evaluationfunction = function () {
        var value = $("#gsc_citybillingid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    setTimeout(function () {
        SamePermanentAddress();

        if($('#gsc_fleetcategory').val() == 100000001)
                $('#gsc_fleetaccount').attr('disabled', 'disabled');
              
        $('#gsc_fleetcategory').on('change', function () {
            if ($(this).val() == 100000001) {
                $('#gsc_fleetaccount').attr('disabled', 'disabled');
                $('#gsc_fleetaccount').val("");
                return;
            }
            else if ($(this).val() == 100000000) {
                $('#gsc_fleetaccount').removeAttr('disabled', 'disabled');
                $('#gsc_fleetaccount').val("");
                return;
            }            $('#gsc_fleetaccount').attr('disabled', 'disabled');
            $('#gsc_fleetaccount').val("");

        });
        if (!$('#gsc_isfleet').is(":checked")) {

            $('#gsc_classid').siblings('.input-group-btn').hide();
            $('#gsc_fleetcategory').attr('disabled', 'disabled');
            $('#gsc_fleetaccount').attr('disabled', 'disabled');
        }

        $('#gsc_isfleet').on('change', function () {

            if ($(this).is(":checked")) {
                $('#gsc_classid').siblings('.input-group-btn').show();
                $("#gsc_classid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
                $('#gsc_fleetcategory').removeAttr('disabled');
                return;
            }
            $('#gsc_classid').val("");
            $('#gsc_classid_name').val("");
            $('#gsc_fleetcategory').val("");
            $('#gsc_fleetaccount').val("");
            $('#gsc_classid').siblings('.input-group-btn').hide();
            $('#gsc_fleetcategory').attr('disabled', 'disabled');
            $('#gsc_fleetaccount').attr('disabled', 'disabled');
        });

        $('.datetimepicker').data("DateTimePicker").setMaxDate(new Date());

        $('#birthdate').next('.datetimepicker').on('dp.change', function (e) {
            var diff = moment().diff(e.date, 'years');
            $('#gsc_age').val(Math.max(0, diff));

        });

        $("#gsc_countryid").on('change', function () {
            $("#gsc_provinceid_name").val("");
            $("#gsc_provinceid").val("");
            $("#gsc_provinceid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $("#gsc_provinceid").trigger("change");
        });

        $("#gsc_provinceid").on('change', function () {
            $("#gsc_cityid_name").val("");
            $("#gsc_cityidid").val("");
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


        //billing address
        $("#gsc_countrybillingid").on('change', function () {
            $("#gsc_provincebillingid_name").val("");
            $("#gsc_provincebillingid").val("");
            $("#gsc_provincebillingid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $("#gsc_provincebillingid").trigger("change");
        });

        $("#gsc_provincebillingid").on('change', function () {
            $("#gsc_citybillingid_name").val("");
            $("#gsc_citybillingid").val("");
            $("#gsc_citybillingid").siblings('div.input-group-btn').children('.clearlookupfield').hide();

            var provincebillingId = $("#gsc_provincebillingid").val();

            if (provincebillingId != null && provincebillingId != "" && provincebillingId != "undefinded") {

                var odataUrl = "/_odata/gsc_cmn_province?$filter=gsc_cmn_provinceid eq (Guid'" + provincebillingId + "')";
                $.ajax({
                    type: "get",
                    async: true,
                    url: odataUrl,
                    success: function (data) {
                        var region = data.value[0].gsc_regionid;
                        $("#gsc_regionbillingid_name").val(region.Name);
                        $("#gsc_regionbillingid").val(region.Id);
                        $("#gsc_regionbillingid_entityname").val("gsc_cmn_region");
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
            }
            else {
                $("#gsc_regionbillingid_name").val("");
                $("#gsc_regionbillingid").val("");
            }
        });

        $('#gsc_sametopermanentaddress').on('change', function () {
            SamePermanentAddress();
        });
        
        /* Added by: Christell Ann Mataac - 2/22/2017
          this will auto populate tax rate based on the selected tax id*/
        $('#gsc_taxid').on('change', function () {
          var taxId = $('#gsc_taxid').val();
          var chargeQuery = "/_odata/gsc_cmn_taxmaintenance?$filter=gsc_cmn_taxmaintenanceid eq (Guid'" + taxId + "')";
  
          $.ajax({
            type: 'get',
            async: true,
            url: chargeQuery,
            success: function (data) {
              if (data.value.length != 0) {
                var tax = data.value[0];
                var taxRate = tax.gsc_rate;
                
                $('#gsc_taxrate').val(taxRate);
              }
            },
            error: function (xhr, textStatus, errorMessage) {
              $('#gsc_taxrate').val('');
              console.log(errorMessage);
            }
          });
        });

    }, 100);

    function SamePermanentAddress() {
        var copyAddress = $('#gsc_sametopermanentaddress').is(":checked");

        if (copyAddress == true) {
            $('label[for=address2_postalcode]').parent("div").removeClass("required");
            $('label[for=address2_line1]').parent("div").removeClass("required");
            $('#gsc_countrybillingid_label').parent("div").removeClass("required");
            $('#gsc_provincebillingid_label').parent("div").removeClass("required");
            $('#gsc_citybillingid_label').parent("div").removeClass("required");

            $("#address2_postalcode").val("");
            $("#address2_line1").val("");
            $("#gsc_countrybillingid").val("");
            $("#gsc_countrybillingid_name").val("");
            $("#gsc_provincebillingid").val("");
            $("#gsc_provincebillingid_name").val("");
            $("#gsc_citybillingid").val("");
            $("#gsc_citybillingid_name").val("");

            $("#address2_postalcode").attr('disabled', 'disabled');
            $("#address2_line1").attr('disabled', 'disabled');
            $('#gsc_countrybillingid').siblings('.input-group-btn').addClass('hidden');
            $('#gsc_provincebillingid').siblings('.input-group-btn').addClass('hidden');
            $('#gsc_citybillingid').siblings('.input-group-btn').addClass('hidden');

            // Remove the new validator to the page validators array:
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != billingZipCodeValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != billingStreetValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != billingCountryValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != billingProvinceValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != billingCityValidator;
            });

            $("a[href='#address2_postalcode']").on("click", function () { scrollToAndFocus('address2_postalcode_label', 'address2_postalcode'); });
            $("a[href='#address2_line1']").on("click", function () { scrollToAndFocus('address2_line1_label', 'address2_line1'); });
            $("a[href='#gsc_countrybillingid']").on("click", function () { scrollToAndFocus('gsc_countrybillingid_label', 'gsc_countrybillingid'); });
            $("a[href='#gsc_provincebillingid']").on("click", function () { scrollToAndFocus('gsc_provincebillingid_label', 'gsc_provincebillingid'); });
            $("a[href='#gsc_citybillingid']").on("click", function () { scrollToAndFocus('gsc_citybillingid_label', 'gsc_citybillingid'); });
        }
        else {
            $('label[for=address2_postalcode]').parent("div").addClass("required");
            $('label[for=address2_line1]').parent("div").addClass("required");
            $('#gsc_countrybillingid_label').parent("div").addClass("required");
            $('#gsc_provincebillingid_label').parent("div").addClass("required");
            $('#gsc_citybillingid_label').parent("div").addClass("required");

            $("#address2_postalcode").removeAttr('disabled');
            $("#address2_line1").removeAttr('disabled');
            $('#gsc_countrybillingid').siblings('.input-group-btn').removeClass('hidden');
            $('#gsc_provincebillingid').siblings('.input-group-btn').removeClass('hidden');
            $('#gsc_citybillingid').siblings('.input-group-btn').removeClass('hidden');

            //Add Validators
            Page_Validators.push(billingZipCodeValidator);
            Page_Validators.push(billingStreetValidator);
            Page_Validators.push(billingCountryValidator);
            Page_Validators.push(billingProvinceValidator);
            Page_Validators.push(billingCityValidator);
        }
    }

    createValidators();

    function createValidators() {
        var phoneValidator = document.createElement('span');
        phoneValidator.style.display = "none";
        phoneValidator.id = "RequiredFieldValidatortelephone1";
        phoneValidator.controltovalidate = "telephone1";
        phoneValidator.errormessage = "<a href='#telephone1'>Alternate phone number not in correct format.</a>";
        phoneValidator.validationGroup = "";
        phoneValidator.initialvalue = "";
        phoneValidator.evaluationfunction = function () {
            var value = $("#telephone1").val();
            var regex = /^[\d ()\-+]*$/;

            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };

        var mobilePhoneValidator = document.createElement('span');
        mobilePhoneValidator.style.display = "none";
        mobilePhoneValidator.id = "RequiredFieldValidatormobilephone";
        mobilePhoneValidator.controltovalidate = "mobilephone";
        mobilePhoneValidator.errormessage = "<a href='#mobilephone'>Mobile phone not in correct format.</a>";
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

        var tinValidator = document.createElement('span');
        tinValidator.style.display = "none";
        tinValidator.id = "RequiredFieldValidatorgsc_tin";
        tinValidator.controltovalidate = "gsc_tin";
        tinValidator.errormessage = "<a href='#gsc_tin'>TIN number not in correct format.</a>";
        tinValidator.validationGroup = "";
        tinValidator.initialvalue = "";
        tinValidator.evaluationfunction = function () {
            var value = $("#gsc_tin").val();
            var regex = /^[\d \-]*$/;

            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };

        var faxValidator = document.createElement('span');
        faxValidator.style.display = "none";
        faxValidator.id = "RequiredFieldValidatormobilephone";
        faxValidator.controltovalidate = "fax";
        faxValidator.errormessage = "<a href='#fax'>Fax not in correct format.</a>";
        faxValidator.validationGroup = "";
        faxValidator.initialvalue = "";
        faxValidator.evaluationfunction = function () {
            var value = $("#fax").val();
            var regex = /^[\d ()\-+]*$/;

            var matches = value.match(regex);

            if (matches != null) {
                return true;
            }
            else
                return false;
        };

        Page_Validators.push(phoneValidator);
        Page_Validators.push(mobilePhoneValidator);
        Page_Validators.push(tinValidator);
        Page_Validators.push(faxValidator);
    }
});