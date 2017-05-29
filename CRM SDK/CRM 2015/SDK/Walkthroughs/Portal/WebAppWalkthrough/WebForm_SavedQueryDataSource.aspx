<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="WebForm_SavedQueryDataSource.aspx.cs" Inherits="WebAppWalkthrough.WebForm_SavedQueryDataSource" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server" />
<asp:Content ContentPlaceHolderID="MainContent" runat="server">
	<crm:SavedQueryDataSource ID="ActiveContacts" SavedQueryName="Active Contacts" runat="server" />
	<asp:GridView DataSourceID="ActiveContacts" runat="server" />
</asp:Content>
