//Created By : Leslie Baliguat, Created On : 3/16/2016
$(document).ready(function (e) {
    var status = "";

    //set status field readonly 
    $('table[data-name="hideSection"]').closest('fieldset').hide();
    CheckifGovernment();

    setTimeout(function () {
        var status = $(".record-status").html();
        $("#gsc_portaluserid").val(userId);
        $.cookie("baseModel", $("#gsc_vehiclebasemodelid").val(), { path: '/' });
        $.cookie("productId", $("#gsc_productid").val(), { path: '/' });
        $.cookie("siteId", $("#gsc_siteid").val(), { path: '/' });
        $.cookie("colorId", $("#gsc_vehiclecolorid").val(), { path: '/' });
        $.cookie("csNoCriteria", $("#gsc_csnocriteria").val(), { path: '/' });
        $.cookie("csNoValue", $("#gsc_csno").val(), { path: '/' });
        $.cookie("engineNoCriteria", $("#gsc_enginenocriteria").val(), { path: '/' });
        $.cookie("engineNoValue", $("#gsc_engineno").val(), { path: '/' });
        $.cookie("VINCriteria", $("#gsc_vincriteria").val(), { path: '/' });
        $.cookie("VINValue", $("#gsc_vin").val(), { path: '/' });
        $.cookie("productionNoCriteria", $("#gsc_productionnocriteria").val(), { path: '/' });
        $.cookie("productionNoValue", $("#gsc_productionno").val(), { path: '/' });

        $("#gsc_siteid").on('change', function () {
            $.cookie("siteId", $("#gsc_siteid").val(), { path: '/' });
        });

        $("#gsc_vehiclecolorid").on('change', function () {
            $.cookie("colorId", $("#gsc_vehiclecolorid").val(), { path: '/' });
        });

        $("#gsc_csnocriteria").on('change', function () {
            $.cookie("csNoCriteria", $("#gsc_csnocriteria").val(), { path: '/' });
        });

        $("#gsc_csno").on('change', function () {
            $.cookie("csNoValue", $("#gsc_csno").val(), { path: '/' });
        });

        $("#gsc_enginenocriteria").on('change', function () {
            $.cookie("engineNoCriteria", $("#gsc_enginenocriteria").val(), { path: '/' });
        });

        $("#gsc_engineno").on('change', function () {
            $.cookie("engineNoValue", $("#gsc_engineno").val(), { path: '/' });
        });

        $("#gsc_vincriteria").on('change', function () {
            $.cookie("VINCriteria", $("#gsc_vincriteria").val(), { path: '/' });
        });

        $("#gsc_vin").on('change', function () {
            $.cookie("VINValue", $("#gsc_vin").val(), { path: '/' });
        });

        $("#gsc_productionnocriteria").on('change', function () {
            $.cookie("productionNoCriteria", $("#gsc_productionnocriteria").val(), { path: '/' });
        });

        $("#gsc_productionno").on('change', function () {
            $.cookie("productionNoValue", $("#gsc_productionno").val(), { path: '/' });
        });

        $('.btn-primary').on('click', function (e) {

            var $subgrid = $(this).closest(".subgrid");
            var $subgridId = $subgrid.parent().prop("id");

            if ($subgridId == "AllocatedItems") {
                e.preventDefault();
                e.stopPropagation();
                if (status == "Allocated") {
                    RemoveAllocatedItems();
                }
            }

        });
    }, 100);

    function CheckifGovernment() {
        var customerType = $("#gsc_customertype").val()
        if (customerType != 100000002) {
            $("#customerid_name").closest("td").attr("colspan", 4);
            $('label[for=gsc_markup], input#gsc_markup').hide();
        }
    }

    //Created By: Artum M. Ramos
    //Vehicle Allocated Items Remove Button
    function RemoveAllocatedItems() {
        //Loading Image
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);

        $('#AllocatedItems tbody tr td.multi-select-cbx').each(function () {
            if ($(this).data('checked') == "true") {
                allocateditems = $(this).closest('tr').data('id');
                $("#gsc_allocateditemstodelete").val(allocateditems);
                $("#UpdateButton").click();
            }
        });
    }

    //set readonly fields
    $('#gsc_netdownpayment').prop('readonly', true);
    $('#gsc_amountfinanced').prop('readonly', true);
    $('#gsc_netamountfinanced').prop('readonly', true);

    //set variables
    var additional = 0.00;
    var netamountfinanced = 0.00;
    var netdp = 0.00;
    var amountfinanced = 0.00;
    var netdownpayment = 0.00;
    var aflessdiscount = 0.00;
    var downpayment = $("#gsc_downpaymentamount").val();
    var dppercent = $("#gsc_downpaymentpercentage").val();
    var lessdiscount = $("#gsc_downpaymentdiscount").val();
    var paymentmode = $("#gsc_paymentmode").val();

    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;

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

    //validations
    setTimeout(function () {
        //check order status if open or not
        paymentModeOnChange();

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

    function paymentModeOnChange() {
        var dpamountfield = $('#gsc_downpaymentamount');
        var dppercentield = $('#gsc_downpaymentpercentage');
        var bankidfield = $('#gsc_bankid_name');
        var schemeidfield = $('#gsc_financingschemeid_name');
        var applytodpamntfield = $('#gsc_applytodpamount');
        var applytodpprcntfield = $('#gsc_applytodppercentage');
        var applytoafamntfield = $('#gsc_applytoafamount');
        var applytoafprcntfield = $('#gsc_applytoafpercentage');
        var chattelFeefield = $('#gsc_chattelfeeeditable');

        //Modified By : Jerome Anthony Gerero, Modified On : 9/16/2016
        var applyToUpPercentField = $('#gsc_applytouppercentage');
        var applyToUpAmountField = $('#gsc_applytoupamount');
        var totaldiscountamount = $("#gsc_totaldiscountamount").val().replace(/,/g, '');

        if (paymentmode == '100000000' || paymentmode == '100000003') {
            chattelFeefield.attr('readonly', true);
            applytodpamntfield.prop('readonly', true);
            applytodpprcntfield.prop('readonly', true);
            applytoafamntfield.prop('readonly', true);
            applytoafprcntfield.prop('readonly', true);
            dpamountfield.prop('readonly', true);
            dppercentield.prop('readonly', true);
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
        }
        else if (paymentmode == '100000002') {

            chattelFeefield.attr('readonly', true);
            applytoafamntfield.prop('readonly', true);
            applytoafprcntfield.prop('readonly', true);

            schemeidfield.siblings('.input-group-btn').addClass('hidden');
            $('#gsc_financingschemeid_label').parent("div").removeClass("required");
            $('#gsc_bankid_label').parent("div").addClass('required');

            Page_Validators.push(bankValidator);

            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != schemeValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != downPaymentAmountValidator;
            });
            Page_Validators = jQuery.grep(Page_Validators, function (value) {
                return value != downPaymentPercentageValidator;
            });
        }
        else if (paymentmode == '100000001') {
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

    setTimeout(function () {

        $("#gsc_downpaymentamount").on('change', function () {
            computeDownPaymentPercent();
        });

        $("#gsc_downpaymentpercentage").on('change', function () {
            $("#gsc_precisedownpaymentpercentage").val($("#gsc_downpaymentpercentage").val());
            computeDownpaymentAmount();
        });

        $('#gsc_netdownpayment').on('change', function () {
            if (paymentmode == '100000001' || (paymentmode == '100000002' && parseFloat(downpayment) != 0)) {
                computeAmountFinanced();
            }
            else if (paymentmode == '100000002' && downpayment == 0)
                $("#gsc_amountfinanced").val(null);
        });

        $("#gsc_amountfinanced").on('change', function () {
            computeNetAmountFinanced();
        });

    }, 300);

    //compute downpayment amount from the percentage input
    //Modified By : Jerome Anthony Gerero, Modified On : 12/15/2016
    //Purpose : Change computation to Unit Price * Down Payment Percentage
    function computeDownpaymentAmount() {
        netprice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
        dppercent = $("#gsc_precisedownpaymentpercentage").val() == "" ? 0 : $("#gsc_precisedownpaymentpercentage").val();

        downpayment = (parseFloat(netprice)) * (parseFloat(dppercent) / 100);

        $("#gsc_downpaymentamount").val(downpayment.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        computeNetDownpayment();
    }

    //compute the equivalent percentage of the downpayment amount
    //Modified By : Jerome Anthony Gerero, Modified On : 12/15/2016
    //Purpose : Change computation to Unit Price * Down Payment Percentage
    function computeDownPaymentPercent() {
        netprice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
        downpayment = $("#gsc_downpaymentamount").val() == "" ? 0 : $("#gsc_downpaymentamount").val().replace(/,/g, '');

        if (netprice != 0) {
            dppercent = (parseFloat(downpayment) / (parseFloat(netprice))) * 100;

            $("#gsc_precisedownpaymentpercentage").val(parseFloat(dppercent));
            $("#gsc_downpaymentpercentage").val(parseFloat(dppercent).toFixed(2));
        } else {
            $("#gsc_downpaymentpercentage").val(0);
        }

        computeNetDownpayment();
    }

    //Compute net downpayment = downpayment - less discount
    function computeNetDownpayment() {
        downpayment = $("#gsc_downpaymentamount").val() == "" ? 0 : $("#gsc_downpaymentamount").val().replace(/,/g, '');
        lessdiscount = $("#gsc_downpaymentdiscount").val() == "" ? 0 : $("#gsc_downpaymentdiscount").val().replace(/,/g, '');

        //if (downpayment == 0 || downpayment < lessdiscount) {
        if (downpayment == 0 || (parseFloat(downpayment) - parseFloat(lessdiscount)) < 0) {
            $("#gsc_netdownpayment").val(0);
        }
        else {
            netdp = parseFloat(downpayment) - parseFloat(lessdiscount);
            $("#gsc_netdownpayment").val(netdp.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        }

        $("#gsc_netdownpayment").trigger("change");
    }

    //compute amount financed = netprice + additional price - netdownpayment
    function computeAmountFinanced() {
        netPrice = parseFloat($('#gsc_netprice').html().substr(1).replace(/,/g, ""));
        grossDownpayment = $("#gsc_downpaymentamount").val() == "" ? 0 : $("#gsc_downpaymentamount").val().replace(/,/g, "");

        amountfinanced = parseFloat(netPrice) - parseFloat(grossDownpayment);
        $("#gsc_amountfinanced").val(amountfinanced.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        $("#gsc_amountfinanced").trigger('change');
    }

    //compute net amount finance = amount financed - less discount
    function computeNetAmountFinanced() {
        amountfinanced = $("#gsc_amountfinanced").val().replace(/,/g, "");
        var downPaymentDiscountAmount = $("#gsc_downpaymentdiscount").val() == "" ? "0" : $("#gsc_downpaymentdiscount").val().replace(/,/g, "");

        if (amountfinanced > 0) {
            netamountfinanced = amountfinanced - parseFloat(downPaymentDiscountAmount);
            $("#gsc_totalamountfinanced").val(netamountfinanced.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        } else {
            // $("#gsc_totalamountfinanced").val(amountfinanced.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        }
    }

    //Order -> Discounts
    var dscnt_dppercent = $("#gsc_applytodppercentage").val();
    var dscnt_dpamount = $("#gsc_applytodpamount").val().replace(/,/g, '');
    var dscnt_afpercent = $("#gsc_applytoafpercentage").val();
    var dscnt_afamount = $("#gsc_applytoafamount").val().replace(/,/g, '');
    var dscnt_uppercent = $("#gsc_applytouppercentage").val();
    var dscnt_upamount = $("#gsc_applytoupamount").val().replace(/,/g, '');
    var totaldiscount = $("#gsc_totaldiscountamount").val().replace(/,/g, '');

    dscnt_dppercent = dscnt_dppercent == "" ? 0 : dscnt_dppercent;
    scnt_afpercent = dscnt_afpercent == "" ? 0 : dscnt_afpercent;
    dscnt_uppercent = dscnt_uppercent == "" ? 0 : dscnt_uppercent;
    totaldiscount = totaldiscount == "" ? 0 : totaldiscount;

    setTimeout(function () {
        //do not allow less than 0 input
        $('#gsc_applytodpamount').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applytodpamount").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_afamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_afamount - dscnt_upamount;
                $("#gsc_applytodpamount").trigger('change');
            }
        });

        $('#gsc_applytoafamount').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applytoafamount").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_dpamount - dscnt_upamount;
                $("#gsc_applytoafamount").trigger('change');
            }
        });

        $('#gsc_applytoafpercentage').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applytoafpercentage").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dppercent) + parseFloat(dscnt_uppercent)) > 100) {
                this.value = (100 - dscnt_dppercent - dscnt_uppercent).toFixed(2);
                $("#gsc_applytoafpercentage").trigger('change');
            }
        });

        $('#gsc_applytodppercentage').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applytodppercentage").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_afpercent) + parseFloat(dscnt_uppercent)) > 100) {
                this.value = (100 - dscnt_afpercent - dscnt_uppercent).toFixed(2);
                $("#gsc_applytodppercentage").trigger('change');
            }
        });

        $('#gsc_applytouppercentage').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applytouppercentage").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dppercent) + parseFloat(dscnt_afpercent)) > 100) {
                this.value = (100 - dscnt_dppercent - dscnt_afpercent).toFixed(2);
                $("#gsc_applytouppercentage").trigger('change');
            }
        });

        $('#gsc_applytoupamount').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applytoupamount").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_afamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_dpamount - dscnt_afamount;
                $("#gsc_applytoupamount").trigger('change');
            }
        });

        $("#gsc_applytodppercentage").on('change', function () {
            dscnt_dppercent = $('#gsc_applytodppercentage').val() == "" ? 0 : $('#gsc_applytodppercentage').val();
            dscnt_dpamount = computeAmount(dscnt_dppercent);
            $("#gsc_applytodpamount").val(dscnt_dpamount.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        });

        $("#gsc_applytodpamount").on('change', function () {
            dscnt_dpamount = $('#gsc_applytodpamount').val() == "" ? 0 : $('#gsc_applytodpamount').val().replace(/,/g, "");
            dscnt_dppercent = computePercentage(dscnt_dpamount);
            $("#gsc_applytodppercentage").val(dscnt_dppercent);
        });

        $("#gsc_applytoafpercentage").on('change', function () {
            dscnt_afpercent = $('#gsc_applytoafpercentage').val() == "" ? 0 : $('#gsc_applytoafpercentage').val();
            dscnt_afamount = computeAmount(dscnt_afpercent);
            $("#gsc_applytoafamount").val(dscnt_afamount.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        });

        $("#gsc_applytoafamount").on('change', function () {
            dscnt_afamount = $('#gsc_applytoafamount').val() == "" ? 0 : $('#gsc_applytoafamount').val().replace(/,/g, "");
            dscnt_afpercent = computePercentage(dscnt_afamount);
            $("#gsc_applytoafpercentage").val(dscnt_afpercent);
        });

        $("#gsc_applytouppercentage").on('change', function () {
            dscnt_uppercent = $('#gsc_applytouppercentage').val() == "" ? 0 : $('#gsc_applytouppercentage').val();
            dscnt_upamount = computeAmount(dscnt_uppercent);
            $("#gsc_applytoupamount").val(dscnt_upamount.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        });

        $("#gsc_applytoupamount").on('change', function () {
            dscnt_upamount = $('#gsc_applytoupamount').val() == "" ? 0 : $('#gsc_applytoupamount').val().replace(/,/g, "");
            dscnt_uppercent = computePercentage(dscnt_upamount);
            $("#gsc_applytouppercentage").val(dscnt_uppercent);
        });

    }, 100);

    function computePercentage(amount) {
        totaldiscount = $("#gsc_totaldiscountamount").val() == "" ? 0 : $("#gsc_totaldiscountamount").val().replace(/,/g, '');
        if (totaldiscount != 0) {
            var percent = (parseFloat(amount) / parseFloat(totaldiscount)) * 100;
            return parseFloat(percent).toFixed(2);
        }
    }

    function computeAmount(percent) {
        totaldiscount = $("#gsc_totaldiscountamount").val() == "" ? 0 : $("#gsc_totaldiscountamount").val().replace(/,/g, '');
        if (totaldiscount != 0) {
            var amount = (parseFloat(totaldiscount) * parseFloat(percent)) / 100;
            return parseFloat(amount).toFixed(2);
        }
    }

    //Check for duplicate preffered color
    setTimeout(function () {
        $('#gsc_vehiclecolorid1').on('change', function () {
            if (checkPreferredColor(1)) {
                clearColorField("gsc_vehiclecolorid1");
            }
        });

        $('#gsc_vehiclecolorid2').on('change', function () {
            if (checkPreferredColor(2)) {
                clearColorField("gsc_vehiclecolorid2");
            }
        });

        $('#gsc_vehiclecolorid3').on('change', function () {
            if (checkPreferredColor(3)) {
                clearColorField("gsc_vehiclecolorid3");
            }
        });
    }, 100);

    function clearColorField(colorFieldName) {
        $("#" + colorFieldName + "_name").val("");
        $("#" + colorFieldName).val("");
        setTimeout(function () {
            $("#" + colorFieldName).siblings('div.input-group-btn').children('.clearlookupfield').hide();
        }, 100);
        DMS.Notification.Error("Error: Cannot select preferred color twice.", true, 5000);
    }

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

    //Negative values validation. Added by Christell Ann Mataac
    $("#gsc_applytouppercentage").attr("min", 0);
    $("#gsc_applytoafpercentage").attr("min", 0);
    $("#gsc_applytoupamount").attr("min", 0);
    $("#gsc_applytodppercentage").attr("min", 0);
    $("#gsc_applytoafamount").attr("min", 0);
    $("#gsc_applytodpamount").attr("min", 0);


    var webRole = DMS.Settings.User.webRole;
    if (webRole == 'Cashier' || webRole.contains("Vehicle Allocator") || webRole == "Invoicer" || webRole == "Invoice Generator by Dealer" || webRole == "CC Manager" || webRole.indexOf("MSD Manager") >= 0) {

        $("input").parent("span.checkbox").each(function () {
            if ($(this).closest("table").data("name") != "hideSection") {
                $inputId = $(this).children("input").attr("id");
                $('input[id="' + $inputId + '"], label[for="' + $inputId + '"]').css({ "pointer-events": "none", "cursor": "default" });
            }
        });

        setTimeout(function () {
            //Vehicle Allocators able to access criteria filters
            if (webRole.contains("Vehicle Allocator")) {
                $("input", '*[data-name="VEHICLECRITERIA"]').removeAttr("readonly");
                $("select", '*[data-name="VEHICLECRITERIA"]').removeAttr("disabled").removeClass("permanent-disabled");

            }
        }, 200);

        $("#EntityFormView").find("input").each(function () {
            if (webRole == "Invoicer") {
                if ($(this).closest('table').data("name") === "tabbed-INSURANCECHARGES") {
                    return true;
                }
            }
            $(this).attr("readonly", true);
        });

        $("#EntityFormView").find("select, textarea").each(function () {
            if (webRole == "Invoicer") {
                if ($(this).closest('table').data("name") === "tabbed-INSURANCECHARGES") {
                    return true;
                }
            }
            if ($(this).attr("id") !== "gsc_status" && $(this).attr("id") !== "gsc_statuscopy") {
                $(this).attr("disabled", true);
                $(this).addClass("permanent-disabled");
            }
        });

        $("#EntityFormView").find(".input-group-btn").each(function () {
            if (webRole == "Invoicer") {
                if ($(this).closest('table').data("name") === "tabbed-INSURANCECHARGES") {
                    return true;
                }
            }
            $(this).addClass("hidden");
        });

    }
});