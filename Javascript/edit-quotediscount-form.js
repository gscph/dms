$(document).ready(function (e) {
    //Created By: Leslie Baliguat, Created On: 03/14/16

    $('.text.money').mask("#,##0.00", { reverse: true });

    $('#UpdateButton').click(function (event) {
        event.preventDefault();
        setTimeout(function () {
            window.parent.$('#btnRecalculate').click();
        }, 500);
    });

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

    //set page validators
    if (typeof (Page_Validators) == 'undefined') return;

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

    //Variables for discount computation
    var dscnt_dppercent = $("#gsc_applypercentagetodp").val();
    var dscnt_dpamount = $("#gsc_applyamounttodp").val().replace(/,/g, '');
    var dscnt_afpercent = $("#gsc_applypercentagetoaf").val();
    var dscnt_afamount = $("#gsc_applyamounttoaf").val().replace(/,/g, '');
    var dscnt_uppercent = $("#gsc_applypercentagetoup").val();
    var dscnt_upamount = $("#gsc_applyamounttoup").val().replace(/,/g, '');
    var totaldiscount = $("#gsc_discountamount").val().replace(/,/g, '');

    dscnt_dppercent = dscnt_dppercent == "" ? 0 : dscnt_dppercent;
    dscnt_afpercent = dscnt_afpercent == "" ? 0 : dscnt_afpercent;
    dscnt_uppercent = dscnt_uppercent == "" ? 0 : dscnt_uppercent;
    dscnt_dpamount = dscnt_dpamount == "" ? 0 : dscnt_dpamount;
    dscnt_afamount = dscnt_afamount == "" ? 0 : dscnt_afamount;
    dscnt_upamount = dscnt_upamount == "" ? 0 : dscnt_upamount;
    totaldiscount = totaldiscount == "" ? 0 : totaldiscount;


    setTimeout(function () {
       // $('#gsc_applyamounttodp').val(parseFloat(dscnt_dpamount).toFixed(2));
       // $('#gsc_applyamounttoaf').val(parseFloat(dscnt_afamount).toFixed(2));
       // $('#gsc_applyamounttoup').val(parseFloat(dscnt_upamount).toFixed(2));
       // $("#gsc_discountamount").val(parseFloat(totaldiscount).toFixed(2));

        //do not allow less than 0 input
        var value = 0;
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
            value = this.value.replace(/,/g, "");
            if (value < 0) {
                this.value = 0;
                $("#gsc_applyamounttodp").trigger('change');
            }
            else if ((parseFloat(value) + parseFloat(dscnt_afamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                value = totaldiscount - dscnt_afamount - dscnt_upamount;
                this.value = value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
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
            value = this.value.replace(/,/g, "");
            if (value < 0) {
                this.value = 0;
                $("#gsc_applyamounttoaf").trigger('change');
            }
            else if ((parseFloat(value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_upamount)) > totaldiscount) {
                value = totaldiscount - dscnt_dpamount - dscnt_upamount;
                this.value = value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
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
            value = this.value.replace(/,/g, "");
            if (value < 0) {
                this.value = 0;
                $("#gsc_applyamounttoup").trigger('change');
            }
            else if ((parseFloat(value) + parseFloat(dscnt_dpamount) + parseFloat(dscnt_afamount)) > totaldiscount) {
                value = totaldiscount - dscnt_dpamount - dscnt_afamount;
                this.value = value.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
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
            $("#gsc_applyamounttodp").val(dscnt_dpamount == 0 ? "" : dscnt_dpamount.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        });

        $("#gsc_applyamounttodp").on('change', function () {
            dscnt_dpamount = $('#gsc_applyamounttodp').val() == "" ? 0 : $('#gsc_applyamounttodp').val().replace(/,/g, "");
            dscnt_dppercent = computePercentage(dscnt_dpamount);
            $("#gsc_applypercentagetodp").val(dscnt_dppercent == 0 ? "" : dscnt_dppercent);
        });

        $("#gsc_applypercentagetoaf").on('change', function () {
            dscnt_afpercent = $('#gsc_applypercentagetoaf').val() == "" ? 0 : $('#gsc_applypercentagetoaf').val();
            dscnt_afamount = computeAmount(dscnt_afpercent);
            $("#gsc_applyamounttoaf").val(dscnt_afamount == 0 ? "" : dscnt_afamount.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        });

        $("#gsc_applyamounttoaf").on('change', function () {
            dscnt_afamount = $('#gsc_applyamounttoaf').val() == "" ? 0 : $('#gsc_applyamounttoaf').val().replace(/,/g, "");
            dscnt_afpercent = computePercentage(dscnt_afamount);
            $("#gsc_applypercentagetoaf").val(dscnt_afpercent == 0 ? "" : dscnt_afpercent);
        });

        $("#gsc_applypercentagetoup").on('change', function () {
            dscnt_uppercent = $('#gsc_applypercentagetoup').val() == "" ? 0 : $('#gsc_applypercentagetoup').val();
            dscnt_upamount = computeAmount(dscnt_uppercent);
            $("#gsc_applyamounttoup").val(dscnt_upamount == 0 ? "" : dscnt_upamount.replace(/(\d)(?=(\d{3})+\.)/g, '$1,'));
        });

        $("#gsc_applyamounttoup").on('change', function () {
            dscnt_upamount = $('#gsc_applyamounttoup').val() == "" ? 0 : $('#gsc_applyamounttoup').val().replace(/,/g, "");
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
});