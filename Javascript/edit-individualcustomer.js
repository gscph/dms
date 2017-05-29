$(document).ready(function (e) {

  //Added by Ernest Sarmiento 02-08-2017
  //Modified JGC_02222017
  $('#gsc_prospect').hide();
  $('#gsc_prospect_label').hide();
  
 var status = $("#statecode").html();

 if(status =="Inactive")
  $("#EntityFormView > div:nth-child(12) > div.box-body > div.tab.clearfix > div > div > fieldset").attr("disabled", "disabled");

  // JGC 02212017
   if($('#gsc_fraud').is(":checked"))
   {
   $('#CustomersInquiry_Subgrid .entity-grid.subgrid').on('loaded', function() {
     $('#CustomersInquiry_Subgrid .add-margin-right').addClass('permanent-disabled disabled');
   });
   }
// END
   $('.text.money').mask("#,##0.00", {reverse: true});
   $( "#gsc_monthlyincometo" ).on('change', function () {
      var miTo = $(this).val().replace(/,/g, '');
      var miFrom = document.getElementById("gsc_monthlyincomefrom").value.replace(/,/g, '');
      if (parseFloat(miTo) < parseFloat(miFrom))
      {
          $(this).val("");
          DMS.Notification.Error("Monthly Income From must be less than Monthly Income To", true, 5000);
      }
    $( "#gsc_monthlyincometo" ).mask('000,000,000,000,000.00', {reverse: true});
  });
  $( "#gsc_monthlyincomefrom" ).on('change', function () {
      var miFrom = $(this).val().replace(/,/g, '');
      var miTo = document.getElementById("gsc_monthlyincometo").value.replace(/,/g, '');
      if (parseFloat(miTo) < parseFloat(miFrom))
      {
          $(this).val("");
          DMS.Notification.Error("Monthly Income From must be less than Monthly Income To", true, 5000);
      }
    $( "#gsc_monthlyincomefrom" ).mask('000,000,000,000,000.00', {reverse: true});
  });
  setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
});