$(document).ready(function(){
    loadIntroSlider();
    loadEmbedShop();
    loadExclusiveDeals();
    loadDealsOfWeek();
});

function loadIntroSlider(){
    getJsonProducts(function(data){
        let topBrandProducts = data.filter(p =>{
             return p.brand.id == 1
        });

        topBrandProducts = getProductsArray(topBrandProducts);

        let $introSlider = $("#introSlider");
        $introSlider.html("");


        let $firstItem = createSliderItem(topBrandProducts[0]);
        $firstItem.addClass("active");
        $introSlider.append($firstItem);

        for(let i = 1; i < topBrandProducts.length; i++){
            $introSlider.append(createSliderItem(topBrandProducts[i]));
        }
        $(".active-banner-slider").owlCarousel({
            items:1,
            autoplay:true,
            autoplayTimeout: 10000,
            loop:true,
            nav:true,
            navText:["<img src='img/banner/prev.png'>","<img src='img/banner/next.png'>"],
            dots:false
        });
    });
}
function loadEmbedShop(){
    loadLatestProducts();
    loadBudgetProducts();
    $(".active-product-area").owlCarousel({
        items:1,
        autoplay:true,
        autoplayTimeout: 10000,
        loop:true,
        nav:true,
        navText:["<img src='img/product/prev.png'>","<img src='img/product/next.png'>"],
        dots:false
    });
}
function loadLatestProducts(){
    getJsonProducts(function(products){
        let latestProducts = products.sort((a,b) =>{
            let dateA = new Date(a.dateReleased).getTime();
            let dateB = new Date(b.dateReleased).getTime();

            if(dateA == dateB)
                return 0;

            return dateA > dateB ? -1 : 1;

        });
        latestProducts = getProductsArray(latestProducts.slice(0,4));

        let $list = $("#latestProductsList");
        $list.html("");
        latestProducts.forEach(p => {
            $list.append(createEmbedShopItem(p));
        });
    },null, false);
}
function loadBudgetProducts(){
    getJsonProducts(function(products){
        let budgetProducts = products.sort((a,b) =>{
            let priceA;
            let priceB;

            if(a.price.newPrice == null)
                priceA = a.price.oldPrice;
            else
                priceA = a.price.newPrice;

            if(b.price.newPrice == null)
                priceB = b.price.oldPrice;
            else
                priceB = b.price.newPrice;

            if(priceA == priceB)
                return 0;
            
            return priceA > priceB ? 1 : -1;

        });
        budgetProducts = getProductsArray(budgetProducts.slice(0,4));

        let $list = $("#budgetProductsList");
        $list.html("");
        budgetProducts.forEach(p => {
            $list.append(createEmbedShopItem(p));
        });
    },null, false);
}
function loadExclusiveDeals(){
    getJsonProducts(function(products){
        let exclusiveProducts = products
        .filter(p => {
            return p.price.newPrice != null;
        })
        .sort((a,b) => {
            let discountA = a.price.oldPrice - a.price.newPrice;
            let discountB = b.price.oldPrice - b.price.newPrice;

            if(discountA == discountB)
                return 0;
            
            return discountA < discountB ? 1 : -1;
        });

        exclusiveProducts = getProductsArray(exclusiveProducts.slice(0,2));

        let $list = $("#exclusiveProductsList");
        $list.html("");
        exclusiveProducts.forEach(p => {
            $list.append(createExclusiveListItem(p));
        });

        $(".active-exclusive-product-slider").owlCarousel({
            items:1,
            autoplay:true,
            autoplayTimeout: 8000,
            loop:true,
            nav:true,
            navText:["<img src='img/product/prev.png'>","<img src='img/product/next.png'>"],
            dots:false
        });

    });
}
function loadDealsOfWeek(){
    getJsonProducts(function(products){
        let discountedProducts = products
        .filter(p => {
            return p.price.newPrice != null;
        });

        discountedProducts = getProductsArray(discountedProducts.slice(0,6));

        let $list = $("#dealsOfWeekList");
        $list.html("");

        discountedProducts.forEach(p => {
            $list.append(createDealOfWeekItem(p));
        });
    });
}
function getProductsArray(products) {
    let productsCache = [];
    products.forEach(p => {
        let prod = new Product(p.id, `${p.name} - ${p.brand.name}`,p.description, p.dateReleased, p.img, p.specifications.deckWidth, p.specifications.deckLength, p.specifications.truckHeight, p.specifications.wheelbase, p.price);
        productsCache.push(prod);
    });

    return productsCache;
}
function createSliderItem(product){
//     `<div class="owl-item" style="width: 1110px; margin-right: 0px;"><div class="row single-slide align-items-center d-flex">
//     <div class="col-lg-5 col-md-6">
//         <div class="banner-content">
//             <h1>BLAAA</h1>
//             <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et
//                 dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>
//             <div class="add-bag d-flex align-items-center">
//                 <a class="add-btn" href=""><span class="lnr lnr-cross"></span></a>
//                 <span class="add-text text-uppercase">Add to Bag</span>
//             </div>
//         </div>
//     </div>
//     <div class="col-lg-7">
//         <div class="banner-img">
//             <img class="img-fluid" src="img/banner/banner-img.png" alt="">
//         </div>
//     </div>
// </div></div>`


    let $itemContainer = $(`<div class="row single-slide align-items-center d-flex introSliderItem"></div>`);
    let itemContent = `
        <div class="col-lg-5 col-md-6">
            <div class="banner-content">
                <h1>${product.title}</h1>
                <p>${product.description}</p>
                <div class="add-bag d-flex align-items-center">
                    <a data-id="${product.id}" class="add-btn" href=""><span class="lnr lnr-cross"></span></a>
                    <span class="add-text text-uppercase">Add to Bag</span>
                </div>
            </div>
        </div>
        <div class="col-lg-7">
            <div class="banner-img">
                <img class="img-fluid mx-auto" src="${product.image.src}" alt="${product.image.alt}">
            </div>
        </div>`;

    $itemContainer.html(itemContent);
    return $itemContainer;
}
function createEmbedShopItem(product){

    let $itemContainer = $(`<div class="col-lg-3 col-md-6"></div>`);
    let itemContent = `
    <div class="single-product">
        <img class="img-fluid" src="${product.image.src}" alt="${product.image.alt}">
        <div class="product-details">
            <h6>${product.title}</h6>
            <div class="d-flex justify-content-between align-items-center">
                <div class="price">
                    ${getPricesMarkup(product.price)}
                </div>
                <div class="prd-bottom mt-0">
                    <a data-id="${product.id}"href="" class="social-info">
                        <span class="ti-bag"></span>
                        <p class="hover-text">add to bag</p>
                    </a>
                </div>
            </div>
        </div>
    </div>`;

    $itemContainer.html(itemContent);
    return $itemContainer;
}
function createExclusiveListItem(product){
    let $itemContainer = $(`<div class="single-exclusive-slider"></div>`);
    let itemContent = `
    <img class="img-fluid mb-3" src="${product.image.src}" alt="${product.image.alt}">
    <div class="product-details">
        <div class="price">
            ${getPricesMarkup(product.price)}
        </div>
        <h4>${product.title}</h4>
        <div class="add-bag d-flex align-items-center justify-content-center">
            <a data-id="${product.id}" class="add-btn" href=""><span class="ti-bag"></span></a>
            <span class="add-text text-uppercase">Add to Bag</span>
        </div>
    </div>`;

    $itemContainer.html(itemContent);
    return $itemContainer;
}
function createDealOfWeekItem(product){
    let $itemContainer = $(`<div class="col-lg-4 col-md-4 col-sm-6 mb-20"></div>`);
    let itemContent = `
    <div class="single-related-product d-flex">
        <a href="shop.html"><img src="${product.image.src}" alt="${product.image.alt}"></a>
        <div class="desc">
            <a href="shop.html" class="title">${product.title}</a>
            <div class="price">
                ${getPricesMarkup(product.price)}
            </div>
        </div>
    </div>`;

    $itemContainer.html(itemContent);
    return $itemContainer;
}
function getPricesMarkup(price) {
    if (price.newPrice != null) {
        return `<h6>$${price.newPrice}</h6>
            <h6 class="l-through">$${price.oldPrice}</h6>`;
    }
    else {
        return `<h6>$${price.oldPrice}</h6>`;
    }
}
function getJsonProducts(callbackSuccess, callbackError, async) {
    let ajaxAsync;
    if(async == null)
        ajaxAsync = true;
    else
        ajaxAsync = async;

    $.ajax({
        url: "data/data.json",
        method: "GET",
        async: ajaxAsync,
        dataType: "json",
        success: function (data) {
            if (callbackSuccess != null)
                callbackSuccess(data.products);
        },
        error: function (xhr, errType, errMsg) {
            if (callbackError != null)
                callbackError(xhr.responseText);
        }
    });
}