// 後台JS

const token = '8dFkCgb6y7fnuUbukcW8ZBesjBu2';
const headers = {
  headers: {
    'Authorization': token,
  }
}
const orderList = document.querySelector('.js-order__list'); // 訂單的ul
const deleteAdminAll = document.querySelector('.js-admin__deleteAll'); // 刪除全部按鈕
const orderListInfo = document.querySelector('.js-order__listInfo'); // 訂單資訊
const orderOverlay = document.querySelector('.js-order__overlay'); // 訂單顯示的訂單資訊
let orderData = [];

// 初始化
function init() {
  if (orderList) {
    getOrderList();
  }
}
init();

// 取得訂單列表
function getOrderList() {
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`;
  axios.get(url, headers)
    .then(function (res) {
      orderData = res.data.orders;
      renderOrderList(orderData);
      dataSort(orderData);
    })
}

// 渲染訂單列表
function renderOrderList(orderData) {
  let str = '';
  let strTitle =
    `
      <tr>
        <th>訂單編號</th>
        <th>姓名</th>
        <th>聯絡電話</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
      </tr>
    `
  // 無訂單，清空strTitle字串，並顯示str的文字內容
  if (orderData.length === 0) {
    strTitle = '';
    str = `<div class="text-xl text-primary text-center py-4">目前購物車無商品</div>`;
  } else {
    orderData.forEach(function (item, index) {
      // 組時間字串
      const timeStamp = new Date(item.createdAt * 1000).toLocaleString();
      // const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;

      // 組訂單字串
      let content =
        `
          <tr>
            <td>${item.id}</td>
            <td><p>${item.user.name}</p></td>
            <td><p>${item.user.tel}</p></td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td class="order__item">
              <a class="showProductBtn" data-id="${index}">訂單資訊</a>
            </td>
            <td>${timeStamp}</td>
            <td class="order__status">${orderStatus(item.paid, item.id)}</td>
            <td class="order__delete">
              <div class="admin__delete flex flex-wrap items-center">
                <a class="delete" href="javascript:;" data-id="${item.id}"></a>
              </div>
            </td>
          </tr>
  
        `
      str += content;
    })
  }
  orderList.innerHTML = strTitle + str;
  renderC3();
}

// 排序訂單填寫時間
function dataSort(orderData) {
  orderData.sort(function (a, b) {
    let orderListTimeA = a.createdAt;
    let orderListTimeB = b.createdAt;
    return orderListTimeB - orderListTimeA;
  })
  renderOrderList(orderData);
}
// 判斷訂單狀態在顯示訂單狀態
function orderStatus(paid, id) {
  if (paid == true) {
    return `<a class="orderStatus text-primary" href="javascript:;" data-status="${paid}" data-id="${id}">已處理</a>`;
  } else {
    return `<a class="orderStatus text-orange" href="javascript:;" data-status="${paid}" data-id="${id}">未處理</a>`;
  }
}

// 判斷是orderList的修改訂單或刪除
function editOrderStatus(e) {
  e.preventDefault();
  const targetClass = e.target.getAttribute("class"); // 選取點擊到的class名稱
  const target = e.target.nodeName;
  let id = e.target.getAttribute("data-id");
  let status = e.target.getAttribute("data-status");
  if (targetClass === 'delete') {
    deleteOrder(id);
    return;
  }

  if (targetClass === 'showProductBtn') {
    renderOrderProductInfo(e);
    return;
  }

  if (target === 'A') {
    changeOrderStatus(status, id);
    return;
  }
}

//修改訂單資料
function changeOrderStatus(status, id) {
  loading.classList.add('is-active');
  let newStatus;
  // 判斷訂單為true還是false
  if (status == 'true') {
    newStatus = false;
  } else {
    newStatus = true;
  }
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`;
  let data = {
    "data": {
      "id": id,
      "paid": newStatus
    }
  }
  axios.put(url, data, headers)
    .then(function (res) {
      alert("已修改訂單狀態");
      getOrderList();
      loading.classList.remove('is-active');
    })
}

