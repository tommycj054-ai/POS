// ===============================
// POS V12 APP.JS
// PART 1
// ===============================


// DATA

let products =
JSON.parse(localStorage.getItem("products")) || [];


let categories =
JSON.parse(localStorage.getItem("categories")) || [];


let sales =
JSON.parse(localStorage.getItem("sales")) || [];



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
"categories",
JSON.stringify(categories)
);


localStorage.setItem(
"sales",
JSON.stringify(sales)
);


}








// ===============================
// PAGE SWITCHING
// ===============================


function showPage(page){


document
.querySelectorAll(".page")
.forEach(section=>{

section.classList.remove("active");

});



let selected =
document.getElementById(page);



if(selected){

selected.classList.add("active");

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



if(page==="categories"){

displayCategories();

}



if(page==="sales"){

displaySales();

}



}








// ===============================
// IPAD BUTTON SYSTEM
// ===============================


document.addEventListener(
"DOMContentLoaded",
()=>{


document
.querySelectorAll("[data-page]")
.forEach(button=>{


button.addEventListener(
"click",
()=>{


showPage(
button.dataset.page
);


});


});



}
);









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





let inventory =
document.getElementById(
"inventoryCount"
);



if(inventory)

inventory.innerText =

products.reduce(

(total,p)=>

total + Number(p.stock),

0

);






let low =
document.getElementById(
"lowStock"
);



if(low)

low.innerText =

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

.filter(p=>p.stock<=2)

.forEach(p=>{


box.innerHTML += `


<div class="sales-item">

⚠️ ${p.name}

<br>

Stock: ${p.stock}

</div>


`;


});


}








// ===============================
// BEST SELLERS
// ===============================


