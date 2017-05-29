$(document).ready(function (e) {
//JGC: ReadOnly buttons if record is deactivated
var status = $(".record-status").html();
$('#AccreditationInformation .entity-grid.subgrid').on('loaded', function() {
if (status == "Inactive")
{
	$("#AccreditationInformation .action.add-margin-right").addClass("disabled")
	$("#AccreditationInformation .btn-xs").addClass("disabled");

}
});
$('#TrainingsAttended .entity-grid.subgrid').on('loaded', function() {
if (status == "Inactive")
{
	$("#TrainingsAttended .action.add-margin-right").addClass("disabled")
	$("#TrainingsAttended .btn-xs").addClass("disabled");
}
});

  //Added by Ernest Sarmiento
  if( $('#gsc_positionid_name').val() != "Sales Executive"){
      $('.checkbox-cell').addClass("hidden");
  } else {
      $('.checkbox-cell').removeClass("hidden");
  }
  setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }

});