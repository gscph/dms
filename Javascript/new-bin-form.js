$(document).ready(function () {
	$('#gsc_sitename').attr('readOnly', 'readOnly');

	setTimeout(function autoPopulate(){

    $('#gsc_siteid').on('change', function () {
      var siteId = $('#gsc_siteid').val();
      var siteQuery = "/_odata/gsc_iv_site?$filter=gsc_iv_siteid eq (Guid'" + siteId + "')";
      
      $.ajax({
        type: 'get',
        async: true,
        url: siteQuery,
        success: function (data) {
          if (data.value.length != 0) {
            var site = data.value[0];
            var siteName = site.gsc_sitename;
            
            $('#gsc_sitename').val(siteName);
          }
        },
        error: function (xhr, textStatus, errorMessage) {
          $('#gsc_sitename').val('');
          console.log(errorMessage);
        }
     });
 	});
	}, 1000);
});