function displayBestSellers(){


let box =
document.getElementById(
"bestSellers"
);



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

.forEach(item=>{


box.innerHTML += `


<div class="sales-item">

⭐ ${item[0]}

<br>

Sold: ${item[1]}

</div>


`;


});


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


displayCategoryButtons();


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


let name =
categories[index];



products.forEach(product=>{


if(product.category===name){

product.category="";

}


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
// PRODUCT SYSTEM
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


let name =
document.getElementById(
"productName"
).value.trim();



let price =
Number(
document.getElementById(
"productPrice"
).value
);



let stock =
Number(
document.getElementById(
"productStock"
).value
);



let category =
document.getElementById(
"productCategory"
).value;



let barcode =
document.getElementById(
"productBarcode"
).value;



let imageInput =
document.getElementById(
"productImage"
);




let product = {


id:Date.now(),


name:name,


price:price,


stock:stock,


category:category,


barcode:
barcode || generateBarcodeNumber(),


image:""


};





if(imageInput.files[0]){


let reader =
new FileReader();



reader.onload=function(e){


product.image=e.target.result;


products.push(product);


saveData();


clearProductForm();


showPage("inventory");


};


reader.readAsDataURL(
imageInput.files[0]
);


}

else{


products.push(product);


saveData();


clearProductForm();


showPage("inventory");


}



}








function clearProductForm(){


[
"productName",
"productPrice",
"productStock",
"productBarcode"

].forEach(id=>{


let element =
document.getElementById(id);



if(element)

element.value="";


});


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
).value=product.name;



document.getElementById(
"editPrice"
).value=product.price;



document.getElementById(
"editStock"
).value=product.stock;



document.getElementById(
"editCategory"
).value=product.category;



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
// INVENTORY
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

${product.category}



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
// CHECKOUT PRODUCTS
// ===============================


function displayCategoryButtons(){


let box =
document.getElementById(
"categoryButtons"
);



if(!box)

return;



box.innerHTML=`


<button onclick="filterCategory('All')">

All

</button>


`;



categories.forEach(cat=>{


box.innerHTML += `


<button onclick="filterCategory('${cat}')">

${cat}

</button>


`;



});


}








function filterCategory(cat){


currentCategory=cat;


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
// CART SYSTEM
// ===============================


function addToCart(id){


let product =
products.find(
p=>p.id===id
);



if(!product)

return;



if(product.stock<=0){

alert("Out of stock");

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


total += item.price * item.qty;



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
// CHECKOUT PAYMENT
// ===============================


function pay(type){



if(cart.length===0){

alert("Cart is empty");

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


updateDashboard();


displayProducts();



alert(
"Payment Complete: "+type
);


}









// ===============================
// BARCODE LOOKUP
// ===============================


function findProductByBarcode(code){



code =
String(code)
.trim();



return products.find(product=>{


return String(product.barcode)
.trim()===code;



});


}








// ===============================
// BLUETOOTH SCANNER
// ===============================


// Most scanners act like keyboards


function barcodeEntered(){



let input =
document.getElementById(
"barcodeInput"
);



let code =
input.value.trim();



if(code){


processBarcodeScan(code);


}



input.value="";


}








function checkoutBarcodeEntered(){


let input =
document.getElementById(
"checkoutBarcodeInput"
);



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



if(mode)

mode=mode.value;

else

mode="checkout";







if(mode==="checkout"){


addToCart(product.id);



if(result)

result.innerHTML =

"✅ Added<br>"+product.name;



}







if(mode==="add"){


product.stock++;


saveData();


displayInventory();


updateDashboard();



if(result)

result.innerHTML=

"➕ Added 1<br>"+product.name;



}








if(mode==="remove"){



if(product.stock>0)

product.stock--;



saveData();


displayInventory();


updateDashboard();



if(result)

result.innerHTML=

"➖ Removed 1<br>"+product.name;



}



}









// ===============================
// IPAD CAMERA SCANNER
// ===============================


function startScanner(){

if(scannerRunning)
return;


scanLocked = false;

scannerRunning = true;



Quagga.init({

inputStream:{

name:"Live",

type:"LiveStream",

target:
document.querySelector("#cameraScanner"),

constraints:{

facingMode:"environment",

width:640,

height:480

}

},


decoder:{

readers:[

"code_128_reader",

"ean_reader",

"ean_8_reader",

"upc_reader",

"code_39_reader"

]

}


},function(error){


if(error){

console.log(error);

alert("Camera error");

scannerRunning=false;

return;

}


Quagga.start();


});





Quagga.onDetected(function(data){



// Stop multiple scans

if(scanLocked)
return;



scanLocked = true;



let code =
data.codeResult.code.trim();



console.log(
"Camera Scan:",
code
);



processBarcodeScan(code);




// Turn camera off after one scan

setTimeout(()=>{


stopScanner();


},500);



});



}


decoder:{


readers:[

"code_128_reader",

"ean_reader",

"ean_8_reader",

"upc_reader",

"code_39_reader"

]


}



},function(error){



if(error){


console.log(error);


alert(
"Camera error"
);


scannerRunning=false;


return;


}



Quagga.start();


});





Quagga.onDetected(function(data){



let code =
data.codeResult.code;



console.log(
"Camera Scan:",
code
);



processBarcodeScan(code);



setTimeout(()=>{


stopScanner();


},700);



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
onchange="toggleBarcode(${product.id})"
>


<h3>

${product.name}

</h3>


<svg id="barcode-${product.id}"></svg>


<p>

${product.barcode}

</p>



<label>

Copies:

</label>


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
products.map(
p=>p.id
);



displayBarcodeList();



}








function clearBarcodeSelection(){


selectedBarcodes=[];


displayBarcodeList();


}








function printSelectedBarcodes(){



let items =
products.filter(
p=>selectedBarcodes.includes(p.id)
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



label.className=
"print-label";



label.innerHTML=`


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
// STARTUP
// ===============================


window.onload=function(){



updateCategoryDropdowns();


displayCategoryButtons();


displayProducts();


displayInventory();


displayBarcodeList();


updateDashboard();


updateCart();



// Bluetooth scanners
// automatically focus here

let scanInput =
document.getElementById(
"checkoutBarcodeInput"
);



if(scanInput){


scanInput.focus();



scanInput.addEventListener(
"change",
checkoutBarcodeEntered
);


}



let inventoryScanner =
document.getElementById(
"barcodeInput"
);



if(inventoryScanner){


inventoryScanner.addEventListener(
"change",
barcodeEntered
);


}



};