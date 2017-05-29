using System;
using System.Linq;
using Xrm;

namespace ConsoleAppWalkthrough
{
	class Program
	{
		static void Main(string[] args)
		{
			var xrm = new XrmServiceContext("Xrm");
			
			WriteExampleContacts(xrm);

			//create a new contact called Allison Brown
			var allisonBrown = new Xrm.Contact
			{
				FirstName = "Allison",
				LastName = "Brown",
				Address1_Line1 = "23 Market St.",
				Address1_City = "Sammamish",
				Address1_StateOrProvince = "MT",
				Address1_PostalCode = "99999",
				Telephone1 = "12345678",
				EMailAddress1 = "allison.brown@example.com"
			};

			xrm.AddObject(allisonBrown);
			xrm.SaveChanges();

			WriteExampleContacts(xrm);

			Console.WriteLine("Press any key to exit.");
			Console.ReadKey();
		}

		/// <summary>
		/// Grab all contacts where the email address ends in @example.com
		/// </summary>
		private static void WriteExampleContacts(XrmServiceContext xrm)
		{
			var exampleContacts = xrm.ContactSet
				.Where(c => c.EMailAddress1.EndsWith("@example.com"));

			//write the example Contacts
			foreach (var contact in exampleContacts)
			{
				Console.WriteLine(contact.FullName);
			}
		}
	}
}
