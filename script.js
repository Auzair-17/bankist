"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2025-09-08T17:01:17.194Z",
    "2025-09-09T01:36:17.929Z",
    "2025-09-10T01:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jesica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

const formatMovementsDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCurrencies = function (value, locale, currency) {
  return Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const sortedMovs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  sortedMovs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementsDate(date, acc.locale);

    const formattedMovements = formatCurrencies(mov, acc.locale, acc.currency);
    const html = `
    <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>

        <div class="movements__value">${formattedMovements}</div>
    </div>
  `;
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((element) => element[0])
      .join("");
  });
};
createUsername(accounts);

const startLogOutTimer = function () {
  let time = 120;
  const tick = function () {
    let min = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    time--;
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const updateUi = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (accumulator, curMovement) {
    return accumulator + curMovement;
  }, 0);
  const formattedBalance = formatCurrencies(
    acc.balance,
    acc.locale,
    acc.currency
  );
  labelBalance.textContent = formattedBalance;
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((sum, mov) => sum + mov, 0);
  const formattedIncome = formatCurrencies(income, acc.locale, acc.currency);
  labelSumIn.textContent = formattedIncome;

  const out = Math.abs(
    acc.movements.filter((mov) => mov < 0).reduce((sum, mov) => sum + mov, 0)
  );
  const formattedOut = formatCurrencies(out, acc.locale, acc.currency);
  labelSumOut.textContent = formattedOut;

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((mov) => mov > 1)
    .reduce((sum, int) => sum + int, 0);
  const formatteInterest = formatCurrencies(interest, acc.locale, acc.currency);
  labelSumInterest.textContent = formatteInterest;
};

let curAccount, timer;

// Event Listeners
btnLogin.addEventListener("click", function (e) {
  // Prevent reloading the page
  e.preventDefault();
  curAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  if (curAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI
    containerApp.style.opacity = 100;

    // Display date
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      curAccount.locale,
      options
    ).format(now);

    // Clear input fields and remove focus from the input field
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    // Display welcome message
    labelWelcome.textContent = `Welcome back, ${
      curAccount.owner.split(" ")[0]
    }`;
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUi(curAccount);
  }
});

btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const recieverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  const amount = Number(inputTransferAmount.value);

  inputTransferTo.value = inputTransferAmount.value = "";

  if (
    recieverAcc &&
    amount > 0 &&
    amount <= curAccount.balance &&
    recieverAcc.username !== curAccount.username
  ) {
    curAccount.movements.push(-amount);
    recieverAcc.movements.push(amount);

    curAccount.movementsDates.push(new Date().toISOString());
    recieverAcc.movementsDates.push(new Date().toISOString());
  }
  updateUi(curAccount);
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && curAccount.movements.some((mov) => mov >= amount * 0.1)) {
    setTimeout(function () {
      curAccount.movements.push(amount);

      // Add loan date
      curAccount.movementsDates.push(new Date().toISOString());

      updateUi(curAccount);
    }, 2500);
  }
  inputLoanAmount.value = "";
  inputLoanAmount.blur();

  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === curAccount.username &&
    Number(inputClosePin.value) === curAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === curAccount.username
    );
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  console.log("click");
  displayMovements(curAccount.movements, !sorted);
  sorted = !sorted;
});
