using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Site.Areas.DMS_Api.Controllers
{
    public class DataController : Controller
    {
        //
        // GET: /DMS_Api/Data/
        public ActionResult GetData(string entityName)
        {
            return View();
        }
	}
}