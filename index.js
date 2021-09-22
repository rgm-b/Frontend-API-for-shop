let token = null;

let product_id = null;
let productTitle = null;
let price = null;

//Объект для кнопок меню авторизации и регистрации
let signMenu ={
  image_src:"img/img-profile.png",
  fields:[
    {  
      id:"buttonLogin",
      class:"link",
      name:"Авторизоваться"
    },
    {
      id:"buttonCreateUser",
      class:"link",
      name:"Зарегистрироваться"
    }
  ]
};	

let objFormAuthorize = {  
  id: "formAuthorization", 
  title: "Авторизация" 
};
let objFormRegistration = {  
  id: "formRegistration", 
  title: "Регистрация" 
};

//для формы добавления нового товара
let objFormAdd = {
  id: "formAddProduct",
  title: "Добавить товаР"
}

//для формы изменения товара
let obj_form_change = {
  id: "change_product",
  title: "ИЗМЕНЕНИЕ ТОВАРА"
}

let handlebars = (templateID, obj, placeID ) => {
  let source = $(templateID).html();
  let template = Handlebars.compile(source);
  let readyTemplate = template(obj);
  $(placeID).html(readyTemplate);
}

//универсальная функция ajax запроса на сервер
let request = (method, urlEnd, success, data, beforeSend,processData,contentType) => {
  $.ajax({
        method,
        url: 'http://localhost:3000/' + urlEnd,  
        success, //исполняется в случае успеха    
        processData,            
        contentType,         
        data,      
        beforeSend,              
    });
}

//данные при отправке формы регистрации и авторизации (name)
const objData = (self) => {
    const formData = new FormData(self);
	return Object.fromEntries( formData.entries() );
}

// success регистрации
let successRegistration = (response) => {
  alert(`${response.message}, Новый пользователь создан!`);
  $('#buttonLogin').trigger('click'); //кликнем по кнопке авторизации для вывода формы авторизации
}

// success авторизации
let successAutorization = (response) => {
  token = response.token;            
  if( token !== null ){
      console.log(`${response.message} - Вы авторизовались!`);
      console.log("token:", response.token);      
  }               
  request('GET', 'products', getProductList );   
}

//success вывода товаров после успешной авторизации
function getProductList(response){
    console.log("Получили объект для вывода списка продуктов:", response);  

    handlebars("#button-template", null,  "#place"); //выводим кнопки Добавить товар и Перейти в корзину
    handlebars( "#products", response , "#placeForContent"); //выводим список продуктов после авторизации
}

//проверка
let beforeSend = (xhr) => {
  xhr.setRequestHeader("Authorization", "token " + token);
}

let successGoToCart = (response) => {
  handlebars("#button-cart-template", null, "#place"); //переписываем кнопки в меню

  console.log("Ответ, содержимое вашей корзины:", response.orders);

  let sum = 0;
  response.orders.forEach( currentValue => {
    let sumPrice = currentValue.product.price * currentValue.quantity;
    currentValue.product.priceSum = currentValue.product.price * currentValue.quantity;

    sum += currentValue.product.priceSum; //Делаем итого (в таблице)  
  });
  
  handlebars("#tpl_cart", response, "#placeForContent"); //Выводим содержимое корзины по шаблону в таблицу               
  $("#total").html(`${sum} руб`); //выводим значение Итого в таблицу из переменной sum  
}

//добавить продукт в корзину ( Add to cart )
let addProductToCart = (product_id) => {     
  let productParam = {"productId": product_id, "quantity": "1"};
  request('POST', 'orders', successAddToCart, productParam, beforeSend);    
}

let successAddToCart = (response) => {
  alert("Продукт добавлен в корзину!");
  console.log("Ответ, после добавления продукта в корзину", response)
}

//Добавление нового товара в магазин
function addProductSuccess(r){
  alert("Продукт успешно добавлен!");
  request('GET', 'products', getProductList );              
}
//Добавление нового товара в магазин
function addProduct(self){
  let formData = new FormData(self);  
  request('POST', 'products', addProductSuccess , formData, beforeSend, false, false); 
}

