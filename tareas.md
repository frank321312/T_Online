1. Permitir que los usuarios creen sus propias salas, para ello se necesita el nombre de la sala y dar la opcion si es publica o privada, si es privada se necesitara una clave para acceder a dicha sala.

1-a. Crear la tabla sala, sus atributos son idSala, nombre, clave, idUsuario. C
1-b. Crear una interfaz que permita crear salas al usuario. Cuando el usuario interactue con dicha interfaz deben aparecer las opciones entre ellas se encuentra el nombre, clave (generado por el servidor) y la opcion de si es publica o privada. C
1-c. Crear un endpoint para insetar filas en la tabla Salas, se debe validar que cada sala tengo un nombre unico por lo que se debera validar tambien. C
1-d. Agregar al DOM la sala creada por el usuario, de la sala solo se debe mostrar su nombre y si es publico o no, la clave estara en el chat de la sala. C