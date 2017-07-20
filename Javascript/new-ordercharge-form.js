$(document).ready(function () {
  $('#gsc_recordownerid_name').siblings('.input-group-btn').addClass('hidden');
  $('#gsc_dealerid_name').siblings('.input-group-btn').addClass('hidden');
  $('#gsc_branchid_name').siblings('.input-group-btn').addClass('hidden');
  
  $('#UpdateButton').click(function (event) {
    event.preventDefault();
    setTimeout(function() {
      window.parent.$('#btnRecalculate').click();
    }, 100);
  });
  
  var amount = 0.00;
  var actualCost = 0.00;
  
  setTimeout(function () {
    $('#gsc_chargesid').on('change', function () {
      var chargesId = $('#gsc_chargesid').val();
      var chargeQuery = "/_odata/gsc_cmn_charges?$filter=gsc_cmn_chargesid eq (Guid'" + chargesId + "')";
      
      $.ajax({
        type: 'get',
        async: true,
        url: chargeQuery,
        success: function (data) {
          if (data.value.length != 0) {
            var charge = data.value[0];
            var chargeType = charge.gsc_chargetype.Value;
            var description = charge.gsc_description;
            
            if(charge.gsc_chargeamount != null) {
              amount = eval(charge.gsc_chargeamount).toFixed(2);
              actualCost = eval(charge.gsc_chargeamount).toFixed(2);
            } 
             
            
            
            
            $('#gsc_chargetype').val(chargeType);
            $('#gsc_description').val(description);
            $('#gsc_amount').val(amount);
            $('#gsc_actualcost').val(actualCost);
            
            FreeCharge();
          }
        },
        error: function (xhr, textStatus, errorMessage) {
          $('#gsc_chargetype').val('');
          $('#gsc_description').val('');
          $('#gsc_amount').val('');
          $('#gsc_actualcost').val('');
          console.log(errorMessage);
        }
      });
    });
    
    $('#gsc_free').on('change', function () {
      FreeCharge();
    });
  }, 100);
  
  function FreeCharge() {
    var isFree = $('#gsc_free').is(":checked");
    
    if (isFree == true) {
      $("#gsc_actualcost").val("");
      $("#gsc_actualcost").attr('readOnly', 'readOnly');
    } else {
      var amount = $("#gsc_amount").val();
      $("#gsc_actualcost").val(amount);
      $("#gsc_actualcost").removeAttr('readOnly');
    }
  }
  
});