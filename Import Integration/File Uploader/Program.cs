using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace File_Uploader
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("********************** DMS File Uploader **********************");
            Console.WriteLine("please type the file name that you want to upload to the server");
            Console.Write("file: ");
            string fileName = Console.ReadLine();

            string path = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location) + "\\" + fileName;

            if (System.IO.File.Exists(path))
            {
                using (WebClient client = new WebClient())
                {
                    string userName = "mmpc\\mmpcadmin";
                    string password = "*Houseoftherisingsun!";

                    client.Credentials = new NetworkCredential(userName, password);
                    client.UploadFile("ftp://dmsprod2.gurango.net/Vehicle Receiving.xlsx", "STOR", path);
                }

                Console.WriteLine("File Upload was successful!");
                Console.WriteLine("Press any key to close the window..");
                Console.ReadLine();
            }
            else
            {
                Console.WriteLine("the file that you entered does not exist.");
                Console.WriteLine("Press any key to close the window..");
                Console.ReadLine();
            }         
        }
    }
}
