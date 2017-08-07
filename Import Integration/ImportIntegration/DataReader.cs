using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ImportIntegration
{
    public class DataReader
    {
        private string _filePath;
        private static List<char> Letters = new List<char>() { 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ' };
        public DataReader() { }

        public DataReader(string filePath)
        {
            _filePath = filePath;
        }

        public List<ReceivingTransaction> Read()
        {
            List<ReceivingTransaction> rtList = new List<ReceivingTransaction>();

            using (SpreadsheetDocument doc = SpreadsheetDocument.Open(_filePath, false))
            {
                //Read the first Sheets 
                Sheet sheet = doc.WorkbookPart.Workbook.Sheets.GetFirstChild<Sheet>();
                Worksheet worksheet = (doc.WorkbookPart.GetPartById(sheet.Id.Value) as WorksheetPart).Worksheet;
                IEnumerable<Row> rows = worksheet.GetFirstChild<SheetData>().Descendants<Row>();

                foreach (Row row in rows)
                {
                    ReceivingTransaction rt = new ReceivingTransaction();
                    //Read the first row as header
                    if (row.RowIndex.Value != 1)
                    {
                        int columnIndex = 0;
                        foreach (Cell cell in row.Descendants<Cell>())
                        {
                            // Gets the column index of the cell with data
                            int cellColumnIndex = (int)GetColumnIndexFromName(GetColumnName(cell.CellReference));

                            if (columnIndex < cellColumnIndex)
                            {
                                do
                                {
                                    if (columnIndex == 0)
                                    {
                                        rt.VehiclePurchaseOrderNumber = string.Empty;
                                    }
                                    if (columnIndex == 1)
                                    {
                                        rt.PullOutDate = string.Empty;
                                    }
                                    if (columnIndex == 2)
                                    {
                                        rt.MMPCStatus = string.Empty;
                                    }
                                    if (columnIndex == 3)
                                    {
                                        rt.InvoiceNumber = string.Empty;
                                    }
                                    if (columnIndex == 4)
                                    {
                                        rt.InTransitReceiptDate = string.Empty;
                                    }
                                    if (columnIndex == 5)
                                    {
                                        rt.InvoiceDate = string.Empty;
                                    }
                                    if (columnIndex == 6)
                                    {
                                        rt.InTransitSite = string.Empty;
                                    }
                                    if (columnIndex == 7)
                                    {
                                        rt.ReceivingDetails.ModelCode = string.Empty;
                                    }
                                    if (columnIndex == 8)
                                    {
                                        rt.ReceivingDetails.OptionCode = string.Empty;
                                    }
                                    if (columnIndex == 9)
                                    {
                                        rt.ReceivingDetails.ModelYear = string.Empty;
                                    }
                                    if (columnIndex == 10)
                                    {
                                        rt.ReceivingDetails.ColorCode = string.Empty;
                                    }
                                    if (columnIndex == 11)
                                    {
                                        rt.ReceivingDetails.EngineNumber = string.Empty;
                                    }
                                    if (columnIndex == 12)
                                    {
                                        rt.ReceivingDetails.CSNumber = string.Empty;
                                    }
                                    if (columnIndex == 13)
                                    {
                                        rt.ReceivingDetails.ProductionNumber = string.Empty;
                                    }
                                    if (columnIndex == 14)
                                    {
                                        rt.ReceivingDetails.VIN = string.Empty;
                                    }
                                    if (columnIndex == 15)
                                    {
                                        rt.DealerCode = string.Empty;
                                    }
                                    if (columnIndex == 16)
                                    {
                                        rt.BranchCode = string.Empty;
                                    }
                                    columnIndex++;
                                }
                                while (columnIndex < cellColumnIndex);
                            }

                            if (columnIndex == 0)
                            {
                                rt.VehiclePurchaseOrderNumber = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 1)
                            {
                                string cellValue = GetCellValue(doc, cell);
                                DateTime sample;
                                if (string.IsNullOrEmpty(cellValue) || DateTime.TryParse(cellValue, out sample))
                                {
                                    rt.PullOutDate = cellValue;
                                }                               
                                else
                                {
                                    rt.PullOutDate = DateTime.FromOADate(Convert.ToDouble(cellValue)).ToString();
                                }                              
                            }
                            if (columnIndex == 2)
                            {
                                rt.MMPCStatus = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 3)
                            {
                                rt.InvoiceNumber = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 4)
                            {
                                string cellValue = GetCellValue(doc, cell);
                                DateTime sample;
                                if (string.IsNullOrEmpty(cellValue) || DateTime.TryParse(cellValue, out sample))
                                {
                                    rt.InTransitReceiptDate = cellValue;
                                }
                                else
                                {
                                    rt.InTransitReceiptDate = DateTime.FromOADate(Convert.ToDouble(cellValue)).ToString();
                                }  
                              
                            }
                            if (columnIndex == 5)
                            {
                                string cellValue = GetCellValue(doc, cell);
                                DateTime sample;
                                if (string.IsNullOrEmpty(cellValue) || DateTime.TryParse(cellValue, out sample))
                                {
                                    rt.InvoiceDate = cellValue;
                                }
                                else
                                {
                                    rt.InvoiceDate = DateTime.FromOADate(Convert.ToDouble(cellValue)).ToString();
                                }                                
                            }
                            if (columnIndex == 6)
                            {
                                rt.InTransitSite = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 7)
                            {
                                rt.ReceivingDetails.ModelCode = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 8)
                            {
                                rt.ReceivingDetails.OptionCode = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 9)
                            {
                                rt.ReceivingDetails.ModelYear = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 10)
                            {
                                rt.ReceivingDetails.ColorCode = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 11)
                            {
                                rt.ReceivingDetails.EngineNumber = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 12)
                            {
                                rt.ReceivingDetails.CSNumber = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 13)
                            {
                                rt.ReceivingDetails.ProductionNumber = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 14)
                            {
                                rt.ReceivingDetails.VIN = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 15)
                            {
                                rt.DealerCode = GetCellValue(doc, cell);
                            }
                            if (columnIndex == 16)
                            {
                                rt.BranchCode = GetCellValue(doc, cell);
                            }

                            columnIndex++;

                        }
                    }
                    rtList.Add(rt);
                }
            }

            rtList.RemoveAt(0);

            return rtList;
        }

       
        /// <summary>
        /// Given a cell name, parses the specified cell to get the column name.
        /// </summary>
        /// <param name="cellReference">Address of the cell (ie. B2)</param>
        /// <returns>Column Name (ie. B)</returns>
        public static string GetColumnName(string cellReference)
        {
            // Create a regular expression to match the column name portion of the cell name.
            Regex regex = new Regex("[A-Za-z]+");
            Match match = regex.Match(cellReference);

            return match.Value;
        }

        /// <summary>
        /// Given just the column name (no row index), it will return the zero based column index.
        /// Note: This method will only handle columns with a length of up to two (ie. A to Z and AA to ZZ). 
        /// A length of three can be implemented when needed.
        /// </summary>
        /// <param name="columnName">Column Name (ie. A or AB)</param>
        /// <returns>Zero based index if the conversion was successful; otherwise null</returns>
        public static int? GetColumnIndexFromName(string columnName)
        {
            int? columnIndex = null;

            string[] colLetters = Regex.Split(columnName, "([A-Z]+)");
            colLetters = colLetters.Where(s => !string.IsNullOrEmpty(s)).ToArray();

            if (colLetters.Count() <= 2)
            {
                int index = 0;
                foreach (string col in colLetters)
                {
                    List<char> col1 = colLetters.ElementAt(index).ToCharArray().ToList();
                    int? indexValue = Letters.IndexOf(col1.ElementAt(index));

                    if (indexValue != -1)
                    {
                        // The first letter of a two digit column needs some extra calculations
                        if (index == 0 && colLetters.Count() == 2)
                        {
                            columnIndex = columnIndex == null ? (indexValue + 1) * 26 : columnIndex + ((indexValue + 1) * 26);
                        }
                        else
                        {
                            columnIndex = columnIndex == null ? indexValue : columnIndex + indexValue;
                        }
                    }

                    index++;
                }
            }

            return columnIndex;
        }

        private static string GetCellValue(SpreadsheetDocument doc, Cell cell)
        {

            SharedStringTablePart stringTablePart = doc.WorkbookPart.SharedStringTablePart;
            string value = cell.InnerText;
            if (cell.CellValue != null)
            {
                value = cell.CellValue.InnerXml;
            }
            if (cell.DataType != null && cell.DataType.Value == CellValues.SharedString)
            {
                return doc.WorkbookPart.SharedStringTablePart.SharedStringTable.ChildElements.GetItem(int.Parse(value)).InnerText;
            }

            value = value.Trim();

            return value;
        }
    }
}
