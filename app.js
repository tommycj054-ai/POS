
// ================================
// POS V11 DATA
// ================================

let products =
JSON.parse(localStorage.getItem("products")) || [];

let sales =
JSON.parse(localStorage.getItem("sales")) || [];

let categories =
JSON.parse(localStorage.getItem("categories")) || [];

let todos =
JSON.parse(localStorage.getItem("todos")) || [];


let cart = [];

let currentCategory = "All";

let editingID = null;

let scannerRunning = false;

let selectedBarcodes = [];

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



localStorage.setItem(
"todos",
JSON.stringify(todos)
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




document
.getElementById(page)
.classList.add("active");





if(page==="dashboard"){

updateDashboard();

}



if(page==="checkout"){

displayCategoryButtons();

displayProducts();

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



let count =
document.getElementById("productCount");

if(count)

count.innerText =
products.length;





let stock =
document.getElementById("inventoryCount");


if(stock)

stock.innerText =

products.reduce(

(a,p)=>a+p.stock,

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

<div class="sales-item">

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

(sold[i.name] || 0)

+ i.qty;



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


let amount =

products

.filter(p=>p.category===c)

.reduce(

(a,p)=>a+p.stock,

0

);



box.innerHTML += `


<div class="sales-item">

📦 ${c}

<br>

${amount} items

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


// ================================
// CATEGORY DROPDOWNS
// ================================

function updateCategoryDropdowns(){


let selects = [

document.getElementById("productCategory"),

document.getElementById("editCategory")

];



selects.forEach(select=>{


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
// PRODUCT DISPLAY
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

$${p.price}

</p>



<small>

Stock: ${p.stock}

</small>



</div>


`;



});



}









