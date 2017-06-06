$(document).on('loaded', function () {
    $('td[data-attribute="gsc_reportsto"').hide();
    var webPageId = $('#webPageId span').html();

    var service = DMS.Service('GET', '~/api/Service/GetPrivilages',
       { webPageId: webPageId }, DMS.Helpers.DefaultErrorHandler, null);

    service.then(function (response) {
        DMS.Settings.Permission = response;

        if (response == null) return;
        if (DMS.Settings.Permission.Read == null) return;

        if (DMS.Settings.Permission.Read == false) {
            $('.view-empty.message').hide();
            $('.view-error.message').hide();
            $('.view-loading.message').hide();
            $('.view-access-denied.message').show();
            $('.view-grid table tbody').html('');
            $('.toolbar-right').html('');
            return;
        }

        if (DMS.Settings.Permission.Create == false) {
            $('.btn.action:first').remove();
        }

        if (DMS.Settings.Permission.Update == false) {
            $('.btn.activate').remove();
            $('.btn.deactivate').remove();
        }

        if (DMS.Settings.Permission.Delete == false) {
            $('.btn.delete').remove();
        }

    });


});