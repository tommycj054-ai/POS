
// ===============================
// POS V12 APP.JS
// PART 1
// ===============================



let products = JSON.parse(
localStorage.getItem("products")
) || [];



let sales = JSON.parse(
localStorage.getItem("sales")
) || [];



let categories = JSON.parse(
localStorage.getItem("categories")
) || [];



let cart = [];



let currentCategory = "All";



let editingID = null;



let scannerRunning = false;



let scanLocked = false;



let selectedBarcodes = [];



let barcodeCopies = {};








// ===============================
// SAVE DATA
// ===============================



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









// ===============================
// PAGE SYSTEM
// ===============================



function showPage(page){



document
.querySelectorAll(".page")
.forEach(section=>{


section.classList.remove(
"active"
);


});





let target =
document.getElementById(page);



if(target){


target.classList.add(
"active"
);


}







if(page==="dashboard"){


updateDashboard();


}



if(page==="checkout"){


displayProducts();


displayCategoryButtons();


}




if(page==="inventory"){


displayInventory();


}




if(page==="barcodes"){


displayBarcodeList();


}




if(page==="sales"){


displaySales();


}




if(page==="categories"){


displayCategories();


}



}









// ===============================
// BUTTON CONNECTION
// ===============================



function setupButtons(){



document
.querySelectorAll(".nav-button")
.forEach(button=>{



button.addEventListener(
"click",
()=>{


showPage(
button.dataset.page
);


});


});






document
.getElementById("clearCart")
?.addEventListener(
"click",
clearCart
);





document
.getElementById("cashPay")
?.addEventListener(
"click",
()=>pay("Cash")
);





document
.getElementById("cardPay")
?.addEventListener(
"click",
()=>pay("Card")
);





document
.getElementById("generateBarcode")
?.addEventListener(
"click",
generateProductBarcode
);





document
.getElementById("saveProduct")
?.addEventListener(
"click",
saveProduct
);





document
.getElementById("updateProduct")
?.addEventListener(
"click",
updateProduct
);



document
.getElementById("addCategory")
?.addEventListener(
"click",
addCategory
);



document
.getElementById("clearSales")
?.addEventListener(
"click",
clearSales
);



document
.getElementById("startCamera")
?.addEventListener(
"click",
startScanner
);



document
.getElementById("stopCamera")
?.addEventListener(
"click",
stopScanner
);



document
.getElementById("selectAllBarcodes")
?.addEventListener(
"click",
selectAllBarcodes
);



document
.getElementById("clearBarcodeSelection")
?.addEventListener(
"click",
clearBarcodeSelection
);



document
.getElementById("printSelected")
?.addEventListener(
"click",
printSelectedBarcodes
);



document
.getElementById("printAll")
?.addEventListener(
"click",
printAllBarcodes
);



}









// ===============================
// DASHBOARD
// ===============================



function updateDashboard(){



let productCount =
document.getElementById(
"productCount"
);



if(productCount)

productCount.innerText =
products.length;






let inventoryCount =
document.getElementById(
"inventoryCount"
);



if(inventoryCount)


inventoryCount.innerText =

products.reduce(
(total,p)=>total+p.stock,
0
);







let lowStock =
document.getElementById(
"lowStock"
);



if(lowStock)


lowStock.innerText =

products.filter(
p=>p.stock<=2
).length;







let sold =
document.getElementById(
"itemsSold"
);



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



}









// ===============================
// LOW STOCK
// ===============================



function displayLowStock(){


let box =
document.getElementById(
"lowStockList"
);



if(!box)

return;



box.innerHTML="";



products
.filter(
p=>p.stock<=2
)
.forEach(product=>{


box.innerHTML += `


<div class="sales-item">

⚠️ ${product.name}

<br>

Stock: ${product.stock}

</div>


`;



});



}









// ===============================
// START APP
// ===============================



window.addEventListener(
"DOMContentLoaded",
()=>{


setupButtons();


updateDashboard();


displayProducts();


displayInventory();


updateCart();


console.log(
"POS V12 Loaded"
);


}

);

// ===============================
// PRODUCT CREATION
// ===============================


