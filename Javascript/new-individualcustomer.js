$(document).ready(function (){
  
  //Modified JGC_02222017
  $('#gsc_prospect').hide();
  $('#gsc_prospect_label').hide();
  
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

});