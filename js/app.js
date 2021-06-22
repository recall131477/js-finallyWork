// 解決瀏覽器觀看滿版問題
let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

// home__loading
$(window).on('load', function () {
  setTimeout(function () {
    $('.js-home__loading').addClass('is-loaded');
  }, 900);
});

// jQuery動態效果
$(document).ready(function () {

  // 點擊漢堡選單顯示nav
  $(".js-header__menu").click(function () {
    $(".menu__list").toggleClass('is-active');
    $(".header__menu .header__burger span").toggleClass('is-active');
    $(".header__menu a").toggleClass('is-active');
  });

  // recommend swiper
  const recommendSwiper = new Swiper('.recommend .swiper-container', {
    slidesPerView: 'auto',
    spaceBetween: 30,
    centeredSlides: true, // 讓swiper的active在中間為第一個
    loop: true, // 若中間為第一個這個循環一定要為ture，為false左邊會沒有畫面
    autoplay: {  // 自動撥放
      delay: 4000,
      disableOnInteraction: false, // 用手操控swiper後一樣會自動輪播
    },
  });

  // 更改表單內容文字位置
  if ($(".js-form").length) {
    $(".js-form .form__control").on("focus", function () {
      $(this)
        .siblings("label")
        .addClass("is-focus");
    });
    $(".js-form .form__control").on("blur", function () {
      if (
        $(this)
          .val()
          .trim().length == 0
      ) {
        $(this).val("");
        $(this)
          .siblings("label")
          .removeClass("is-focus");
      }
    });
  }
});

// AOS
AOS.init({
  duration: 1000,
  once: true
})

//前台JS

const api_path = 'rousong';
const baseUrl = 'https://livejs-api.hexschool.io';

// 指定DOM
// loading
const loading = document.querySelector('.js-loading'); // loading
// 產品
const productList = document.querySelector('.js-product__list'); // 產品的ul
const productSelect = document.querySelector('.js-product__select') // 產品的select
// 購物車
const cartList = document.querySelector('.js-cart__list'); // 購物車的ul
const totalPrice = document.querySelector('.js-totalPrice'); // 購物車的總金額
const deleteAll = document.querySelector('.cart__deleteAll'); // 刪除所有品項按鈕
const cartNum = document.querySelector('.js-CartNum'); // 顯示購物車品項數量 
// 表單
const customerName = document.querySelector('.js-customerName'); // 表單的姓名
const customerTel = document.querySelector('.js-customerTel'); // 表單的電話
const customerEmail = document.querySelector('.js-customerEmail'); // 表單的信箱
const customerAddress = document.querySelector('.js-customerAddress'); // 表單的地址
const payMethod = document.querySelector('.js-payMethod'); // 表單交易方式
const submitBtn = document.querySelector('.js-submitBtn'); // 送出表單按鈕
const form = document.querySelector('.js-form'); // 表單
const inputs = document.querySelectorAll('input[type=text],input[type=tel]'); // inputs
const messages = document.querySelectorAll('[data-msg]'); // p的文字訊息
let productData = [];
let cartData = [];
let finallyTotal = 0;
// 驗證
const constraints = {
  "姓名": {
    presence: {
      message: "必填"
    }
  },
  "電話": {
    presence: {
      message: "必填"
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼"
    },
  },
  "信箱": {
    presence: {
      message: "必填"
    },
    email: {
      message: "格式有誤"
    }
  },
  "地址": {
    presence: {
      message: "必填"
    }
  }
};

//初始化
function init() {
  getProductList();
  getCartList();
}
init();

