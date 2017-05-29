$(document).ready(function (e) {

 var status = $("#statecode").html();

 if(status =="Inactive")
  $("#EntityFormView > div:nth-child(12) > div.box-body > div.tab.clearfix > div > div > fieldset").attr("disabled", "disabled");

	setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }
});