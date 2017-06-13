using System;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using System.Web.Routing;
using Adxstudio.Xrm.AspNet;
using Adxstudio.Xrm.AspNet.Cms;
using Adxstudio.Xrm.AspNet.Identity;
using Adxstudio.Xrm.AspNet.Organization;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;
using Microsoft.Owin.Security;
using Microsoft.Xrm.Portal.Configuration;
using System.Configuration;
using System.ServiceModel;
using System.ServiceModel.Description;
using System.Text;
using Site.Areas.DMSApi;
// These namespaces are found in the Microsoft.Xrm.Sdk.dll assembly
// found in the SDK\bin folder.
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Client;
using Microsoft.Crm.Sdk.Messages;
using System.Collections.Generic;
using Site.Areas.DMS_Api;
using System.Xml;

namespace Site.Areas.Account.Models
{
    // Configure the application user manager used in this application. UserManager is defined in ASP.NET Identity and is used by the application.

    public class ApplicationUserManager : CrmUserManager<ApplicationUser, string>
    {
        public ApplicationUserManager(IUserStore<ApplicationUser> store, MembershipProviderMigrationStore<string> migrationStore, CrmIdentityErrorDescriber identityErrors)
            : base(store, migrationStore, identityErrors)
        {
        }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
        {
            var dbContext = context.Get<ApplicationDbContext>();
            var website = context.Get<ApplicationWebsite>();



            var manager = new ApplicationUserManager(
                new UserStore<ApplicationUser>(dbContext, website.GetCrmUserStoreSettings()),
                website.GetMembershipProviderMigrationStore(dbContext),
                website.GetCrmIdentityErrorDescriber());

            // Configure default validation logic for usernames
            var userValidator = manager.UserValidator as UserValidator<ApplicationUser, string>;

            if (userValidator != null)
            {
                userValidator.AllowOnlyAlphanumericUserNames = false;
                userValidator.RequireUniqueEmail = false;
            }

            // Configure default validation logic for passwords
            var passwordValidator = manager.PasswordValidator as PasswordValidator;

            if (passwordValidator != null)
            {
                passwordValidator.RequiredLength = 6;
                passwordValidator.RequireNonLetterOrDigit = false;
                passwordValidator.RequireDigit = false;
                passwordValidator.RequireLowercase = false;
                passwordValidator.RequireUppercase = false;
            }

            // Configure user lockout defaults
            manager.UserLockoutEnabledByDefault = true;
            manager.DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(5);
            manager.MaxFailedAccessAttemptsBeforeLockout = 5;

            // Register two factor authentication providers. This application uses Phone and Emails as a step of receiving a code for verifying the user
            // You can write your own provider and plug in here.
            manager.RegisterTwoFactorProvider("PhoneCode", new CrmPhoneNumberTokenProvider<ApplicationUser, string>(context.Get<ApplicationOrganizationManager>()));
            manager.RegisterTwoFactorProvider("EmailCode", new CrmEmailTokenProvider<ApplicationUser, string>(context.Get<ApplicationOrganizationManager>()));
            manager.EmailService = new EmailService();
            manager.SmsService = new SmsService();

            var dataProtectionProvider = options.DataProtectionProvider;

            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider =
                    new DataProtectorTokenProvider<ApplicationUser>(dataProtectionProvider.Create("ASP.NET Identity"));
            }

            var claimsIdentityFactory = new CrmClaimsIdentityFactory<ApplicationUser, string>(context.Authentication, dbContext)
            {
                KeepExternalLoginClaims = true,
                ClaimAttributes = new[] { "firstname", "lastname" },
            };

            manager.ClaimsIdentityFactory = claimsIdentityFactory;

            manager.Configure(website);

