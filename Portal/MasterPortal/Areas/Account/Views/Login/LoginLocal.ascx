<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Site.Areas.Account.ViewModels.LoginViewModel>" %>

<%@ Import Namespace="System.Configuration" %>

<% using (Html.BeginForm("Login", "Login", new { area = "Account", ReturnUrl = ViewBag.ReturnUrl, InvitationCode = ViewBag.InvitationCode }))
   { %>

<%: Html.AntiForgeryToken() %>

<!--<div class="form-horizontal">
    <fieldset>-->
<%: Html.ValidationSummary(true, string.Empty, new {@class = "alert alert-block alert-danger padding-left-0"}) %>
<% if (ViewBag.Settings.LocalLoginByEmail)
   { %>
<%--<div class="form-group">
           <legend>
                <%: Html.TextSnippet("Account/SignIn/SignInLocalFormHeading", defaultValue: "Dealership Management System", tagName: "span") %>
            </legend>

        </div>--%>

<div class="form-group">
    <label class="col-sm-4 control-label" for="Email"><%: Html.TextSnippet("Account/SignIn/EmailLabel", defaultValue: "Email", tagName: "span") %></label>
    <div class="col-sm-8">
        <%: Html.TextBoxFor(model => model.Email, new { @class = "form-control" }) %>
    </div>
</div>
<% }
   else
   { %>
<div class="form-group">
    <!--<label class="col-sm-4 control-label" for="Username"><%: Html.TextSnippet("Account/SignIn/UsernameLabel", defaultValue: "Username", tagName: "span") %></label>-->
    <!--<div class="col-sm-8">-->
    <%: Html.TextBoxFor(model => model.Username, new { @class = "form-control input-sm login-input", @placeholder = "User Name" }) %>
    <!--</div>-->
</div>
<% } %>
<div class="form-group">
    <!--<label class="col-sm-4 control-label" for="Password"><%: Html.TextSnippet("Account/SignIn/PasswordLabel", defaultValue: "Password", tagName: "span") %></label>-->
    <!--<div class="col-sm-8">-->
    <%: Html.PasswordFor(model => model.Password, new { @class = "form-control input-sm login-input", @placeholder = "Password" }) %>
</div>
<div class="row" style="margin-top: 20px;">  
    <div class="col-md-12">
        <button id="submit-signin-local" class="btn btn-default btn-flat btn-block login-button " style="border: none;"><%: Html.SnippetLiteral("Account/SignIn/SignInLocalButtonText", "LOGIN") %></button>
    </div>
</div>
<div class="row">
    <div class="col-md-6 col-sm-6 col-xs-6">
        <div class="checkbox">
            <label>
                <%: Html.CheckBoxFor(model => model.RememberMe) %>
<div style="padding-top:2px;">
                <%: Html.TextSnippet("Account/SignIn/RememberMeLabel", defaultValue: "Stay signed in", tagName: "span") %></div>
            </label>
        </div>
    </div>
    <div class="col-md-6 col-sm-6 col-xs-6 forgot-password">
        <a href="<%: Url.Action("ForgotPassword") %>" style="color:red;font-size:12px">Forgot Password?</a><br>
    </div>
</div>
<div class="row" style="margin-top: 20px;">
     <div class="col-md-12" style="font-size: 11px;text-align:center">
         <p>Problems signing in to your account? Contact your system administrator to help you out. </p>
      
     </div>
</div>
<!--</div>-->
<% if (ViewBag.Settings.RememberMeEnabled)
   { %>
<!--<div class="form-group">
            <div class="col-sm-offset-4 col-sm-8">
                <div class="checkbox">
                    <label>
                        <%: Html.CheckBoxFor(model => model.RememberMe) %>
                        <%: Html.TextSnippet("Account/SignIn/RememberMeLabel", defaultValue: "Remember me?", tagName: "span") %>
                    </label>
                </div>
            </div>
        </div>-->
<% } %>
<!--<div class="form-group">
            <div class="col-sm-4 col-xs-12">
                 <button id="submit-signin-local" class="btn btn-info"><%: Html.SnippetLiteral("Account/SignIn/SignInLocalButtonText", "Sign in") %></button>
            </div>
            <div class="col-sm-8 col-xs-12">
                <% if (ViewBag.Settings.ResetPasswordEnabled)
                   { %>
                <a class="btn btn-default pull-right" href="<%: Url.Action("ForgotPassword") %>"><%: Html.SnippetLiteral("Account/SignIn/PasswordResetLabel", "Forgot Your Password?") %></a>
                <% } %>               
            </div>
        </div>-->
<!--</fieldset>
</div>-->
<% } %>
<script type="text/javascript">
    $(function () {
        $("#submit-signin-local").click(function () {
            $.blockUI({ message: null, overlayCSS: { opacity: .3 } });
        });
    });
</script>