function searchProducts(){


let search =

document
.getElementById("search")
.value
.toLowerCase();



let box =
document.getElementById("products");



box.innerHTML="";



products

.filter(p=>

p.name

.toLowerCase()

.includes(search)

)



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

$${p.price}

</p>


</div>


`;



});



}









// ================================
// BARCODE GENERATOR
// ================================


function generateBarcodeNumber(){


return Date.now()

.toString()

.slice(-12);


}





function generateProductBarcode(){


let box =

document.getElementById(
"productBarcode"
);



box.value =

generateBarcodeNumber();



}









// ================================
// ADD PRODUCT
// ================================


function saveProduct(){


let product = {


id:Date.now(),


name:

productName.value,


price:

Number(productPrice.value),


stock:

Number(productStock.value),


category:

productCategory.value,



barcode:

productBarcode.value ||

generateBarcodeNumber(),



image:""


};






let file =

productImage.files[0];






if(file){



let reader =

new FileReader();




reader.onload=function(e){



product.image =

e.target.result;



products.push(product);



saveData();



displayInventory();



showPage("inventory");



};




reader.readAsDataURL(file);



}

else{


products.push(product);



saveData();



displayInventory();



showPage("inventory");


}



}









// ================================
// EDIT PRODUCT
// ================================


function editProduct(id){


let p =

products.find(

x=>x.id===id

);



editingID=id;



editName.value=p.name;


editPrice.value=p.price;


editStock.value=p.stock;


editCategory.value=p.category;



showPage("editProduct");



}







function updateProduct(){



let p =

products.find(

x=>x.id===editingID

);




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



showPage("inventory");



}









// ================================
// INVENTORY
// ================================


function displayInventory(){



let box =

document.getElementById(
"inventoryList"
);



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

products.find(

x=>x.id===id

);



p.stock++;



saveData();



displayInventory();



updateDashboard();



}






function removeStock(id){



let p =

products.find(

x=>x.id===id

);




if(p.stock>0)

p.stock--;



saveData();



displayInventory();



updateDashboard();



}
// ================================
// DELETE PRODUCT
// ================================

function deleteProduct(id){


let product = products.find(
p => p.id === id
);



if(!product)

return;



products = products.filter(
p => p.id !== id
);



saveData();



displayInventory();

displayProducts();

displayBarcodeList();

updateDashboard();


}

// ================================
// FIND PRODUCT BY BARCODE
// ================================


function findProductByBarcode(code){


return products.find(

p => p.barcode === code

);


}









// ================================
// BLUETOOTH SCANNER
// ================================
// Most Bluetooth scanners act like a keyboard


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









// ================================
// PROCESS SCAN
// ================================


function processBarcodeScan(code){


let now = Date.now();


// Prevent duplicate scans
if(
    code === lastScan &&
    now - lastScanTime < 1500
){

    return;

}


lastScan = code;
lastScanTime = now;



let product = findProductByBarcode(code);



let result =
document.getElementById("scanResult");



if(!product){


if(result)

result.innerHTML =
"❌ Barcode not found";


return;


}





let mode =
document.getElementById("scanMode").value;





// ADD TO CART

if(mode==="checkout"){


addToCart(product.id);


if(result)

result.innerHTML = `

✅ Added to Cart

<br>

${product.name}

`;



}








// ADD EXACTLY 1 STOCK

if(mode==="add"){


product.stock = Number(product.stock) + 1;


saveData();


displayInventory();


if(result)

result.innerHTML = `

➕

${product.name}

<br>

Stock: ${product.stock}

`;



}









// REMOVE EXACTLY 1 STOCK

if(mode==="remove"){



if(product.stock > 0){


product.stock = Number(product.stock) - 1;


}



saveData();


displayInventory();



if(result)

result.innerHTML = `

➖

${product.name}

<br>

Stock: ${product.stock}

`;



}



updateDashboard();


}




// ================================
// IPAD CAMERA SCANNER
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

document.querySelector(
"#cameraScanner"
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


console.log(error);


alert(
"Camera could not start"
);


return;


}



Quagga.start();



});








Quagga.onDetected(function(data){

let code =
data.codeResult.code;


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
// CART SYSTEM
// ================================


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


${item.name}


<br>


Qty:

${item.qty}



<button onclick="removeCartItem(${item.id})">

X

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

i=>i.id!==id

);



updateCart();



}







function clearCart(){



cart=[];



updateCart();



}








// ================================
// CHECKOUT
// ================================


function pay(type){



cart.forEach(item=>{



let product =

products.find(

p=>p.id===item.id

);



if(product){



product.stock -=

item.qty;



}



});







sales.push({



date:

new Date()
.toLocaleString(),



payment:type,



items:[...cart]



});






saveData();



cart=[];



updateCart();



updateDashboard();



displayProducts();



}

// ================================
// BARCODE PRINTING
// ================================


function displayBarcodeList(){


let box =

document.getElementById(
"barcodeList"
);



if(!box)

return;




box.innerHTML="";





products.forEach(p=>{



box.innerHTML += `


<div class="barcode-card">


<input 
type="checkbox"
id="check-${p.id}"
onchange="toggleBarcode(${p.id})"
>



<h3>

${p.name}

</h3>



<svg id="barcode-${p.id}"></svg>



<p>

${p.barcode}

</p>



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









function toggleBarcode(id){



if(

selectedBarcodes.includes(id)

){



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









// PRINT SELECTED


function printSelectedBarcodes(){



let items =

products.filter(

p=>

selectedBarcodes.includes(p.id)

);



printBarcodes(items);



}








// PRINT ALL


function printAllBarcodes(){



printBarcodes(products);



}









function printBarcodes(items){



let area =

document.getElementById(
"printArea"
);



area.innerHTML="";



let size =

document.getElementById(
"labelSize"
).value;





items.forEach(p=>{



let div =

document.createElement("div");



div.className =
"print-label";




if(size==="medium"){


div.style.width="2.625in";


div.style.height="1in";


}



if(size==="large"){


div.style.width="3.33in";


div.style.height="2in";


}




if(size==="full"){


div.style.width="8.5in";


div.style.height="11in";


}





div.innerHTML = `


<h3>

${p.name}

</h3>


<svg id="print-barcode-${p.id}"></svg>


`;




area.appendChild(div);




});








items.forEach(p=>{


JsBarcode(

"#print-barcode-"+p.id,

p.barcode,


{


format:"CODE128",

width:2,

height:50,

displayValue:true


}



);



});







window.print();



}









// ================================
// SALES HISTORY
// ================================



function displaySales(){



let box =

document.getElementById(
"salesList"
);



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



${s.items

.map(i=>i.name+" x"+i.qty)

.join(", ")

}



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