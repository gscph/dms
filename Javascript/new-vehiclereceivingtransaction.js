$(document).ready(function() {
  $('#gsc_recordtype').prop('disabled', 'disabled');
  
   /* Actual Receipt Date and In-Transit Date Validation */
    setTimeout(function () {
    $('#gsc_actualreceiptdate').next('.datetimepicker').on("dp.change", function (e) {
        $('#gsc_intransitreceiptdate').next('.datetimepicker').data("DateTimePicker").setMaxDate(e.date);
    });

    $('#gsc_intransitreceiptdate').next('.datetimepicker').on("dp.change", function (e) {
        $('#gsc_actualreceiptdate').next('.datetimepicker').data("DateTimePicker").setMinDate(e.date);
    });
    },100);
  
  setTimeout(function() {
   $("#gsc_purchaseorderid").on('change', function () {
     var poId = $('#gsc_purchaseorderid').val();
     
     if(poId != "")
     {
      var addressOdataQuery = "/_odata/gsc_cmn_purchaseorder?$filter=gsc_cmn_purchaseorderid eq (Guid'" + poId + "')";
      $.ajax({
          type: 'get',
          async: true,
          url: addressOdataQuery,
          success: function (data) {
            if(data.value.length != 0){
              var site = data.value[0].gsc_siteid;
              var date = data.value[0].gsc_vpodate;
              if(site != null){
                $("#gsc_siteid").val(site.Id);
                $("#gsc_siteid_name").val(site.Name);
                $("#gsc_siteid_entityname").val("gsc_iv_site");
                $("#gsc_siteid").siblings('div.input-group-btn').children('.clearlookupfield').show();
              }
              console.log(date);
            }
          },
          error: function (xhr, textStatus, errorMessage) {
              console.log(errorMessage);
          }
      });
     }
     else {
        $("#gsc_siteid").val("");
        $("#gsc_siteid_name").val("");
        $("#gsc_siteid").siblings('div.input-group-btn').children('.clearlookupfield').hide();
     }
   });
  },100);
  
   $('#gsc_intransitreceiptdate').next('.datetimepicker').on("dp.change", function (e) {
        var dateValue = $(this).find('input').val();
        $('#gsc_actualreceiptdate').next('.datetimepicker').find('input').val(dateValue);
        $('#gsc_actualreceiptdate').next('.datetimepicker').datetimepicker({ date: e.date });
        $('#gsc_actualreceiptdate').next('.datetimepicker').data("DateTimePicker").setMinDate(e.date);
    });
  
});