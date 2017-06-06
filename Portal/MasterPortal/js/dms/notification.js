var Notification = {
    Success: function (success, autohide, seconds, flash) {
        var $container = $(".notifications");
        if ($container.length == 0) {
            var $pageheader = $(".page-heading");
            if ($pageheader.length == 0) {
                $container = $("<div class='notifications'></div>").prependTo($("#content-container"));
            } else {
                $container = $("<div class='notifications'></div>").appendTo($pageheader);
            }
        }

        $container.find(".notification").slideUp().remove();
        if (typeof success !== typeof undefined && success !== false && success != null && success != '') {
            
            var $alert = $("<div class='notification alert alert-success success alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" + success + "</div>")
                .on('closed.bs.alert', function () {
                    if ($container.find(".notification").length == 0) $container.hide();
                }).prependTo($container);
            $container.show();

            if (flash) {
                $alert.addClass('flash-notification');
            }
            if (autohide) {
                setTimeout(function () {
                    $alert.slideUp(100).remove();
                    if ($container.find(".notification").length == 0) $container.hide();
                }, seconds);
            }
        }
    },
    Warning: function (warning, autohide, seconds, flash) {
        var $container = $(".notifications");
        if ($container.length == 0) {
            var $pageheader = $(".page-heading");
            if ($pageheader.length == 0) {
                $container = $("<div class='notifications'></div>").prependTo($("#content-container"));
            } else {
                $container = $("<div class='notifications'></div>").appendTo($pageheader);
            }
        }

        $container.find(".notification").slideUp().remove();
        if (typeof warning !== typeof undefined && warning !== false && warning != null && warning != '') {
            var $alert = $("<div class='notification alert alert-warning warning alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" + warning + "</div>")
                .on('closed.bs.alert', function () {
                    if ($container.find(".notification").length == 0) $container.hide();
                }).prependTo($container);
            $container.show();


            if (flash) {
                $alert.addClass('flash-notification');
            }
            if (autohide) {
                setTimeout(function () {
                    $alert.slideUp(100).remove();
                    if ($container.find(".notification").length == 0) $container.hide();
                }, seconds);
            }
        }
    },

    Error: function (error, autohide, seconds, flash) {
        var $element = $('#EntityForm1').find(".entity-form");               

        if (typeof error !== typeof undefined && error !== false && error != null) {
            console.error(error);
            var message;
            if (typeof error.InnerError !== typeof undefined && error.InnerError !== false && error.InnerError != null) {
                message = error.InnerError.Message;
            }
            else if (typeof error.ExceptionMessage !== typeof undefined) {
                message = error.ExceptionMessage
            }
            else {
                message = error.Message;
            }

            if (typeof message === 'undefined') {
                message = error;
            }

            var $container = $(".notifications");
            if ($container.length == 0) {
                var $pageheader = $(".page-heading");
                if ($pageheader.length == 0) {
                    $container = $("<div class='notifications'></div>").prependTo($("#content-container"));
                } else {
                    $container = $("<div class='notifications'></div>").appendTo($pageheader);
                }
            }
            $container.find(".notification").slideUp().remove();
            var $status = $element.find(".navbar-collapse").find(".action-status");
            if ($status.length == 0) $status = $element.parent().find(".navbar-collapse").find(".action-status");
            $status.html("<span class='fa fa-fw fa-exclamation-circle text-danger' aria-hidden='true'></span>");
            var $alert = $("<div class='notification alert alert-danger error alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button><span class='fa fa-exclamation-triangle' aria-hidden='true'></span> " + message + "</div>")
                .on('closed.bs.alert', function () {
                    $status.html("<span class='fa fa-fw' aria-hidden='true'></span>");
                    if ($container.find(".notification").length == 0) $container.hide();
                }).prependTo($container);
            $container.show();

            if (flash) {
                $alert.addClass('flash-notification');
            }
            if (autohide) {
                setTimeout(function () {
                    $alert.slideUp(100).remove();
                    if ($container.find(".notification").length == 0) $container.hide();
                }, seconds);
            }
        }
    },
    // returns alert msg box object
    NoRecordsFound: function () {
        var html = '<div class="alert alert-block alert-warning" style="margin-top: -40px;">There are no records to display.</div>';
        return $(html);
    },
    // informational notif
    Info: function (success, autohide, seconds, flash) {
        var $container = $(".notifications");
        if ($container.length == 0) {
            var $pageheader = $(".page-heading");
            if ($pageheader.length == 0) {
                $container = $("<div class='notifications'></div>").prependTo($("#content-container"));
            } else {
                $container = $("<div class='notifications'></div>").appendTo($pageheader);
            }
        }

        $container.find(".notification").slideUp().remove();
        if (typeof success !== typeof undefined && success !== false && success != null && success != '') {
            var $alert = $("<div class='notification alert alert-info info alert-dismissible' role='alert'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" + success + "</div>")
                .on('closed.bs.alert', function () {
                    if ($container.find(".notification").length == 0) $container.hide();
                }).prependTo($container);
            $container.show();

            if (flash) {
                $alert.addClass('flash-notification');
            }
            if (autohide) {
                setTimeout(function () {
                    $alert.slideUp(100).remove();
                    if ($container.find(".notification").length == 0) $container.hide();
                }, seconds);
            }
        }
    }
}