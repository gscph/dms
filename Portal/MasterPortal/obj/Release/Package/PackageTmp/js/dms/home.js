$('.profile-img-container').hover(function () {
    $(this).find('img').fadeTo(500, 0.5);
}, function () {
    $(this).find('img').fadeTo(500, 1);
});


$('.sidebar-toggle').on('click', function () {
    setTimeout(function () {
        $(document).trigger('sidebarSizeChanged');
    }, 100);
});

$(document).ready(function () {
    $(document).ready(function () {
        $('.scroll-down span').on('mouseover', function () {
            $('.sidebar').animate({ scrollTop: 150 }, 300);
        });
    });


    $('#userInfo').html(DMS.Settings.User.branch);
    $('.userPosition').html(DMS.Settings.User.positionName);


    $('.sidebar-menu .treeview-menu .treeview-menu li.active').each(function () {
        $(this).closest('li.treeview').addClass('active');
    });

    $('.sidebar-menu .treeview-menu li.active').each(function () {
        $(this).closest('li.treeview').addClass('active');
    });
});

function ToggleOffCanvas() {

    var isCollapsed = $('body').hasClass('sidebar-collapse');

    if (isCollapsed) {
        $('body').removeClass('sidebar-collapse');
    }

    $(document).trigger('sidebarSizeChanged');

}

$(document).ready(function () {
    //  myFunction();
    $(document).trigger("initializeEditableGrid");
});