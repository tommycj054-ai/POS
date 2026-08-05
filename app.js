// ================================
// POS V12 DATA
// ================================


let products =
JSON.parse(localStorage.getItem("products")) || [];


let sales =
JSON.parse(localStorage.getItem("sales")) || [];


let categories =
JSON.parse(localStorage.getItem("categories")) || [];



let cart = [];


let currentCategory = "All";


let editingID = null;


let scannerRunning = false;


let selectedBarcodes = [];


let barcodeCopies = {};



let lastScan = "";

let lastScanTime = 0;







// ================================
// SAVE DATA
// ================================


function saveData(){


localStorage.setItem(
"products",
JSON.stringify(products)
);



localStorage.setItem(
"sales",
JSON.stringify(sales)
);



localStorage.setItem(
"categories",
JSON.stringify(categories)
);


}









// ================================
// PAGE SWITCH
// ================================


function showPage(page){



document
.querySelectorAll(".page")
.forEach(p=>{

p.classList.remove("active");

});




let selected =
document.getElementById(page);



if(selected)

selected.classList.add("active");






if(page==="dashboard"){

updateDashboard();

}



if(page==="checkout"){

displayCategoryButtons();

displayProducts();


setTimeout(()=>{

document
.getElementById("checkoutBarcodeInput")
?.focus();

},200);


}





if(page==="inventory"){

displayInventory();

}



if(page==="barcodes"){

displayBarcodeList();

}



if(page==="categories"){

displayCategories();

}



if(page==="sales"){

displaySales();

}



}









// ================================
// DASHBOARD
// ================================


function updateDashboard(){


let productCount =
document.getElementById("productCount");


if(productCount)

productCount.innerText =
products.length;




let stockCount =
document.getElementById("inventoryCount");



if(stockCount)

stockCount.innerText =

products.reduce(

(a,p)=>a+Number(p.stock),

0

);





let low =
document.getElementById("lowStock");



if(low)

low.innerText =

products.filter(

p=>p.stock<=2

).length;





let sold =
document.getElementById("itemsSold");



if(sold)

sold.innerText =

sales.reduce(

(total,s)=>


total +

s.items.reduce(

(a,i)=>a+i.qty,

0

),

0

);



displayLowStock();

displayBestSellers();

displayCategoryStock();


}









// ================================
// LOW STOCK
// ================================


function displayLowStock(){


let box =
document.getElementById("lowStockList");



if(!box)

return;



box.innerHTML="";



products

.filter(p=>p.stock<=2)

.forEach(p=>{


box.innerHTML += `


<div>

⚠️ ${p.name}

<br>

Stock: ${p.stock}

</div>


`;



});


}









// ================================
// BEST SELLERS
// ================================


function displayBestSellers(){


let box =
document.getElementById("bestSellers");


if(!box)

return;



let sold={};



sales.forEach(s=>{


s.items.forEach(i=>{


sold[i.name] =
(sold[i.name] || 0)+i.qty;


});


});



box.innerHTML="";



Object.entries(sold)

.sort((a,b)=>b[1]-a[1])

.slice(0,5)

.forEach(i=>{


box.innerHTML += `

<div>

⭐ ${i[0]}

<br>

Sold: ${i[1]}

</div>

`;


});


}









// ================================
// CATEGORY STOCK
// ================================


function displayCategoryStock(){


let box =
document.getElementById("categoryStock");


if(!box)

return;



box.innerHTML="";



categories.forEach(c=>{


let total =

products

.filter(p=>p.category===c)

.reduce(

(a,p)=>a+p.stock,

0

);



box.innerHTML += `


<div>

📦 ${c}

<br>

${total} items

</div>


`;


});


}









// ================================
// CATEGORY SYSTEM
// ================================


function addCategory(){


let input =
document.getElementById("categoryName");


let name =
input.value.trim();



if(!name)

return;



if(!categories.includes(name)){


categories.push(name);


saveData();


}



input.value="";


displayCategories();


updateCategoryDropdowns();


displayCategoryButtons();


}