//Изменение товара в магазине
function addProductChange(self){
  let formData = new FormData(self);  
  request('PATCH', 'products/'+product_id , addProductChangeSuccess, formData, beforeSend, false, false)
}
function addProductChangeSuccess(r){
	alert("Продукт успешно Изменён!");
	request('GET', 'products', getProductList );  
}

//success дезинтергации (удаление товара насовсем)
function disintegration(response){
	console.log(response);
    console.log("Продукт дезинтегрирован!");	
	console.log(getProductList);

	request('GET', 'products', getProductList );
}

//@@@@@@ начало рефакторинга

//выводим форму регистрации
$('body').on('click', '#buttonCreateUser', function(){         
  handlebars('#tplFormsSign', objFormRegistration, '#placeForContent');    
});

//выводим форму авторизации 
$('body').on('click', '#buttonLogin', function(){         
  handlebars('#tplFormsSign', objFormAuthorize, '#placeForContent');    
});

//регистрация - отправка формы
$('body').on('submit', '#formRegistration', function(e){
  e.preventDefault();
  request('POST', 'user/signup', successRegistration, objData(this) );    
}); 

//авторизация - отправка формы
$('body').on('submit', '#formAuthorization', function(e){    
    e.preventDefault(); 
    request('POST', 'user/login', successAutorization, objData(this) ); //this = form#formAuthorization
});

//добавления нового товара - отрисовка формы
$("body").on("click", '#buttonAddProduct', function(){    
  handlebars("#tplProduct", objFormAdd, "#placeProduct"); 
});   
//добавление товара - отправка формы
$("body").on('submit', '#formAddProduct', function (e){
  e.preventDefault();
  addProduct(this);
});



//@@@@@@ конец рефакторинга



//изменение товара - отрисовка формы
$("body").on("click", '.change', function(){
	product_id = $(this).parent().data("id");  
	productTitle = $(this).siblings('h4').html();
	price = $(this).siblings('.product_box__price').children('span').html();

	handlebars("#tplProduct", obj_form_change, "#placeProduct"); //сделать отрисовку формы для изменения товара
	
	$ ('#change_product #name').val(productTitle);
	$ ('#change_product #price').val(price);
});
//изменение товара - отправка
$("body").on('submit', '#change_product', function (e){
  e.preventDefault();
  addProductChange(this);
});





//добавить в корзину
$("body").on('click', ".add_to_cart" , function (){
  let product_id = $(this).parent().data("id");
  console.log(`Продукт с ID ${product_id} помещён в корзину`);
  addProductToCart(product_id);
});
//переход в корзину
$("body").on("click", "#go_to_cart", function(){
  request('GET', 'orders', successGoToCart, null, beforeSend); 
});




//удаление товара из магазина
$("body").on("click", '.delete', function(){ //присваиваем кнопке Удалить функцию по клику							  
    let product = $(this).parent().data("id");
    console.log(product);

  	//удаляем товар
  	request('DELETE', 'products/'+product, disintegration , null, beforeSend );			

});  

//вернуться из корзины к списку товаров
$('body').on('click', '#back_to_product-list',()=>{
	request('GET', 'products', getProductList );
});

//выйти (перезагузить страницу)
$("body").on("click", "#reset", ()=>{
	location.reload();
});

$('body').on('click', '.delCart', function(){ //для сохранения контекста оставил function
	let idProductInCart = $(this).parent().data('id');
	console.log(idProductInCart);
	request('DELETE', 'orders/'+idProductInCart, successDel, null, beforeSend);	
});
let successDel = (response)=>{
	alert('Заказ удалён!');
	console.log(response);
	request('GET', 'orders', successGoToCart, null, beforeSend); //обновим список товаров в корзине
}


//вывод кнопок меню: Авторизоваться и Зарегистрироваться
handlebars('#menu-template', signMenu, '#place');