            return manager;
        }
    }

    public class EmailTemplate
    {
        public string Body { get; set; }
        public string Subject { get; set; }
    }

    public class EmailService : IIdentityMessageService
    {
        XrmConnection _service = new XrmConnection();
        public EmailTemplate Template
        {
            get
            {
                QueryExpression exp = new QueryExpression("template");
                exp.ColumnSet = new ColumnSet("subjectpresentationxml", "presentationxml");
                exp.Criteria.AddCondition("templatetypecode", ConditionOperator.Equal, 8);
                exp.Criteria.AddCondition("title", ConditionOperator.Equal, "Password Reset Notification");
                EntityCollection template = _service.ServiceContext.RetrieveMultiple(exp);

                XmlDocument subjectXml = new XmlDocument();
                subjectXml.LoadXml(template.Entities[0].GetAttributeValue<string>("subjectpresentationxml"));

                XmlDocument bodyXml = new XmlDocument();
                bodyXml.LoadXml(template.Entities[0].GetAttributeValue<string>("presentationxml"));

                return new EmailTemplate
                {
                    Subject = subjectXml.DocumentElement.InnerText,
                    Body = bodyXml.DocumentElement.InnerText,
                };
            }
        }

        public string GetFullname(string userId)
        {
            Entity user = _service.ServiceContext.Retrieve("contact", new Guid(userId), new ColumnSet("fullname"));

            return user.GetAttributeValue<string>("fullname") ?? "User";
        }

        public string RenderBodyTemplate(IdentityMessage message, EmailTemplate template)
        {            

            int fullnameIndex = template.Body.IndexOf("{fullname}");

            template.Body = template.Body.Insert(fullnameIndex, GetFullname(message.Subject));

            int linkIndex = template.Body.IndexOf("{link}");

            template.Body = template.Body.Insert(linkIndex, "<a href=\"" + message.Body + "\">Reset Password</a>");

            int linkCopyIndex = template.Body.IndexOf("{link-copy}");

            template.Body = template.Body.Insert(linkCopyIndex, message.Body);

            fullnameIndex = template.Body.IndexOf("{fullname}");

            template.Body = template.Body.Remove(fullnameIndex, 10);

            linkIndex = template.Body.IndexOf("{link}");

            template.Body = template.Body.Remove(linkIndex, 6);

            linkCopyIndex = template.Body.IndexOf("{link-copy}");

            template.Body = template.Body.Remove(linkCopyIndex, 11);

            return template.Body;
        }

        public Task SendAsync(IdentityMessage message)
        {           

            Entity fromParty = new Entity("activityparty");

            WhoAmIRequest systemUserRequest = new WhoAmIRequest();
            WhoAmIResponse systemUserResponse = (WhoAmIResponse)_service.ServiceContext.Execute(systemUserRequest);

            fromParty["partyid"] = new EntityReference("systemuser", systemUserResponse.UserId);

            Entity toParty = new Entity("activityparty");
            toParty["addressused"] = message.Destination;

            Entity email = new Entity("email");
            email["from"] = new Entity[] { fromParty };
            email["to"] = new Entity[] { toParty };

            EmailTemplate template = this.Template;         


            email["subject"] = template.Subject;
            email["description"] = RenderBodyTemplate(message, template); ;
            email["directioncode"] = true;

            Guid emailId = _service.ServiceContext.Create(email);

            _service.ServiceContext.Execute(new SendEmailRequest
            {
                EmailId = emailId,
                TrackingToken = "",
                IssueSend = true
            });

            return Task.FromResult(0);
        }
    }

    public class SmsService : IIdentityMessageService
    {
        public Task SendAsync(IdentityMessage message)
        {
            string hello = message.Destination;
            string hey = message.Body;
            string hoy = message.Subject;

            //SendEmailFromTemplateRequest newEmail = new SendEmailFromTemplateRequest { 
            //    Target = new Email
            //};
            // Plug in your sms service here to send a text message.
            return Task.FromResult(0);
        }
    }

    public class ApplicationSignInManager : CrmSignInManager<ApplicationUser, string>
    {
        public ApplicationSignInManager(
            ApplicationUserManager userManager,
            IAuthenticationManager authenticationManager,
            MembershipProviderMigrationStore<string> migrationStore)
            : base(userManager, authenticationManager, migrationStore)
        {
        }

        public static ApplicationSignInManager Create(IdentityFactoryOptions<ApplicationSignInManager> options, IOwinContext context)
        {
            var manager = new ApplicationSignInManager(
                context.GetUserManager<ApplicationUserManager>(),
                context.Authentication,
                context.Get<ApplicationWebsite>().GetMembershipProviderMigrationStore(context.Get<ApplicationDbContext>()));

            return manager;
        }

        public override Task<ClaimsIdentity> CreateUserIdentityAsync(ApplicationUser user)
        {
            return user.GenerateUserIdentityAsync(UserManager);
        }
    }

    public class ApplicationInvitationManager : InvitationManager<ApplicationInvitation, string>
    {
        public ApplicationInvitationManager(IInvitationStore<ApplicationInvitation, string> store, CrmIdentityErrorDescriber identityErrors)
            : base(store, identityErrors)
        {
        }

        public static ApplicationInvitationManager Create(IdentityFactoryOptions<ApplicationInvitationManager> options, IOwinContext context)
        {
            return new ApplicationInvitationManager(
                new InvitationStore(context.Get<ApplicationDbContext>()),
                context.Get<ApplicationWebsite>().GetCrmIdentityErrorDescriber());
        }
    }

    public class ApplicationOrganizationManager : OrganizationManager
    {
        public ApplicationOrganizationManager(IOrganizationStore store)
            : base(store)
        {
        }

        public static ApplicationOrganizationManager Create(IdentityFactoryOptions<ApplicationOrganizationManager> options, IOwinContext context)
        {
            return new ApplicationOrganizationManager(new OrganizationStore(context.Get<ApplicationDbContext>()));
        }
    }

    public class ApplicationWebsite : CrmWebsite<string>, IDisposable
    {
        public static ApplicationWebsite Create(IdentityFactoryOptions<ApplicationWebsite> options, IOwinContext context)
        {
            var websiteManager = context.Get<ApplicationWebsiteManager>();
            return websiteManager.Find(context);
        }

        void IDisposable.Dispose() { }
    }

    public class ApplicationWebsiteManager : WebsiteManager<ApplicationWebsite, string>
    {
        public ApplicationWebsiteManager(IWebsiteStore<ApplicationWebsite, string> store)
            : base(store)
        {
        }

        public static ApplicationWebsiteManager Create(ApplicationDbContext dbContext)
        {
            return CreateWebsiteManager(dbContext);
        }

        public static ApplicationWebsiteManager Create(IdentityFactoryOptions<ApplicationWebsiteManager> options, IOwinContext context)
        {
            return CreateWebsiteManager(context.Get<ApplicationDbContext>());
        }

        private static ApplicationWebsiteManager CreateWebsiteManager(ApplicationDbContext dbContext)
        {
            var manager = new ApplicationWebsiteManager(new CrmWebsiteStore<ApplicationWebsite, string>(dbContext))
            {
                WebsiteName = GetWebsiteName()
            };

            return manager;
        }

        private static string GetWebsiteName()
        {
            var portal = PortalCrmConfigurationManager.GetPortalContextElement("Xrm");
            return portal == null ? null : portal.Parameters["websiteName"];
        }
    }

    public class ApplicationPortalContextManager : PortalContextManager<ApplicationWebsite, ApplicationUser, string>
    {
        public static ApplicationPortalContextManager Create(IdentityFactoryOptions<ApplicationPortalContextManager> options, IOwinContext context)
        {
            return new ApplicationPortalContextManager();
        }
    }

    public class ApplicationPortalCrmConfigurationProvider : PortalCrmConfigurationProvider<ApplicationWebsite, ApplicationUser, string>
    {
        protected override PortalContextManager<ApplicationWebsite, ApplicationUser, string> GetPortalContextManager(RequestContext request)
        {
            return request.HttpContext.GetOwinContext().Get<ApplicationPortalContextManager>();
        }

        protected override WebsiteManager<ApplicationWebsite, string> GetWebsiteManager(RequestContext request)
        {
            return request.HttpContext.GetOwinContext().Get<ApplicationWebsiteManager>();
        }

        protected override UserManager<ApplicationUser, string> GetUserManager(RequestContext request)
        {
            return request.HttpContext.GetOwinContext().Get<ApplicationUserManager>();
        }
    }

    public class ApplicationStartupSettingsManager : StartupSettingsManager<ApplicationUserManager, ApplicationWebsite, ApplicationUser, string>
    {
        public ApplicationStartupSettingsManager(
            ApplicationWebsite website,
            Func<ApplicationUserManager, ApplicationUser, Task<ClaimsIdentity>> regenerateIdentityCallback,
            PathString loginPath,
            PathString externalLoginCallbackPath)
            : base(website, regenerateIdentityCallback, loginPath, externalLoginCallbackPath)
        {
        }

        protected override CrmDbContext GetDbContext(IOwinContext context)
        {
            return context.Get<ApplicationDbContext>();
        }
    }
}