function generateBarcodeNumber(){


return Date.now()
.toString()
.slice(-12);


}








function generateProductBarcode(){


let input =
document.getElementById(
"productBarcode"
);



input.value =
generateBarcodeNumber();



}








function saveProduct(){



let product = {


id:Date.now(),


name:
document.getElementById(
"productName"
).value.trim(),



price:
Number(
document.getElementById(
"productPrice"
).value
),



stock:
Number(
document.getElementById(
"productStock"
).value
),



category:
document.getElementById(
"productCategory"
).value,



barcode:
document.getElementById(
"productBarcode"
).value ||
generateBarcodeNumber(),



image:""



};





let file =
document.getElementById(
"productImage"
).files[0];







function finishSave(){



products.push(product);


saveData();


updateDashboard();


displayInventory();


displayProducts();


showPage(
"inventory"
);



}








if(file){



let reader =
new FileReader();



reader.onload=function(e){



product.image =
e.target.result;



finishSave();



};



reader.readAsDataURL(file);



}

else{


finishSave();



}



}









// ===============================
// INVENTORY DISPLAY
// ===============================



function displayInventory(){



let box =
document.getElementById(
"inventoryList"
);



if(!box)

return;



box.innerHTML="";



products.forEach(product=>{



box.innerHTML += `


<div class="inventory-item">


${
product.image ?

`<img src="${product.image}">`

:

"📦"

}



<h3>

${product.name}

</h3>



Category:

${product.category || "None"}


<br>


Stock:

${product.stock}



<br>


Barcode:

${product.barcode}



<br><br>



<button onclick="editProduct(${product.id})">

✏️ Edit

</button>



<button onclick="addStock(${product.id})">

+1

</button>



<button onclick="removeStock(${product.id})">

-1

</button>



<button onclick="deleteProduct(${product.id})">

🗑 Delete

</button>



</div>



`;



});



}









function addStock(id){


let product =
products.find(
p=>p.id===id
);



if(product){


product.stock++;


}



saveData();


displayInventory();


updateDashboard();


}








