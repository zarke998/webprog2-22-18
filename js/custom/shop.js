var productPage = 1;
var productsCache = [];
var filters = {
    "categories" : [],
    "brands": [],
    "colors": [],
    "deckWidths": []
}
var searchString = "";

const SORT_CRIT = {
    PRICE_ASC: 1,
    PRICE_DESC: 2,
    TITLE_ASC: 3,
    TITLE_DESC: 4
}

$(document).ready(function () {

    initializeShop();
    $(".pagination .arrow").click(changeProductPage);
    $(".sortSelect").change(sortProducts);
    $("#search_input").change(filterBySearch);

    loadDealsOfWeek();
});
///////////////////////////////////////////////////////////////////////////////////////////EVENTS
function onProductsReceived(products) {
    let filtered = applyProductFilters(products);
    loadProductsIntoCache(filtered);

    if(searchString != "")
        productsCache = applySearchFilter(productsCache, searchString);

    initializePagination(productsCache.length);
    showProductPage(1);
}
function onProductsError(error) {
    alert("Error fetching products");
    console.log(error);
}
function changeProductPage(e) {
    e.preventDefault();
    
    let page;

    let dir = this.dataset.dir;
    if(dir == null)
        page = parseInt($(this).text());
    else{
        let currentPage = parseInt($(".paginationNumbers a.active").eq(0).text());
        dir = parseInt(dir);

        page = currentPage + dir;
    }

    if(page < 1)
        page = 1;
    else if(page > Math.ceil(productsCache.length/6))
        page = Math.ceil(productsCache.length/6);
    


    $(".paginationNumbers a").removeClass("active");
    $(`.paginationNumbers a:contains('${page}')`).addClass("active");

    showProductPage(page);
}
function sortProducts(){
    let sortCrit = parseInt($(this).val());
    let sortText = $(this).find(`option[value=${sortCrit}]`).eq(0).text();

    $(".sortSelect span").text(sortText);
    $(".sortSelect ul li").removeClass("selected focus");
    $(`.sortSelect ul li[data-value=${sortCrit}]`).addClass("selected focus");


    switch(sortCrit){
        case SORT_CRIT.PRICE_ASC:            
            productsCache.sort((a,b) => {
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
            break;
        
        case SORT_CRIT.PRICE_DESC:            
            productsCache.sort((a,b) => {
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
                
                return priceA < priceB ? 1 : -1;
            });
            break;

        case SORT_CRIT.TITLE_ASC:            
            productsCache.sort((a,b) => {

                if(a.title == b.title)
                    return 0;
                
                return a.title > b.title ? 1 : -1;
            });
            break;
        case SORT_CRIT.TITLE_DESC:            
            productsCache.sort((a,b) => {

                if(a.title == b.title)
                    return 0;
                
                return a.title < b.title ? 1 : -1;
            });
            break;
    }

    initializePagination(productsCache.length);
    showProductPage(1);
}
function filterProductByCategory(e){
    e.preventDefault();
    let categoryId = parseInt(this.dataset.id);

    
    filters.categories = [];
    if(!$(this).hasClass("clicked-link")){
        $("#categoryList li a").removeClass("clicked-link");
        $(this).addClass("clicked-link");

        filters.categories.push(categoryId);
    }
    else{
        $("#categoryList li a").removeClass("clicked-link");
    }

    getJsonProducts(onProductsReceived);
}
function filterProduct(){
    filters.brands = [];
    filters.colors = [];
    filters.deckWidths = [];

    let brandsChecked = $(".common-filter .head:contains('Brands')+ul li input:checked");
    for(let b of brandsChecked){
        filters.brands.push(parseInt(b.value));
    }
    let colorsChecked = $(".common-filter .head:contains('Colors')+ul li input:checked");
    for(let c of colorsChecked){
        filters.colors.push(parseInt(c.value));
    }
    let deckWidthsCheked = $(".common-filter .head:contains('Deck Widths')+ul li input:checked");
    for(let dw of deckWidthsCheked){
        filters.deckWidths.push(parseFloat(dw.dataset.value));
    }

    getJsonProducts(onProductsReceived);
}
function filterBySearch(){
    searchString = $(this).val();
    getJsonProducts(onProductsReceived);
}
///////////////////////////////////////////////////////////////////////////////////////////FUNCTIONS
function initializeShop() {
    getJsonProducts(function (products) {

        loadProductsIntoCache(products);

        initializePagination(products.length);
        populateCategories(products);
        populateFilters(products);

        showProductPage(1);
    });
}
function initializePagination(numOfProducts) {

    let nOfPages = Math.ceil(numOfProducts / 6);

    let $paginationNumbers = $(".paginationNumbers");
    $paginationNumbers.html("");
    $paginationNumbers.append(createPaginationNumberMarkup(1, true));

    for (let i = 2; i <= nOfPages; i++) {
        $paginationNumbers.append(createPaginationNumberMarkup(i, false));
    }
    $(".paginationNumbers a").click(changeProductPage);
}
function loadProductsIntoCache(products) {
    productsCache = [];
    products.forEach(p => {
        let prod = new Product(p.id, `${p.name} - ${p.brand.name}`,p.description, p.dateReleased, p.img, p.specifications.deckWidth, p.specifications.deckLength, p.specifications.truckHeight, p.specifications.wheelbase, p.price);
        productsCache.push(prod);
    });
}
function populateList(products) {
    let $list = $("#productList>div");
    $list.html("");
    products.forEach(p => {
        $list.append(createProductMarkup(p));
    });
    $(".addToCart").click(addToCart);
}
function populateCategories(products) {
    let categories = [];
    let categoriesCount = [];

    products.forEach(p => {
        if (!categories.some(c => {
            return c.id == p.category.id;
        })) {


            categories.push(p.category);
            categoriesCount.push(1);
        }

        else {
            let categoryIndex = categories.findIndex(c => c.id == p.category.id);
            categoriesCount[categoryIndex]++;
        }
    });

    $categoryList = $("#categoryList");
    $categoryList.html("");
    for (let i = 0; i < categories.length; i++)
        $categoryList.append(createCategoryMarkup(categories[i], categoriesCount[i]));
    
    $categoryList.find("li a").click(filterProductByCategory);

}
function populateFilters(products) {

    let $filterContainer = $("#filtersContainer");
    $filterContainer.html(`<div class="top-filter-head">Filters</div>`);

    populateBrands();
    populateColors();
    populateDeckWidth();
    $(".filter-list input").change(filterProduct);

    function populateBrands() {
        let brands = [];
        let brandsCount = [];

        products.forEach(p => {
            if (!brands.some(b => {
                return b.id == p.brand.id;
            })) {
                brands.push(p.brand);
                brandsCount.push(1);
            }
            else {
                let brandIndex = brands.findIndex(b => b.id == p.brand.id);
                brandsCount[brandIndex]++;
            }
        });

        let $filter = $(`<div class="common-filter"></div>`);
        $filter.html(`<div class="head">Brands</div>`);

        let $filterList = $("<ul></ul>");
        for (let i = 0; i < brands.length; i++) {
            $filterList.append(createFilterItem(brands[i], brandsCount[i]));
        }

        $filter.append($filterList);
        $filterContainer.append($filter);

    }
    function populateColors() {
        let colors = [];
        let colorsCount = [];

        products.forEach(p => {
            p.colors.forEach(c => {
                if (!colors.some(filterColor => {
                    return filterColor.id == c.id;
                })) {

                    colors.push(c);
                    colorsCount.push(1);
                }
                else {
                    let colorIndex = colors.findIndex(filterColor => filterColor.id == c.id);
                    colorsCount[colorIndex]++;
                }
            });

        });

        let $filter = $(`<div class="common-filter"></div>`);
        $filter.html(`<div class="head">Colors</div>`);

        let $filterList = $("<ul></ul>");
        for (let i = 0; i < colors.length; i++) {
            $filterList.append(createFilterItem(colors[i], colorsCount[i]));
        }

        $filter.append($filterList);
        $filterContainer.append($filter);
    }
    function populateDeckWidth() {
        let deckWidths = [];
        let deckWidthsCount = [];

        products.forEach(p => {
            if (!deckWidths.includes(p.specifications.deckWidth)) {
                deckWidths.push(p.specifications.deckWidth);
                deckWidthsCount.push(1);
            }
            else {
                let colorIndex = deckWidths.indexOf(p.specifications.deckWidth);
                deckWidthsCount[colorIndex]++;
            }
        });

        let $filter = $(`<div class="common-filter"></div>`);
        $filter.html(`<div class="head">Deck Widths</div>`);

        let $filterList = $("<ul></ul>");
        for (let i = 0; i < deckWidths.length; i++) {
            $filterList.append(createFilterValueItem(deckWidths[i], deckWidthsCount[i]));
        }
        $filter.append($filterList);
        $filterContainer.append($filter);
    }
    function createFilterItem(item, itemCount) {
        return `<li class="filter-list"><input class="pixel-radio sp-checkbox" type="checkbox" value="${item.id}"><label for="apple">${item.name}<span> (${itemCount})</span></label></li>`;
    }
    function createFilterValueItem(itemValue, itemCount) {
        return `<li class="filter-list"><input class="pixel-radio sp-checkbox" type="checkbox" data-value="${itemValue}><label for="apple">${itemValue}&quot;<span> (${itemCount})</span></label></li>`;
    }
}
function createProductMarkup(product) {
    let $productWrapper = $(`<div class="col-lg-4 col-md-6"></div>`);

    let productContent = `
    <div class="single-product">
        <img class="img-fluid" src="${product.image.src}" alt="${product.image.alt}">
        <div class="product-details">
            <h6>${product.title}</h6>
            <div class="d-flex justify-content-between align-items-center">
                <div class="price">
                    ${getPricesMarkup(product.price)}
                </div>
                <div class="prd-bottom mt-0">
                    <a href="" class="social-info addToCart" data-id="${product.id}">
                        <span class="ti-bag"></span>
                        <p class="hover-text">add to bag</p>
                    </a>
                </div>
            </div>
        </div>
    </div>`;

    $productWrapper.html(productContent);
    return $productWrapper;

    function getPricesMarkup(price) {
        if (price.newPrice != null) {
            return `<h6>$${price.newPrice}</h6>
                <h6 class="l-through">$${price.oldPrice}</h6>`;
        }
        else {
            return `<h6>$${product.price.oldPrice}</h6>`;
        }
    }
}
function createCategoryMarkup(category, categoryCount) {
    let $categoryContainer = $(`<li class="main-nav-list"></li>`);
    let categoryContent = `<a data-id="${category.id}">${category.name}<span class="number">(${categoryCount})</span></a>`;

    $categoryContainer.html(categoryContent);

    return $categoryContainer;
}
function createPaginationNumberMarkup(number, active) {
    let activeClass = "";
    if (active)
        activeClass = `class="active"`;

    let $markup = $(`<a href="#" ${activeClass}>${number}</a>`);
    return $markup;
}
function showProductPage(page){
    let startIndex = (page - 1) * 6;
    let endIndex = startIndex + 6;
    populateList(productsCache.slice(startIndex,endIndex));
}
function applyProductFilters(products){
    let filtered = products;
    if(filters.categories.length != 0){
        filtered = filtered.filter(p => {
            return filters.categories.includes(p.category.id);
        });
    }
    if(filters.brands.length != 0){
        filtered = filtered.filter(p => {
            return filters.brands.includes(p.brand.id);
        });
    }
    if(filters.colors.length != 0){
        filtered = filtered.filter(p => {
            for(let c of p.colors){
                if(filters.colors.includes(c.id))
                    return true;
            }
            return false;
        });
    }
    if(filters.deckWidths.length != 0){
        filtered = filtered.filter(p => {
            return filters.deckWidths.includes(p.specifications.deckWidth);
        });
    }
    return filtered;
}
function applySearchFilter(products, search){
    return products.filter(p => {
        return p.title.toLowerCase().includes(search.toLowerCase());
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
            //DEALS OF WEEK
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

function getJsonProducts(callbackSuccess, callbackError) {
    $.ajax({
        url: "data/data.json",
        method: "GET",
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