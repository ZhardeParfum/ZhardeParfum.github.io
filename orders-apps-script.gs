/* ZHARDÉ order and payment-proof recording (free): Google Sheet + Google Drive via Apps Script.
   Steps are in ORDERS-SETUP.txt */
var SHEET = 'Orders';
var FOLDER = 'ZHARDE Payment Proofs';
var HEAD = ['Order No','Date','Name','Phone','Address','City','State','Postcode','Items','Subtotal (RM)','Discount (RM)','Shipping (RM)','Total to pay (RM)','Note','Payment Claim','Payment Proof','Status','Tracking No','Delivery'];
var STATUS = ['Submitted','Payment Pending','Paid','Processing','Shipped','Completed','Cancelled'];

function clean(v){ v = String(v == null ? '' : v).slice(0, 500); return /^[=+\-@]/.test(v) ? "'" + v : v; }
function out(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function saveProof(orderNo, p){
  var mime = String(p.mime || '');
  if (['image/jpeg','image/png','image/webp'].indexOf(mime) < 0) throw new Error('Unsupported file type');
  var bytes = Utilities.base64Decode(p.data);
  if (bytes.length > 4 * 1024 * 1024) throw new Error('File too large');
  var ext = mime === 'image/png' ? 'png' : (mime === 'image/webp' ? 'webp' : 'jpg');
  var name = String(orderNo).replace(/[^A-Za-z0-9\-]/g, '') + '-receipt.' + ext;
  var it = DriveApp.getFoldersByName(FOLDER);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER);
  return folder.createFile(Utilities.newBlob(bytes, mime, name)).getUrl();   // files stay private to you
}

function doPost(e){
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD); sh.setFrozenRows(1);
      sh.getRange('Q2:Q2000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUS, true).build());
    }
    var proofUrl = '';
    if (d.proof && d.proof.data) proofUrl = saveProof(d.orderNo, d.proof);
    var found = sh.createTextFinder(clean(d.orderNo)).matchEntireCell(true).findNext();
    if (found && found.getColumn() === 1) {
      var r = found.getRow();
      sh.getRange(r, 15).setValue(clean(d.payment)); sh.getRange(r, 19).setValue(clean(d.method));
      if (proofUrl) sh.getRange(r, 16).setValue(proofUrl);
      return out({ ok: true, proofUrl: proofUrl });
    }
    var items = (d.items || []).slice(0, 30).map(function(i){ return clean(i.name) + ' – ' + clean(i.size) + ' – Qty ' + Number(i.qty) + ' – RM' + Number(i.amount); }).join('\n');
    sh.appendRow([clean(d.orderNo), new Date(), clean(d.name), "'" + clean(d.phone), clean(d.address), clean(d.city), clean(d.state), "'" + clean(d.postcode),
      items, Number(d.subtotal) || 0, Number(d.discount) || 0, clean(d.shipping), Number(d.total) || 0, clean(d.note), clean(d.payment), proofUrl, 'Submitted', '', clean(d.method)]);
    return out({ ok: true, proofUrl: proofUrl });
  } catch (err) {
    return out({ ok: false, error: String(err).slice(0, 200) });
  } finally { lock.releaseLock(); }
}
function doGet(){ return ContentService.createTextOutput('ZHARDÉ orders endpoint'); }
