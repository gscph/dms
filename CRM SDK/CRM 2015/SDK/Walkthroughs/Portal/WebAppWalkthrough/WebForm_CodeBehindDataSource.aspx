<%@ Page Title="" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="WebForm_CodeBehindDataSource.aspx.cs" Inherits="WebAppWalkthrough.WebForm_CodeBehind" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server" />
<asp:Content ContentPlaceHolderID="MainContent" runat="server">
	<asp:GridView ID="ContactsGridView" AutoGenerateColumns="false" runat="server">
		<Columns>
			<asp:TemplateField HeaderText="First Name">
				<ItemTemplate>
					<asp:Label Text='<%# Eval("firstname")%>' runat="server" />
				</ItemTemplate>
			</asp:TemplateField>
			<asp:TemplateField HeaderText="Last Name">
				<ItemTemplate>
					<asp:Label Text='<%# Eval("lastname") %>' runat="server" />
				</ItemTemplate>
			</asp:TemplateField>
			<asp:TemplateField HeaderText="City">
				<ItemTemplate>
					<asp:Label Text='<%# Eval("address1_city") %>' runat="server" />
				</ItemTemplate>
			</asp:TemplateField>
		</Columns>
	</asp:GridView>
</asp:Content>
