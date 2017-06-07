/*! Signal R locking for edit forms
 * @Author  Joseph F. Cadiao
 * @Email   <jcadiao@gurango.net>
 * @version 1.0.0 
 * @integration with adx portal
*/

$(function () {
    // Reference the auto-generated proxy for the hub.  
    var sales = $.connection.salesHub;
    var pages;
    var currentPage = window.location.href.split('#')[0];

    //// check if something has changed 
    sales.client.pendingChanges = function (url, clientId, clientFullName) {
        if (url == currentPage && clientId !== userId) {
            DMS.Notification.Warning(clientFullName + ' had changes to the record. Performing Auto Refresh in 5 seconds', false, 0, true);
            setTimeout(function () {
                location.reload(true);
            }, 5000);
        }
    }

    // Get Web Pages
    sales.client.updatePages = function (currentlyUsedWebPageModel, updateType) {
        // does the user need this notif? 
        // User should only get notifications from the same form
        if (currentPage != currentlyUsedWebPageModel.Url) {
            return;
        }

        // Another user has accessed the record
        if (updateType == 1 && userId != currentlyUsedWebPageModel.User) {
            DMS.Notification.Info(currentlyUsedWebPageModel.UserFullName + ' has also viewed the record.', true, 10000, true);
        }
        // A user has been disconnected due to inactivty
        if (updateType == 3) {
            DMS.Notification.Info(currentlyUsedWebPageModel.UserFullName + " has been disconnected due to inactivity.", true, 10000, true);
        }
        // A user ha left the record.
        if (updateType == 4) {
            DMS.Notification.Info(currentlyUsedWebPageModel.UserFullName + " has left the page.", true, 10000, true);
        }
        // - end check Notification Type

        $('.footer-left').html('<span class="fa fa fa-spinner fa-spin" style="font-size:10px;float:left;margin-top:10px; margin-left: 5px;"></span>');
        // get update pages
        $.ajax({
            url: '/api/Service/GetCurrentlyUsedWebPages',
            type: 'POST',
            data: JSON.stringify({
                Url: currentPage
            }),
            dataType: "json",
            contentType: 'application/json; charset=utf-8'
        }).success(function (result) {
            // get connectionId
            var connId = $.connection.hub.id;
            // sort by queue
            var usersQueue = result.sort(function (a, b) {
                return a.Queue - b.Queue;
            });

            // append queue to footer
            DisplayQueue(usersQueue);

            if (result.length <= 0) {
                // no results means connectionid already expired.                        
                ForceLogOut();
            }

            if (result.length == 1) {
                // filter user id
                var myPages = result.filter(function (itm, i, a) {
                    return itm.User == userId;
                });

                if (myPages.length > 0) {
                    // it's my page
                    DMS.Helpers.EnableEntityForm();
                    return;
                }
                // you do not have any pages left, means that it was already deleted.                    
                ForceLogOut();
            }

            if (result.length > 1) {
                // page is greater than 1
                var myPages = result.filter(function (itm, i, a) {
                    return itm.User == userId;
                });

                if (myPages.length <= 0) {
                    // you do not have any pages left, means that it was already deleted.                            
                    ForceLogOut();
                }

                if (myPages[0].Queue <= 0) {
                    // top of the queue
                    DMS.Helpers.EnableEntityForm();
                }
                else {
                    // mid/bottom of the queue
                    DMS.Helpers.DisableEntityForm();
                }
            }
        }).error(function (err) {
            console.error('error occured while getting currently used web page');
            console.error(err);
        });
    };

    // Start the connection.
    $.connection.hub.start().done(function () {
        $('.footer-left').html('<span class="fa fa fa-spinner fa-spin" style="font-size:10px;float:left;margin-top:10px; margin-left: 5px;"></span>');
        // get all pages.
        $.ajax({
            url: '/api/Service/GetCurrentlyUsedWebPages',
            contentType: 'application/html ; charset:utf-8',
            type: 'POST',
            data: JSON.stringify({
                Url: currentPage
            }),
            dataType: "json",
            contentType: 'application/json; charset=utf-8'
        }).success(function (result) {
            // init queue to zero
            var queue = 0;
            var connId = $.connection.hub.id;
            if (result.length <= 0) {
                // no ones using the record form.
                tryInsertPage(connId, queue, currentPage);
                return;
            }

            if (result.length > 0) {

                // somone's using the form.                  

                var myPages = result.filter(function (itm, i, a) {
                    return itm.User == userId;
                });

                if (myPages.length > 0) {
                    // I have an existing page                          
                    queue = myPages[0].Queue;
                    DMS.Helpers.EnableEntityForm();

                    if (queue > 0) {
                        DMS.Helpers.DisableEntityForm();
                        DMS.Notification.Error('This form is currently locked', true, 10000, true);
                    }

                    tryUpdateConnection(connId, myPages[0].Id, currentPage);
                }
                else {
                    // doesn't have exsiting pages
                    queue = result.length;
                    //DisableForm();
                    DMS.Helpers.DisableEntityForm();
                    tryInsertPage(connId, queue, currentPage);
                    DMS.Notification.Error('This form is currently locked', true, 10000, true);
                }
            }

        }).error(function (err) {
            console.error('error occured while getting web pages');
            console.error(err);
        });

    });

});

function DisableForm() {
    $('form fieldset').attr('disabled', true);
    // clear disabled class
    $('.row.form-custom-actions .btn').removeClass('disabled');
    // disable
    $('.row.form-custom-actions .btn').addClass('disabled');
}

function EnableForm() {
    $('form fieldset').attr('disabled', false);
    $('.row.form-custom-actions .btn').removeClass('disabled');
}

function ForceLogOut(hubInstance) {
    DisableForm();
    console.log('log out kana!');
    DMS.Notification.Error('Your Session has ended. Logging out..', false, 0, true);
    setTimeout(function () {
        window.location.href = $('#logoutBtn').attr('href');
    }, 10000);
}

function tryInsertPage(connId, queue, currentPage) {

    userData = {
        User: userId,
        Url: currentPage,
        UserFullName: userFullName,
        UserImageUrl: imgUrl,
        Queue: queue,
        ConnectionId: connId
    }

    var json = JSON.stringify(userData);

    return $.ajax({
        url: '/api/Service/StoreNewPages',
        type: 'PUT',
        data: json,
        dataType: "json",
        contentType: 'application/json; charset=utf-8'
    }).error(function (errorData) {
        console.error('error occured while inserting new page');
        console.error(errorData);
    });

}

function tryUpdateConnection(connId, id, url) {
    return $.ajax({
        url: '/api/Service/UpdatePage?id=' + id + '&connId=' + connId + '&url=' + url,
        contentType: 'application/html ; charset:utf-8',
        type: 'PUT',
    }).error(function (errorData) {
        console.error('error occured while updating a page');
        console.error(errorData);
    });
}

function DisplayQueue(queueList) {

    var ul = $('<ul class="users-list clearfix"></ul>');
    queueList.forEach(function (item, index) {
        var status = ' is viewing..', img = $('<img/>');

        if (item.Queue == 0) {
            status = ' is editing..'
        }

        img.attr('id', item.User);
        img.attr('src', item.UserImageUrl);
        img.attr('title', item.UserFullName + '[' + (item.Queue + 1) + ']' + status);
        img.attr('onerror', "this.onerror=null;this.src='~/images/users/default.jpg'");
        ul.append($('<li></li>').append(img));
    });

    $('.footer-left').html('');
    $('.footer-left').append(ul);
    //$('table[data-name=UserList] tbody tr td:first').html('');
    //$('table[data-name=UserList] tbody tr td:first').append(ul);

}