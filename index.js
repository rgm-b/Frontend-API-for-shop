let token = null;

let product_id = null;
let productTitle = null;
let price = null;

//Объект для кнопок меню авторизации и регистрации
let signMenu ={
  image_src:"img/img-profile.png",
  fields:[
    {  
      id:"login",
      class:"link",
      name:"Авторизоваться"
    },
    {
      id:"newUser",
      class:"link",
      name:"Зарегистрироваться"
    }
  ]
};	

let formAuthorize = {  
  id: "authorization", 
  title: "Авторизация" 
};
let formRegistration = {  
  id: "registration", 
  title: "Регистрация" 
};

//для формы добавления нового товара
let obj_form_add = {
  id: "add_product",
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

// success регистрации
let registration = (response) => {
  alert(`${response.message}, Новый пользователь создан!`);
  $('#login').trigger('click'); //кликнем по кнопке авторизации
}

// success авторизации
let autorization = (response) => {
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
function addProduct(){
  let formData = new FormData();          
      formData.append("name", $('#add_product #name').val() );
      formData.append("price", $('#add_product #price').val() );
      formData.append("productimage", $("#add_product #image").prop('files')[0]);
  console.log("formData:", formData);

  request('POST', 'products', addProductSuccess , formData, beforeSend, false, false);      
}

//??? изменение товара - отправка
function addProductChange(product_id){

  let formData = new FormData();      
      formData.append("name", $('#change_product #name').val() );
      formData.append("price", $('#change_product #price').val() );

  if( $("#change_product #image").prop('files')[0] ){
    formData.append("productimage", $("#change_product #image").prop('files')[0]);                
  }else{
    console.log('ХЕР');
//???
  }      //src="http://localhost:3000/uploads\1631293728248-sapogi.png"      

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


//авторизация
$('body').on('click', '#login', function(){         
  handlebars('#myTpl', formAuthorize, '#placeForContent'); //выводим форму авторизации    
});
//регистрация
$('body').on('click', '#newUser', function(){         
  handlebars('#myTpl', formRegistration, '#placeForContent'); //выводим форму регистрации    
});

//регистрация
$('body').on('submit', '#registration', function(){
  event.preventDefault();
  request('POST', 'user/signup', registration, { email: $('#registration #email').val() , password: $("#registration #password").val() }  );    
}); 

//авторизация
$('body').on('submit', '#authorization', function(){    
  event.preventDefault();     
    request('POST', 'user/login', autorization, { email: $('#authorization #email').val(), password: $('#authorization #password').val() }  );
});

$("body").on("click", '#add_product_button', function(){    
  handlebars("#tpl_change_product", obj_form_add, "#place_change_product"); //выводим форму добавления нового товара  
});   

$("body").on("click", "#go_to_cart", function(){
  request('GET', 'orders', successGoToCart, null, beforeSend); //переход в корзину
});

$("body").on('click', ".add_to_cart" , function (){  //по клику на кнопку с классом add_to_cart
  let product_id = $(this).parent().data("id");
  console.log(`Продукт с ID ${product_id} помещён в корзину`);
  addProductToCart(product_id);
});

$("body").on('submit', '#add_product', function (){
  event.preventDefault();
  addProduct();
});

//изменение товара - отрисовка формы
$("body").on("click", '.change', function(){
	product_id = $(this).parent().data("id");  
	productTitle = $(this).siblings('h4').html();
	price = $(this).siblings('.product_box__price').children('span').html();

	handlebars("#tpl_change_product", obj_form_change, "#place_change_product"); //сделать отрисовку формы для изменения товара
	
	$ ('#change_product #name').val(productTitle);
	$ ('#change_product #price').val(price);
});
//изменение товара - отправка
$("body").on('submit', '#change_product', function (){
  event.preventDefault();
  console.log( $("#change_product #image").prop('files')[0] );
  addProductChange(product_id);
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