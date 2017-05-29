$(document).ready(function () {

    $(".section[data-name='HideSection']").closest("fieldset").hide();
    $('#gsc_regionid_name').siblings('.input-group-btn').addClass('hidden');
    $('#gsc_age').attr('readonly', true);

    setTimeout(function () {
        $('#birthdate').next('.datetimepicker').data("DateTimePicker").setMaxDate(new Date());

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

        /* Added by: Christell Ann Mataac - 2/24/2017
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

    //Added by JGC_12162016
    //Create button to convert prospect to customer
    $btnConvertToCustomer = DMS.Helpers.CreateButton('button', "btn-primary btn ConvertToCustomer", '', ' CONVERT TO CUSTOMER', DMS.Helpers.CreateFontAwesomeIcon('fa-user-plus'));
    var stateCode = $("#statecode").html();
    if (stateCode == 'Active') {
        $(".form-action-container-left").append($btnConvertToCustomer);
    }
    $btnConvertToCustomer.click(function (evt) {
        showLoading();
        $("#gsc_ispotential_0").prop("checked", true);
        evt.preventDefault();
        $("#UpdateButton").click();
    });
    if ($("#gsc_ispotential_0").is(":checked")) {
        alert("Redirecting to customer page...")
        var param1var = DMS.Helpers.GetUrlQueryString('id');
        var protocol = window.location.protocol;
        var host = window.location.host;
        var url = protocol + "//" + host + "/master/contact/editcontact/?id=" + param1var;
        window.location.href = url;
    }
    //End

    function showLoading() {
        $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

        var div = document.createElement("DIV");
        div.className = "view-loading message text-center";
        div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
        var span = document.createElement("SPAN");
        span.className = "fa fa-2x fa-spinner fa-spin";
        div.appendChild(span);
        $(".content-wrapper").append(div);
    }

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

    Page_Validators.push(mobilePhoneValidator);

    var faxValidator = document.createElement('span');
    faxValidator.style.display = "none";
    faxValidator.id = "RequiredFieldValidatormobilephone";
    faxValidator.controltovalidate = "fax";
    faxValidator.errormessage = "<a href='#fax'>Fax should only contain numeric values.</a>";
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

    Page_Validators.push(faxValidator);

    var alternatePhoneValidator = document.createElement('span');
    alternatePhoneValidator.style.display = "none";
    alternatePhoneValidator.id = "RequiredFieldValidatormobilephone";
    alternatePhoneValidator.controltovalidate = "telephone1";
    alternatePhoneValidator.errormessage = "<a href='#telephone1'>Mobile phone should only contain numeric values.</a>";
    alternatePhoneValidator.validationGroup = "";
    alternatePhoneValidator.initialvalue = "";
    alternatePhoneValidator.evaluationfunction = function () {
        var value = $("#telephone1").val();
        var regex = /^[\d ()\-+]*$/;

        var matches = value.match(regex);

        if (matches != null) {
            return true;
        }
        else
            return false;
    };

    Page_Validators.push(alternatePhoneValidator);
});