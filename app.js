// POS V13 - barcode prices + cash/card payments

let products = JSON.parse(localStorage.getItem("products") || "[]");
let sales = JSON.parse(localStorage.getItem("sales") || "[]");
let categories = JSON.parse(localStorage.getItem("categories") || "[]");
let cart = [];
let currentCategory = "All";
let editingID = null;
let scannerRunning = false;
let scanLocked = false;
let selectedBarcodes = [];
let barcodeCopies = {};

function saveData(){
  localStorage.setItem("products",JSON.stringify(products));
  localStorage.setItem("sales",JSON.stringify(sales));
  localStorage.setItem("categories",JSON.stringify(categories));
}
function money(n){return Number(n||0).toFixed(2)}
function totalCart(){return cart.reduce((t,i)=>t+Number(i.price)*Number(i.qty),0)}
function escapeHtml(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]))}

function showPage(page){
  document.querySelectorAll(".page").forEach(s=>s.classList.remove("active"));
  const target=document.getElementById(page); if(target)target.classList.add("active");
  if(page==="dashboard")updateDashboard();
  if(page==="checkout"){displayProducts();displayCategoryButtons()}
  if(page==="inventory")displayInventory();
  if(page==="barcodes")displayBarcodeList();
  if(page==="sales")displaySales();
  if(page==="categories")displayCategories();
}
function setupButtons(){
  document.querySelectorAll(".nav-button").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
  document.getElementById("clearCart")?.addEventListener("click",clearCart);
  document.getElementById("cashPay")?.addEventListener("click",()=>pay("Cash"));
  document.getElementById("cardPay")?.addEventListener("click",()=>pay("Card"));
  document.getElementById("generateBarcode")?.addEventListener("click",generateProductBarcode);
  document.getElementById("saveProduct")?.addEventListener("click",saveProduct);
  document.getElementById("updateProduct")?.addEventListener("click",updateProduct);
  document.getElementById("addCategory")?.addEventListener("click",addCategory);
  document.getElementById("clearSales")?.addEventListener("click",clearSales);
  document.getElementById("startCamera")?.addEventListener("click",startScanner);
  document.getElementById("stopCamera")?.addEventListener("click",stopScanner);
  document.getElementById("selectAllBarcodes")?.addEventListener("click",selectAllBarcodes);
  document.getElementById("clearBarcodeSelection")?.addEventListener("click",clearBarcodeSelection);
  document.getElementById("printSelected")?.addEventListener("click",printSelectedBarcodes);
  document.getElementById("printAll")?.addEventListener("click",printAllBarcodes);
}
function updateDashboard(){
  const pc=document.getElementById("productCount");if(pc)pc.innerText=products.length;
  const ic=document.getElementById("inventoryCount");if(ic)ic.innerText=products.reduce((t,p)=>t+Number(p.stock||0),0);
  const ls=document.getElementById("lowStock");if(ls)ls.innerText=products.filter(p=>Number(p.stock)<=2).length;
  const sold=document.getElementById("itemsSold");if(sold)sold.innerText=sales.reduce((t,s)=>t+(s.items||[]).reduce((a,i)=>a+Number(i.qty||0),0),0);
  displayLowStock();displayBestSellers();
}
function displayLowStock(){const box=document.getElementById("lowStockList");if(!box)return;box.innerHTML=products.filter(p=>Number(p.stock)<=2).map(p=>`<div class="sales-item">⚠️ ${escapeHtml(p.name)}<br>Stock: ${p.stock}</div>`).join("")}
function displayBestSellers(){const box=document.getElementById("bestSellers");if(!box)return;const totals={};sales.forEach(s=>(s.items||[]).forEach(i=>totals[i.name]=(totals[i.name]||0)+Number(i.qty||0)));const rows=Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);box.innerHTML=rows.length?rows.map(([n,q])=>`<div class="sales-item">⭐ ${escapeHtml(n)} — ${q} sold</div>`).join(""):"No sales yet"}

