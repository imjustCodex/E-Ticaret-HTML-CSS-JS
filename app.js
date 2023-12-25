let mangalList = [],
  cartList = [];

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

const toggleModal = () => {
  const cartModalEl = document.querySelector(".cart__modal");
  cartModalEl.classList.toggle("active");
};

const getmangals = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((mangals) => (mangalList = mangals));
};

getmangals();

const createmangalStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    else starRateHtml += `<i class="bi bi-star-fill"></i>`;
  }

  return starRateHtml;
};

const createmangalItemsHtml = () => {
  const mangalListEl = document.querySelector(".mangal__list");
  let mangalListHtml = "";
  mangalList.forEach((mangal, index) => {
    mangalListHtml += `<div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
    <div class="row mangal__card">
      <div class="col-6">
        <img
          class="img-fluid shadow"
          src="${mangal.imgSource}"
          width="258"
          height="400"
        />
      </div>
      <div class="col-6 d-flex flex-column justify-content-between">
        <div class="mangal__detail">
          <span class="fos gray fs-5">${mangal.author}</span><br />
          <span class="fs-4 fw-bold">${mangal.name}</span><br />
          <span class="mangal__star-rate">
            ${createmangalStars(mangal.starRate)}
            <span class="gray">${mangal.reviewCount} reviews</span>
          </span>
        </div>
        <p class="mangal__description fos gray">
          ${mangal.description}
        </p>
        <div>
          <span class="black fw-bold fs-4 me-2">${mangal.price}₺</span>
          ${
            mangal.oldPrice
              ? `<span class="fs-4 fw-bold old__price">${mangal.oldPrice}</span>`
              : ""
          }
        </div>
        <button class="btn__purple" onclick="addmangalTocart(${
          mangal.id
        })">Sepete Ekle</button>
      </div>
    </div>
  </div>`;
  });

  mangalListEl.innerHTML = mangalListHtml;
};

const mangal_TYPES = {
  ALL: "Tümü",
  MANGAL: "Mangal",
  ACCES: "Aksesuarlar",
  COAL: "Kömür ve Tutuşturucu",
  TERMO: "Termometre",
};

const createmangalTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  mangalList.forEach((mangal) => {
    if (filterTypes.findIndex((filter) => filter == mangal.type) == -1)
      filterTypes.push(mangal.type);
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `<li class="${
      index == 0 ? "active" : null
    }" onclick="filtermangals(this)" data-type="${type}">${
      mangal_TYPES[type] || type
    }</li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filtermangals = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let mangalType = filterEl.dataset.type;
  getmangals();
  if (mangalType != "ALL")
    mangalList = mangalList.filter((mangal) => mangal.type == mangalType);
  createmangalItemsHtml();
};
const listcartItems = () => {
  localStorage.setItem("cartList", JSON.stringify(cartList));
  const cartListEl = document.querySelector(".cart__list");
  const cartCountEl = document.querySelector(".cart__count");
  cartCountEl.innerHTML = cartList.length > 0 ? cartList.length : null;
  const totalPriceEl = document.querySelector(".total__price");

  let cartListHtml = "";
  let totalPrice = 0;
  cartList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    cartListHtml += `<li class="cart__item">
        <img
          src="${item.product.imgSource}"
          width="100"
          height="100"
        />
        <div class="cart__item-info">
          <h3 class="mangal__name">${item.product.name}</h3>
          <span class="mangal__price">${item.product.price}₺</span><br />
          <span class="mangal__remove" onclick="removeItemTocart(${item.product.id})">Kaldır</span>
        </div>
        <div class="mangal__count">
          <span class="decrease" onclick="decreaseItemTocart(${item.product.id})">-</span>
          <span class="my-5">${item.quantity}</span>
          <span class="increase" onclick="increaseItemTocart(${item.product.id})">+</span>
        </div>
      </li>`;
  });

  cartListEl.innerHTML = cartListHtml
    ? cartListHtml
    : `<li class="cart__item">Sepetiniz Boş.</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Toplam : " + totalPrice.toFixed(2) + "₺" : null;
};

const addmangalTocart = (mangalId) => {
  let findedmangal = mangalList.find((mangal) => mangal.id == mangalId);
  if (findedmangal) {
    const cartAlreadyIndex = cartList.findIndex(
      (cart) => cart.product.id == mangalId
    );
    if (cartAlreadyIndex == -1) {
      let addedItem = { quantity: 1, product: findedmangal };
      cartList.push(addedItem);
    } else {
      if (
        cartList[cartAlreadyIndex].quantity <
        cartList[cartAlreadyIndex].product.stock
      )
        cartList[cartAlreadyIndex].quantity += 1;
      else {
        toastr.error("Üzgünüz. Stoğumuz Bitti.");
        return;
      }
    }
    listcartItems();
    toastr.success("Ürün sepete eklendi.");
  }
};

const removeItemTocart = (mangalId) => {
  const findedIndex = cartList.findIndex(
    (cart) => cart.product.id == mangalId
  );
  if (findedIndex != -1) {
    cartList.splice(findedIndex, 1);
  }
  listcartItems();
};

const decreaseItemTocart = (mangalId) => {
  const findedIndex = cartList.findIndex(
    (cart) => cart.product.id == mangalId
  );
  if (findedIndex != -1) {
    if (cartList[findedIndex].quantity != 1)
      cartList[findedIndex].quantity -= 1;
    else removeItemTocart(mangalId);
    listcartItems();
  }
};

const increaseItemTocart = (mangalId) => {
  const findedIndex = cartList.findIndex(
    (cart) => cart.product.id == mangalId
  );
  if (findedIndex != -1) {
    if (
      cartList[findedIndex].quantity < cartList[findedIndex].product.stock
    )
      cartList[findedIndex].quantity += 1;
    else toastr.error("Üzgünüz, Stoğumuz Bitti.");
    listcartItems();
  }
};

if (localStorage.getItem("cartList")) {
  cartList = JSON.parse(localStorage.getItem("cartList"));
  listcartItems();
}

const satinal = () => {
  
  if (cartList.length > 0) {
    toastr.success("Satın alma işlemi başarılı.");
    cartList = [];
    listcartItems();
  }
};

setTimeout(() => {
  createmangalItemsHtml();
  createmangalTypesHtml();
}, 100);
