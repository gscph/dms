using Adxstudio.Xrm.AspNet.Cms;
using Adxstudio.Xrm.AspNet.PortalBus;
using Microsoft.AspNet.SignalR;
using Owin;

namespace Site
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            if (SetupConfig.OwinEnabled())
            {
                ConfigureAuth(app);
            }

            app.UseApplicationRestartPluginMessage(new PluginMessageOptions());
            app.UsePortalBus<ApplicationRestartPortalBusMessage>();
            app.UsePortalBus<CacheInvalidationPortalBusMessage>();
            // DMS SignalR

            //

            //GlobalHost.DependencyResolver.UseSqlServer(ConfigurationManager.ConnectionStrings["Xrm"].ConnectionString.ToString(););
            //this.ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