// 刪除訂單資料
function deleteOrder(id) {
  loading.classList.add('is-active');
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${id}`;

  axios.delete(url, headers)
    .then(function (res) {
      alert('已刪除該筆訂單資訊');
      getOrderList();
      loading.classList.remove('is-active');
    })
}

// 刪除訂單全部資料
function deleteOrderAll() {
  loading.classList.add('is-active');
  let url = `${baseUrl}/api/livejs/v1/admin/${api_path}/orders`;

  if (orderData.length === 0) {
    loading.classList.remove('is-active');
    return;
  } else {
    axios.delete(url, headers)
      .then(function (res) {
        alert('已刪除全部訂單資訊');
        getOrderList();
        loading.classList.remove('is-active');
      })
  }
}

// 顯示訂單品項資訊
function renderOrderProductInfo(e) {
  orderOverlay.classList.add('is-active');
  let str = '';
  let strFooter;
  let strTitle =
    `
    <div class="order__titleInfo flex flex-wrap justify-center p-2">
      <div class="w-1/2">
        <span>品項</span>
      </div>
      <div class="w-1/4">
        <span>數量</span>
      </div>
      <div class="w-1/4">
        <span>金額</span>
      </div>
    </div>
    `
  let index = e.target.dataset.id;
  orderData[index].products.forEach(function (item) {
    let content =
      `
      <div class="order__itemInfo flex flex-wrap justify-center p-2">
      <div class="w-1/2">
        <span>${item.title}</span>
      </div>
      <div class="w-1/4">
        <span>x${item.quantity}</span>
      </div>
      <div class="w-1/4">
        <span>${toThousands(item.price * item.quantity)}</span>
      </div>
    </div>

    `
    strFooter =
      `
    <div class="order__totalInfo">
      <div class="order__total flex p-2">
        <span class="mr-4">總金額</span>
        <span>$${toThousands(orderData[index].total)}</span>
      </div>
    </div>
    `
    str += content;
  })
  orderListInfo.innerHTML = strTitle + str + strFooter;
}

// 渲染C3圖表
function renderC3() {
  //資料收集
  let obj = {};
  orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
      if (obj[productItem.title] === undefined) {
        obj[productItem.title] = productItem.quantity * productItem.price;
      } else {
        obj[productItem.title] += productItem.quantity * productItem.price;
      }
    })
  })
  // 拉出資料關聯
  let originAry = Object.keys(obj);
  // 透過 originAry，整理成 C3 格式
  let newData = [];
  originAry.forEach(function (item) {
    let ary = [];
    ary.push(item, obj[item]);
    newData.push(ary);
  })
  // 比大小(取營收前三高的品項當主要色塊，把其餘的品項加總起來當成一個色塊)
  newData.sort(function (a, b) {
    return b[1] - a[1]; //newData中每個陣列的[1]為各品項價錢
  })
  // 如果筆數超過4筆以上，就統整為其它
  if (newData.length > 3) {
    let otherTotal = 0;
    newData.forEach(function (item, index) {
      if (index > 2) {
        otherTotal += newData[index][1];
      }
    })
    // 超過三筆後將第四名之後的價格加總起來放在 otherTotal
    newData.splice(3, newData.length - 1);
    newData.push(['其他', otherTotal]);
  }
  console.log(newData);
  c3.generate({
    bindto: '.chart',
    data: {
      columns: newData,
      type: 'pie',
    },
    color: {
      pattern: ["#265AE9", "#517aed", "#a8bdf6", "#d3defa"]
    }
  });
}

// 監聽
if (orderList) {
  orderList.addEventListener('click', editOrderStatus);
  deleteAdminAll.addEventListener('click', deleteOrderAll);
  orderOverlay.addEventListener('click', function (e) {
    orderOverlay.classList.remove('is-active');
  })
}

