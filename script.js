//###############IMPORT###############
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5ntuLA7UzZbH8Mv-F7DYONoHs1_AOaqQ",
  authDomain: "digital-wallet-8192e.firebaseapp.com",
  databaseURL: "https://digital-wallet-8192e-default-rtdb.firebaseio.com",
  projectId: "digital-wallet-8192e",
  storageBucket: "digital-wallet-8192e.appspot.com",
  messagingSenderId: "805555071594",
  appId: "1:805555071594:web:2c86c1aa05f27fbf653813",
  measurementId: "G-DBZDLNLV7E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();


import {getDatabase, set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

//########JavaScript#########

const fecha = document.getElementById("fechaHoy");
const select = document.getElementById("gasto-ingresar");
const selectPresupuesto = document.getElementById("presupuesto-ingresar")
const selectMonth = document.getElementById("select-month");
const gastoMonto = document.getElementById("gasto-monto");
const addButton = document.getElementById("addButton");
const registerBtn = document.getElementById('registerBtn');
const newUser = document.getElementById('newUserBtn');
const ownerInput = document.getElementById("walletOwner");
const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth();
const dateDirectory = thisYear+"/"+thisMonth+"/";
const abrirIngresos = document.querySelector(".resumen-ingreso").querySelector(".sub-title");
const agregarIngreso = document.querySelector("#newIngreso");
const popUpIngresoInside = document.querySelector("#pop-up-ingreso").querySelector(".inside-pop-up");
const abrirPresupuestos = document.querySelector(".resumen-presupuesto").querySelector(".sub-title");
const agregarPresupuesto = document.querySelector("#newPresupuesto");
const popUpPresupuestoInside = document.querySelector("#pop-up-presupuesto").querySelector(".inside-pop-up");
const abrirAhorros = document.querySelector(".resumen-ahorro").querySelector(".sub-title");
const agregarAhorro = document.querySelector("#newAhorro");
const popUpAhorroInside = document.querySelector("#pop-up-ahorro").querySelector(".inside-pop-up");
const resumenGasto = document.querySelector('.resumen-gasto');
const popUpGastoInside = document.querySelector("#pop-up-gasto").querySelector(".inside-pop-up");
const abrirRubros = document.querySelector("#editRubros");
const popUpRubroInside = document.querySelector("#pop-up-rubros").querySelector(".inside-pop-up");
const passwordInput = document.getElementById("password");
const cambiarPsw = document.getElementById("cambiarPsw");
const optionsButton = document.querySelector(".optionsBtn");
const changePwdButton = document.getElementById("changePswOption");
const monthlyChartButton = document.getElementById("monthlyChartOption");

var weekOfMonth = Math.ceil(new Date().getDate() / 7);
var walletOwner = '';
var lastID = 0;

getNewDb();
getTotal();
assignEnterBtn();
assignCloseBtn();


var sFecha = new Date().toLocaleString().split(",")[0];

fecha.textContent = sFecha;
selectMonth.value = thisMonth;

select.addEventListener("change", showAddButton);
addButton.addEventListener("click", addToList);
//ownerInput.addEventListener("change", getNewDb);
passwordInput.addEventListener("keypress", function(event){
  if (event.key == "Enter"){
    enterWallet();
  }
})
cambiarPsw.addEventListener("click", changePsw);
newUser.addEventListener('click', insertUser);
registerBtn.addEventListener('click', showNewUser);

abrirIngresos.addEventListener("click", openPopUp);
abrirIngresos.popUpId = '#pop-up-ingreso';
agregarIngreso.addEventListener("click", insertIngresoIntoTable);
popUpIngresoInside.addEventListener('click', getEditIngreso);

abrirPresupuestos.addEventListener("click", openPopUp);
abrirPresupuestos.popUpId = '#pop-up-presupuesto';
agregarPresupuesto.addEventListener("click", insertPresupuestoIntoTable);
popUpPresupuestoInside.addEventListener('click', getEditPresupuesto);

abrirAhorros.addEventListener("click", openPopUp);
abrirAhorros.popUpId = '#pop-up-ahorro';
agregarAhorro.addEventListener("click", insertAhorroIntoTable);
popUpAhorroInside.addEventListener('click', getEditAhorro);

//Rubros
abrirRubros.addEventListener("click", openPopUp);
abrirRubros.popUpId = '#pop-up-rubros';
//agregarRubro.addEventListener("click", insertRubroIntoTable);
popUpRubroInside.addEventListener('click', getClickRubro);

//Mover despues
function getClickRubro(e){
  if (!e.target.matches('button')){return};
  if (e.target.textContent=='Agregar'){
    let rowToEdit = e.target.parentNode;
    insertRubroIntoTable();
  } else if (e.target.textContent=='Editar'){
    let rowToEdit = e.target.parentNode;
    updateRubroFromTable(rowToEdit);
  } else if (e.target.textContent=='Eliminar'){
    let rowToEdit = e.target.parentNode;
    deleteRubroFromTable(rowToEdit);
  }
}

function insertRubroIntoTable(){
  const resumenRubro = document.querySelector("#pop-up-rubros");
  const divLines = resumenRubro.querySelectorAll(".div-line");
  var maxKey = 0;

  for (let i=0; i<divLines.length; i++){
      let key = divLines[i].dataset.key;
      if (parseInt(key) > maxKey){
        maxKey = parseInt(key);
      }
  }

  maxKey++;
  let elementName = resumenRubro.querySelector("#rubroName").value;
  let elementIsChecked = resumenRubro.querySelector("#rubroCheckbox").checked;

  if (elementName == ""){
    alert("Debes elegir un nombre")
    return;
  }

  set(ref(db, walletOwner +"Rubros/" + maxKey), {
    Rubro: elementName,
    Oculto: elementIsChecked,
    id: maxKey
  })
    .then(() => {
      //alert("Succes!");
      resumenRubro.querySelector("#rubroName").value = '';
      resumenRubro.querySelector("#rubroCheckbox").checked = false;
      getRubrosFromTable("true");
      buildSelectOptions(walletOwner+'/Rubros/', select);
      buildSelectOptions(walletOwner+'/Rubros/', selectPresupuesto);
    })
    .catch((error) => {
      alert(error);
      maxKey--;
    })
}

function updateRubroFromTable(row){
  let key = row.dataset.key;

  let divNombre = row.querySelector("input").value;
  let isOculto = row.querySelector("input[type='checkbox']").checked;

  if (divNombre == "" && isOculto == false){
    alert("Debes ingresar un nombre o marcarlo como oculto para dejar este campo vacio");
    return;
  }

  update(ref(db, walletOwner+"Rubros/"+key), {
    Rubro: divNombre,
    Oculto: isOculto,
    id: key
  })
    .then(() => {
      //alert("Presupuesto agregado correctamente");
      getRubrosFromTable('true');
      buildSelectOptions(walletOwner+'/Rubros/', select);
      buildSelectOptions(walletOwner+'/Rubros/', selectPresupuesto);
    })
    .catch((error) => {
      alert(error);
    })
}

function deleteRubroFromTable(row){
  let key = row.dataset.key;

  remove(ref(db, walletOwner+"Rubros/"+key), {
  })
    .then(() => {
      getRubrosFromTable("true");
      buildSelectOptions(walletOwner+'/Rubros/', select);
      buildSelectOptions(walletOwner+'/Rubros/', selectPresupuesto);
    })
    .catch((error) => {
      alert(error);
    })
}

function getRubrosFromTable(isPopUp) {
  const dbref = ref(db);

  if (isPopUp == "true"){
    clearGrid('#pop-up-rubros', ".addToTable")

    get(child(dbref, walletOwner+"Rubros/"))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Rubro;
          let isChecked = '';
          
          if (childSnapshot.val().Oculto == true){
            isChecked = 'checked';
            gridLine.classList.add('bg-gray');
          }
    
          //gridLine.setAttribute("title", childSnapshot.val().Fecha);
          gridLine.classList.add("div-line");
          gridLine.dataset.key = childSnapshot.val().id;
          if (divName == ''){
            gridLine.innerHTML = '<input placeholder="'+divName+'"><input type="checkbox"'+ isChecked +'><button class="bg-red">Eliminar</button>';
          } else {
            gridLine.innerHTML = '<input placeholder="'+divName+'"><input type="checkbox"'+ isChecked +'><button>Editar</button>';
          }
          gridLine.querySelector('input').value = divName;
          appendToPopUp(gridLine, "#pop-up-rubros");
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  }
}

resumenGasto.addEventListener('click', checkIfChild);
popUpGastoInside.addEventListener('click', getEditGasto);

optionsButton.addEventListener("click", openPopUp);
optionsButton.popUpId = '#pop-up-options';

changePwdButton.addEventListener("click", openPopUp);
changePwdButton.popUpId = '#pop-up-cambiarPsw';

monthlyChartButton.addEventListener("click", openMonthlyChart);
selectMonth.addEventListener("change", function() {
  clearCanvasForChart('#pieChart', 'monthlyChart');
})


//Getting Gastos
//getGastosFromTable();

getLastId();

//NUEVO USUARIO
function insertUser(){
  let newUserName = document.getElementById('newUserName').value;
  let newUserPsw1 = document.getElementById('newUserPassword1').value;
  let newUserPsw2 = document.getElementById('newUserPassword2').value;

  if(checkNewUserInputs(newUserName, newUserPsw1, newUserPsw2) == "Valido"){
    checkIfUserIsInTable(newUserName, newUserPsw1);
  };
}

function checkNewUserInputs(user, psw1, psw2){
  let regEx = /^[A-Za-z\s]{4,20}$/;

  if (!regEx.test(user)){
    return alert('Nombre de usuario inválido. Intente de nuevo');
  }
  else if (psw1.trim() == "" || psw1.length != 4){
    return alert('La contraseña debe contener 4 caracteres');
  }
  else if (psw1 != psw2){
    return alert("Las contraseñas no son iguales");
  }
  else {
    return 'Valido';
  }
}

function checkIfUserIsInTable(user, psw1){
  const dbref = ref(db);
  
  get(child(dbref, 'Users/'+ user))
  .then((snapshot) => {
    if (snapshot.exists()){
      alert('Ya existe nombre de usuario. Elige otro por favor')
    } else {
      insertUserIntoTable(user, psw1)
    }
  })
}

function insertUserIntoTable(user, psw1){
  const dbref = ref(db);

  set(ref(db, 'Users/' + user + "/Password/"), {
    Password: psw1
  })
    .then(() => {
      alert("El usuario se ha creado correctamente");
      showEnterPop(user, psw1);
    })
    .catch((error) => {
      alert(error);
    })

    //new
    get(child(dbref, 'Rubros/'))
    .then((snapshot) => {
      let index = 0;
      snapshot.forEach(childSnapshot => {
        copyRubrosFromTable(childSnapshot.val(), index, user);
        index++;
        })
      })
      .catch((error) => {
        alert(error);
      })
}

function copyRubrosFromTable(name, index, user){
  set(ref(db, 'Users/' + user + '/Rubros/' + index), {
    Rubro: name,
    Oculto: false,
    id: index
  });
}

function showNewUser(){
  let parent = document.getElementById('pop-up');
  parent.querySelector('.enterWallet').classList.add('hidden');
  parent.querySelector('.newUser').classList.remove('hidden');
}

function showEnterPop(user, psw1){
  let parent = document.getElementById('pop-up');
  parent.querySelector('.enterWallet').classList.remove('hidden');
  parent.querySelector('.newUser').classList.add('hidden');
  parent.querySelector('#userName').value = user;
  parent.querySelector('#password').value = psw1;
}

//INGRESOS
function getEditIngreso(e){
  if (!e.target.matches('button')){return};
  if (e.target.textContent=='Editar'){
    let rowToEdit = e.target.parentNode;
    updateIngresosFromTable(rowToEdit);
  } else if (e.target.textContent=='Eliminar'){
    let rowToEdit = e.target.parentNode;
    deleteIngresosFromTable(rowToEdit);
  }
}

function getIngresosFromTable(isPopUp) {
  const dbref = ref(db);

  if (isPopUp == "true"){
    clearGrid('#pop-up-ingreso', ".addToTable")

    get(child(dbref, walletOwner+"Ingresos/"+dateDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Nombre;
          let divMonto = childSnapshot.val().Monto;
    
          gridLine.setAttribute("title", childSnapshot.val().Fecha);
          gridLine.classList.add("div-line");
          gridLine.dataset.key = childSnapshot.val().Id;
          if(divMonto == 0){
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button class="bg-red">Eliminar</button>';
          } else {
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button>Editar</button>';
          }
  
          appendToPopUp(gridLine, "#pop-up-ingreso");
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  } else {
    clearGrid('.resumen-ingreso', ".sub-title");

    get(child(dbref, walletOwner+"Ingresos/"+dateDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Nombre;
          let divMonto = childSnapshot.val().Monto;

          if (divMonto != 0){
            gridLine.setAttribute("title", childSnapshot.val().Fecha);
            gridLine.classList.add("grid-line");
            gridLine.dataset.key = childSnapshot.val().Id;
            gridLine.innerHTML = '<div class="rubro">'+divName+'</div><div class="monto">'+divMonto+'</div>';
    
            appendToIngresos(gridLine);
          }
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  }
}

function updateIngresosFromTable(row){
  let key = row.dataset.key;

  let divMonto = row.querySelector("input").value;
  if (divMonto == ""){
    alert("Debes ingresar un monto o ingresar 0");
    return;
  }

  update(ref(db, walletOwner+"Ingresos/"+dateDirectory+key), {
    Monto: divMonto,
    Fecha: sFecha,
  })
    .then(() => {
      //alert("Ingreso agregado correctamente");
      getIngresosFromTable("true");
      getIngresosFromTable();
    })
    .catch((error) => {
      alert(error);
    })
}

function deleteIngresosFromTable(row){
  let key = row.dataset.key;

  remove(ref(db, walletOwner+"Ingresos/"+dateDirectory+key), {
  })
    .then(() => {
      //alert("Ingreso agregado correctamente");
      getIngresosFromTable("true");
      getIngresosFromTable();
    })
    .catch((error) => {
      alert(error);
    })
}

function appendToIngresos(line){
  let ingresos = document.querySelector(".resumen-ingreso");
  ingresos.appendChild(line);
  getTotal();
}

function insertIngresoIntoTable() {
  const resumenIngreso = document.querySelector("#pop-up-ingreso");
  const divLines = resumenIngreso.querySelectorAll(".div-line");
  var maxKey = 0;

  for (let i=0; i<divLines.length; i++){
      let key = divLines[i].dataset.key;
      if (parseInt(key) > maxKey){
        maxKey = parseInt(key);
      }
  }

  maxKey++;
  let elementName = this.parentElement.querySelector(".inputName").value;
  let elementMonto = this.parentElement.querySelector(".inputMonto").value;

  if (elementName == "" || elementMonto == ""){
    alert("Debes completar Nombre y Monto")
    return;
  }

  set(ref(db, walletOwner +"Ingresos/"+ dateDirectory + maxKey), {
    Nombre: elementName,
    Monto: elementMonto,
    Fecha: sFecha,
    Id: maxKey
  })
    .then(() => {
      //alert("Gasto agregado correctamente");
      this.parentElement.querySelector(".inputName").value = "";
      this.parentElement.querySelector(".inputMonto").value = "";
      getIngresosFromTable("true");
      getIngresosFromTable();
    })
    .catch((error) => {
      alert(error);
      maxKey--;
    })
}

//Presupuesto
function getEditPresupuesto(e){
  if (!e.target.matches('button')){return};
  if (e.target.textContent=='Editar'){
    let rowToEdit = e.target.parentNode;
    updatePresupuestoFromTable(rowToEdit);
  } else if (e.target.textContent=='Eliminar'){
    let rowToEdit = e.target.parentNode;
    deletePresupuestoFromTable(rowToEdit);
  }
}

function getPresupuestoFromTable(isPopUp) {
  const dbref = ref(db);

  if (isPopUp == "true"){
    clearGrid('#pop-up-presupuesto', ".addToTable")

    get(child(dbref, walletOwner+"Presupuesto/"+dateDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Nombre;
          let divMonto = childSnapshot.val().Monto;
    
          gridLine.setAttribute("title", childSnapshot.val().Fecha);
          gridLine.classList.add("div-line");
          gridLine.dataset.key = childSnapshot.val().Id;
          if(divMonto == 0){
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button class="bg-red">Eliminar</button>';
          } else {
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button>Editar</button>';
          }
  
          appendToPopUp(gridLine, "#pop-up-presupuesto");
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  } else {
    clearGrid('.resumen-presupuesto', ".sub-title");

    get(child(dbref, walletOwner+"Presupuesto/"+dateDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Nombre;
          let divMonto = childSnapshot.val().Monto;

          if (divMonto != 0){
            gridLine.setAttribute("title", childSnapshot.val().Fecha);
            gridLine.classList.add("grid-line");
            gridLine.dataset.week = weekOfMonth;
            gridLine.dataset.key = childSnapshot.val().Id;
            gridLine.innerHTML = '<div class="rubro">'+divName+'</div><div class="monto" data-monto='+divMonto+'>'+divMonto+'</div>';
    
            appendToPresupuesto(gridLine);
          }
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  }
}

function updatePresupuestoFromTable(row){
  let key = row.dataset.key;

  let divMonto = row.querySelector("input").value;
  if (divMonto == ""){
    alert("Debes ingresar un monto o ingresar 0");
    return;
  }

  update(ref(db, walletOwner+"Presupuesto/"+dateDirectory+key), {
    Monto: divMonto,
    Fecha: sFecha,
  })
    .then(() => {
      //alert("Presupuesto agregado correctamente");
      getPresupuestoFromTable("true");
      getPresupuestoFromTable();
    })
    .catch((error) => {
      alert(error);
    })
}

function deletePresupuestoFromTable(row){
  let key = row.dataset.key;

  remove(ref(db, walletOwner+"Presupuesto/"+dateDirectory+key), {
  })
    .then(() => {
      //alert("Data updated succesfully");
      getPresupuestoFromTable("true");
      getPresupuestoFromTable();
    })
    .catch((error) => {
      alert(error);
    })
}

function appendToPresupuesto(line){
  let presupuesto = document.querySelector(".resumen-presupuesto");
  presupuesto.appendChild(line);
  getTotal();
}

function insertPresupuestoIntoTable() {
  const resumenPresupuesto = document.querySelector("#pop-up-presupuesto");
  const divLines = resumenPresupuesto.querySelectorAll(".div-line");
  var maxKey = 0;

  for (let i=0; i<divLines.length; i++){
      let key = divLines[i].dataset.key;
      if (parseInt(key) > maxKey){
        maxKey = parseInt(key);
      }
  }

  maxKey++;
  let elementName = this.parentElement.querySelector(".inputName").value;
  let elementMonto = this.parentElement.querySelector(".inputMonto").value;

  if (elementName == "0" || elementMonto == "" || elementName == ""){
    alert("Debes elegir una opción y asignar un monto")
    return;
  }

  set(ref(db, walletOwner +"Presupuesto/"+ dateDirectory + maxKey), {
    Nombre: elementName,
    Monto: elementMonto,
    Fecha: sFecha,
    Id: maxKey
  })
    .then(() => {
      //alert("Succes!");
      this.parentElement.querySelector(".inputName").value = "";
      this.parentElement.querySelector(".inputMonto").value = "";
      getPresupuestoFromTable("true");
      getPresupuestoFromTable();
    })
    .catch((error) => {
      alert(error);
      maxKey--;
    })
}

//Gastos

function showAddButton(){
  if (this.value != 0){
    addButton.classList.remove("hidden");
  } else {
    addButton.classList.add("hidden");
  }
}

function getGastosFromTable() {
  clearGrid('.resumen-gasto', ".sub-title");
  const dbref = ref(db);

  get(child(dbref, walletOwner+"Gastos/"+dateDirectory))
    .then((snapshot) => {
      snapshot.forEach(childSnapshot => {

        let gridLine = document.createElement('div');
        let divRubro = childSnapshot.val().Rubro;
        let divMonto = childSnapshot.val().Monto;
  
        gridLine.setAttribute("title", childSnapshot.val().Fecha);
        gridLine.classList.add("grid-line");
        gridLine.dataset.week = childSnapshot.val().Semana;
        gridLine.id = childSnapshot.val().Id;
        gridLine.innerHTML = '<div class="rubro">'+divRubro+'</div><div class="monto">'+divMonto+'</div>';

        appendToGastos(gridLine);
      });
    })
    .catch((error) => {
      alert(error)
    }
  )
}

function addToList(){
  //Safe
  if (select.value == 0 || gastoMonto.value == 0){
    alert("Debe ingresar un monto");
    return;
  }
  //Declarations
  let gridLine = document.createElement('div');
  const getRubro = select.value;
  const getMonto = gastoMonto.value;
  
  insertIntoTable(getRubro, getMonto);
  //Button
  this.classList.add("hidden");
  select.value = 0;
  gastoMonto.value = "";
}

function insertIntoTable(elementRubro, elementMonto) {
  getLastId();
  lastID++;
  set(ref(db, walletOwner +"Gastos/"+ dateDirectory + lastID), {
    Rubro: elementRubro,
    Monto: elementMonto,
    Fecha: sFecha,
    Semana: weekOfMonth,
    Id: lastID
  })
    .then(() => {
      //alert("Succes!");
      getGastosFromTable();
    })
    .catch((error) => {
      alert(error);
      lastID--;
    })
}

function appendToGastos(line){
  let gastos = document.querySelector(".resumen-gasto");
  gastos.appendChild(line);
  getTotal();
}

function checkBudget(rubro, monto){
  const presupuesto = document.querySelector(".resumen-presupuesto");
  const pLines = presupuesto.querySelectorAll(".grid-line");
  
  for (let i=0; i<pLines.length; i++){
    let pRubro = pLines[i].querySelector(".rubro").textContent;
    let pMonto = pLines[i].querySelector(".monto");
    
    if (pRubro == rubro){
      pMonto.textContent = parseInt(pMonto.textContent) - parseInt(monto);
      
    }
  }
}

function getTotal(){
  //Total
  const total = document.querySelector(".total-disponible");
  var totalMonto = total.querySelector(".monto");
  //Ingresos
  const ingresos = document.querySelector(".resumen-ingreso");
  const ingresosMonto = ingresos.querySelectorAll(".monto");
  var ingresosTotal = 0;
  
  for (let i=0; i<ingresosMonto.length; i++){
    ingresosTotal += parseInt(ingresosMonto[i].textContent);
  }
  //Gastos
  const gastos = document.querySelector(".resumen-gasto");
  const gastosMonto = gastos.querySelectorAll(".monto");
  var gastosTotal = 0;
  //Ahorro
  const ahorros = document.querySelector(".resumen-ahorro");
  const ahorroMonto = ahorros.querySelectorAll(".monto");
  var ahorroTotal = 0;

  for (let i=0; i<ahorroMonto.length; i++){
    ahorroTotal += parseInt(ahorroMonto[i].textContent);
  }
  
  for (let i=0; i<gastosMonto.length; i++){
    gastosTotal += parseInt(gastosMonto[i].textContent);
  }
  
  totalMonto.textContent = ingresosTotal-gastosTotal-ahorroTotal;
  getPresupuesto()
}

function getLastId(){
  const resumen = document.querySelector(".resumen-gasto");
  var gastos = resumen.querySelectorAll(".grid-line");
  
  for (let i=0; i<gastos.length; i++){
    let id = gastos[i].id;
    if (parseInt(id) > lastID){
      lastID = parseInt(id);
    }
  }
}

function checkIfChild(e){
  const gridLine = e.target.parentNode;
  if (!gridLine.matches('.grid-line')){
    return;
  } else {
    openPopUpAndEditGasto(gridLine.id);
  }
}

function openPopUpAndEditGasto(id){
  openGastoPopUp();
  getThisGastoFromTable(id);
}

function openGastoPopUp(){
  document.querySelector('#pop-up-gasto').classList.remove("hidden");
  clearGrid('#pop-up-gasto', ".addToTable");
}

function getThisGastoFromTable(id){
  const dbref = ref(db);

  clearGrid('#pop-up-gasto', ".addToTable")

    get(child(dbref, walletOwner+"Gastos/"+dateDirectory+id))
      .then((snapshot) => {
        if (snapshot.exists()){
          let gridLine = document.createElement('div');
          let divName = snapshot.val().Rubro;
          let divMonto = snapshot.val().Monto;
          let divDate = snapshot.val().Fecha;
    
          gridLine.setAttribute("title", snapshot.val().Fecha);
          gridLine.classList.add("div-line");
          gridLine.dataset.key = snapshot.val().Id;
          if(divMonto == 0){
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button class="bg-red">Eliminar</button>';
          } else {
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button>Editar</button>';
          }
          appendToPopUp(gridLine, "#pop-up-gasto");
          showDateInGastoPopup(divDate, '#pop-up-gasto');
        }
      })
      .catch((error) => {
        alert(error)
      }
    )
}

function showDateInGastoPopup(date, query){
  let divLine = document.querySelector(query);
  divLine.querySelector('.addToTable').textContent = date;
}

function getEditGasto(e){
  if (!e.target.matches('button')){return};
  if (e.target.textContent=='Editar'){
    let rowToEdit = e.target.parentNode;
    updateGastosFromTable(rowToEdit);
  } else if (e.target.textContent=='Eliminar'){
    let rowToEdit = e.target.parentNode;
    deleteGastosFromTable(rowToEdit);
  }
}

function updateGastosFromTable(row){
  let key = row.dataset.key;

  let divMonto = row.querySelector("input").value;
  if (divMonto == ""){
    alert("Debes ingresar un monto o ingresar 0");
    return;
  }

  update(ref(db, walletOwner+"Gastos/"+dateDirectory+key), {
    Monto: divMonto,
    Fecha: sFecha,
  })
    .then(() => {
      getGastosFromTable();
      getThisGastoFromTable(key);
    })
    .catch((error) => {
      alert(error);
    })
}

function deleteGastosFromTable(row){
  let key = row.dataset.key;

  remove(ref(db, walletOwner+"Gastos/"+dateDirectory+key), {
  })
    .then(() => {
      getGastosFromTable();
      document.getElementById('pop-up-gasto').classList.add('hidden');
    })
    .catch((error) => {
      alert(error);
    })
}

// Ahorros

function getEditAhorro(e){
  if (!e.target.matches('button')){return};
  if (e.target.textContent=='Editar'){
    let rowToEdit = e.target.parentNode;
    updateAhorrosFromTable(rowToEdit);
  } else if (e.target.textContent=='Eliminar'){
    let rowToEdit = e.target.parentNode;
    deleteAhorrosFromTable(rowToEdit);
  }
}

function getAhorrosFromTable(isPopUp) {
  const dbref = ref(db);

  if (isPopUp == "true"){
    clearGrid('#pop-up-ahorro', ".addToTable")

    get(child(dbref, walletOwner+"Ahorros/"+dateDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Nombre;
          let divMonto = childSnapshot.val().Monto;
    
          gridLine.setAttribute("title", childSnapshot.val().Fecha);
          gridLine.classList.add("div-line");
          gridLine.dataset.key = childSnapshot.val().Id;
          if(divMonto == 0){
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button class="bg-red">Eliminar</button>';
          } else {
            gridLine.innerHTML = '<span>'+divName+'</span><input placeholder="'+divMonto+'"><button>Editar</button>';
          }
  
          appendToPopUp(gridLine, "#pop-up-ahorro");
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  } else {
    clearGrid('.resumen-ahorro', ".sub-title");

    get(child(dbref, walletOwner+"Ahorros/"+dateDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gridLine = document.createElement('div');
          let divName = childSnapshot.val().Nombre;
          let divMonto = childSnapshot.val().Monto;

          if (divMonto != 0){
            gridLine.setAttribute("title", childSnapshot.val().Fecha);
            gridLine.classList.add("grid-line");
            gridLine.dataset.key = childSnapshot.val().Id;
            gridLine.innerHTML = '<div class="rubro">'+divName+'</div><div class="monto">'+divMonto+'</div>';
    
            appendToAhorros(gridLine);
          }
        });
      })
      .catch((error) => {
        alert(error)
      }
    )
  }
}

function updateAhorrosFromTable(row){
  let key = row.dataset.key;

  let divMonto = row.querySelector("input").value;
  if (divMonto == ""){
    alert("Debes ingresar un monto o ingresar 0");
    return;
  }

  update(ref(db, walletOwner+"Ahorros/"+dateDirectory+key), {
    Monto: divMonto,
    Fecha: sFecha,
  })
    .then(() => {
      //alert("Data updated succesfully");
      getAhorrosFromTable("true");
      getAhorrosFromTable();
    })
    .catch((error) => {
      alert(error);
    })
}

function deleteAhorrosFromTable(row){
  let key = row.dataset.key;

  remove(ref(db, walletOwner+"Ahorros/"+dateDirectory+key), {
  })
    .then(() => {
      //alert("Data updated succesfully");
      getAhorrosFromTable("true");
      getAhorrosFromTable();
    })
    .catch((error) => {
      alert(error);
    })
}

function appendToAhorros(line){
  let ahorro = document.querySelector(".resumen-ahorro");
  ahorro.appendChild(line);
  getTotal();
}

function insertAhorroIntoTable() {
  const resumenAhorro = document.querySelector("#pop-up-ahorro");
  const divLines = resumenAhorro.querySelectorAll(".div-line");
  var maxKey = 0;

  for (let i=0; i<divLines.length; i++){
      let key = divLines[i].dataset.key;
      if (parseInt(key) > maxKey){
        maxKey = parseInt(key);
      }
  }

  maxKey++;
  let elementName = this.parentElement.querySelector(".inputName").value;
  let elementMonto = this.parentElement.querySelector(".inputMonto").value;

  if (elementName == "" || elementMonto == ""){
    alert("Debes completar Nombre y Monto")
    return;
  }

  set(ref(db, walletOwner +"Ahorros/"+ dateDirectory + maxKey), {
    Nombre: elementName,
    Monto: elementMonto,
    Fecha: sFecha,
    Id: maxKey
  })
    .then(() => {
      //alert("Succes!");
      this.parentElement.querySelector(".inputName").value = "";
      this.parentElement.querySelector(".inputMonto").value = "";
      getAhorrosFromTable("true");
      getAhorrosFromTable();
    })
    .catch((error) => {
      alert(error);
      maxKey--;
    })
}

// 19/05/2023

function assignEnterBtn(){
  const enterBtn = document.querySelectorAll("#enterBtn");
  for (let i=0; i<enterBtn.length; i++) {
    enterBtn[i].addEventListener("click", enterWallet);
  }
}

function assignCloseBtn(){
  const closeBtn = document.querySelectorAll(".closeBtn");
  for (let i=0; i<closeBtn.length; i++) {
    closeBtn[i].addEventListener("click", hideElement);
  }
}

function hideElement(){
  this.parentElement.parentElement.classList.add("hidden");
}

function openPopUp(event){
  let popUpId = event.currentTarget.popUpId;
  document.querySelector(popUpId).classList.remove("hidden");
  clearGrid(popUpId, ".addToTable");
  getIngresosFromTable("true");
  getPresupuestoFromTable("true");
  getAhorrosFromTable("true");
  getRubrosFromTable("true");
}

function getPresupuesto(){
  //Decalarations
  const presupuesto = document.querySelector(".resumen-presupuesto");
  const presupuestoRubro = presupuesto.querySelectorAll(".rubro");
  const gastos = document.querySelector(".resumen-gasto");
  const gastosRubro = gastos.querySelectorAll(".rubro");
  
  for (let i=0; i<presupuestoRubro.length; i++){
    let presWeek = presupuestoRubro[i].parentNode.dataset.week;
    let thisPres = presupuestoRubro[i].textContent;
    let presMonto = presupuestoRubro[i].parentNode.querySelector(".monto");
    presMonto.textContent = presMonto.dataset.monto;
   for(let j=0; j<gastosRubro.length; j++){
     let gastosWeek = gastosRubro[j].parentNode.dataset.week
     let thisGasto = gastosRubro[j].textContent;
     let gastoMonto = gastosRubro[j].parentNode.querySelector(".monto");
     if ( thisPres == thisGasto && presWeek == gastosWeek){
       presMonto.textContent = parseInt(presMonto.textContent)-parseInt(gastoMonto.textContent);
     }
   }
  }
}


//DATABASE FUNCTIONS

function getNewDb(){
    let dbName = document.getElementById('dbName');
    dbName.textContent = 'Billetera Digital';
    walletOwner = 'Users/';
    password.value = "";
}

function loadPage(){
  clearGrid(".resumen-gasto", ".sub-title");
  clearGrid(".resumen-ingreso", ".sub-title");
  clearGrid(".resumen-presupuesto", ".sub-title");
  getGastosFromTable();
  getIngresosFromTable();
  getPresupuestoFromTable();
  getAhorrosFromTable();
  getTotal();
  //Getting Rubros
  buildSelectOptions(walletOwner+'/Rubros/', select);
  buildSelectOptions(walletOwner+'/Rubros/', selectPresupuesto);
  let dbName = document.getElementById('dbName');
  dbName.textContent = walletOwner.slice(6,-1);
}

function buildSelectOptions(path, select) {
  const dbref = ref(db);

  select.innerHTML = '<option value="0" selected="selected">Elegir</option>'

  get(child(dbref, path))
    .then((snapshot) => {
      snapshot.forEach(childSnapshot => {
        if (childSnapshot.val().Oculto != true){
          let sOption = document.createElement('option');
          sOption.innerHTML = '<option value="'+childSnapshot.val().Rubro+'">'+childSnapshot.val().Rubro+'</option>';
          select.appendChild(sOption);
        }
      });
    })
    .catch((error) => {
      alert(error)
    }
  )
}

function appendToPopUp(line, parentElement){
  let popUp = document.querySelector(parentElement).querySelector(".inside-pop-up");
  popUp.appendChild(line);
}

function clearGrid(parentElement, titleElement){
  let parentNode = document.querySelector(parentElement);
  let currentElement = parentNode.querySelector(titleElement);
  if (currentElement != null){
    while (!!currentElement.nextElementSibling) {
      currentElement.nextElementSibling.remove();
    };
  }
}

function checkPassword(passwordFromTable){
  let password = document.getElementById("password").value;

  if (password == passwordFromTable){
    return "true";
  } else {
    alert("La contraseña no es correcta. Pruebe otra vez");
    return 'false'
  }
}

function enterWallet(){
  const dbref = ref(db);
  const userInput = document.getElementById("userName").value + '/';

    get(child(dbref, 'Users/' + userInput + "Password/"))
    .then((snapshot)=>{
        if (snapshot.exists()){
          if (checkPassword(snapshot.val().Password) === "true"){
            setUpWallet(`Users/${userInput}`);
          }
        } else {
            alert("No existe un usuario con esas credenciales");
        }
    })
    .catch((error)=>{
        alert(error);
    })
}

function setUpWallet(user){
  document.getElementById("pop-up").classList.add("hidden");
  walletOwner = user;
  loadPage();
}

function changePsw(){
  const dbref = ref(db);

  get(child(dbref, walletOwner + "Password/"))
    .then((snapshot) => {
      if (snapshot.exists()) {
        updatePassword(snapshot.val().Password)
      } else {
        alert("Not data found");
    }
    })
    .catch((error) => {
      alert(error);
    })
}

function updatePassword(passwordFromDB){
  let passwordActual = document.getElementById("password-vieja").value;
  let passwordNueva = document.getElementById("password-nueva").value;
  let passwordCheck = document.getElementById("password-repetida").value;

  if (passwordActual != passwordFromDB) {
    alert("La contraseña no coincide con la guardada en la base de datos");
    return
  } 
  else if (passwordNueva == "" || passwordNueva.length < 4){
    alert("La contraseña nueva debe contener 4 caracteres");
    return
  } 
  else if (passwordNueva != passwordCheck){
    alert("Las contraseñas no son iguales");
    return
  } 
  else {
    insertPswIntoDB(passwordNueva);
  }
} 

function insertPswIntoDB(password){
  update(ref(db, walletOwner + "Password/"), {
    Password: password
  })
    .then(() => {
      alert("La nueva contraseña se ha guardado correctamente");
    })
    .catch((error) => {
      alert(error);
    })
}


//CHART
var isResumenOpen = 'true';
var isMonthlyChartOpen = 'false';

function openMonthlyChart(){
  toggleResumenCliente();
  clearCanvasForChart('#pieChart', 'monthlyChart');
  toggleMonthlyChart();
}

function toggleResumenCliente(){
  let resumen = document.querySelectorAll("#resumen-cliente");
  let fechaResumen = document.querySelector(".fecha-resumen");

  if (isResumenOpen == 'true'){
    resumen.forEach(item => {
      item.classList.add('hidden');
    })
    fechaResumen.classList.add("hidden");
    isResumenOpen = 'false'
  } else {
    resumen.forEach(item => {
      item.classList.remove('hidden');
    })
    fechaResumen.classList.remove("hidden");
    isResumenOpen = 'true'
  }
}

function toggleMonthlyChart(){
  console.log('here');
  let monthlyChart = document.getElementById("pieChart");
  let monthlyChartTitle = document.querySelector(".monthly-chart");
  let openChartButton = document.getElementById("monthlyChartOption")

  if (isMonthlyChartOpen == "true"){
    monthlyChart.classList.add("hidden");
    monthlyChartTitle.classList.add("hidden");
    openChartButton.textContent = "Ver gráfica mensual"
    isMonthlyChartOpen = 'false';
  } else {
    monthlyChart.classList.remove("hidden");
    monthlyChartTitle.classList.remove("hidden");
    openChartButton.textContent = "Ver resumen de gastos"
    isMonthlyChartOpen = 'true';
  }
}

function getGastosForChart() {
    const dbref = ref(db);
    var gArray = [];
    const selectedMonth = document.getElementById("select-month").value;
    let getSelectedMonthDirectory = thisYear+"/"+selectedMonth+"/";
  
    get(child(dbref, walletOwner+"Gastos/"+getSelectedMonthDirectory))
      .then((snapshot) => {
        snapshot.forEach(childSnapshot => {
  
          let gRubro = childSnapshot.val().Rubro;
          let gMonto = childSnapshot.val().Monto;
    
          let item = {
            "Rubro": gRubro,
            "Monto": gMonto
          }

          gArray.push(item);
        });
        addParts(gArray, parseInt(selectedMonth)+1);
      })
      .catch((error) => {
        alert(error)
      }
    )
  }

  function addParts(data, selectedMonth){
    const transformed = [];

    data.forEach(item => {
      item.Monto = parseInt(item.Monto);
      const exist = transformed.find(t => t.Rubro == item.Rubro)
      if (exist)
        exist.Monto += item.Monto;
      else
        transformed.push(item);
    })


    buildMonthlyGastosChart(transformed, selectedMonth)
  }

  function buildMonthlyGastosChart(data, selectedMonth){
    const arrayRubro = [];
    const arrayMonto = [];

    data.forEach(item => {
      arrayRubro.push(item.Rubro);
      arrayMonto.push(item.Monto);
    });

    new Chart("monthlyChart", {
      type: "pie",
      data: {
          labels: arrayRubro,
          datasets: [{
              backgroundColor: getColors(data.length),
              data: arrayMonto
          }]
      },
      options: {
          hover: {mode: null}, //Esto es para evitar que cambie de color en hover
          title: {
              display: true,
              text: `Gastos del mes ${selectedMonth} del año ${thisYear}`
          },
          legend: {
            display: true,
            labels: {
              boxWidth: 10,
              padding: 5,
            }
          }
      }
    });
  }

  function getColors(num){
    let hue = 0;
    let colors = []
    for (let j = 0; j < num; j++) {
      let color = "hsl(" + hue + ",100%,50%)"      
      colors.push(color)      
      hue += 500
    }
    return colors;
  }

  function clearCanvasForChart(parentQuery, childId){
    let parent = document.querySelector(parentQuery);
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    let newCanvas = document.createElement('canvas');
    newCanvas.id = childId;
    parent.appendChild(newCanvas);
    getGastosForChart();
  }