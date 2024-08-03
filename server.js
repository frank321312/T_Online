import express from 'express';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { createClient } from '@libsql/client';
import cors from 'cors';

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cors());

const io = new Server(server, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
    }
});

dotenv.config();
const db = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKKEN
})

await db.execute(`
    CREATE TABLE IF NOT EXISTS Mensajes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contenido TEXT,
        idUsuario INTEGER,
        FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario)
    )
`);

await db.execute(`
    CREATE TABLE IF NOT EXISTS Usuarios (
        idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT
    );
`)

await db.execute(`
    CREATE TABLE IF NOT EXISTS Jugadas (
        idJugada INTEGER PRIMARY KEY AUTOINCREMENT,
        idUsuario INTEGER,
        FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario)
    );
`)

await db.execute(`
    CREATE TABLE IF NOT EXISTS Salas (
        idSala INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT,
        clave TEXT,
        publico INTEGER,
        idUsuario INTEGER,
        FOREIGN KEY (idUsuario) REFERENCES Usuarios(idUsuario)
    );
`)

const port = process.env.PORT || 8000;

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "/public/registrar.html"));
});

app.get("/principal", (req, res) => {
    res.sendFile(join(__dirname, "/public/principal.html"));
});

async function existsUser(user, username) {
    return new Promise((resolve, reject) => {
        if (user.nombre == username) {
            reject("Ya existe un usuario con ese nombre");
        } else {
            resolve("El usuario no existe");
        }
    });
}

async function searchUser(nombre, id) {
    return new Promise(async (resolve, reject) => {
        const userData = await db.execute({
            sql: "SELECT idUsuario, nombre FROM Usuarios WHERE nombre = (:username) AND idUsuario = (:id)",
            args: { username: nombre, id: id }
        });
        if (userData.rows.length == 0) {
            reject({ message: "No existe el usuario", error: true });
        } else {
            resolve(userData.rows[0]);
        }
    });
}

app.post("/api/registro", async (req, res) => {
    try {
        console.log(req.body.nombre);
        // if (typeof req.body.nombre != "string") throw new Error("Debe ser un string");
        if (!/^[^\s]{3,10}$/.test(req.body.username)) throw new Error("nombre invalido");
        const userData = await db.execute({
            sql: "SELECT idUsuario, nombre FROM Usuarios WHERE nombre = (:username)",
            args: { username: req.body.username } 
        });
        if (userData.rows.length > 0) {
            await existsUser(userData.rows[0], req.body.username);
        }
 
        await db.execute({
            sql: "INSERT INTO Usuarios (nombre) VALUES (:nombre)",
            args: { nombre: req.body.username }
        });

        const selectData = await db.execute({
            sql: "SELECT idUsuario, nombre FROM Usuarios WHERE nombre = (:username)",
            args: { username: req.body.username }
        });

        // console.log(userData);
        console.log("Registro existoso");
        res.status(200).json({ message: "Registro exitoso", url: "https://t-online.onrender.com/principal", data: selectData.rows, validation: true });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }
});

function generateClave() {
    const caracter = "zxcvbnmasdfghjklñqwertyuiop1234567890_-"
    let clave = "";
    for (let i = 0; i < 15; i++) {
        const rmd = Math.floor(Math.random() * caracter.length);
        clave += caracter[rmd];
    }
    return clave;
} 

async function existsSala(nombre) {
    return new Promise( async (resolve, reject) => {
        const respuesta = await db.execute({
            sql: "SELECT * FROM Salas WHERE nombre = (:name)",
            args: { name: nombre }
        })
        if (respuesta.rows.length == 0) {
            // console.log(respuesta.rows);
            resolve({ message: "No existe la sala" });
        } else {
            reject({ message: "Ese ya esta en uso", error: true });
        }
    });
}

