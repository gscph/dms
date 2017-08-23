$(document).ready(function (e) {
    //Disable transferred vehicles remove button on load then enable on item select
    $(document).on('click', '#AllocatedVehicles .view-grid table tbody tr', AddEventAllocatedVehicles);

    setTimeout(function () {
        $.cookie("baseModelId", $("#gsc_vehiclebasemodelid").val(), { path: '/' });
        $.cookie("productId", $("#gsc_productid").val(), { path: '/' });
        $.cookie("siteId", $("#gsc_sitecriteriaid").val(), { path: '/' });
        $.cookie("colorName", $("#gsc_colorid_name").val(), { path: '/' });
        $.cookie("modelCode", $("#gsc_modelcode").val(), { path: '/' });
        $.cookie("optionCode", $("#gsc_optioncode").val(), { path: '/' });

        $("#gsc_vehiclebasemodelid").on('change', function () {
            $.cookie("baseModelId", $("#gsc_vehiclebasemodelid").val(), { path: '/' });
        });

        $("#gsc_productid").on('change', function () {
            $.cookie("productId", $("#gsc_productid").val(), { path: '/' });
        });

        $("#gsc_modelcode").on('change', function () {
            $.cookie("modelCode", $("#gsc_modelcode").val(), { path: '/' });
        });

        $("#gsc_optioncode").on('change', function () {
            $.cookie("optionCode", $("#gsc_optioncode").val(), { path: '/' });
        });

        $("#gsc_sitecriteriaid").on('change', function () {
            $.cookie("siteId", $("#gsc_sitecriteriaid").val(), { path: '/' });
        });

        $("#gsc_colorid").on('change', function () {
            $.cookie("colorName", $("#gsc_colorid_name").val(), { path: '/' });
        });

    }, 100);

    checkTDColumn();

    function checkTDColumn() {
        $('#AllocatedVehicles .btn-primary:not(a[title="Download"])').addClass('disabled');
        if ($('#AllocatedVehicles tbody tr td:first-child').is(':visible')) {
            $('#AllocatedVehicles tbody tr td:first-child').click(function () {
                AddEventAllocatedVehicles();
            });
        }
        else {
            setTimeout(checkTDColumn, 50);
        }
    }

    function AddEventAllocatedVehicles() {
        var id;
        var latestId = $('#gsc_allocateditemstodelete').val();
        var counter = 0;

        $('#AllocatedVehicles tbody tr td.multi-select-cbx').each(function () {
            if ($(this).data('checked') == "true") {
                counter++;
            }
        });

        if (counter > 0) {
            $('#AllocatedVehicles .btn-primary:not(a[title="Download"])').removeClass('disabled');
        } else {
            $('#AllocatedVehicles .btn-primary:not(a[title="Download"])').addClass('disabled');
        }
    }

    setTimeout(function () {
        $('#gsc_allocateditemstodelete').val('');
        $('#gsc_allocateditemstodelete').parent().parent().hide();

        $('.btn-primary:not(a[title="Download"])').on('click', function (e) {
            var $subgrid = $(this).closest(".subgrid");
            var $subgridId = $subgrid.parent().prop("id");

            if ($subgridId == "AllocatedVehicles") {
                e.preventDefault();
                e.stopPropagation();
                removeAllocatedItems();
            }
        });
    }, 100);

    function removeAllocatedItems() {
        var counter = 0;
        var count = $('#AllocatedVehicles tbody tr td.multi-select-cbx').length;

        $('#AllocatedVehicles tbody tr td.multi-select-cbx').each(function () {
            if ($(this).data('checked') == "true") {
                counter++;
            }
        });

        if (counter > 1 || counter == 0) {
            DMS.Notification.Error(" You can only remove one vehicle per transaction.", true, 5000);
        } else {
            //Loading Image
            $.blockUI({ message: null, overlayCSS: { opacity: .3 } });

            var div = document.createElement("DIV");
            div.className = "view-loading message text-center";
            div.style.cssText = 'position: absolute; top: 50%; left: 50%;margin-right: -50%;display: block;';
            var span = document.createElement("SPAN");
            span.className = "fa fa-2x fa-spinner fa-spin";
            div.appendChild(span);
            $(".content-wrapper").append(div);

            $('#AllocatedVehicles tbody tr td.multi-select-cbx').each(function () {
                if ($(this).data('checked') == "true") {
                    allocateditems = $(this).closest('tr').data('id');
                    $("#gsc_allocateditemstodelete").val(allocateditems);
                    $("#UpdateButton").click();
                }
            });
        }
    }

  disableModelOptionCode();
  
  setTimeout(function() {
    $('#gsc_productid').on('change', function () {
      disableModelOptionCode();
    });
  }, 2000);
  
  function disableModelOptionCode() {
      $('#gsc_modelcode').val('');
      $('#gsc_optioncode').val('');

    if ($('#gsc_productid').val() != '') {
      $('#gsc_modelcode').prop('readonly', true);
      $('#gsc_optioncode').prop('readonly', true);
    }
    else {
      $('#gsc_modelcode').prop('readonly', false);
      $('#gsc_optioncode').prop('readonly', false);
    }
  }
});