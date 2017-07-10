$(document).ready(function () {
    $(".section[data-name='tabbed-opportunityquotes']").closest("fieldset").hide();
    $('#gsc_portaluserid').hide();
    $('#gsc_portaluserid_label').hide();

    setTimeout(function () {
        $('#accordionHeader-1').parent().hide();
        $('#gsc_portaluserid').val(userId);
    }, 1000);

    //Modified By : Jerome Anthony Gerero, Modified On : 1/23/2017
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

         if(DMS.Settings.User.positionName == "Sales Executive" || DMS.Settings.User.webRole == "Sales Executive")
            SetSalesExecutive();

    function SetSalesExecutive(){
        $("#gsc_salesexecutiveid_entityname").val("contact");
        $("#gsc_salesexecutiveid").val(DMS.Settings.User.Id);
        var fullName = $("#userFullname").html();
        $("#gsc_salesexecutiveid_name").val(fullName);
    }
        $("#gsc_paymentmode").on('change', function () {
            var paymentmode = $("#gsc_paymentmode").val();

            if (paymentmode == '100000001') {
                $('#gsc_financingtermid_label').parent("div").addClass("required");
                $("#gsc_financingtermid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
                $('#gsc_financingtermid_name').siblings('.input-group-btn').removeClass('hidden');

                Page_Validators.push(financingValidator);
            }
            else {
                $('#gsc_financingtermid').val(null);
                $('#gsc_financingtermid_name').val(null);
                $('#gsc_financingtermid_label').parent("div").removeClass("required");
                $("#gsc_financingtermid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
                $('#gsc_financingtermid_name').siblings('.input-group-btn').addClass('hidden');

                Page_Validators = jQuery.grep(Page_Validators, function (value) {
                    return value != financingValidator;
                });
            }
        });

        $("#customerid").on('change', function () {
            var customerId = $("#customerid").val();

            if (customerId != "") {
                var customerEntity = $("#customerid_entityname").val();
                var odataName = customerEntity;

                if (customerEntity == "contact")
                    odataName = "individual";

                var customerOdataQuery = "/_odata/" + odataName + "?$filter=" + customerEntity + "id eq (Guid'" + customerId + "')";
                $.ajax({
                    type: 'get',
                    async: true,
                    url: customerOdataQuery,
                    success: function (data) {
                        var customer = data.value[0];
                        var country = customer.gsc_countryid;
                        var province = customer.gsc_provinceid;
                        var city = customer.gsc_cityid;
                        var address = customer.address1_line1;
                        var isFraud = customer.gsc_fraud;

                        if(isFraud == true)
                        {
                          $("#customerid").val(null);
                          $("#customerid_name").val(null);
                          DMS.Notification.Error("The customer you selected has been identified as a fraud account. Please ask the customer to provide further information.",true,5000);
                        }
                      else 
                        {
                        if (customerEntity == "contact")
                            $("#gsc_mobileno").val(customer.mobilephone);
                        else
                            $("#gsc_mobileno").val(customer.telephone1);

                        if (city != null) {
                            address = address + ", " + city.Name;
                        }
                        if (province != null) {
                            address = address + ", " + province.Name;
                        }
                        if (country != null) {
                            address = address + ", " + country.Name;
                        }
                        $("#gsc_completeaddress").val(address);

                    }},
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
            }
            else {
                $("#gsc_mobileno").val("");
                $("#gsc_completeaddress").val("");
            }
        });

    });
    //End

    var refEntity = DMS.Helpers.GetUrlQueryString('refentity');
    var refId = DMS.Helpers.GetUrlQueryString('refid');

    if (refEntity != null && refId != null) {
        //Loading Image
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center loadingDiv";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);

        var odataName = refEntity;

        if (refEntity == "contact")
            odataName = "individual";

        var customerOdataQuery = "/_odata/" + odataName + "?$filter=" + refEntity + "id eq (Guid'" + refId + "')";
        $.ajax({
            type: 'get',
            async: true,
            url: customerOdataQuery,
            success: function (data) {
                var customer = data.value[0];
                var country = customer.gsc_countryid;
                var province = customer.gsc_provinceid;
                var city = customer.gsc_cityid;
                var address = customer.address1_line1;
                var isFraud = customer.gsc_fraud;
              
                if(isFraud == true)
                {
                  $("#customerid").val(null);
                  $("#customerid_name").val(null);
                  DMS.Notification.Error("The customer you selected has been identified as a fraud account. Please ask the customer to provide further information.",true,5000);
                }
              else
              {
                if (refEntity == "contact") {
                    $("#customerid").val(customer.contactid);
                    $("#customerid_name").val(customer.fullname);
                }
                else {
                    $("#customerid").val(customer.accountid);
                    $("#customerid_name").val(customer.name);
                }

                $("#customerid_entityname").val(refEntity);
                $('#customerid_name').siblings('.input-group-btn').addClass('hidden');

                if (refEntity == "contact")
                    $("#gsc_mobileno").val(customer.mobilephone);
                else
                    $("#gsc_mobileno").val(customer.telephone1);

                if (city != null) {
                    address = address + ", " + city.Name;
                }
                if (province != null) {
                    address = address + ", " + province.Name;
                }
                if (country != null) {
                    address = address + ", " + country.Name;
                }
                $("#gsc_completeaddress").val(address);
                $.unblockUI();
                $(".loadingDiv").remove();

            }},
            error: function (xhr, textStatus, errorMessage) {
                console.log(errorMessage);
            }
        });
    }
});