function removeStock(id){



let product =
products.find(
p=>p.id===id
);



if(product && product.stock>0){


product.stock--;


}



saveData();


displayInventory();


updateDashboard();



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









// ===============================
// EDIT PRODUCT
// ===============================



function editProduct(id){


let product =
products.find(
p=>p.id===id
);



if(!product)

return;



editingID=id;



document.getElementById(
"editName"
).value =
product.name;



document.getElementById(
"editPrice"
).value =
product.price;



document.getElementById(
"editStock"
).value =
product.stock;



document.getElementById(
"editCategory"
).value =
product.category;



showPage(
"editProduct"
);



}








function updateProduct(){



let product =
products.find(
p=>p.id===editingID
);



if(!product)

return;




product.name =
document.getElementById(
"editName"
).value;



product.price =
Number(
document.getElementById(
"editPrice"
).value
);



product.stock =
Number(
document.getElementById(
"editStock"
).value
);



product.category =
document.getElementById(
"editCategory"
).value;



saveData();


displayInventory();


showPage(
"inventory"
);



}









// ===============================
// CATEGORY SYSTEM
// ===============================



function addCategory(){



let input =
document.getElementById(
"categoryName"
);



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


}








function displayCategories(){



let box =
document.getElementById(
"categoryList"
);



if(!box)

return;



box.innerHTML="";



categories.forEach((cat,index)=>{


box.innerHTML += `


<div class="category-card">


${cat}



<button onclick="deleteCategory(${index})">

Delete

</button>



</div>


`;



});


}








function deleteCategory(index){



let cat =
categories[index];



products.forEach(product=>{


if(product.category===cat)

product.category="";


});



categories.splice(index,1);



saveData();


displayCategories();


updateCategoryDropdowns();



}








function updateCategoryDropdowns(){



let lists=[

document.getElementById(
"productCategory"
),

document.getElementById(
"editCategory"
)

];



lists.forEach(select=>{


if(!select)

return;



select.innerHTML="";



categories.forEach(cat=>{


select.innerHTML += `

<option value="${cat}">

${cat}

</option>

`;


});



});


}

// ===============================
// CHECKOUT DISPLAY
// ===============================


function displayCategoryButtons(){


let box =
document.getElementById(
"categoryButtons"
);



if(!box)

return;



box.innerHTML = `

<button onclick="filterCategory('All')">

All

</button>

`;



categories.forEach(category=>{


box.innerHTML += `


<button onclick="filterCategory('${category}')">

${category}

</button>


`;



});


}








function filterCategory(category){


currentCategory = category;


displayProducts();


}








function displayProducts(){


let box =
document.getElementById(
"products"
);



if(!box)

return;



box.innerHTML="";



products

.filter(product=>{


if(currentCategory==="All")

return true;



return product.category===currentCategory;



})

.forEach(product=>{



box.innerHTML += `


<div class="product"
onclick="addToCart(${product.id})">



${
product.image ?

`<img src="${product.image}">`

:

"📦"

}



<h3>

${product.name}

</h3>



<p>

$${product.price.toFixed(2)}

</p>



<small>

Stock: ${product.stock}

</small>



</div>



`;



});



}









// ===============================
// CART
// ===============================



function addToCart(id){



let product =
products.find(
p=>p.id===id
);



if(!product)

return;



if(product.stock<=0){


alert(
"Out of stock"
);


return;


}



let item =
cart.find(
i=>i.id===id
);



if(item){


item.qty++;


}

else{


cart.push({


id:product.id,


name:product.name,


price:product.price,


qty:1



});


}



updateCart();



}








function updateCart(){


let box =
document.getElementById(
"cartItems"
);



if(!box)

return;



box.innerHTML="";



let total=0;



cart.forEach(item=>{



total +=
item.price *
item.qty;



box.innerHTML += `


<div class="cart-item">


<div>

${item.name}

<br>

Qty: ${item.qty}

</div>



<button onclick="removeCartItem(${item.id})">

❌

</button>



</div>



`;



});






document.getElementById(
"total"
).innerText =
total.toFixed(2);



}








function removeCartItem(id){



cart =
cart.filter(
item=>item.id!==id
);



updateCart();



}








function clearCart(){


cart=[];


updateCart();


}









// ===============================
// PAYMENT
// ===============================



function pay(type){



if(cart.length===0){


alert(
"Cart is empty"
);


return;


}




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



date:new Date()
.toLocaleString(),



payment:type,



items:[...cart]



});





saveData();



cart=[];


updateCart();


displayProducts();


displayInventory();


updateDashboard();



alert(
"Paid with "+type
);



}









// ===============================
// BARCODE SEARCH
// ===============================



function findProductByBarcode(code){


code =
String(code)
.trim();



return products.find(product=>{


return String(product.barcode)
.trim() === code;



});


}









// ===============================
// BLUETOOTH SCANNER
// ===============================



function processBarcodeScan(code){



let product =
findProductByBarcode(code);



let result =
document.getElementById(
"scanResult"
);



if(!product){


if(result)

result.innerHTML =
"❌ Barcode not found<br>"+code;



return;


}




let mode =
document.getElementById(
"scanMode"
);



mode =
mode ? mode.value : "checkout";







if(mode==="checkout"){


addToCart(product.id);


}



if(mode==="add"){


product.stock++;


saveData();


displayInventory();


}





if(mode==="remove"){


if(product.stock>0)

product.stock--;


saveData();


displayInventory();


}




if(result){


result.innerHTML = `

✅ ${product.name}

<br>

Stock: ${product.stock}

`;



}



updateDashboard();



}









function setupScannerInputs(){



let checkout =
document.getElementById(
"checkoutScanner"
);



if(checkout){


checkout.addEventListener(
"change",
()=>{


processBarcodeScan(
checkout.value
);



checkout.value="";


}


);



}





let inventory =
document.getElementById(
"inventoryScanner"
);



if(inventory){


inventory.addEventListener(
"change",
()=>{


processBarcodeScan(
inventory.value
);



inventory.value="";


}



);



}



}









// ===============================
// IPAD CAMERA SCANNER
// ===============================



