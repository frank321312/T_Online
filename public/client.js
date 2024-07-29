const addSala = document.querySelector(".addSala");
const body = document.body;
const salas = document.querySelector(".salas");
const dataUser = JSON.parse(sessionStorage.getItem("usuario"));

addSala.addEventListener("click", () => {
    if (body.querySelector(".cuadro-add") == undefined) {
        const cuadroAddSala = document.createElement("div");
        cuadroAddSala.classList.add("cuadro-add");
        cuadroAddSala.innerHTML =
        `
        <div style="width: 100%; display: flex; justify-content: end; font-family: sans-serif; padding-right: 20px;">
        <span class="ico-X">X</span>
        </div>
        <form action="" class="form-sala">
            <label for="text-input" class="label-text">Ingrese el nombre:</label>
            <input type="text" id="text-input" class="sala-text" placeholder="nombre de la sala">
            <span class="error"></span>
            <label for="check" class="check-box">
            <input id="check" type="checkbox" >
            Privado
            </label>
            <button type="submit" class="btn-add">Crear sala</button>
        </form>
        `

        body.appendChild(cuadroAddSala);
        const icoX = document.querySelector(".ico-X");
        const check = document.getElementById("check");
        const btnAdd = document.querySelector(".btn-add");
        const textInput = document.getElementById("text-input");
        const errorMessage = document.querySelector(".error");
        const formSala = document.querySelector(".form-sala");
        errorMessage.style.backgroundColor = "#fff";
        errorMessage.style.alignSelf = "flex-start";
        errorMessage.style.marginBottom = "8px";
        errorMessage.style.padding = "0";

        icoX.addEventListener("click", () => {
            cuadroAddSala.removeChild(formSala);
            document.body.removeChild(cuadroAddSala);
        });

        btnAdd.addEventListener("click", async (e) => {
            e.preventDefault();
            if (!/^\w[^\s]{3,20}$/.test(textInput.value)) {
                console.log("Error");
                errorMessage.textContent = "Nombre invalido";
                errorMessage.style.backgroundColor = "#fff";
                errorMessage.style.color = "rgb(207, 58, 58)";
                errorMessage.style.padding = "5px 0 0 0";
            } else {
                try {
                    const respuesta = await fetch("https://tateti-online.vercel.app/api/sala-post", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ nombre: textInput.value, publico: check.checked, user: dataUser }),
                    });

                    const data = await respuesta.json();
                    if (data.error) {
                        errorMessage.textContent = data.message;
                        errorMessage.style.color = "rgb(207, 58, 58)";
                        errorMessage.style.padding = "5px 0 0 0";
                    } else if (data.okay) {
                        errorMessage.textContent = "";
                        textInput.value = "";
                        const sala = document.createElement("div");
                        sala.classList.add("sala");
                        sala.innerHTML = `
                            <span>sala: ${data.nombre}</span>
                            <span>accesibilidad: ${data.accesible ? "privado" : "publico"}</span>
                            `
                        salas.appendChild(sala);
                        body.removeChild(cuadroAddSala);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }
});
