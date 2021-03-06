﻿<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPages/DMS-Profile.master" AutoEventWireup="true" CodeBehind="Profile.aspx.cs" Inherits="Site.Pages.DMS_Templates.Profile" %>


<%@ Import Namespace="Microsoft.Xrm.Sdk" %>


<asp:Content ID="Content5" ContentPlaceHolderID="EntityControls" runat="server">

</asp:Content>

<asp:Content ContentPlaceHolderID="ContentBottom" ViewStateMode="Enabled" runat="server">
    <asp:Panel ID="ConfirmationMessage" runat="server" CssClass="alert alert-success alert-block" Visible="False">
        <a class="close" data-dismiss="alert" href="#">&times;</a>
        <adx:Snippet runat="server" SnippetName="Profile Update Success Text" DefaultText="Your profile has been updated successfully." Editable="true" EditType="html" />
    </asp:Panel>

    <asp:Panel ID="MissingFieldsMessage" runat="server" CssClass="alert alert-danger alert-block" Visible="False">
        <a class="close" data-dismiss="alert" href="#">&times;</a>
        <adx:Snippet runat="server" SnippetName="Force Sign-Up Profile Explanation" DefaultText="You must complete your profile before using the features of this website." Editable="true" EditType="html" />
    </asp:Panel>

    <asp:Panel ID="ProfileAlertInstructions" runat="server" CssClass="alert alert-warning alert-block" Visible="False">
        <a class="close" data-dismiss="alert" href="#">&times;</a>
        <asp:Label runat="server" Text='<%$ Context: Property=User, Attribute=adx_profilealertinstructions %>' />
    </asp:Panel>

    <fieldset>      

        <adx:CrmDataSource ID="ProfileDataSource" runat="server" CrmDataContextName="<%$ SiteSetting: Language Code %>" />
        <adx:CrmEntityFormView ID="ProfileFormView" runat="server"
            DataSourceID="ProfileDataSource"
            CssClass="crmEntityFormView"
            EntityName="contact"
            FormName="Custom Profile Form"
            OnItemUpdated="OnItemUpdated"
            OnItemUpdating="OnItemUpdating"
            ValidationGroup="Profile"
            ValidationSummaryCssClass="alert alert-danger alert-block"
            RecommendedFieldsRequired="True"
            ShowUnsupportedFields="False"
            ToolTipEnabled="False"
            ClientIDMode="Static"
            Mode="Edit"
            LanguageCode="<%$ SiteSetting: Language Code, 0 %>"
            ContextName="<%$ SiteSetting: Language Code %>">
            <UpdateItemTemplate>
            </UpdateItemTemplate>
        </adx:CrmEntityFormView>
    </fieldset>

    <asp:Panel ID="MarketingOptionsPanel" Visible="false" runat="server">
        <fieldset>
            <legend>
                <adx:Snippet runat="server" SnippetName="Profile/MarketingPref" DefaultText="How may we contact you? <small>Select all that apply.</small>" Editable="True" EditType="text" />
            </legend>
            <div class="form-horizontal">
                <div class="form-group">
                    <div class="col-sm-12">
                        <div class="checkbox">
                            <label>
                                <asp:CheckBox runat="server" ID="marketEmail" />
                                <adx:Snippet runat="server" SnippetName="Profile/MarketEmail" DefaultText="Email" Editable="True" EditType="text" />
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <asp:CheckBox runat="server" ID="marketFax" />
                                <adx:Snippet runat="server" SnippetName="Profile/MarketFax" DefaultText="Fax" Editable="True" EditType="text" />
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <asp:CheckBox runat="server" ID="marketPhone" />
                                <adx:Snippet runat="server" SnippetName="Profile/MarketPhone" DefaultText="Phone" Editable="True" EditType="text" />
                            </label>
                        </div>
                        <div class="checkbox">
                            <label>
                                <asp:CheckBox runat="server" ID="marketMail" />
                                <adx:Snippet runat="server" SnippetName="Profile/MarketMail" DefaultText="Mail" Editable="True" EditType="text" />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </fieldset>
    </asp:Panel>

    <asp:Panel ID="MarketingLists" Visible="false" runat="server">
        <fieldset>
            <legend>
                <adx:Snippet runat="server" SnippetName="Profile Marketing Lists Title Text" DefaultText="Subscribe to the following email lists" Editable="true" EditType="text" />
            </legend>
            <div class="form-horizontal">
                <div class="form-group">
                    <div class="col-sm-12">
                        <asp:ListView ID="MarketingListsListView" runat="server">
                            <LayoutTemplate>
                                <ul class="list-unstyled">
                                    <asp:PlaceHolder ID="ItemPlaceholder" runat="server" />
                                </ul>
                            </LayoutTemplate>
                            <ItemTemplate>
                                <li>
                                    <div class="checkbox">
                                        <label>
                                            <asp:CheckBox ID="ListCheckbox" runat="server" Checked='<%# IsListChecked(Container.DataItem) %>' />
                                            <asp:HiddenField ID="ListID" Value='<%# ((Entity)Container.DataItem).GetAttributeValue<Guid>("listid") %>' runat="server" />
                                            <%# ((Entity)Container.DataItem).GetAttributeValue<string>("listname") %> &ndash; <%# ((Entity)Container.DataItem).GetAttributeValue<string>("purpose") %>
                                        </label>
                                    </div>
                                </li>
                            </ItemTemplate>
                        </asp:ListView>
                    </div>
                </div>
            </div>
        </fieldset>
    </asp:Panel>

    <div class="crmEntityFormView">
       <%-- <div class="actions">--%>
            <asp:Button ID="SubmitButton" Text='<%$ Snippet: Profile Submit Button Text, UPDATE %>' CssClass="btn btn-danger" OnClientClick="clearCacheWithDelay()" OnClick="SubmitButton_Click" ValidationGroup="Profile" runat="server" />
        <%--</div>--%>
    </div>
</asp:Content>