function startScanner(){



if(scannerRunning)

return;



scanLocked=false;



scannerRunning=true;




Quagga.init({



inputStream:{


name:"Live",


type:"LiveStream",


target:
document.getElementById(
"cameraScanner"
),



constraints:{


facingMode:"environment"


}


},



decoder:{


readers:[


"code_128_reader",

"ean_reader",

"ean_8_reader",

"upc_reader"

]


}



},function(error){



if(error){


alert(
"Camera failed"
);


scannerRunning=false;


return;


}



Quagga.start();



});







Quagga.onDetected(function(result){



if(scanLocked)

return;



scanLocked=true;



let code =
result.codeResult.code;



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



scanLocked=false;



}

// ===============================
// BARCODE PRINTING
// ===============================


function displayBarcodeList(){


let box =
document.getElementById(
"barcodeList"
);



if(!box)

return;



box.innerHTML="";



products.forEach(product=>{



if(!barcodeCopies[product.id]){


barcodeCopies[product.id]=1;


}



box.innerHTML += `


<div class="barcode-card">


<input

type="checkbox"

class="barcode-check"

data-id="${product.id}"

>


<h3>

${product.name}

</h3>



<svg id="barcode-${product.id}"></svg>



<p>

${product.barcode}

</p>



<input

type="number"

min="1"

value="${barcodeCopies[product.id]}"

onchange="changeBarcodeCopies(${product.id},this.value)"

>


</div>


`;



});







products.forEach(product=>{


JsBarcode(

"#barcode-"+product.id,

product.barcode,

{


format:"CODE128",

width:2,

height:60,

displayValue:true


}



);



});



}








function changeBarcodeCopies(id,value){



barcodeCopies[id] =
Math.max(
1,
Number(value)
);



}








function selectAllBarcodes(){


selectedBarcodes =
products.map(
p=>p.id
);



document
.querySelectorAll(
".barcode-check"
)
.forEach(check=>{


check.checked=true;


});



}








function clearBarcodeSelection(){



selectedBarcodes=[];



document
.querySelectorAll(
".barcode-check"
)
.forEach(check=>{


check.checked=false;


});



}








document.addEventListener(
"change",
function(e){



if(
e.target.classList.contains(
"barcode-check"
)
){



let id =
Number(
e.target.dataset.id
);



if(e.target.checked){


selectedBarcodes.push(id);


}

else{


selectedBarcodes =
selectedBarcodes.filter(
x=>x!==id
);


}



}



}

);








function printSelectedBarcodes(){



let items =
products.filter(
p=>

selectedBarcodes.includes(
p.id
)

);



printBarcodes(items);



}








function printAllBarcodes(){


printBarcodes(products);



}








function printBarcodes(items){



let area =
document.getElementById(
"printArea"
);



area.innerHTML="";



items.forEach(product=>{


let copies =
barcodeCopies[product.id] || 1;



for(
let i=0;
i<copies;
i++
){



let label =
document.createElement(
"div"
);



label.className =
"print-label";



label.innerHTML = `


<h3>

${product.name}

</h3>


<svg id="print-${product.id}-${i}"></svg>



`;



area.appendChild(label);



}



});







items.forEach(product=>{



let copies =
barcodeCopies[product.id] || 1;



for(
let i=0;
i<copies;
i++
){



JsBarcode(

"#print-"+product.id+"-"+i,

product.barcode,

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









// ===============================
// SALES HISTORY
// ===============================


function displaySales(){



let box =
document.getElementById(
"salesList"
);



if(!box)

return;



box.innerHTML="";



sales.forEach(sale=>{


box.innerHTML += `


<div class="sales-item">


<b>

${sale.date}

</b>


<br>


Payment:

${sale.payment}



<br>


${sale.items.map(
item=>

item.name+" x"+item.qty

).join(", ")}



</div>


`;



});



}








function clearSales(){


sales=[];


saveData();


displaySales();


updateDashboard();


}









// ===============================
// FINAL STARTUP
// ===============================



window.addEventListener(
"DOMContentLoaded",
()=>{



setupButtons();



setupScannerInputs();



updateCategoryDropdowns();



displayCategoryButtons();



displayProducts();



displayInventory();



displayBarcodeList();



displaySales();



updateDashboard();



updateCart();



console.log(
"POS V12 Ready"
);



});