function displayCategories(){


let box =
document.getElementById("categoryList");


if(!box)

return;



box.innerHTML="";



categories.forEach((c,i)=>{


box.innerHTML += `


<div class="category-card">


${c}


<button onclick="deleteCategory(${i})">

Delete

</button>


</div>


`;


});


}






function deleteCategory(index){


let name =
categories[index];



products.forEach(p=>{


if(p.category===name)

p.category="";


});



categories.splice(index,1);



saveData();


displayCategories();

updateCategoryDropdowns();


}






function updateCategoryDropdowns(){


[
"productCategory",
"editCategory"

].forEach(id=>{


let select =
document.getElementById(id);



if(!select)

return;



select.innerHTML="";



categories.forEach(c=>{


select.innerHTML += `

<option value="${c}">

${c}

</option>

`;


});


});


}
// ================================
// CHECKOUT CATEGORIES
// ================================


function displayCategoryButtons(){


let box =
document.getElementById("categoryButtons");


if(!box)

return;



box.innerHTML = `

<button onclick="filterCategory('All')">

All

</button>

`;



categories.forEach(c=>{


box.innerHTML += `


<button onclick="filterCategory('${c}')">

${c}

</button>


`;


});


}






function filterCategory(category){


currentCategory = category;


displayProducts();


}









// ================================
// DISPLAY PRODUCTS
// ================================


function displayProducts(){


let box =
document.getElementById("products");



if(!box)

return;



box.innerHTML="";



products

.filter(p=>{


if(currentCategory==="All")

return true;


return p.category===currentCategory;


})


.forEach(p=>{



box.innerHTML += `


<div class="product"

onclick="addToCart(${p.id})">



${p.image ?

`<img src="${p.image}">`

:

"📦"

}




<h3>

${p.name}

</h3>



<p>

$${Number(p.price).toFixed(2)}

</p>



<small>

Stock: ${p.stock}

</small>



</div>


`;



});


}









// ================================
// ADD PRODUCT
// ================================


function generateBarcodeNumber(){


return Date.now()

.toString()

.slice(-12);


}






function generateProductBarcode(){


document.getElementById(
"productBarcode"
).value = generateBarcodeNumber();


}







function saveProduct(){


let product = {


id:Date.now(),



name:
document.getElementById("productName").value,



price:
Number(document.getElementById("productPrice").value),



stock:
Number(document.getElementById("productStock").value),



category:
document.getElementById("productCategory").value,



barcode:
document.getElementById("productBarcode").value ||
generateBarcodeNumber(),



image:""


};





let file =
document.getElementById("productImage").files[0];





if(file){


let reader = new FileReader();



reader.onload=function(e){


product.image=e.target.result;


products.push(product);


saveData();


finishAddProduct();


};



reader.readAsDataURL(file);



}

else{


products.push(product);


saveData();


finishAddProduct();


}


}







function finishAddProduct(){


document.getElementById("productName").value="";

document.getElementById("productPrice").value="";

document.getElementById("productStock").value="";

document.getElementById("productBarcode").value="";


displayInventory();

displayProducts();

updateDashboard();


showPage("inventory");


}









// ================================
// EDIT PRODUCT
// ================================


function editProduct(id){


let p =
products.find(x=>x.id===id);



if(!p)

return;



editingID=id;



editName.value=p.name;

editPrice.value=p.price;

editStock.value=p.stock;

editCategory.value=p.category;



showPage("editProduct");


}






function updateProduct(){


let p =
products.find(x=>x.id===editingID);



if(!p)

return;



p.name =
editName.value;



p.price =
Number(editPrice.value);



p.stock =
Number(editStock.value);



p.category =
editCategory.value;



saveData();


displayInventory();

displayProducts();


showPage("inventory");


}









// ================================
// INVENTORY
// ================================


