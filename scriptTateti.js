const contenedorHijos = document.querySelector(".cotenedor__hijos");

const cuadroWin = document.querySelector(".cuadro__win");
const players = document.querySelectorAll(".player");
const buttonReload = document.createElement("button");
buttonReload.classList.add("reload");
buttonReload.textContent = "Volver a jugar";

let contador = 0;
let listObjectGame = [
    {
        gameId: "",
        player1: {
            id: "",
            points: 0
        },
        player2: {
            id: "",
            points: 0
        }
    }
]

function tieneHijos(agregarHijo, elemento) {
    if (elemento.children.length == 0) {
        elemento.appendChild(agregarHijo);
    }
}

function contieneEsaClase(elemento, clase) {
    return elemento.classList.contains(clase);
}

function esGanador(listElement, num1, num2, num3, team) {
    return contieneEsaClase(listElement[num1], team) &&
        contieneEsaClase(listElement[num2], team) &&
        contieneEsaClase(listElement[num3], team);
}

function assignTeam(listElement, team) {
    return esGanador(listElement, 0, 1, 2, team) || esGanador(listElement, 3, 4, 5, team) || esGanador(listElement, 6, 7, 8, team) ||
        esGanador(listElement, 0, 4, 8, team) || esGanador(listElement, 2, 4, 6, team) || esGanador(listElement, 0, 3, 6, team) ||
        esGanador(listElement, 1, 4, 7, team) || esGanador(listElement, 2, 5, 8, team);
}

function ganaEquis(listElement) {
    return assignTeam(listElement, "x");
}

function ganaO(listElement) {
    return assignTeam(listElement, "o");
}

function agregarAnimacion(lista, nombre) {
    for (let i = 0; i < lista.length; i++) {
        lista[i].style.animationName = nombre;
    }
}

function reiniciarPartida() {
    cuadroAll[i].innerHTML = "";
    cuadroAll[i].classList.remove("o", "x", "contador")
}

function removeClassElement(list) {
    for (let i = 0; i < list.length; i++) {
        list[i].classList.remove("o", "x", "contador")        
    }
}

function removeClassTermino(list) {
    for (let i = 0; i < list.length; i++) {
        list[i].classList.remove("termino")        
    }    
}

function terminoPartida(list) {
    for (let i = 0; i < list.length; i++) {
        cuadroAll[i].classList.add("termino")
    }    
}

function agregarScriptAnimacion(spanText) {
    contenedorHijos.innerHTML = spanText;
    contenedorHijos.appendChild(buttonReload);
    agregarAnimacion(cuadroAll, "desvanecerCuadro");
    cuadroWin.style.visibility = "visible";
    cuadroWin.style.animationName = "bajarCuadroWin";
}

for (let i = 0; i < cuadroAll.length; i++) {
    const x = document.createElement("div");
    x.classList.add("equis");

    const o = document.createElement("div");
    o.classList.add("circulo");

    cuadroAll[i].addEventListener("click", () => {

        let containsTermino = cuadroAll[i].classList.contains("termino");
        if (!cuadroAll[i].classList.contains("contador") && !containsTermino) {
            contador++
        } 

        cuadroAll[i].classList.add("contador");
        let claseContains = cuadroAll[i].classList.contains("x") || cuadroAll[i].classList.contains("o");
        if (contador % 2 == 0) {
            !containsTermino && tieneHijos(o, cuadroAll[i]);
            if (!claseContains && !containsTermino) cuadroAll[i].classList.add("o");
        } else {
            !containsTermino && tieneHijos(x, cuadroAll[i]);
            // tieneHijos(x, cuadroAll[i]);
            if (!claseContains && !containsTermino) cuadroAll[i].classList.add("x");
        }
        if (ganaEquis(cuadroAll)) {
            if (!containsTermino) {
                listObjectGame[0].player1.points++;
            }
            terminoPartida(cuadroAll);
            agregarScriptAnimacion(`<span>Gano el jugador con "X"</span>`)
            players[0].textContent = `Jugador X: ${listObjectGame[0].player1.points}`
            removeClassElement(cuadroAll)
        } else if (ganaO(cuadroAll)) {
            if (!containsTermino) {
                listObjectGame[0].player2.points++;
            }
            terminoPartida(cuadroAll);
            agregarScriptAnimacion(`<span>Gano el jugador con "O"</span>`)
            players[1].textContent = `Jugador O: ${listObjectGame[0].player2.points}`
            removeClassElement(cuadroAll)
        }
        if (contador == 9) {
            contenedorHijos.style.width = "50vw"
            agregarScriptAnimacion(`<span>No hay ganador</span>`)
            removeClassElement(cuadroAll)
            terminoPartida(cuadroAll);
        }
        console.log(contador);
    });

    buttonReload.addEventListener("click", () => {
        cuadroWin.style.visibility = "";
        cuadroWin.style.animationName = "";
        contenedorHijos.innerHTML = "";
        cuadroAll[i].style.animationName = "";
        cuadroAll[i].innerHTML = "";
        contador = 0;
        removeClassTermino(cuadroAll)
        removeClassElement(cuadroAll)
    });
}