async function searchSala(nombre) {
    return new Promise( async (resolve, reject) => {
        const respuesta = await db.execute({
            sql: "SELECT * FROM Salas WHERE nombre = ?",
            args: [nombre]
        })
        if (respuesta.rows.length > 0) {
            resolve(respuesta.rows[0]);
        } else {
            reject({ message: "No existe la sala", error: true });
        }
    });
}  

app.post("/api/sala-post", async (req, res) => {
    try {
        if (!/^\w[^\s]{3,20}$/.test(req.body.nombre)) throw new Error("Los datos no son validos");
        await existsSala(req.body.nombre);
        await searchUser(req.body.user.nombre, req.body.user.idUsuario);
        console.log(req.body);
        await db.execute({
            sql: "INSERT INTO Salas (nombre, clave, publico, idUsuario) VALUES(:nombre, :clave, :publico, :idUsuario)",
            args: { nombre: req.body.nombre, clave: generateClave(), publico: req.body.publico ? 1 : 0, idUsuario: req.body.user.idUsuario }
        }); 
        const resSala = await searchSala(req.body.nombre);
        
        res.status(200).send({ okay: true, nombre: resSala.nombre, accesible: resSala.publico == 1 ? true : false });
    } catch (error) {
        if (error.error) {
            res.status(400).json(error);
        }
        console.log(req.body);
        // console.log(error);
    }
});

app.get("/test", (req, res) => {
    res.send("Esto es una prueba")
});

io.on("connection", async (socket) => {
    console.log("Usuario conectado");

    socket.on("disconnect", () => {
        console.log("Usuario desconectado");
    });

    socket.on("chat message", async (msg) => {
        try {
            const userSelect = await searchUser(socket.handshake.auth.nombre, socket.handshake.auth.id);

            await db.execute({
                sql: 'INSERT INTO Mensajes (contenido, idUsuario) VALUES (:contenido, :id)',
                args: { contenido: msg, id: userSelect.idUsuario }
            });
            io.emit("mensaje", msg, userSelect);
        } catch (error) {
            io.emit("error user", error);
            console.log(error);
        }
    });

    socket.on("request", (callback) => {
        callback({
            status: "Buenardo"
        })
    });

    socket.on("jugada", async (msg) => {
        try {
            const userSelect = await searchUser(socket.handshake.auth.nombre, socket.handshake.auth.id);

            const ultimaJugada = await db.execute("SELECT idUsuario FROM Jugadas ORDER BY idJugada DESC LIMIT 1");
            console.log(ultimaJugada.rows);
            if (ultimaJugada.rows[0].idUsuario === userSelect.idUsuario) {
                throw new Error(`Este jugador no puede hacer una jugada ${ultimaJugada.rows[0].idUsuario}`);
            }

            await db.execute({
                sql: "INSERT INTO Jugadas (idUsuario) VALUES (:id)",
                args: { id: userSelect.idUsuario }
            });
            // console.log("Este chavon fue quien hizo la jugada", socket.handshake.auth);
            socket.emit("espera", userSelect.idUsuario, true)

        } catch (error) {
            console.log(error);
        }
    });

    if (!socket.recovered) {
        try {
            const respuesta = await db.execute("SELECT contenido, Mensajes.idUsuario, Usuarios.nombre FROM Mensajes INNER JOIN Usuarios ON Mensajes.idUsuario = Usuarios.idUsuario");
            const userSelect = await searchUser(socket.handshake.auth.nombre, socket.handshake.auth.id);
            // console.log("Hola", userSelect);
            io.emit("mensaje recovered", respuesta.rows, userSelect);
            // console.log(socket.handshake.auth.idUsuario);
        } catch (error) {
            console.log(error);
        }
    }
});
// const respuesta = await db.execute({
//     sql: "SELECT * FROM Usuarios WHERE nombre = ?",
//     args: ["Mounstrico"]
// })
// console.log(respuesta);
server.listen(port, () => {
    console.log(`Ejecutando en el puerto ${port}`);
});