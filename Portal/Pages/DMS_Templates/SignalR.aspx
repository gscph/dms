<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-FormsContent.master" AutoEventWireup="true" CodeBehind="SignalR.aspx.cs" Inherits="Site.Pages.DMS_Templates.SignalR" %>

<%@ Import Namespace="Adxstudio.Xrm.Web.Mvc.Html" %>


<asp:Content ID="Content1" ContentPlaceHolderID="Head" runat="server">
    <link href="~/css/dms/handsontable.full.min.css" rel="stylesheet" />
    <link href="~/css/dms/entity-form.css" rel="stylesheet" />
    <link href="~/css/dms/handsontable.bootstrap.css" rel="stylesheet" />
    <style>
        .no-border {
            border: none;
            margin-left: 0px;
            padding-left: 0px;
        }
    </style>
    <script>
        var userId = "<%: Html.AttributeLiteral(Html.PortalUser(), "contactid") %>"; 
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="Breadcrumbs" runat="server">
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PageHeader" runat="server">
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="MainContent" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="EntityControls" runat="server">
    <div id="loader">
        <span class="fa fa-spinner fa-spin fa-4x loader-color"></span>
    </div>
    <h1 id="EntityListTitle" class="hidden">
        <adx:Property PropertyName="adx_title,adx_name" DataItem='<%$ CrmSiteMap: Current %>' runat="server" />
    </h1>
    <script type="text/javascript">
        function entityFormClientValidate() {
            // Custom client side validation. Method is called by the submit button's onclick event.
            // Must return true or false. Returning false will prevent the form from submitting.   
            var button = $('<button type="button" class="close">&times;</button>');

            $(button).on('click', function () {
                $('#ValidationSummaryEntityFormView').hide();
            });

            setTimeout(function () {
                $('#ValidationSummaryEntityFormView').prepend(button);
            }, 500);

            setTimeout(function () {
                $('#ValidationSummaryEntityFormView').hide();
            }, 10000);

            return true;
        }
    </script>
    <div class="content-wrapper">
        <div id="mainContents">
            <div class="notifications"></div>
            <div id="currentPage"></div>
            <crm:CrmEntityDataSource ID="CurrentEntity" DataItem="<%$ CrmSiteMap: Current %>" runat="server" />
            <!-- Render the Title property, falling back to the Name property if Title is null -->
            <section class="content">
                <adx:EntityForm ID="EntityForm1"
                    runat="server"
                    FormCssClass="crmEntityFormView"
                    PreviousButtonCssClass="btn btn-primary"
                    NextButtonCssClass="btn btn-primary"
                    SubmitButtonCssClass="btn btn-primary"
                    ClientIDMode="Static"
                    OnItemSaved="OnItemSaved"                                      
                    LanguageCode="<%$ SiteSetting: Language Code, 0 %>"
                    PortalName="<%$ SiteSetting: Language Code %>" />
            </section>
        </div>
    </div>

    <%--<script src="~/js/dms/handsontable.full.js"></script>--%>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/handsontable/0.28.2/handsontable.full.js"></script>
    <script>
        numbro.language('fil-PH', {
            delimiters: {
                thousands: ',',
                decimal: '.'
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            ordinal: function (number) {
                var b = number % 10;
                return (~~(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
            },
            currency: {
                symbol: '₱'
            }
        });
    </script>
    <script src="~/js/dms/accordion.js"></script>
    <script src="~/js/dms/multi-select.js"></script>
</asp:Content>
<asp:Content ID="Content7" ContentPlaceHolderID="Scripts" runat="server">
    <%--<script src="~/js/dms/jquery.signalR-2.0.0.min.js"></script>
    <script src="~/signalr/hubs"></script>
    <script>
        var userFullName = "<%: Html.AttributeLiteral(Html.PortalUser(), "fullname") ?? "" %>";
        var imgUrl = "<%: Html.AttributeLiteral(Html.PortalUser(), "gsc_userimageurl") ?? "~/css/images/default.png" %>";
        $(function () {
            // Reference the auto-generated proxy for the hub.  
            var sales = $.connection.salesHub;
            var pages;
            var currentPage = window.location.href.split('#')[0];          

            //// check if something has changed 
            sales.client.pendingChanges = function (url, clientId, clientFullName) {
                if (url == currentPage && clientId !== userId) {
                    DMS.Notification.Warning(clientFullName + ' had changes to the record. Performing Auto Refresh in 5 seconds');
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

                // check Notification Type
                if (updateType == 1 && userId != currentlyUsedWebPageModel.User) {
                    DMS.Notification.Info(currentlyUsedWebPageModel.UserFullName + ' has also viewed the record.', true, 5000);
                }

                if (updateType == 3) {                   
                    DMS.Notification.Info(currentlyUsedWebPageModel.UserFullName + " has been disconnected due to inactivity.", true, 5000);
                }

                if (updateType == 4) {
                    DMS.Notification.Info(currentlyUsedWebPageModel.UserFullName + " has left the page.", true, 5000);
                }              
                // - end check Notification Type

                $('table[data-name=UserList] tbody tr td:first').html('<span class="fa fa fa-spinner fa-spin" style="font-size:10px;float:left;margin-top:5px; margin-left: 5px;"></span>');
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
                        // single page
                        var myPages = result.filter(function (itm, i, a) {
                            return itm.User == userId;
                        });

                        if (myPages.length > 0) {
                            // its my page
                            EnableForm();
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
                            EnableForm();
                        }
                        else {
                            // mid/bottom of the queue
                            DisableForm();
                        }
                    }
                }).error(function (err) {
                    console.error('error occured while getting currently used web page');
                    console.error(err);
                });
            };

            // Start the connection.
            $.connection.hub.start().done(function () {
                $('table[data-name=UserList] tbody tr td:first').html('<span class="fa fa fa-spinner fa-spin" style="font-size:10px;float:left;margin-top:5px; margin-left: 5px;"></span>');
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
                            // meron akong existing na page                          
                            queue = myPages[0].Queue;
                            EnableForm();

                            if (queue > 0) {
                                DisableForm();
                                DMS.Notification.Error('This form is currently locked', true, 10000);
                            }                            

                            tryUpdateConnection(connId, myPages[0].Id, currentPage);
                        }
                        else {
                            // doesn't have exsiting pages
                            queue = result.length;
                            DisableForm();
                            tryInsertPage(connId, queue, currentPage);
                            DMS.Notification.Error('This form is currently locked', true, 10000);
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

        function HookSavingEventInForm(queue) {
            if (queue == 0) {
                $("#content_form").bind('ajax:complete', function () {
                                       

                });
            }
        }

        function ForceLogOut(hubInstance) {
            DisableForm();
            DMS.Notification.Error('Your Session has ended. Logging out..');
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
            $('table[data-name=UserList] tbody tr td:first').html('');
            $('table[data-name=UserList] tbody tr td:first').append(ul);
        }
    </script>--%>


    <script src="~/js/dms/select2-editor.js"></script>
    <script src="~/js/dms/hot-renderers.js"></script>
    <script src="~/js/dms/edit-on-doubleclick.js"></script>
    <script src="~/js/dms/generic-grid.js"></script>
    <script src="~/js/dms/currency-fields.js"></script>
    <script src="~/js/dms/datepicker-reinit.js"></script>
    <script src="~/js/dms/entity-form.js"></script>
    <script src="~/js/dms/computation-total.js"></script>
    <script src="~/js/dms/primary-field.js"></script>
    <script src="~/js/dms/modal-customization.js"></script>
    <script src="~/js/dms/subgrid-counter.js"></script>
</asp:Content>
