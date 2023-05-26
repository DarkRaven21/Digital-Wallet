//###############IMPORT###############
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9B_9ctag0CSC2nuoa01oPY964kAdRsRQ",
  authDomain: "billetera-web.firebaseapp.com",
  projectId: "billetera-web",
  storageBucket: "billetera-web.appspot.com",
  messagingSenderId: "32452057885",
  appId: "1:32452057885:web:e8ff9cb5f478e9d1ab1ff4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();


import {getDatabase, set, get, update, remove, ref, child} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

//########JavaScript#########

const fecha = document.getElementById("fechaHoy");
const select = document.getElementById("gasto-ingresar");
const gastoMonto = document.getElementById("gasto-monto");
const addButton = document.getElementById("addButton");
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
const passwordInput = document.getElementById("password");
const cambiarPsw = document.getElementById("cambiarPsw");
const passwordIcon = document.querySelector(".changePsw");


var weekOfMonth = Math.ceil(new Date().getDate() / 7);
var walletOwner = '';
var lastID = 0;

getNewDb();
getTotal();
assignEnterBtn();
assignCloseBtn();

console.log(lastID);

var sFecha = new Date().toLocaleString().split(",")[0];

fecha.textContent = sFecha;

select.addEventListener("change", showAddButton);
addButton.addEventListener("click", addToList);
ownerInput.addEventListener("change", getNewDb);
passwordInput.addEventListener("keypress", function(event){
  if (event.key == "Enter"){
    enterWallet();
  }
})
cambiarPsw.addEventListener("click", changePsw);

abrirIngresos.addEventListener("click", openPopUp);
abrirIngresos.popUpId = '#pop-up-ingreso';
agregarIngreso.addEventListener("click", insertIngresoIntoTable);
popUpIngresoInside.addEventListener('click', getEditIngreso);

abrirPresupuestos.addEventListener("click", openPopUp);
abrirPresupuestos.popUpId = '#pop-up-presupuesto';
agregarPresupuesto.addEventListener("click", insertPresupuestoIntoTable);
popUpPresupuestoInside.addEventListener('click', getEditPresupuesto);

passwordIcon.addEventListener("click", openPopUp);
passwordIcon.popUpId = '#pop-up-cambiarPsw';

//Getting Rubros
buildSelectOptions('Rubros/', select);
//Getting Gastos
//getGastosFromTable();

getLastId();

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
  console.log(key);
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
      alert("Data updated succesfully");
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
      alert("Data updated succesfully");
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
      alert("Succes!");
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
      alert("Data updated succesfully");
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
      alert("Data updated succesfully");
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

  if (elementName == "" || elementMonto == ""){
    alert("Debes completar Nombre y Monto")
    return;
  }

  set(ref(db, walletOwner +"Presupuesto/"+ dateDirectory + maxKey), {
    Nombre: elementName,
    Monto: elementMonto,
    Fecha: sFecha,
    Id: maxKey
  })
    .then(() => {
      alert("Succes!");
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
      alert("Succes!");
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
  const ahorroMonto = ahorros.querySelector(".monto");
  var ahorroTotal = parseInt(ahorroMonto.textContent);
  
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
    dbName.textContent = ownerInput.options[ownerInput.selectedIndex].textContent;
    walletOwner = ownerInput.value;
    clearGrid(".resumen-gasto", ".sub-title");
    clearGrid(".resumen-ingreso", ".sub-title");
    clearGrid(".resumen-presupuesto", ".sub-title");
    getGastosFromTable();
    getIngresosFromTable();
    getPresupuestoFromTable();
    password.value = "";
}

function buildSelectOptions(path, select) {
  const dbref = ref(db);

  get(child(dbref, path))
    .then((snapshot) => {
      snapshot.forEach(childSnapshot => {
        let sOption = document.createElement('option');
        sOption.innerHTML = '<option value="'+childSnapshot.val()+'">'+childSnapshot.val()+'</option>';
        select.appendChild(sOption);
      });
    })
    .catch((error) => {
      alert(error)
    }
  )
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

function appendToPopUp(line, parentElement){
  let popUp = document.querySelector(parentElement).querySelector(".inside-pop-up");
  popUp.appendChild(line);
}

function clearGrid(parentElement, titleElement){
  let parentNode = document.querySelector(parentElement);
  let currentElement = parentNode.querySelector(titleElement);
  while (!!currentElement.nextElementSibling) {
    currentElement.nextElementSibling.remove();
  };
}

function checkPassword(passwordFromTable){
  let password = document.getElementById("password").value;

  if (password == passwordFromTable){
    document.getElementById("pop-up").classList.add("hidden");
  } else {
    alert("La contraseña no es correcta. Pruebe otra vez");
  }
}

function enterWallet(){
  const dbref = ref(db);

    get(child(dbref, walletOwner +"Password/"))
    .then((snapshot)=>{
        if (snapshot.exists()){
          checkPassword(snapshot.val().Password)
        } else {
            alert("Not data found");
        }
    })
    .catch((error)=>{
        alert(error);
    })
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



function InsertData(){
    set(ref(db, walletOwner + id), {
        Name: 'Bruno',
        Lastname: 'Jannet',
        Age: 31
    })
    .then(()=>{
        alert("Succes!");
        id++;
    })
    .catch((error)=>{
        alert(error);
    })
}

function UpdateData(){
    update(ref(db, walletOwner + findID), {
        //Name: enterName.value,
        //Lastname: enterLastname.value,
        //Age: enterAge.value
    })
    .then(()=>{
        alert("Data updated succesfully");
    })
    .catch((error)=>{
        alert(error);
    })
}

function FindData(){
    const dbref = ref(db);

    get(child(dbref, walletOwner + findID))
    .then((snapshot)=>{
        if (snapshot.exists()){
            console.log(snapshot.val().Name);
            console.log(snapshot.val().Lastname);
        } else {
            alert("Not data found");
        }
    })
    .catch((error)=>{
        alert(error);
    })
}

function RemoveData(){
    remove(ref(db, walletOwner + findID))
    .then(()=>{
        alert("Data removed succesfully");
    })
    .catch((error)=>{
        alert(error);
    })
}