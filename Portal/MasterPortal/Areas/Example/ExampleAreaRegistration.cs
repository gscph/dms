using System.Web.Mvc;

namespace Site.Areas.Example
{
    public class ExampleAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "Example";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "Example_default",
                "Example/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );
        }
    }
}