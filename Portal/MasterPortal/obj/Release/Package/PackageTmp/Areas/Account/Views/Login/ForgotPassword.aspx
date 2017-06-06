<%@ Page Title="" Language="C#" MasterPageFile="Login.Master" Inherits="System.Web.Mvc.ViewPage<Site.Areas.Account.ViewModels.ForgotPasswordViewModel>" %>

<asp:Content ContentPlaceHolderID="PageCopy" runat="server">
    <%: Html.HtmlSnippet("Account/ForgotPassword/PageCopy", "page-copy") %>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <br />
    <br />
    <% using (Html.BeginForm("ForgotPassword", "Login"))
       { %>
    <%: Html.AntiForgeryToken() %>
    <!--<div class="form-horizontal">
        <fieldset>-->
    <!--<legend><%: Html.TextSnippet("Account/PasswordReset/ForgotPasswordFormHeading", defaultValue: "Forgot your password?", tagName: "span") %></legend>-->
    <p class="login-box-msg">
        <%: Html.TextSnippet("Account/SignIn/SignInLocalFormHeading", defaultValue: "Forgot your password?", tagName: "span") %>
    </p>
    <%: Html.ValidationSummary(string.Empty, new {@class = "alert alert-block alert-danger"}) %>
    <br />
    <div class="form-group">
        <!--<label class="col-sm-2 control-label" for="Email"><%: Html.TextSnippet("Account/PasswordReset/EmailLabel", defaultValue: "Email", tagName: "span") %></label>-->
        <!--<div class="col-sm-12">-->
        <%: Html.TextBoxFor(model => model.Email, new { @class = "form-control", @placeholder = "Enter email address here" }) %>
        <p class="help-block"><%: Html.TextSnippet("Account/PasswordReset/EmailInstructionsText", defaultValue: "Enter your email address to request a password reset.", tagName: "span") %></p>
        <!--</div>-->
    </div>
    <!--<div class="form-group">
                <div class="col-sm-offset-4 col-sm-8">
                    <a href="/Account/Login" class="btn btn-primary btn-block btn-flat" style="margin-left:5px">Back</a>
                    <button id="submit-forgot-password" class="btn btn-primary pull-right"><%: Html.SnippetLiteral("Account/PasswordReset/ForgotPasswordButtonText", "Send") %></button>
                  
               </div>
            </div>-->
           <br />
    <div class="row">
        <div class="col-md-6 col-xs-12">
            <button id="submit-forgot-password" class="btn btn-default btn-block btn-flat" style="border: none;"><%: Html.SnippetLiteral("Account/PasswordReset/ForgotPasswordButtonText", "Send") %></button>
        </div>
        <div class="col-md-6 col-xs-12">
            <a href="/Account/Login" class="btn btn-default btn-block btn-flat" style="margin-left: 5px; border: none;">Back</a>
        </div>

    </div>
 <%--   </div>--%>
        <!--</fieldset>
    </div>-->
    <% } %>
    <script type="text/javascript">

        $(document).ready(function () {
            $('.validation-summary-valid').hide();
        });

        $('#back').click(function () {
            window.location.href = "/Account/Login";
        })

        $(function () {
            $("#submit-forgot-password").click(function () {
                $.blockUI({ message: null, overlayCSS: { opacity: .3 } });
            });

            $('.login-box-body').attr('style', 'padding-top: 0px;');
        });
    </script>
</asp:Content>