// 取得產品列表
function getProductList() {
  let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/products`;
  axios.get(url)
    .then(function (res) {
      productData = res.data.products;
      if (productList) {
        renderProduct(productData);
        renderOption();
      }
    })
}

// 渲染產品列表
function renderProduct(productData) {
  let str = '';
  productData.forEach(function (item) {
    let content =
      `
      <li class="product__item w-full | sm:w-1/2 | md:w-1/3 | xl:w-1/4">
        <div class="product__inner">
          <div class="product__innerMedia mb-4">
            <img src="${item.images}" alt="">
            <span class="product__innerItem">${item.category}</span>
            <a type="button" class="product__addCart" data-id="${item.id}">加入購物車</a>
          </div>
          <div class="product__innerContent">
            <h3 class="mb-2.5 | xl:text-lg">${item.title}</h3>
            <ul class="content__list flex flex-wrap">
              <li class="content__item">NT$${toThousands(item.price)}</li>
              <li class="content__item">NT$${toThousands(item.origin_price)}</li>
            </ul>
          </div>
        </div>
      </li>
      `
    str += content;
  })
  // if (productList) {
  productList.innerHTML = str;
  // }
}

// 篩選產品
function filterProduct(e) {
  let nowCategory = e.target.value;
  let currentData = [];
  console.log(nowCategory);
  productData.forEach(function (item) {
    if (nowCategory === '全部') {
      renderProduct(productData);
    } else if (nowCategory === item.category) {
      currentData.push(item);
      renderProduct(currentData); // 顯示篩選後的產品
    }
  })
}

// 渲染option
function renderOption() {
  // 分類前
  let unSort = productData.map(function (item) {
    return item.category;
  })
  // 分類後
  let sorted = unSort.filter(function (item, index) {
    return unSort.indexOf(item) === index;
  })

  let str = `<option value="全部">全部</option>`;
  sorted.forEach(function (item) {
    str += `<option value="${item}">${item}</option>`;
  })
  productSelect.innerHTML = str;
}

// 取得購物車列表
function getCartList() {
  let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  axios.get(url)
    .then(function (res) {
      cartData = res.data.carts;
      finallyTotal = res.data.finalTotal;
      if (cartList) {
        renderCartList(cartData);
      }
      renderCartNum(cartData);
    })
}

// 渲染購物車列表
function renderCartList(cartData) {
  let str = '';
  let strTitle =
    `
    <div class="cart__project flex flex-wrap mb-2.5">
    <div class="w-1/2 | xl:w-2/5">
      <div class="cart__box">
        <span>品項</span>
      </div>
    </div>
    <div class="w-1/6 | xl:w-1/5">
      <div class="cart__box">
        <span>單價</span>
      </div>
    </div>
    <div class="w-1/6 | xl:w-1/5">
      <div class="cart__box">
        <span>數量</span>
      </div>
    </div>
    <div class="w-1/6 | xl:w-1/5">
      <div class="cart__box">
        <span>金額</span>
      </div>
    </div>
    <div></div>
  </div>
  `
  // 購物車內無商品，清空strTitle字串，並顯示str的文字內容
  if (cartData.length === 0) {
    strTitle = '';
    str = `<div class="text-xl text-primary text-center py-4">目前購物車無商品</div>`;
  } else {
    cartData.forEach(function (item) {
      let content =
        `
        <div class="cart__item mb-7.5 | lg:mb-0">
          <div class="cart__inner block | lg:flex lg:flex-wrap">
            <div class="cart__innerItem block | lg:flex lg:flex-wrap lg:items-center">
              <div class="w-full | lg:w-1/2 | xl:w-2/5">
                <div class="cart__box" data-title="品項">
                  <div class="flex flex-wrap items-center mt-5 | md:mt-0">
                    <img src="${item.product.images}" alt="">
                    <p class="mt-3 | md:ml-2.5 md:mt-0">${item.product.title}</p>
                  </div>
                </div>
              </div>
              <div class="w-full | lg:w-1/6 | xl:w-1/5">
                <div class="cart__box" data-title="單價">
                  <span>NT$${toThousands(item.product.price)}</span>
                </div>
              </div>
              <div class="w-full | lg:w-1/6 | xl:w-1/5">
                <div class="cart__box flex flex-wrap" data-title="數量">
                  <a class="cart__change cart__remove" data-num="${item.quantity - 1}" data-id="${item.id}"></a>
                  <span class="px-2">${item.quantity}</span>
                  <a class="cart__change cart__add" data-num="${item.quantity + 1}" data-id="${item.id}"></a>
                </div>
              </div>
              <div class="w-full | lg:w-1/6 | xl:w-1/5">
                <div class="cart__box" data-title="金額">
                  <span>NT$${toThousands(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
            <div class="cart__delete flex flex-wrap items-center">
              <a class="delete" data-id="${item.id}"></a>
            </div>
          </div>
        </div>
        `
      str += content;
    })
  }
  if (cartList) {
    cartList.innerHTML = strTitle + str;
    totalPrice.textContent = `NT$${toThousands(finallyTotal)}`;
  }
}

// 加入購物車
function addCart(e) {
  e.preventDefault();
  let addCartClass = e.target.nodeName;
  if (addCartClass !== 'A') {
    return;
  }
  loading.classList.add('is-active');
  let productId = e.target.getAttribute("data-id");
  let num = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      num = item.quantity += 1;
    }
  })
  let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  let data = {
    "data": {
      "productId": productId,
      "quantity": num
    }
  }
  axios.post(url, data)
    .then(function (res) {
      alert('已加入購物車');
      // getCartList();
      renderCartList(res.data.carts);
      renderCartNum(res.data.carts);
      loading.classList.remove('is-active');
    })
}

// 新增或修改購物車數量
function judgmentBtn(e) {
  loading.classList.add('is-active');
  e.preventDefault();
  const targetName = e.target.nodeName;
  const targetClass = e.target.getAttribute("class");
  if (targetName !== 'A') {
    loading.classList.remove('is-active');
    return;
  }
  let id = e.target.getAttribute("data-id");
  let num = parseInt(e.target.getAttribute("data-num"));

  if (num > 0) {
    let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
    let data = {
      "data": {
        "id": id,
        "quantity": num
      }
    }
    axios.patch(url, data)
      .then(function (res) {
        finallyTotal = res.data.finalTotal;
        renderCartList(res.data.carts);
        loading.classList.remove('is-active');
      })
      .catch(function (err) {
        console.log(err)
      })
  } else {
    deleteCart(e); //商品為0自動刪除該品項
    return;
  }

  if (targetClass === 'delete') {
    deleteCart(e);
    return;
  }

}

// 顯示購物車內容數量
function renderCartNum(cartData) {
  let str = '';
  if (cartData.length > 0) {
    cartData.forEach(function (item) {
      let content = `<span class="cart__num">${cartData.length}</span>`;
      str = content;
    })
  }
  cartNum.innerHTML = str;
  // renderCartList(cartData);
}

// 刪除購物車產品
function deleteCart(e) {
  let cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }
  loading.classList.add('is-active');
  let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${cartId}`
  axios.delete(url)
    .then(function (res) {
      alert('已刪除該筆購物車資訊');
      getCartList();
      loading.classList.remove('is-active');
    })
}

// 刪除購物車全部產品
function deleteCartAll() {
  loading.classList.add('is-active');
  let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/carts`;
  //購物車沒東西時不執行不執行刪除全部品項的請求
  if (cartData.length === 0) {
    loading.classList.remove('is-active');
    return;
  } else {
    axios.delete(url)
      .then(function (res) {
        alert('已刪除全部購物車資訊');
        getCartList();
        loading.classList.remove('is-active');
      })
  }
}

// 驗證並判斷表單內容是否有誤，驗證成功送出表單內容
function verification(e) {
  e.preventDefault();
  let errors = validate(form, constraints);
  // 如果有誤，呈現錯誤訊息  
  if (errors) {
    showErrors(errors);
  } else {
    // 如果沒有錯誤，送出表單
    addOrder();
    // 清空表單內容
    form.reset();
  }
}

// 顯示表單錯誤訊息
function showErrors(errors) {
  messages.forEach(function (item) {
    item.textContent = "";
    item.textContent = errors[item.dataset.msg];
  })
}

// 監控全部的input
inputs.forEach(function (item) {
  item.addEventListener("change", function (e) {
    e.preventDefault();
    let name = item.name;
    let errors = validate(form, constraints);
    item.nextElementSibling.textContent = "";
    // 針對正在操作的欄位呈現警告訊息
    if (errors) {
      document.querySelector(`[data-msg='${name}']`).textContent = errors[name];
    }
  });
});

// 送出表單
function addOrder() {
  let url = `${baseUrl}/api/livejs/v1/customer/${api_path}/orders`;
  let data = {
    data: {
      user: {
        name: customerName.value.trim(),
        tel: customerTel.value.trim(),
        email: customerEmail.value.trim(),
        address: customerAddress.value.trim(),
        payment: payMethod.value.trim()
      }
    }
  }
  loading.classList.add('is-active');
  if (cartData.length === 0) {
    alert('購物車是空的，請先加入商品');
    loading.classList.remove('is-active');
    return;
  }
  loading.classList.add('is-active');
  axios.post(url, data)
    .then(function (res) {
      alert('訂單已建立成功');
      getCartList();
      loading.classList.remove('is-active');
    })
    .catch(function (err) {
      console.log(err);
    })
}

// 監聽
if (productList) {
  productSelect.addEventListener('change', filterProduct);
  productList.addEventListener('click', addCart);
}
if (cartList) {
  cartList.addEventListener('click', judgmentBtn);
  deleteAll.addEventListener('click', deleteCartAll);
  submitBtn.addEventListener('click', verification);
}