function generateBarcodeNumber(){let code=String(Date.now()).slice(-12);while(products.some(p=>String(p.barcode)===code))code=String(Number(code)+1).slice(-12);return code}
function generateProductBarcode(){const el=document.getElementById("productBarcode");if(el)el.value=generateBarcodeNumber()}
function saveProduct(){
  const name=document.getElementById("productName")?.value.trim();if(!name){alert("Enter a product name.");return}
  const product={id:Date.now(),name,price:Number(document.getElementById("productPrice")?.value||0),stock:Math.max(0,Number(document.getElementById("productStock")?.value||0)),category:document.getElementById("productCategory")?.value||"",barcode:document.getElementById("productBarcode")?.value.trim()||generateBarcodeNumber(),image:""};
  const file=document.getElementById("productImage")?.files?.[0];
  const finish=()=>{products.push(product);saveData();updateDashboard();displayInventory();displayProducts();showPage("inventory")};
  if(file){const r=new FileReader();r.onload=e=>{product.image=e.target.result;finish()};r.readAsDataURL(file)}else finish();
}
function displayInventory(){const box=document.getElementById("inventoryList");if(!box)return;box.innerHTML=products.map(p=>`<div class="inventory-item">${p.image?`<img src="${p.image}">`:"📦"}<h3>${escapeHtml(p.name)}</h3>Category: ${escapeHtml(p.category||"None")}<br>Price: $${money(p.price)}<br>Stock: ${p.stock}<br>Barcode: ${escapeHtml(p.barcode)}<br><br><button onclick="editProduct(${p.id})">✏️ Edit</button><button onclick="addStock(${p.id})">+1</button><button onclick="removeStock(${p.id})">-1</button><button onclick="deleteProduct(${p.id})">🗑 Delete</button></div>`).join("")}
function addStock(id){const p=products.find(x=>x.id===id);if(p)p.stock++;saveData();displayInventory();updateDashboard()}
function removeStock(id){const p=products.find(x=>x.id===id);if(p&&p.stock>0)p.stock--;saveData();displayInventory();updateDashboard()}
function deleteProduct(id){products=products.filter(p=>p.id!==id);saveData();displayInventory();displayProducts();updateDashboard()}
function editProduct(id){const p=products.find(x=>x.id===id);if(!p)return;editingID=id;document.getElementById("editName").value=p.name;document.getElementById("editPrice").value=p.price;document.getElementById("editStock").value=p.stock;updateCategoryDropdowns();document.getElementById("editCategory").value=p.category||"";showPage("editProduct")}
function updateProduct(){const p=products.find(x=>x.id===editingID);if(!p)return;p.name=document.getElementById("editName").value.trim();p.price=Number(document.getElementById("editPrice").value||0);p.stock=Math.max(0,Number(document.getElementById("editStock").value||0));p.category=document.getElementById("editCategory").value||"";saveData();displayInventory();displayProducts();updateDashboard();showPage("inventory")}

