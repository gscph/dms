$(document).ready(function (){
var printIcon = DMS.Helpers.CreateFontAwesomeIcon('fa-print');
var printBtn = DMS.Helpers.CreateButton('button', 'btn btn-primary printBase', '', ' PRINT', printIcon);
DMS.Helpers.AppendButtonToToolbar(printBtn);
  printBtn.on('click', function(evt) {
                          evt.preventDefault();
                          var param1var = DMS.Helpers.GetUrlQueryString('id');
                          var protocol = window.location.protocol;
                          var host = window.location.host;
                          var url = protocol + "//" + host + "/report/?reportname={96ef2cee-ec24-e711-80f1-00155d010e2c}&reportid=" + param1var;
                          window.open(url, 'blank', 'scrollbars=1,resizable=1,width=850,height=1000');
                          });
  setTimeout(disableTab, 3000);

    function disableTab()
    {
        $('.disabled').attr("tabindex", "-1");
        $('fieldset.permanent-disabled .btn').attr("tabindex", "-1");
    }

})