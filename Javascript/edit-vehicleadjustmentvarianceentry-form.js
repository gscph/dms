$(document).ready(function (e) {
    
    setTimeout(function () {
        $.cookie("baseModelId", $("#gsc_vehiclebasemodelid").val(), { path: '/' });
        $.cookie("productId", $("#gsc_productid").val(), { path: '/' });
        $.cookie("siteId", $("#gsc_siteid").val(), { path: '/' });
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
        
         $("#gsc_siteid").on('change', function () {
            $.cookie("siteId", $("#gsc_siteid").val(), { path: '/' });
        });

        $("#gsc_colorid").on('change', function () {
            $.cookie("colorName", $("#gsc_colorid_name").val(), { path: '/' });
        });
        
     },100);
     
     disableModelOptionCode();
  
  setTimeout(function() {
    $('#gsc_productid').on('change', function () {
      disableModelOptionCode();
    });
  }, 2000);
  
  function disableModelOptionCode() {
    if ($('#gsc_productid').val() != '') {
      $('#gsc_modelcode').prop('readonly', true);
      $('#gsc_optioncode').prop('readonly', true);
    }
    else {
      $('#gsc_modelcode').prop('readonly', false);
      $('#gsc_modelcode').val('');
      $('#gsc_optioncode').prop('readonly', false);
      $('#gsc_modelcode').val('');
    }
  }
});