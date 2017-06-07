using Site.Areas.DMS_Api.XrmWebService;
using Site.Areas.DMSApi;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Site.Areas.DMS_Api.Controllers
{
    public class FileUploadController : Controller
    {
        private readonly XrmConnection _conn = new XrmConnection();
        //
        // GET: /DMS_Api/FileUpload/
        [HttpPost]
        public ActionResult UpdateUserImage(string userFileName, Guid userId)
        {
            try
            {
                foreach (string item in Request.Files)
                {
                    HttpPostedFileBase file = Request.Files[item] as HttpPostedFileBase;

                    string UploadPath = "~/images/users";

                    if (file.ContentLength == 0)
                        continue;
                    if (file.ContentLength > 0)
                    {                        
                        userFileName = userFileName + Path.GetExtension(file.FileName);
                        string path = Path.Combine(HttpContext.Request.MapPath(UploadPath), userFileName);                      

                        string userImagePath =  String.Format("{0}/{1}", UploadPath, userFileName);
                        
                        var service = new UserManager(_conn);
                        service.UpdateUserImageUrl(userId, userImagePath);

                        file.SaveAs(path);
                    }
                }
                return Json("");
            }
            catch (Exception ex)
            {               
                return Json(ex);
            }           
        }
        [HttpPost]
        public ActionResult Upload(string recordId = null)
        {
            try
            {
                string result = string.Empty;
                foreach (string item in Request.Files)
                {
                    HttpPostedFileBase file = Request.Files[item] as HttpPostedFileBase;

                    string UploadPath = "~/images/account";

                    if (file.ContentLength == 0)
                        continue;
                    if (file.ContentLength > 0 && recordId != null)
                    {
                        string userFileName = recordId + Path.GetExtension(file.FileName);
                        //string userFileName = file.FileName;
                        string path = Path.Combine(HttpContext.Request.MapPath(UploadPath), userFileName);

                        string userImagePath = String.Format("{0}/{1}", UploadPath, userFileName);                      

                        file.SaveAs(path);

                        byte[] data;
                        using (Stream inputStream = file.InputStream)
                        {
                            recordId = recordId.Replace('_', '-');
                            MemoryStream memoryStream = inputStream as MemoryStream;
                            if (memoryStream == null)
                            {
                                memoryStream = new MemoryStream();
                                inputStream.CopyTo(memoryStream);
                            }
                            data = memoryStream.ToArray();

                            var service = new XrmServiceContext(_conn);
                            service.UpdateAccountImage(new Guid(recordId), data);

                        }
                        result = userImagePath;
                    }                   
                }
                return Json(result);
            }
            catch (Exception ex)
            {
                return Json(ex);
            }  
        }
	}
}