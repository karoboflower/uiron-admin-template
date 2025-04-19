import type { WorkBook } from 'xlsx';
import type { JsonToMultipleSheet, JsonToSheet } from './typing';
import * as xlsx from 'xlsx';

const { utils, writeFile } = xlsx;

const DEF_FILE_NAME = 'excel-list.xlsx';
const DEF_SHEET_NAME = 'sheet';

/**
 * Sets the column width of a worksheet based on the length of the data values.
 * @param data - The data array containing the values.
 * @param worksheet - The worksheet object to set the column width on.
 * @param min - The minimum column width (default: 3).
 */
function setColumnWidth(data, worksheet, min = 3) {
  const obj = {};
  worksheet['!cols'] = [];
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      const cur = item[key];
      const length = cur?.length ?? min;
      obj[key] = Math.max(length, obj[key] ?? min);
    });
  });
  Object.keys(obj).forEach((key) => {
    worksheet['!cols'].push({
      wch: obj[key],
    });
  });
}

export function jsonToSheetXlsx<T = any>({
  data,
  header,
  filename = DEF_FILE_NAME,
  sheetName = DEF_SHEET_NAME,
  json2sheetOpts = {},
  write2excelOpts = { bookType: 'xlsx' },
}: JsonToSheet<T>) {
  const arrData = [...data];
  if (header) {
    arrData.unshift(header);
    json2sheetOpts.skipHeader = true;
  }

  const worksheet = utils.json_to_sheet(arrData, json2sheetOpts);
  // setColumnWidth(arrData, worksheet);

  /* add worksheet to workbook */
  const workbook: WorkBook = {
    SheetNames: [sheetName],
    Sheets: {
      [sheetName]: worksheet,
    },
  };
  /* output format determined by filename */
  writeFile(workbook, filename, write2excelOpts);
  /* at this point, out.xlsb will have been downloaded */
}

/**
 * json导出多Sheet的Xlsx
 * sheetList 多sheet配置
 * filename 文件名(包含后缀)
 * write2excelOpts 文件配置
 */
export function jsonToMultipleSheetXlsx<T = any>({
  sheetList,
  filename = DEF_FILE_NAME,
  write2excelOpts = { bookType: 'xlsx' },
}: JsonToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {},
  };
  sheetList.forEach((p, index) => {
    const arrData = [...p.data];
    if (p.header) {
      arrData.unshift(p.header);
      p.json2sheetOpts = p.json2sheetOpts || {};
      p.json2sheetOpts.skipHeader = true;
    }

    const worksheet = utils.json_to_sheet(arrData, p.json2sheetOpts);
    setColumnWidth(arrData, worksheet);

    p.sheetName = p.sheetName || `${DEF_SHEET_NAME}${index}`;
    workbook.SheetNames.push(p.sheetName);
    workbook.Sheets[p.sheetName] = worksheet;
  });
  writeFile(workbook, filename, write2excelOpts);
}
