/* ZHARDÉ orders + automatic receipt images (free): Google Sheet + Google Drive via Apps Script.
   Steps are in ORDERS-SETUP.txt */
/* Jika skrip ini dicipta dari menu Extensions > Apps Script DALAM Google Sheet, biarkan SHEET_ID kosong.
   Jika skrip ini projek berasingan (script.google.com), tampal ID Google Sheet anda di sini.
   ID ialah teks antara /d/ dan /edit dalam URL Sheet. */
var SHEET_ID = '';
var SHEET = 'Orders';
var FOLDER = 'ZHARDE Order Receipts';
var HEAD = ['Order No','Date','Name','Phone','Address','City','State','Postcode','Items','Subtotal (RM)','Discount (RM)','Shipping (RM)','Total to pay (RM)','Note','Payment Claim','Receipt File','Status','Tracking No','Delivery','Receipt Image'];
var STATUS = ['Submitted','Payment Pending','Paid','Processing','Shipped','Completed','Cancelled'];
var IMG_COL = 20, IMG_H = 330;

function getSS(){ return SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet(); }
function clean(v){ v = String(v == null ? '' : v).slice(0, 500); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function attachReceipt(sh, row, orderNo, r){
  var mime = String(r.mime || '');
  if (['image/jpeg','image/png'].indexOf(mime) < 0) throw new Error('Unsupported file type');
  var bytes = Utilities.base64Decode(r.data);
  if (bytes.length > 3 * 1024 * 1024) throw new Error('File too large');
  var name = String(orderNo).replace(/[^A-Za-z0-9\-]/g, '') + '-receipt.' + (mime === 'image/png' ? 'png' : 'jpg');
  var blob = Utilities.newBlob(bytes, mime, name);
  var it = DriveApp.getFoldersByName(FOLDER);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
  sh.getRange(row, 16).setValue(folder.createFile(blob).getUrl());          // private link to the receipt image
  var img = sh.insertImage(blob, IMG_COL, row);                              // receipt picture inside the sheet
  var ratio = img.getWidth() / img.getHeight(), h = IMG_H - 10, w = Math.round(h * ratio);
  img.setHeight(h).setWidth(w);
  sh.setRowHeight(row, IMG_H);
  if (sh.getColumnWidth(IMG_COL) < w + 10) sh.setColumnWidth(IMG_COL, w + 10);
}

function doPost(e){
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = getSS();
    var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD); sh.setFrozenRows(1);
      sh.getRange('Q2:Q2000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
    }
    var found = sh.createTextFinder(clean(d.orderNo)).matchEntireCell(true).findNext();
    var row;
    if (found && found.getColumn() === 1) {
      row = found.getRow();
      sh.getRange(row, 15).setValue(clean(d.payment));
      sh.getRange(row, 19).setValue(clean(d.method));
    } else {
      var items = (d.items || []).slice(0, 30).map(function(i){ return clean(i.name) + ' – ' + clean(i.size) + ' – Qty ' + Number(i.qty) + ' – RM' + Number(i.amount); }).join('\n');
      sh.appendRow([clean(d.orderNo), new Date(), clean(d.name), "'" + clean(d.phone), clean(d.address), clean(d.city), clean(d.state), "'" + clean(d.postcode),
        items, Number(d.subtotal) || 0, Number(d.discount) || 0, clean(d.shipping), Number(d.total) || 0, clean(d.note), clean(d.payment), '', 'Submitted', '', clean(d.method), '']);
      row = sh.getLastRow();
    }
    if (d.receipt && d.receipt.data && !sh.getRange(row, 16).getValue()) attachReceipt(sh, row, d.orderNo, d.receipt);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err).slice(0, 200) });
  } finally { lock.releaseLock(); }
}
function doGet(){ return ContentService.createTextOutput('ZHARDÉ orders endpoint'); }
