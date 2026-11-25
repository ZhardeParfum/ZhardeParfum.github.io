/* ZHARDÉ order recording (free): Google Sheet + Apps Script.
   Steps are in ORDERS-SETUP.txt */
var SHEET = 'Orders';
var HEAD = ['Order No','Date','Name','Phone','Address','City','State','Postcode','Items','Subtotal (RM)','Discount (RM)','Total (RM, excl. shipping)','Note','Status','Tracking No'];
var STATUS = ['Submitted','Payment Pending','Paid','Processing','Shipped','Completed','Cancelled'];

function clean(v){ v = String(v == null ? '' : v).slice(0, 500); return /^[=+\-@]/.test(v) ? "'" + v : v; }

function doPost(e){
  var lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD); sh.setFrozenRows(1);
      sh.getRange('N2:N2000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
    }
    var items = (d.items || []).slice(0, 30).map(function(i){ return clean(i.name) + ' – ' + clean(i.size) + ' – Qty ' + Number(i.qty) + ' – RM' + Number(i.amount); }).join('\n');
    sh.appendRow([clean(d.orderNo), new Date(), clean(d.name), "'" + clean(d.phone), clean(d.address), clean(d.city), clean(d.state), "'" + clean(d.postcode),
      items, Number(d.subtotal) || 0, Number(d.discount) || 0, Number(d.total) || 0, clean(d.note), 'Submitted', '']);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error');
  } finally { lock.releaseLock(); }
}
function doGet(){ return ContentService.createTextOutput('ZHARDÉ orders endpoint'); }
