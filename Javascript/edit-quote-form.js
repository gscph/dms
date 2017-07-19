$(document).ready(function (e) {
    $('table[data-name="hideSection"]').closest('fieldset').hide();
    $("#gsc_lessdiscount").closest("td").height(57);
    var paymentmode = "";

    //for custom filtering of views
    setTimeout(function () {
        $("#gsc_portaluserid").val(userId);
        $.cookie("baseModel", $("#gsc_vehiclebasemodelid").val(), { path: '/' });
        $.cookie("productId", $("#gsc_productid").val(), { path: '/' });

        $('#gsc_validuntil').next('.datetimepicker').on("dp.change", function (e) {
            $(this).data("DateTimePicker").setMinDate(new Date());
        });

    }, 100);

    //check quote status if open or not
    CheckStatus();
    CheckifGovernment();

    function CheckStatus() {
        setTimeout(function () {
            var stateCode = $(".record-status").html();
            if (stateCode == "Active") {
                $('#SubmitButton').attr("disabled", true);
                $('.delete-link').attr("disabled", true);
                $("#btnSaveCopy").attr("disabled", true);
                $(".cancel").attr("disabled", true);
                $(".addnew").attr("disabled", true);
            }
            else if (stateCode == "Closed" || stateCode == "Won") {
                $('#SubmitButton').attr("disabled", true);
                $('.delete-link').attr("disabled", true);
                $('#btnRecalculate').attr("disabled", true);
                $('#btnRecalculate').addClass("disabled");
                $('.close-quote').attr("disabled", true);
                $("#btnSaveCopy").attr("disabled", true);
                $(".cancel").attr("disabled", true);
                $(".addnew").attr("disabled", true);
            }
        }, 100);
    }

    function CheckifGovernment() {
        if ($("#customerid_entityname").val() == "account") {
            var accountid = $("#customerid").val();

            var odataUrl = "/_odata/account?$filter=accountid eq (Guid'" + accountid + "')";

            $.ajax({
                type: "get",
                async: true,
                url: odataUrl,
                success: function (data) {
                    for (var i = 0; i < data.value.length; i++) {
                        var obj = data.value[i];
                        if (obj.gsc_customertype.Name == "Corporate") {
                            $("#customerid_name").closest("td").attr("colspan", 4);
                            $('label[for=gsc_markup], input#gsc_markup').hide();
                        }
                    }
                },
                error: function (xhr, textStatus, errorMessage) {
                    console.log(errorMessage);
                }
            });
        }
        else {
            $("#customerid_name").closest("td").attr("colspan", 4);
            $('label[for=gsc_markup], input#gsc_markup').hide();
        }
    }

    if ($("#gsc_paymentmode").val() == "") {
        var opportunityId = $("#opportunityid").val();

        if (opportunityId != "") {
            //Loading Image
            $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

            var div = document.createElement("DIV");
            div.className = "view-loading message text-center loadingDiv";
            div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
            var span = document.createElement("SPAN");
            span.className = "fa fa-2x fa-spinner fa-spin";
            div.appendChild(span);
            $(".content-wrapper").append(div);

            var countryOdataQuery = "/_odata/opportunity?$filter=opportunityid eq (Guid'" + opportunityId + "')";
            $.ajax({
                type: 'get',
                async: true,
                url: countryOdataQuery,
                success: function (data) {
                    if (data.value.length != 0) {
                        var paymentMode = data.value[0].gsc_paymentmode;
                        if (paymentMode != null) {
                            $("#gsc_paymentmode").val(paymentMode.Value);
                            paymentmode = $("#gsc_paymentmode").val();
                            console.log(paymentmode);
                            paymentModeOnChange("onload");
                        }
                    }
                    $.unblockUI();
                    $(".loadingDiv").remove();
                },
                error: function (xhr, textStatus, errorMessage) {
                    console.log(errorMessage);
                }
            });
        }
    }

    //set readonly fields
    $('#gsc_netdownpayment').attr('readonly', true);
    $('#gsc_amountfinanced').attr('readonly', true);
    $('#gsc_netamountfinanced').attr('readonly', true);
    var status = $(".record-status").html();

    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;

    //Validator when valid until is not less than current date
    var validUntilValidator = document.createElement('span');
    validUntilValidator.style.display = "none";
    validUntilValidator.id = "RequiredFieldValidatorvaliduntil";
    validUntilValidator.errormessage = "Valid Until Date should not be less than the current date.";
    validUntilValidator.validationGroup = "";
    validUntilValidator.initialvalue = "";
    validUntilValidator.evaluationfunction = function () {
        var validDate = $("#gsc_validuntil").val() == "" ? 0 : $("#gsc_validuntil").val();
        var currentDate = new Date();

        if (new Date(validDate) >= new Date(currentDate.setHours(0, 0, 0, 0))) {
            return true;
        } else {
            return false;
        }
    };

    if (status == 'Draft') {
        Page_Validators.push(validUntilValidator);
    }

    //Validator when the discounts are not equal to 100%
    var discountValidator = document.createElement('span');
    discountValidator.style.display = "none";
    discountValidator.id = "RequiredFieldValidatordiscounts";
    discountValidator.errormessage = "Discounts to be applied should total to 100%.";
    discountValidator.validationGroup = "";
    discountValidator.initialvalue = "";
    discountValidator.evaluationfunction = function () {
        var af = $("#gsc_applytoafpercentage").val() == "" ? 0 : $("#gsc_applytoafpercentage").val();
        var dp = $("#gsc_applytodppercentage").val() == "" ? 0 : $("#gsc_applytodppercentage").val();
        var up = $("#gsc_applytouppercentage").val() == "" ? 0 : $("#gsc_applytouppercentage").val();


        if (af < 1 && dp < 1 && up < 1) {
            return true;
        } else {
            var total = parseFloat(af) + parseFloat(dp) + parseFloat(up);
            if (total < 100) {
                return false;
            } else {
                return true;
            }
        }
    };

    Page_Validators.push(discountValidator);

    var bankValidator = document.createElement('span');
    bankValidator.style.display = "none";
    bankValidator.id = "RequiredFieldValidatorgsc_bankid";
    bankValidator.controltovalidate = "gsc_bankid";
    bankValidator.errormessage = "<a href='#gsc_bankid'>Bank is a required field</a>";
    bankValidator.validationGroup = "";
    bankValidator.initialvalue = "";
    bankValidator.evaluationfunction = function () {
        var value = $("#gsc_bankid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var schemeValidator = document.createElement('span');
    schemeValidator.style.display = "none";
    schemeValidator.id = "RequiredFieldValidatorgsc_financingschemeid";
    schemeValidator.controltovalidate = "gsc_financingschemeid";
    schemeValidator.errormessage = "<a href='#gsc_financingschemeid'>Financing Scheme is a required field.</a>";
    schemeValidator.validationGroup = "";
    schemeValidator.initialvalue = "";
    schemeValidator.evaluationfunction = function () {
        var value = $("#gsc_financingschemeid").val();
        if (value == null || value == "") {
            return false;
        } else {
            return true;
        }
    };

    var downPaymentAmountValidator = document.createElement('span');
    downPaymentAmountValidator.style.display = 'none';
    downPaymentAmountValidator.id = 'RequiredFieldValidatorgsc_downpaymentamount';
    downPaymentAmountValidator.controltovalidate = 'gsc_downpaymentamount';
    downPaymentAmountValidator.errormessage = '<a href="#gsc_downpaymentamount">Down Payment is a required field</a>';
    downPaymentAmountValidator.validationGroup = '';
    downPaymentAmountValidator.initialvalue = '';
    downPaymentAmountValidator.evaluationfunction = function () {
        var value = $('#gsc_downpaymentamount').val();
        if (value == null || value == '') {
            return false;
        } else {
            return true;
        }
    };

    var downPaymentPercentageValidator = document.createElement('span');
    downPaymentPercentageValidator.style.display = 'none';
    downPaymentPercentageValidator.id = 'RequiredFieldValidatorgsc_downpaymentpercentage';
    downPaymentPercentageValidator.controltovalidate = 'gsc_downpaymentpercentage';
    downPaymentPercentageValidator.errormessage = '<a href="#gsc_downpaymentpercentage"> Down Payment Percentage is a required field</a>';
    downPaymentPercentageValidator.validationGroup = '';
    downPaymentPercentageValidator.initialvalue = '';
    downPaymentPercentageValidator.evaluationfunction = function () {
        var value = $('#gsc_downpaymentpercentage').val();
        if (value == null || value == '') {
            return false;
        } else {
            return true;
        }
    };

    setTimeout(function () {
        paymentmode = $("#gsc_paymentmode").val();
        paymentModeOnChange("");
        $("#gsc_paymentmode").on('change', function () {
            paymentmode = $("#gsc_paymentmode").val();
            paymentModeOnChange("onchange");
        });
    }, 100);

    function paymentModeOnChange(action) {
        var dpamountfield = $('#gsc_downpaymentamount');
        var dppercentield = $('#gsc_downpaymentpercentage');
        var bankidfield = $('#gsc_bankid_name');
        var schemeidfield = $('#gsc_financingschemeid_name');
        var applytodpamntfield = $('#gsc_applytodpamount');
        var applytodpprcntfield = $('#gsc_applytodppercentage');
        var applytoafamntfield = $('#gsc_applytoafamount');
        var applytoafprcntfield = $('#gsc_applytoafpercentage');
        var dpDiscountfield = $('#gsc_lessdiscount');
        var afDiscountfield = $('#gsc_lessdiscountaf');
        var chattelFeefield = $('#gsc_chattelfeeeditable');

        //Modified By : Jerome Anthony Gerero, Modified On : 9/16/2016
        var applyToUpPercentField = $('#gsc_applytouppercentage');
        var applyToUpAmountField = $('#gsc_applytoupamount');

        var totaldiscountamount = $("#totaldiscountamount").val().replace(/,/g, '');

        console.log(paymentmode);
        if (paymentmode == '100000000' || paymentmode == '100000003' || paymentmode == '') {

            // hideAutoFinancingTab(); //hide auto financing tab
            dpDiscountfield.attr('readonly', true);
            applytodpamntfield.attr('readonly', true);
            afDiscountfield.attr('readonly', true);
            chattelFeefield.attr('readonly', true);
            applytoafamntfield.attr('readonly', true);
            applytoafprcntfield.attr('readonly', true);
            applytodpprcntfield.attr('readonly', true);
            dpamountfield.attr('readonly', true);
            dppercentield.attr('readonly', true);
            bankidfield.siblings('.input-group-btn').addClass('hidden');
            schemeidfield.siblings('.input-group-btn').addClass('hidden');

            $('#gsc_bankid_label').parent("div").removeClass("required");
            $('#gsc_financingschemeid_label').parent("div").removeClass("required");
            $('#gsc_downpaymentamount_label').parent('div').removeClass('required');
            $('#gsc_downpaymentpercentage_label').parent('div').removeClass('required');

            // Remove the new validator to the page validators array:
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != bankValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != schemeValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != downPaymentAmountValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != downPaymentPercentageValidator;
            });

            if (action == "onchange") {
                //Clear then set values
                applytodpamntfield.val(null);
                applytodpamntfield.val(null);
                chattelFeefield.val(null);
                applytoafamntfield.val(null);
                applytoafprcntfield.val(null);
                applytodpprcntfield.val(null);
                dpamountfield.val(null);
                dpamountfield.trigger('change');
                dppercentield.val(null);
                dppercentield.trigger('change');
                $('#gsc_bankid').val(null);
                bankidfield.val(null);
                $('#gsc_financingschemeid').val(null);
                schemeidfield.val(null);
                applyToUpPercentField.val(null);
                applyToUpAmountField.val(null);

                applyToUpPercentField.val(100);
                applyToUpAmountField.val(totaldiscountamount);

                dscnt_uppercent = 100;
                dscnt_dppercent = 0;
                dscnt_afpercent = 0;

                dscnt_dpamount = 0;
                dscnt_afamount = 0;
                dscnt_upamount = totaldiscountamount;
                //End
            }
        }
        else if (paymentmode == '100000002') {

            dpDiscountfield.attr('readonly', true);
            afDiscountfield.attr('readonly', true);
            chattelFeefield.attr('readonly', true);
            applytoafamntfield.attr('readonly', true);
            applytoafprcntfield.attr('readonly', true);

            bankidfield.siblings('.input-group-btn').removeClass('hidden');
            schemeidfield.siblings('.input-group-btn').addClass('hidden');

            $('#gsc_bankid_label').parent("div").addClass('required');
            $('#gsc_financingschemeid_label').parent("div").removeClass("required");
            //$('#gsc_downpaymentamount_label').parent('div').addClass('required');
            //$('#gsc_downpaymentpercentage_label').parent('div').addClass('required');

            if (DMS.Settings.Permission.Update == true) {
                dpamountfield.attr('readonly', false);
                dppercentield.attr('readonly', false);
            }

            // Remove the new validator to the page validators array:          
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != schemeValidator;
            });
			Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != downPaymentAmountValidator;
            });
			Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != downPaymentPercentageValidator;
            });

            // Add Validator
            Page_Validators.push(bankValidator);

            if (action == "onchange") {
                //Clear then set values
                applytodpamntfield.val(null);
                applytodpamntfield.val(null);
                chattelFeefield.val(null);
                applytoafamntfield.val(null);
                applytoafprcntfield.val(null);
                applytodpprcntfield.val(null);
                dpamountfield.val(null);
                dpamountfield.trigger('change');
                dppercentield.val(null);
                dppercentield.trigger('change');
                $('#gsc_bankid').val(null);
                bankidfield.val(null);
                $('#gsc_financingschemeid').val(null);
                schemeidfield.val(null);
                applyToUpPercentField.val(null);
                applyToUpAmountField.val(null);

                applyToUpPercentField.val(100);
                applyToUpAmountField.val(totaldiscountamount);

                dscnt_uppercent = 100;
                dscnt_dppercent = 0;
                dscnt_afpercent = 0;

                dscnt_dpamount = 0;
                dscnt_afamount = 0;
                dscnt_upamount = totaldiscountamount;
                //End
            }
        }
        else if (paymentmode == '100000001') {

            if (action == "onchange") {
                dscnt_uppercent = 0;
                dscnt_dppercent = 0;
                dscnt_afpercent = 0;

                dscnt_dpamount = 0;
                dscnt_afamount = 0;
                dscnt_upamount = 0;

                applyToUpPercentField.val(null);
                applyToUpAmountField.val(null);
            }

            dpDiscountfield.attr('readonly', true);
            afDiscountfield.attr('readonly', true);

            if (DMS.Settings.Permission.Update == true) {
                chattelFeefield.attr('readonly', false);
                dpamountfield.attr('readonly', false);
                dppercentield.attr('readonly', false);
                applytoafprcntfield.attr('readonly', false);
                applytoafamntfield.attr('readonly', false);
                applytodpprcntfield.attr('readonly', false);
                applytodpamntfield.attr('readonly', false);
            }

            bankidfield.siblings('.input-group-btn').removeClass('hidden');
            schemeidfield.siblings('.input-group-btn').removeClass('hidden');

            $('#gsc_bankid_label').parent("div").addClass('required');
            $('#gsc_financingschemeid_label').parent("div").addClass('required');
            $('#gsc_downpaymentamount_label').parent('div').addClass('required');
            $('#gsc_downpaymentpercentage_label').parent('div').addClass('required');

            // Add the new validator to the page validators array:
            Page_Validators.push(bankValidator);
            Page_Validators.push(schemeValidator);
            Page_Validators.push(downPaymentAmountValidator);
            Page_Validators.push(downPaymentPercentageValidator);
        }
    }

    //retrieve product sell price and vehicle color additional price
    /* var netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
     var additional = parseFloat($('#gsc_colorprice').html().substr(1).replace(/,/g, ""));;
     var unitprice = parseFloat($('#gsc_unitprice').html().substr(1).replace(/,/g, ""));;
     var netamountfinanced = 0.00;
     var netdp = 0.00;
     var amountfinanced = 0.00;
     var netdownpayment = 0.00;
     var aflessdiscount = 0.00;
     var downpayment = $("#gsc_downpaymentamount").val();
     var dppercent = $("#gsc_downpaymentpercentage").val();
     var lessdiscount = $("#gsc_lessdiscount").val(); */

    //validations
    setTimeout(function () {
        //change type from text to number; only allow numbers in textbox
        //$('#gsc_downpaymentamount').click(function () {
        //    $(this).get(0).type = 'number';
        //});

        $('#gsc_downpaymentpercentage').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_downpaymentamount').blur(function () {
            var netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
            var dpAmount = parseFloat($('#gsc_downpaymentamount').val().replace(/,/g, ""));
            if (dpAmount > netPrice) {
                //do not allow greater than net price
                this.value = netPrice.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
                $("#gsc_downpaymentamount").trigger('change');
            }
        });

        $('#gsc_downpaymentpercentage').blur(function () {
            if (this.value < 0) {
                //do not allow less than 0 input
                this.value = 0;
            }
            else if (this.value > 100) {
                //do not allow gearter than 100
                this.value = 100;
                $("#gsc_downpaymentpercentage").trigger('change');
            }
        });
    }, 100);

    //getUnitPrice();

    setTimeout(function () {
        $('#gsc_productid').on('change', function () {
            unitprice = 0.00;
            additional = 0.00;
            netamountfinanced = 0.00;
            netdp = 0.00;
            amountfinanced = 0.00;
            netdownpayment = 0.00;
            aflessdiscount = 0.00;

            $('#gsc_vehiclecolorid1_name').val('');
            $('#gsc_vehiclecolorid1').val('');
            $("#gsc_vehiclecolorid1").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $('#gsc_vehiclecolorid2_name').val("");
            $('#gsc_vehiclecolorid2').val("");
            $("#gsc_vehiclecolorid2").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $('#gsc_vehiclecolorid3_name').val("");
            $('#gsc_vehiclecolorid3').val("");
            $("#gsc_vehiclecolorid3").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            $("#gsc_downpaymentamount").val("");
            $("#gsc_downpaymentpercentage").val("");
            $("#gsc_netdownpayment").val("");
            $("#gsc_amountfinanced").val("");
            $("#gsc_netamountfinanced").val("");
            $.cookie("productId", $("#gsc_productid").val(), { path: '/' });
        });

    }, 300);

   
    //onchange events
    setTimeout(function () {
        //reset value of financing scheme when bank was changed
        $("#gsc_bankid").on('change', function () {
            $("#gsc_financingschemeid_name").val("");
            $("#gsc_financingschemeid").val("");
        });

        $("#gsc_downpaymentamount").on('change', function () {
            var netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
            var dpAmount = parseFloat($('#gsc_downpaymentamount').val().replace(/,/g, ""));
            computeDownPaymentPercent();

            if (paymentmode == '100000001') {
                console.log('a');
                if ($("#gsc_downpaymentamount").val() > 0) {
                    Page_Validators = jQuery.grep(Page_Validators, function (value) {
                        return value != downPaymentPercentageValidator;
                    });
                    $('#gsc_downpaymentpercentage_label').parent('div').removeClass('required');
                }
                else if ($("#gsc_downpaymentamount").val() == 0 || $("#gsc_downpaymentamount").val() == '') {
                    Page_Validators.push(downPaymentPercentageValidator);
                    $('#gsc_downpaymentpercentage_label').parent('div').addClass('required');
                }
            }

        });

        $("#gsc_downpaymentpercentage").on('change', function () {
            computeDownpaymentAmount();

            if (paymentmode == '100000001') {
                if ($("#gsc_downpaymentpercentage").val() > 0) {
                    Page_Validators = jQuery.grep(Page_Validators, function (value) {
                        return value != downPaymentAmountValidator;
                    });
                    $('#gsc_downpaymentamount_label').parent('div').removeClass('required');
                } else if ($("#gsc_downpaymentpercentage").val() == 0 || $("#gsc_downpaymentpercentage").val() == '') {
                    Page_Validators.push(downPaymentPercentageValidator);
                    $('#gsc_downpaymentamount_label').parent('div').addClass('required');
                }
            }
        });

        $('#gsc_netdownpayment').on('change', function () {
            var netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
            var additional = 0.00;
            if (paymentmode == '100000001' || (paymentmode == '100000002' && parseFloat(downpayment) != 0)) {
                computeAmountFinanced(additional, netPrice);
            }
            else if (paymentmode == '100000002' && parseFloat(downpayment) == 0) {
                $("#gsc_amountfinanced").val(null);
            }
        });
        $("#gsc_amountfinanced").on('change', function () {
            computeNetAmountFinanced();
        });

    }, 300);


    //compute downpayment amount from the percentage input
    function computeDownpaymentAmount() {
        netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
        dppercent = $("#gsc_downpaymentpercentage").val() == "" ? 0 : $("#gsc_downpaymentpercentage").val();

        if (netPrice == 0) {
            netPrice = odataComputeNetPrice();
        }

        downpayment = (parseFloat(netPrice)) * (parseFloat(dppercent) / 100);

        $("#gsc_downpaymentamount").val(downpayment.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));

        computeNetDownpayment();
    }

    //compute the equivalent percentage of the downpayment amount
    function computeDownPaymentPercent() {
        netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
        downpayment = $("#gsc_downpaymentamount").val() == "" ? 0 : $("#gsc_downpaymentamount").val().replace(/,/g, "");

        //if (netPrice == 0) {
        //    netPrice = odataComputeNetPrice();
        //}

        if (netPrice != 0) {
            dppercent = (parseFloat(downpayment) / (parseFloat(netPrice))) * 100;
            $("#gsc_downpaymentpercentage").val(parseFloat(dppercent).toFixed(2));
        } else {
            $("#gsc_downpaymentpercentage").val(0);
        }

        computeNetDownpayment();
    }

    //Compute net downpayment = downpayment - discount
    function computeNetDownpayment() {
        downpayment = $("#gsc_downpaymentamount").val() == "" ? 0 : $("#gsc_downpaymentamount").val().replace(/,/g, "");
        lessdiscount = $("#gsc_lessdiscount").val() == "" ? 0 : $("#gsc_lessdiscount").val().replace(/,/g, "");

        if (downpayment == 0 || (parseFloat(downpayment) - parseFloat(lessdiscount)) < 0) {
            $("#gsc_netdownpayment").val(0);
        } else {
            netdp = parseFloat(downpayment) - parseFloat(lessdiscount);
            $("#gsc_netdownpayment").val(netdp.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        }

        $("#gsc_netdownpayment").trigger("change");
    }

    //compute amount financed = unitprice + additional price - net downpayment
    function computeAmountFinanced(additional) {
        netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));

        if (netPrice == 0) {
            netPrice = odataComputeNetPrice();
        }

        grossDownpayment = $("#gsc_downpaymentamount").val() == "" ? 0 : $("#gsc_downpaymentamount").val().replace(/,/g, "");

        // amountfinanced = (parseFloat(netPrice) + parseFloat(additional)) - parseFloat(grossDownpayment);
        amountfinanced = parseFloat(netPrice) - parseFloat(grossDownpayment);
        $("#gsc_amountfinanced").val(amountfinanced.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        $("#gsc_amountfinanced").trigger('change');
    }

    //compute net amount financed = amount financed - discount
    function computeNetAmountFinanced() {
        amountfinanced = $("#gsc_amountfinanced").val().replace(/,/g, "");
        aflessdiscount = $("#gsc_lessdiscountaf").val() == "" ? "0" : $("#gsc_lessdiscountaf").val().replace(/,/g, "");

        if (amountfinanced > 0) {
            netamountfinanced = parseFloat(amountfinanced) - parseFloat(aflessdiscount);
            $("#gsc_totalamountfinanced").val(netamountfinanced.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        }
        else {
            // $("#gsc_totalamountfinanced").val(amountfinanced.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        }
    }

    //Created By: Leslie Baliguat, Created On: 03/14/16
    //Compute Percent and Amount of Downpayment and Amount Financed based on Total Discount

    var dscnt_dppercent = $("#gsc_applytodppercentage").val();
    var dscnt_dpamount = $("#gsc_applytodpamount").val().replace(/,/g, '');
    var dscnt_afpercent = $("#gsc_applytoafpercentage").val();
    var dscnt_afamount = $("#gsc_applytoafamount").val().replace(/,/g, '');
    var dscnt_uppercent = $("#gsc_applytouppercentage").val();
    var dscnt_upamount = $("#gsc_applytoupamount").val().replace(/,/g, '');
    var totaldiscount = $("#totaldiscountamount").val().replace(/,/g, '');

    dscnt_dppercent = dscnt_dppercent == "" ? 0 : dscnt_dppercent;
    dscnt_afpercent = dscnt_afpercent == "" ? 0 : dscnt_afpercent;
    dscnt_uppercent = dscnt_uppercent == "" ? 0 : dscnt_uppercent;
    totaldiscount = totaldiscount == "" ? 0 : totaldiscount;
    //validations
    setTimeout(function () {
        //variable assignment
        $('#gsc_applytodpamount').val(dscnt_dpamount);
        $('#gsc_applytoafamount').val(dscnt_afamount);
        $('#gsc_applytoupamount').val(dscnt_upamount);

        //change type from text to number; only allow numbers in textbox
        $('#gsc_applytodppercentage').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applytodpamount').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applytoafpercentage').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applytoafamount').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applytouppercentage').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applytoupamount').click(function () {
            $(this).get(0).type = 'number';
        });

        //do not allow less than 0 input
        $('#gsc_applytodpamount').blur(function () {
            if (this.value < 0 || totaldiscount == 0) {
                this.value = "";
                $("#gsc_applytodpamount").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_afamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_afamount - dscnt_upamount;
                $("#gsc_applytodpamount").trigger('change');
            }
        });

        $('#gsc_applytoafamount').blur(function () {
            if (this.value < 0 || totaldiscount == 0) {
                this.value = "";
                $("#gsc_applytoafamount").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_dpamount - dscnt_upamount;
                $("#gsc_applytoafamount").trigger('change');
            }
        });

        $('#gsc_applytoafpercentage').blur(function () {
            if (this.value < 0 || totaldiscount == 0) {
                this.value = "";
                $("#gsc_applytoafpercentage").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dppercent) + parseFloat(dscnt_uppercent)) > 100) {
                this.value = (100 - dscnt_dppercent - dscnt_uppercent).toFixed(2);
                $("#gsc_applytoafpercentage").trigger('change');
            }
        });

        $('#gsc_applytodppercentage').blur(function () {
            if (this.value < 0 || totaldiscount == 0) {
                this.value = "";
                $("#gsc_applytodppercentage").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_afpercent) + parseFloat(dscnt_uppercent)) > 100) {
                this.value = (100 - dscnt_afpercent - dscnt_uppercent).toFixed(2);
                $("#gsc_applytodppercentage").trigger('change');
            }
        });
        $('#gsc_applytouppercentage').blur(function () {
            if (this.value < 0 || totaldiscount == 0) {
                this.value = "";
                $("#gsc_applytouppercentage").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dppercent) + parseFloat(dscnt_afpercent)) > 100) {
                this.value = (100 - dscnt_dppercent - dscnt_afpercent).toFixed(2);
                $("#gsc_applytouppercentage").trigger('change');
            }
        });
        $('#gsc_applytoupamount').blur(function () {
            if (this.value < 0 || totaldiscount == 0) {
                this.value = "";
                $("#gsc_applytoupamount").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_afamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_dpamount - dscnt_afamount;
                $("#gsc_applytoupamount").trigger('change');
            }
        });
    }, 100);

    setTimeout(function () {
        $("#gsc_applytodppercentage").on('change', function () {
            dscnt_dppercent = $('#gsc_applytodppercentage').val() == "" ? 0 : $('#gsc_applytodppercentage').val();
            dscnt_dpamount = computeAmount(dscnt_dppercent);
            $("#gsc_applytodpamount").val(dscnt_dpamount == 0 ? "" : dscnt_dpamount);
        });

        $("#gsc_applytodpamount").on('change', function () {
            dscnt_dpamount = $('#gsc_applytodpamount').val() == "" ? 0 : $('#gsc_applytodpamount').val();
            dscnt_dppercent = computePercentage(dscnt_dpamount);
            $("#gsc_applytodppercentage").val(dscnt_dppercent == 0 ? "" : dscnt_dppercent);
        });

        $("#gsc_applytoafpercentage").on('change', function () {
            dscnt_afpercent = $('#gsc_applytoafpercentage').val() == "" ? 0 : $('#gsc_applytoafpercentage').val();
            dscnt_afamount = computeAmount(dscnt_afpercent);
            $("#gsc_applytoafamount").val(dscnt_afamount == 0 ? "" : dscnt_afamount);
        });

        $("#gsc_applytoafamount").on('change', function () {
            dscnt_afamount = $('#gsc_applytoafamount').val() == "" ? 0 : $('#gsc_applytoafamount').val();
            dscnt_afpercent = computePercentage(dscnt_afamount);
            $("#gsc_applytoafpercentage").val(dscnt_afpercent == 0 ? "" : dscnt_afpercent);
        });

        $("#gsc_applytouppercentage").on('change', function () {
            dscnt_uppercent = $('#gsc_applytouppercentage').val() == "" ? 0 : $('#gsc_applytouppercentage').val();
            dscnt_upamount = computeAmount(dscnt_uppercent);
            $("#gsc_applytoupamount").val(dscnt_upamount == 0 ? "" : dscnt_upamount);
        });

        $("#gsc_applytoupamount").on('change', function () {
            dscnt_upamount = $('#gsc_applytoupamount').val() == "" ? 0 : $('#gsc_applytoupamount').val();
            dscnt_uppercent = computePercentage(dscnt_upamount);
            $("#gsc_applytouppercentage").val(dscnt_uppercent == 0 ? "" : dscnt_uppercent);
        });

    }, 300);

    function computePercentage(amount) {
        totaldiscount = $("#totaldiscountamount").val() == "" ? 0 : $("#totaldiscountamount").val().replace(/,/g, '');
        if (totaldiscount != 0) {
            var percent = (parseFloat(amount) / parseFloat(totaldiscount)) * 100;
            return parseFloat(percent).toFixed(2);
        }
    }

    function computeAmount(percent) {
        totaldiscount = $("#totaldiscountamount").val() == "" ? 0 : $("#totaldiscountamount").val().replace(/,/g, '');
        if (totaldiscount != 0) {
            var amount = (parseFloat(totaldiscount) * parseFloat(percent)) / 100;
            return parseFloat(amount).toFixed(2);
        }
    }

    //Created By : Jerome Anthony Gerero, Created On : 1/28/2017
    //Purpose : Compute for net price on new quote form
    function odataComputeNetPrice() {
        //setTimeout(function () {
        var productId = $('#gsc_productid').val();
        var colorId = $('#gsc_vehiclecolorid1').val();
        var unitPrice = 0.00;
        var colorPrice = 0.00;
        var netPrice = 0.00;

        if (productId != '' && productId != 'Nan' && productId != 'undefined') {
            var productOdataUrl = "/_odata/vehicleanditemcatalog?$filter=productid eq (Guid'" + productId + "')";

            $.ajax({
                type: 'get',
                async: false,
                url: productOdataUrl,
                success: function (data) {
                    for (var i = 0; i < data.value.length; i++) {
                        var obj = data.value[i];
                        for (var key in obj) {
                            var attrName = key;
                            var attrValue = obj[key];

                            if (attrName == 'gsc_sellprice') {
                                unitPrice = parseFloat(attrValue);

                                return unitPrice;
                            }
                        }
                    }
                },
                error: function (xhr, textStatus, errorMessage) {
                    console.log(errorMessage);
                }
            });
        }

        if (colorId != '' && colorId != 'Nan' && colorId != 'undefined') {
            var colorOdataUrl = "/_odata/vehiclecolor?$filter=gsc_cmn_vehiclecolorid eq (Guid'" + colorId + "')";

            $.ajax({
                type: 'get',
                async: false,
                url: colorOdataUrl,
                success: function (data) {
                    for (var x = 0; x < data.value.length; x++) {
                        var obj2 = data.value[x];
                        for (var key2 in obj2) {
                            var attrName2 = key2;
                            var attrValue2 = obj2[key2];

                            if (attrName2 == 'gsc_additionalprice') {
                                colorPrice = parseFloat(attrValue2);

                                if (colorPrice != 0 || colorPrice != '') {
                                    return colorPrice;
                                }
                            }
                        }
                    }
                },
                error: function (xhr, textStatus, errorMessage) {
                    console.log(errorMessage);
                }
            });
        }

        netPrice = parseFloat(unitPrice) + parseFloat(colorPrice);
        return netPrice;

        //}, 100);
    }
    //End - Compute for net price on new quote form

    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) {
                return pair[1];
            }
        }
    }

    //Negative values validation. Added by Christell Ann Mataac
    $("#gsc_applytodppercentage").attr("min", 0);
    $("#gsc_applytoafpercentage").attr("min", 0);
    $("#gsc_applytouppercentage").attr("min", 0);
    $("#gsc_downpaymentamount").attr("min", 0);
    $("#gsc_downpaymentpercentage").attr("min", 0);

    /* Added by: Christell Ann Mataac - 2/23/2017
  this will check duplicate preferred color */
    setTimeout(function () {
        $('#gsc_vehiclecolorid1').on('change', function () {

            if (checkPreferredColor(1)) {
                DMS.Notification.Error("Error: Cannot select preferred color twice.", true, 5000);
                $("#gsc_vehiclecolorid1_name").val("");
                $("#gsc_vehiclecolorid1").val("");
                $("#gsc_vehiclecolorid1").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            }
        });

        $('#gsc_vehiclecolorid2').on('change', function () {

            if (checkPreferredColor(2)) {
                DMS.Notification.Error("Error: Cannot select preferred color twice.", true, 5000);
                $("#gsc_vehiclecolorid2_name").val("");
                $("#gsc_vehiclecolorid2").val("");
                $("#gsc_vehiclecolorid2").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            }
        });

        $('#gsc_vehiclecolorid3').on('change', function () {

            if (checkPreferredColor(3)) {
                DMS.Notification.Error("Error: Cannot select preferred color twice.", true, 5000);
                $("#gsc_vehiclecolorid3_name").val("");
                $("#gsc_vehiclecolorid3").val("");
                $("#gsc_vehiclecolorid3").siblings('div.input-group-btn').children('.clearlookupfield').hide();
            }
        });
    }, 100);

    setTimeout(function () {
        /*Added: 3/17/2017 - Disable Add button in Discount and Charges Grid*/
        /*  if (DMS.Settings.User.positionName == 'MMPC System Admin' || DMS.Settings.User.positionName == 'MMPC System Administrator' || DMS.Settings.User.positionName == 'Sales Supervisor' || DMS.Settings.User.positionName == 'Sales Lead' && userId != $('#gsc_recordownerid').val()) {
              $('#tab-1-1').find('a.btn.btn-primary.action.add-margin-right').attr('disabled', true);
              $('#tab-1-2').find('a.btn.btn-primary.action.add-margin-right').attr('disabled', true);
  
              $('button.addnew.btn.btn-default.btn-sm.btn-primary').eq(0).attr('disabled', true);
              $('button.addnew.btn.btn-default.btn-sm.btn-primary').eq(1).attr('disabled', true);
              $('button.save.btn.btn-default.btn-sm.btn-primary').eq(0).attr('disabled', true);
              $('button.save.btn.btn-default.btn-sm.btn-primary').eq(1).attr('disabled', true);
              $('button.delete.btn.btn-default.btn-sm.btn-primary').eq(0).attr('disabled', true);
              $('button.delete.btn.btn-default.btn-sm.btn-primary').eq(1).attr('disabled', true);
              $('button.cancel.btn.btn-default.btn-sm.btn-primary').eq(0).attr('disabled', true);
              $('button.cancel.btn.btn-default.btn-sm.btn-primary').eq(1).attr('disabled', true);
          }
          else if (DMS.Settings.User.positionName == 'Sales Supervisor' || DMS.Settings.User.positionName == 'Sales Lead' && userId == $('#gsc_recordownerid').val()) {
              //remove disabled  button of the activate and print buttons
              $('.btn-primary.btn.permanent-disabled.disabled').removeClass('disabled');
              $('.activate-quote-link.btn.btn-primary.permanent-disabled.disabled').removeClass('disabled');
          }*/
        //END Added: 3/17/2017 - Disable Add button in Discount and Charges Grid
    }, 7000);

    function checkPreferredColor(index) {
        var colorNum = index;
        var color1 = $('#gsc_vehiclecolorid1').val();
        var color2 = $('#gsc_vehiclecolorid2').val();
        var color3 = $('#gsc_vehiclecolorid3').val();
        var isDuplicate = false;

        if (colorNum == 1) {
            if (color1 == color2 && color1 != "" && color2 != "")
                isDuplicate = true;
            else if (color1 == color3 && color3 != "")
                isDuplicate = true;
        }
        else if (colorNum == 2) {
            if (color2 == color1 && color1 != "" && color2 != "")
                isDuplicate = true;
            else if (color2 == color3 && color3 != "")
                isDuplicate = true;
        }
        else if (colorNum == 3) {
            if (color3 == color1 && color1 != "" && color3 != "")
                isDuplicate = true;
            else if (color3 == color2 && color2 != "")
                isDuplicate = true;
        }
        else
            console.log("Unknown color");

        return isDuplicate;
    }
    /*END - Added by: Christell Ann Mataac - 2/23/2017*/
});