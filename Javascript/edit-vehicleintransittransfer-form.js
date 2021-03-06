$(document).ready(function (e) {
  setTimeout(function () {
    $.cookie("baseModelId", $("#gsc_modelid").val(), { path: '/' });
    $.cookie("productId", $("#gsc_productid").val(), { path: '/' });
    $.cookie("siteId", $("#gsc_siteid").val(), { path: '/' });
    $.cookie("colorName", $("#gsc_colorid_name").val(), { path: '/' });
    $.cookie("modelCode", $("#gsc_modelcode").val(), { path: '/' });
    $.cookie("optionCode", $("#gsc_optioncode").val(), { path: '/' });
    
    $("#gsc_modelid").on('change', function () {
      $.cookie("baseModelId", $("#gsc_modelid").val(), { path: '/' });
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
    
    $("#gsc_siteid").on('change', function () {
      $.cookie("siteId", $("#gsc_siteid").val(), { path: '/' });
    });
    
    $("#gsc_colorid_name").on('change', function () {
      $.cookie("colorName", $("#gsc_colorid_name").val(), { path: '/' });
    });
  }, 100);
  
  //Disable transferred vehicles remove button on load then enable on item select
  $(document).on('click', '#AllocatedVehicle .view-grid table tbody tr', AddEventAllocatedVehicles);
  
  setTimeout(function () {
    $('#AllocatedVehicle .btn-primary').addClass('disabled');
    $('a[title="Download"]').removeClass('disabled');
    $('#AllocatedVehicle .view-grid table tbody td.multi-select-cbx').click(function () {
      AddEventAllocatedVehicles();
    });
    
    $('#gsc_allocateditemstodelete').hide();
    $('#gsc_allocateditemstodelete_label').hide();
    $('#gsc_intransittransferstatus').hide();
    $('#gsc_intransittransferstatus_label').hide();
    
    $('.btn-primary:not(a[title="Download"])').on('click', function (e) {
      var $subgrid = $(this).closest(".subgrid");
      var $subgridId = $subgrid.parent().prop("id");
      
      if ($subgridId == "AllocatedVehicle") {
        e.preventDefault();
        e.stopPropagation();
        removeAllocatedItems();
      }
    });
  }, 3000);
  
  function AddEventAllocatedVehicles() {
    var id;
    var latestId = $('#gsc_allocateditemstodelete').val();
    var inTransitStatus = $('#gsc_intransittransferstatus').val();
    var counter = 0;
    
    $('#AllocatedVehicle tbody tr td.multi-select-cbx').each(function () {
      if ($(this).data('checked') == "true") {
        counter++;
      }
    });
    
    if (counter > 0 && inTransitStatus == 100000000) {
      $('#AllocatedVehicle .btn-primary:not(a[title="Download"])').removeClass('disabled');
    } else {
      $('#AllocatedVehicle .btn-primary:not(a[title="Download"])').addClass('disabled');
    }
  }
  
  function removeAllocatedItems() {
    var counter = 0;
    var count = $('#AllocatedVehicle tbody tr td.multi-select-cbx').length;
    
    $('#AllocatedVehicle tbody tr td.multi-select-cbx').each(function () {
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
      
      $('#AllocatedVehicle tbody tr td.multi-select-cbx').each(function () {
        if ($(this).data('checked') == "true") {
          var allocatedItem = $(this).closest('tr').data('id');
          $("#gsc_allocateditemstodelete").val(allocatedItem);
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