function displayInventory(){


let box =
document.getElementById("inventoryList");



if(!box)

return;



box.innerHTML="";



products.forEach(p=>{


box.innerHTML += `


<div class="inventory-item">


${p.image ?

`<img src="${p.image}">`

:

""

}



<h3>

${p.name}

</h3>



Category:

${p.category}



<br>


Stock:

${p.stock}



<br>


Barcode:

${p.barcode}



<br>




<button onclick="editProduct(${p.id})">

✏️ Edit

</button>




<button onclick="addStock(${p.id})">

+1

</button>




<button onclick="removeStock(${p.id})">

-1

</button>




<button onclick="deleteProduct(${p.id})">

🗑 Delete

</button>



</div>


`;


});


}








function addStock(id){


let p =
products.find(x=>x.id===id);



if(p){

p.stock++;

saveData();

displayInventory();

updateDashboard();

}


}





function removeStock(id){


let p =
products.find(x=>x.id===id);



if(p && p.stock>0){


p.stock--;


saveData();


displayInventory();


updateDashboard();


}


}







function deleteProduct(id){


products =
products.filter(

p=>p.id!==id

);



saveData();



displayInventory();

displayProducts();

updateDashboard();


}









// ================================
// CART SYSTEM
// ================================


function addToCart(id){


let product =
products.find(p=>p.id===id);



if(!product)

return;



if(product.stock<=0){


alert("Out of stock");


return;


}



let item =
cart.find(i=>i.id===id);



if(item){


item.qty++;


}

else{


cart.push({

id:product.id,

name:product.name,

price:Number(product.price),

qty:1


});


}



updateCart();


}






function updateCart(){


let box =
document.getElementById("cartItems");



if(!box)

return;



box.innerHTML="";



let total=0;



cart.forEach(item=>{


total += item.price * item.qty;



box.innerHTML += `


<div class="cart-item">


${item.name}


<br>


Qty: ${item.qty}



<button onclick="removeCartItem(${item.id})">

X

</button>



</div>


`;


});



document.getElementById("total").innerText =
total.toFixed(2);


}





function removeCartItem(id){


cart =
cart.filter(i=>i.id!==id);



updateCart();


}






function clearCart(){


cart=[];


updateCart();


}
// ================================
// BLUETOOTH CHECKOUT SCANNER
// ================================


function checkoutBarcodeScan(){


let input =
document.getElementById("checkoutBarcodeInput");



let code =
input.value.trim();



if(code){


let product =
findProductByBarcode(code);



if(product){


addToCart(product.id);


}


}



input.value="";


}





// ================================
// BARCODE LOOKUP
// ================================


fufunction findProductByBarcode(code){

code = String(code).trim();


return products.find(p =>

String(p.barcode).trim() === code

);

}









// ================================
// SCANNER PAGE BLUETOOTH
// ================================


function barcodeEntered(){


let input =
document.getElementById("barcodeInput");



let code =
input.value.trim();



if(code){


processBarcodeScan(code);


}



input.value="";


}








function processBarcodeScan(code){



let product =
findProductByBarcode(code);



let result =
document.getElementById("scanResult");



if(!product){


if(result)

result.innerHTML="❌ Barcode not found";


return;


}





let mode =
document.getElementById("scanMode").value;





if(mode==="checkout"){


addToCart(product.id);



result.innerHTML = `

✅ Added

<br>

${product.name}

`;



}





if(mode==="add"){


product.stock++;


saveData();


displayInventory();


updateDashboard();



result.innerHTML = `

➕

${product.name}

<br>

Stock: ${product.stock}

`;



}







if(mode==="remove"){


if(product.stock>0)

product.stock--;



saveData();


displayInventory();


updateDashboard();



result.innerHTML = `

➖

${product.name}

<br>

Stock: ${product.stock}

`;



}



}









// ================================
// CAMERA SCANNER
// ================================


function startScanner(){


if(scannerRunning)

return;



scannerRunning=true;



Quagga.init({


inputStream:{


name:"Live",


type:"LiveStream",


target:
document.querySelector("#cameraScanner"),


constraints:{


facingMode:"environment"


}


},



decoder:{


readers:[
"code_128_reader",
"code_39_reader",
"ean_reader",
"ean_8_reader",
"upc_reader"
]


}



},function(error){


if(error){


console.log(error);


alert("Camera error");


return;


}



Quagga.start();



});






Quagga.onDetected(function(data){



let code = data.codeResult.code.trim();

console.log("CAMERA SCANNED:", code);

processBarcodeScan(code);



processBarcodeScan(code);



setTimeout(()=>{


stopScanner();


},500);



});



}