function addCategory(){const input=document.getElementById("categoryName"),n=input?.value.trim();if(!n)return;if(!categories.includes(n))categories.push(n);saveData();input.value="";displayCategories();updateCategoryDropdowns();displayCategoryButtons()}
function displayCategories(){const box=document.getElementById("categoryList");if(!box)return;box.innerHTML=categories.map((c,i)=>`<div class="category-card">${escapeHtml(c)} <button onclick="deleteCategory(${i})">Delete</button></div>`).join("")}
function deleteCategory(i){const c=categories[i];products.forEach(p=>{if(p.category===c)p.category=""});categories.splice(i,1);saveData();displayCategories();updateCategoryDropdowns();displayCategoryButtons()}
function updateCategoryDropdowns(){[document.getElementById("productCategory"),document.getElementById("editCategory")].forEach(s=>{if(!s)return;const old=s.value;s.innerHTML=categories.map(c=>`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");if(old)s.value=old})}
function displayCategoryButtons(){const box=document.getElementById("categoryButtons");if(!box)return;box.innerHTML=`<button onclick="filterCategory('All')">All</button>`+categories.map(c=>`<button onclick='filterCategory(${JSON.stringify(c)})'>${escapeHtml(c)}</button>`).join("")}
function filterCategory(c){currentCategory=c;displayProducts()}
function displayProducts(){const box=document.getElementById("products");if(!box)return;box.innerHTML=products.filter(p=>currentCategory==="All"||p.category===currentCategory).map(p=>`<div class="product" onclick="addToCart(${p.id})">${p.image?`<img src="${p.image}">`:"📦"}<h3>${escapeHtml(p.name)}</h3><p>$${money(p.price)}</p><small>Stock: ${p.stock}</small></div>`).join("")}

function addToCart(id){const p=products.find(x=>x.id===id);if(!p)return;const item=cart.find(x=>x.id===id);const already=item?.qty||0;if(already>=Number(p.stock)){alert("Not enough stock.");return}if(item)item.qty++;else cart.push({id:p.id,name:p.name,price:Number(p.price),qty:1});updateCart()}
function updateCart(){const box=document.getElementById("cartItems");if(!box)return;box.innerHTML=cart.map(i=>`<div class="cart-item"><div>${escapeHtml(i.name)}<br>Qty: ${i.qty}<br>$${money(i.price*i.qty)}</div><button onclick="removeCartItem(${i.id})">❌</button></div>`).join("");const t=document.getElementById("total");if(t)t.innerText=money(totalCart())}
function removeCartItem(id){cart=cart.filter(i=>i.id!==id);updateCart()}
function clearCart(){cart=[];updateCart()}

function createPaymentModal(total){
  let modal=document.getElementById("paymentModal");if(modal)modal.remove();
  modal=document.createElement("div");modal.id="paymentModal";modal.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px";
  modal.innerHTML=`<div style="background:#fff;color:#000;border-radius:16px;padding:24px;width:min(420px,100%);box-shadow:0 10px 40px #0008"><h2>Cash Payment</h2><h3>Total: $${money(total)}</h3><label>Cash received</label><input id="cashReceived" type="number" min="0" step="0.01" inputmode="decimal" style="width:100%;font-size:24px;padding:12px;margin:10px 0"><div id="changeDue" style="font-size:28px;font-weight:bold;margin:15px 0">Change: $0.00</div><button id="finishCash" style="width:100%;padding:14px;font-size:18px">Complete Cash Sale</button><button id="cancelCash" style="width:100%;padding:12px;margin-top:8px">Cancel</button></div>`;
  document.body.appendChild(modal);const input=document.getElementById("cashReceived"),change=document.getElementById("changeDue");
  input.addEventListener("input",()=>{const received=Number(input.value||0);change.textContent=`Change: $${money(Math.max(0,received-total))}`});
  document.getElementById("cancelCash").onclick=()=>modal.remove();
  document.getElementById("finishCash").onclick=()=>{const received=Number(input.value||0);if(received<total){change.textContent=`Still needed: $${money(total-received)}`;return}completeSale("Cash",received,received-total);modal.remove()};input.focus();
}
function pay(type){if(!cart.length){alert("Cart is empty");return}const total=totalCart();if(type==="Cash"){createPaymentModal(total);return}completeSale("Card",total,0)}
function completeSale(type,amount,change){cart.forEach(i=>{const p=products.find(x=>x.id===i.id);if(p)p.stock=Math.max(0,Number(p.stock)-Number(i.qty))});sales.push({date:new Date().toLocaleString(),payment:type,amount:Number(amount),total:totalCart(),change:Number(change||0),items:cart.map(i=>({...i}))});saveData();cart=[];updateCart();displayProducts();displayInventory();updateDashboard();displaySales()}

function findProductByBarcode(code){return products.find(p=>String(p.barcode).trim()===String(code).trim())}
function processBarcodeScan(code){const p=findProductByBarcode(code),result=document.getElementById("scanResult");if(!p){if(result)result.innerHTML=`❌ Barcode not found<br>${escapeHtml(code)}`;return}const mode=document.getElementById("scanMode")?.value||"checkout";if(mode==="checkout")addToCart(p.id);else if(mode==="add")p.stock++;else if(mode==="remove"&&p.stock>0)p.stock--;saveData();displayInventory();displayProducts();updateDashboard();if(result)result.innerHTML=`✅ ${escapeHtml(p.name)}<br>Price: $${money(p.price)}<br>Stock: ${p.stock}`}
function setupScannerInputs(){["checkoutScanner","inventoryScanner"].forEach(id=>{const el=document.getElementById(id);if(el)el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();processBarcodeScan(el.value);el.value=""}})})}
function startScanner(){if(scannerRunning)return;scanLocked=false;scannerRunning=true;Quagga.init({inputStream:{name:"Live",type:"LiveStream",target:document.getElementById("cameraScanner"),constraints:{facingMode:"environment"}},decoder:{readers:["code_128_reader","ean_reader","ean_8_reader","upc_reader"]}},err=>{if(err){scannerRunning=false;alert("Camera failed");return}Quagga.start()});Quagga.onDetected(onCameraDetected)}
function onCameraDetected(result){if(scanLocked)return;scanLocked=true;const code=result?.codeResult?.code;if(code)processBarcodeScan(code);setTimeout(stopScanner,500)}
function stopScanner(){if(scannerRunning){try{Quagga.offDetected(onCameraDetected)}catch(e){}try{Quagga.stop()}catch(e){}scannerRunning=false}scanLocked=false}

function displayBarcodeList(){const box=document.getElementById("barcodeList");if(!box)return;box.innerHTML=products.map(p=>{barcodeCopies[p.id]=Math.max(1,Number(barcodeCopies[p.id]||1));return `<div class="barcode-card"><input type="checkbox" class="barcode-check" data-id="${p.id}" ${selectedBarcodes.includes(p.id)?"checked":""}><h3>${escapeHtml(p.name)}</h3><strong>$${money(p.price)}</strong><svg id="barcode-${p.id}"></svg><p>${escapeHtml(p.barcode)}</p><input type="number" min="1" value="${barcodeCopies[p.id]}" onchange="changeBarcodeCopies(${p.id},this.value)"></div>`}).join("");products.forEach(p=>{try{JsBarcode("#barcode-"+p.id,p.barcode,{format:"CODE128",width:2,height:60,displayValue:true,margin:8})}catch(e){}})}
function changeBarcodeCopies(id,v){barcodeCopies[id]=Math.max(1,Number(v)||1)}
function selectAllBarcodes(){selectedBarcodes=products.map(p=>p.id);displayBarcodeList()}
function clearBarcodeSelection(){selectedBarcodes=[];displayBarcodeList()}
document.addEventListener("change",e=>{if(e.target.classList.contains("barcode-check")){const id=Number(e.target.dataset.id);if(e.target.checked&&!selectedBarcodes.includes(id))selectedBarcodes.push(id);if(!e.target.checked)selectedBarcodes=selectedBarcodes.filter(x=>x!==id)}})
function printSelectedBarcodes(){printBarcodes(products.filter(p=>selectedBarcodes.includes(p.id)))}
function printAllBarcodes(){printBarcodes(products)}
function printBarcodes(items){const area=document.getElementById("printArea");if(!area)return;area.innerHTML="";let index=0;items.forEach(p=>{for(let i=0;i<(barcodeCopies[p.id]||1);i++){const label=document.createElement("div");label.className="print-label";label.innerHTML=`<strong>${escapeHtml(p.name)}</strong><div>$${money(p.price)}</div><svg id="print-barcode-${index}"></svg>`;area.appendChild(label);try{JsBarcode("#print-barcode-"+index,p.barcode,{format:"CODE128",width:2,height:50,displayValue:true,margin:4})}catch(e){}index++}});window.print()}

function displaySales(){const box=document.getElementById("salesList");if(!box)return;const cash=sales.filter(s=>s.payment==="Cash").reduce((t,s)=>t+Number(s.total||0),0),card=sales.filter(s=>s.payment==="Card").reduce((t,s)=>t+Number(s.total||0),0);box.innerHTML=`<div class="sales-item"><b>Sales Totals</b><br>Cash: $${money(cash)}<br>Card: $${money(card)}<br>Total: $${money(cash+card)}</div>`+sales.slice().reverse().map(s=>`<div class="sales-item"><b>${escapeHtml(s.date)}</b><br>Payment: ${escapeHtml(s.payment)}<br>Sale Total: $${money(s.total)}${s.payment==="Cash"?`<br>Cash Received: $${money(s.amount)}<br>Change Given: $${money(s.change)}`:""}<br>${(s.items||[]).map(i=>escapeHtml(i.name)+" x"+i.qty).join(", ")}</div>`).join("")}
function clearSales(){sales=[];saveData();displaySales();updateDashboard()}

window.addEventListener("DOMContentLoaded",()=>{setupButtons();setupScannerInputs();updateCategoryDropdowns();displayCategoryButtons();displayProducts();displayInventory();displayBarcodeList();displaySales();updateDashboard();updateCart()});
