$(document).ready(function (e) {

    var totaldiscount = 0;

    $('#UpdateButton').click(function (event) {
        event.preventDefault();
        setTimeout(function () {
            window.parent.$('#btnRecalculate').click();

        }, 0);
    });

    var param1var = getQueryVariable("refid");
    
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

    var isFinancing = true;
    var paymentMode = window.parent.$('#gsc_paymentmode').val();
    
    if (paymentMode != '100000001')
        isFinancing = false;

    if (paymentMode == '100000000') {
        $('#gsc_applypercentagetodp').attr('readonly', true);
        $('#gsc_applyamounttodp').attr('readonly', true);
    }

    if (!isFinancing) {        
        $('#gsc_applypercentagetoaf').attr('readonly', true);      
        $('#gsc_applyamounttoaf').attr('readonly', true);
    }


    setTimeout(function () {
        $("#gsc_pricelistid").on('change', function () {
            var priceLevelid = $("#gsc_pricelistid").val();
            if (priceLevelid == "")
                removeReadOnly();
            else {

                var productId = window.parent.$("#gsc_productid").val();
                var countryOdataQuery = "/_odata/productpricelevel?$filter=pricelevelid/Id eq (Guid'" + priceLevelid + "') and productid/Id eq (Guid'" + productId + "')";
             
                
   var priceLevelOdataQuery = "/_odata/promo?$filter=pricelevelid%20eq%20(Guid'" + priceLevelid + "')";
                
                  $.ajax({
                    type: 'get',
                    async: true,
                    url: priceLevelOdataQuery,
                    success: function (data) {
                        if (data.value.length != 0) {
                            var data = data.value[0];
                            $("#gsc_description").val(data.description);
                        }
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
                
                $.ajax({
                    type: 'get',
                    async: true,
                    url: countryOdataQuery,
                    success: function (data) {
                        if (data.value.length != 0) {
                            var priceListitem = data.value[0];
                            $("#gsc_discountamount").val(parseFloat(priceListitem.amount).toFixed(2));
                            totaldiscount = $("#gsc_discountamount").val().replace(/,/g, '');
                        }
                    },
                    error: function (xhr, textStatus, errorMessage) {
                        console.log(errorMessage);
                    }
                });
                setReadOnly();
            }
        });

    }, 100);


    function removeReadOnly() {
        $('#gsc_description').val("");
        $('#gsc_discountamount').val("");
        $('#gsc_quotediscountpn').val("");

        $('#gsc_description').attr('readonly', false);
        $('#gsc_discountamount').attr('readonly', false);
        $('#gsc_quotediscountpn').attr('readonly', false);

        if (isFinancing) {
            $('#gsc_applypercentagetodp').attr('readonly', false);
            $('#gsc_applypercentagetoaf').attr('readonly', false);
            $('#gsc_applyamounttodp').attr('readonly', false);
            $('#gsc_applyamounttoaf').attr('readonly', false);
        }
    }


    function setReadOnly() {
        $('#gsc_description').val("");
        $('#gsc_discountamount').val("");
        $('#gsc_applypercentagetodp').val("");
        $('#gsc_applypercentagetoaf').val("");
        $('#gsc_applypercentagetoup').val("");
        $('#gsc_applyamounttodp').val("");
        $('#gsc_applyamounttoaf').val("");
        $('#gsc_applyamounttoup').val("");
        $('#gsc_quotediscountpn').val($('#gsc_pricelistid_name').val());

        $('#gsc_description').attr('readonly', true);
        $('#gsc_discountamount').attr('readonly', true);
        $('#gsc_quotediscountpn').attr('readonly', true);

        if (!isFinancing) {
            
            $('#gsc_applypercentagetoaf').attr('readonly', true);
            $('#gsc_applyamounttoaf').attr('readonly', true);

            if(paymentMode != '100000002')
            {
                $('#gsc_applypercentagetodp').attr('readonly', true);
                $('#gsc_applyamounttodp').attr('readonly', true); 
            }
            
        }
    }

    setTimeout(function () {
        //Variables for discount computation
        var dscnt_dppercent = $("#gsc_applypercentagetodp").val();
        var dscnt_dpamount = $("#gsc_applyamounttodp").val().replace(/,/g, '');
        var dscnt_afpercent = $("#gsc_applypercentagetoaf").val();
        var dscnt_afamount = $("#gsc_applyamounttoaf").val().replace(/,/g, '');
        var dscnt_uppercent = $("#gsc_applypercentagetoup").val();
        var dscnt_upamount = $("#gsc_applyamounttoup").val().replace(/,/g, '');

        dscnt_dpamount = dscnt_dpamount == "" ? 0 : dscnt_dpamount;
        dscnt_afamount = dscnt_afamount == "" ? 0 : dscnt_afamount;
        dscnt_upamount = dscnt_upamount == "" ? 0 : dscnt_upamount;
        dscnt_dppercent = dscnt_dppercent == "" ? 0 : dscnt_dppercent;
        dscnt_afpercent = dscnt_afpercent == "" ? 0 : dscnt_afpercent;
        dscnt_uppercent = dscnt_uppercent == "" ? 0 : dscnt_uppercent;
        totaldiscount = totaldiscount == "" ? 0 : totaldiscount;

        $('#gsc_applyamounttodp').val(parseFloat(dscnt_dpamount).toFixed(2));
        $('#gsc_applyamounttoaf').val(parseFloat(dscnt_afamount).toFixed(2));
        $('#gsc_applyamounttoup').val(parseFloat(dscnt_upamount).toFixed(2));
        $("#gsc_discountamount").val(parseFloat(totaldiscount).toFixed(2));


        //change type from text to number; only allow numbers in textbox
        $('#gsc_applypercentagetodp').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applyamounttodp').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applypercentagetoaf').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applyamounttoaf').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applypercentagetoup').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_applyamounttoup').click(function () {
            $(this).get(0).type = 'number';
        });

        $('#gsc_discountamount').click(function () {
            $(this).get(0).type = 'number';
        });

        //do not allow less than 0 input
        $('#gsc_applypercentagetodp').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applypercentagetodp").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_afpercent) + parseFloat(dscnt_uppercent)) > 100) {
                this.value = 100 - dscnt_afpercent - dscnt_uppercent;
                $("#gsc_applypercentagetodp").trigger('change');
            }
        });

        $('#gsc_applyamounttodp').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applyamounttodp").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_afamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                $("#gsc_applyamounttodp").trigger('change');
            }
        });

        $('#gsc_applypercentagetoaf').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applypercentagetoaf").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dppercent) + parseFloat(dscnt_uppercent)) > 100) {
                this.value = 100 - dscnt_dppercent - dscnt_uppercent;
                $("#gsc_applypercentagetoaf").trigger('change');
            }
        });

        $('#gsc_applyamounttoaf').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applyamounttoaf").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_dpamount - dscnt_upamount;
                $("#gsc_applyamounttoaf").trigger('change');
            }
        });

        $('#gsc_applypercentagetoup').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applypercentagetoup").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dppercent) + parseFloat(dscnt_afpercent)) > 100) {
                this.value = 100 - dscnt_dppercent - dscnt_afpercent;
                $("#gsc_applypercentagetoup").trigger('change');
            }
        });

        $('#gsc_applyamounttoup').blur(function () {
            if (this.value < 0) {
                this.value = 0;
                $("#gsc_applyamounttoup").trigger('change');
            }
            else if ((parseFloat(this.value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_afamount)) > totaldiscount) {
                this.value = totaldiscount - dscnt_dpamount - dscnt_afamount;
                $("#gsc_applyamounttoup").trigger('change');
            }
        });

        $('#gsc_discountamount').blur(function () {
            if (this.value < 0)
                this.value = 0;
            $("#gsc_discountamount").trigger('change');
        });

        $("#gsc_applypercentagetodp").on('change', function () {
            dscnt_dppercent = $('#gsc_applypercentagetodp').val() == "" ? 0 : $('#gsc_applypercentagetodp').val();
            dscnt_dpamount = computeAmount(dscnt_dppercent);
            $("#gsc_applyamounttodp").val(dscnt_dpamount == 0 ? "" : dscnt_dpamount);
        });

        $("#gsc_applyamounttodp").on('change', function () {
            dscnt_dpamount = $('#gsc_applyamounttodp').val() == "" ? 0 : $('#gsc_applyamounttodp').val();
            dscnt_dppercent = computePercentage(dscnt_dpamount);
            $("#gsc_applypercentagetodp").val(dscnt_dppercent == 0 ? "" : dscnt_dppercent);
        });

        $("#gsc_applypercentagetoaf").on('change', function () {
            dscnt_afpercent = $('#gsc_applypercentagetoaf').val() == "" ? 0 : $('#gsc_applypercentagetoaf').val();
            dscnt_afamount = computeAmount(dscnt_afpercent);
            $("#gsc_applyamounttoaf").val(dscnt_afamount == 0 ? "" : dscnt_afamount);
        });

        $("#gsc_applyamounttoaf").on('change', function () {
            dscnt_afamount = $('#gsc_applyamounttoaf').val() == "" ? 0 : $('#gsc_applyamounttoaf').val();
            dscnt_afpercent = computePercentage(dscnt_afamount);
            $("#gsc_applypercentagetoaf").val(dscnt_afpercent == 0 ? "" : dscnt_afpercent);
        });

        $("#gsc_applypercentagetoup").on('change', function () {
            dscnt_uppercent = $('#gsc_applypercentagetoup').val() == "" ? 0 : $('#gsc_applypercentagetoup').val();
            dscnt_upamount = computeAmount(dscnt_uppercent);
            $("#gsc_applyamounttoup").val(dscnt_upamount == 0 ? "" : dscnt_upamount);
        });

        $("#gsc_applyamounttoup").on('change', function () {
            dscnt_upamount = $('#gsc_applyamounttoup').val() == "" ? 0 : $('#gsc_applyamounttoup').val();
            dscnt_uppercent = computePercentage(dscnt_upamount);
            $("#gsc_applypercentagetoup").val(dscnt_uppercent == 0 ? "" : dscnt_uppercent);
        });

        $("#gsc_discountamount").on('change', function () {
            $("#gsc_applyamounttodp").val(dscnt_dpamount = computeAmount(dscnt_dppercent));
            $("#gsc_applyamounttoaf").val(dscnt_afamount = computeAmount(dscnt_afpercent));
            $("#gsc_applyamounttoup").val(dscnt_upamount = computeAmount(dscnt_uppercent));
        });

    }, 100);

    function computePercentage(amount) {
        totaldiscount = $("#gsc_discountamount").val() == "" ? 0 : $("#gsc_discountamount").val().replace(/,/g, '');
        if (totaldiscount != 0) {
            var percent = (parseFloat(amount) / parseFloat(totaldiscount)) * 100;
            return parseFloat(percent).toFixed(2);
        }
    }

    function computeAmount(percent) {
        totaldiscount = $("#gsc_discountamount").val() == "" ? 0 : $("#gsc_discountamount").val().replace(/,/g, '');
        if (totaldiscount != 0) {
            var amount = (parseFloat(totaldiscount) * parseFloat(percent)) / 100;
            return parseFloat(amount).toFixed(2);
        }
    }

    // Validator when the discounts are not equal to 100%
    var discountValidator = document.createElement('span');
    discountValidator.style.display = "none";
    discountValidator.id = "RequiredFieldValidatordiscounts";
    discountValidator.errormessage = "Discounts to be applied should total to 100%.";
    discountValidator.validationGroup = "";
    discountValidator.initialvalue = "";
    discountValidator.evaluationfunction = function () {
        var af = $("#gsc_applypercentagetoaf").val() == "" ? 0 : $("#gsc_applypercentagetoaf").val();
        var dp = $("#gsc_applypercentagetodp").val() == "" ? 0 : $("#gsc_applypercentagetodp").val();
        var up = $("#gsc_applypercentagetoup").val() == "" ? 0 : $("#gsc_applypercentagetoup").val();
        var total = parseFloat(af) + parseFloat(dp) + parseFloat(up);


        if (af < 1 && dp < 1 && up < 1) {
            return false;
        } else {
            var total = parseFloat(af) + parseFloat(dp) + parseFloat(up);
            if (total < 100) {
                return false;
            } else {
                return true;
            }
        }
    };

    // Validator when the Discount Amount has no value
    var discountAmountValidator = document.createElement('span');
    discountAmountValidator.style.display = "none";
    discountAmountValidator.id = "RequiredFieldValidatoramounts";
    discountAmountValidator.errormessage = "Discounts amount should have value.";
    discountAmountValidator.validationGroup = "";
    discountAmountValidator.initialvalue = "";
    discountAmountValidator.evaluationfunction = function () {
        var amount = $("#gsc_discountamount").val() == "" ? 0 : $("#gsc_discountamount").val();

        if(amount == 0)
        {
            console.log("empty");
            return false;
        }

        else
            return true;
    };

    Page_Validators.push(discountValidator);
    Page_Validators.push(discountAmountValidator);


});