function stopScanner(){


if(scannerRunning){


Quagga.stop();


scannerRunning=false;


}


}









// ================================
// CHECKOUT PAYMENT
// ================================


function pay(type){



if(cart.length===0)

return;




cart.forEach(item=>{


let product =
products.find(
p=>p.id===item.id
);



if(product){


product.stock -= item.qty;


}


});






sales.push({


date:
new Date().toLocaleString(),



payment:type,



items:[...cart]


});





saveData();



cart=[];



updateCart();


displayProducts();


displayInventory();


updateDashboard();


}









// ================================
// BARCODE PRINTING V12
// ================================



function displayBarcodeList(){


let box =
document.getElementById("barcodeList");



if(!box)

return;



box.innerHTML="";




products.forEach(p=>{


if(!barcodeCopies[p.id])

barcodeCopies[p.id]=1;




box.innerHTML += `


<div class="barcode-card">


<input 
type="checkbox"
onchange="toggleBarcode(${p.id})"
>



<h3>

${p.name}

</h3>




<svg id="barcode-${p.id}"></svg>



<p>

${p.barcode}

</p>



<label>

Copies

</label>



<input

type="number"

min="1"

value="${barcodeCopies[p.id]}"

onchange="setBarcodeCopies(${p.id},this.value)"

>



</div>


`;



});






products.forEach(p=>{


JsBarcode(

"#barcode-"+p.id,

p.barcode,

{


format:"CODE128",

width:2,

height:60,

displayValue:true


}


);



});



}








function setBarcodeCopies(id,value){


barcodeCopies[id]=Number(value);



}








function toggleBarcode(id){


if(selectedBarcodes.includes(id)){


selectedBarcodes =
selectedBarcodes.filter(
x=>x!==id
);


}

else{


selectedBarcodes.push(id);


}



}








function selectAllBarcodes(){


selectedBarcodes =
products.map(p=>p.id);



displayBarcodeList();


}







function clearBarcodeSelection(){


selectedBarcodes=[];


displayBarcodeList();


}









function printSelectedBarcodes(){



let items =
products.filter(

p=>

selectedBarcodes.includes(p.id)

);



printBarcodes(items);


}








function printAllBarcodes(){



printBarcodes(products);


}








function printBarcodes(items){



let area =
document.getElementById("printArea");



area.innerHTML="";




items.forEach(p=>{



let amount =
barcodeCopies[p.id] || 1;



for(let i=0;i<amount;i++){



let label =
document.createElement("div");



label.className="print-label";



label.innerHTML=`


<h3>${p.name}</h3>


<svg id="print-${p.id}-${i}"></svg>


`;



area.appendChild(label);



}


});







items.forEach(p=>{


let amount =
barcodeCopies[p.id] || 1;



for(let i=0;i<amount;i++){


JsBarcode(

"#print-"+p.id+"-"+i,

p.barcode,

{


format:"CODE128",

width:2,

height:50,

displayValue:true


}

);


}


});





window.print();


}









// ================================
// SALES HISTORY
// ================================


function displaySales(){


let box =
document.getElementById("salesList");



if(!box)

return;



box.innerHTML="";



sales.forEach(s=>{


box.innerHTML += `


<div class="sales-item">


${s.date}


<br>


${s.payment}


<br>


${s.items.map(
i=>i.name+" x"+i.qty
).join(", ")}



</div>


`;


});


}







function clearSales(){


sales=[];


saveData();


displaySales();


}









// ================================
// STARTUP
// ================================


window.onload=function(){


updateCategoryDropdowns();


displayCategoryButtons();


displayProducts();


displayInventory();


displayBarcodeList();


updateDashboard();


updateCart();



};
console.log("POS V12 Loaded");