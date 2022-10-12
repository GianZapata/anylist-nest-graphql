<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


## Ejecutar en desarrollo

1. Clonar el repositorio

2. Ejecutar el comando
```
yarn install
```

3. Tener Nest CLI instalado
```
npm i -g @nestjs/cli
```

4. Levantar la image de Docker (Docker desktop)
```
docker-compose up -d
```

5. Clonar el archivo ```.env.template``` y renombrarlo la copia ```.env```

6. Llenar las variables de entorno definidas en el archivo ```.env```

7. Levantar el servidor de Nest
```
yarn start:dev
```

8. Visitar el sitio
```
http://localhost:3000/graphql
```

9. Ejecutar la mutation __executeSeed__ para purgar la base de datos y llenarla con datos de prueba


# Recomendaciones
- Descargar Docker Desktop para levantar la base de datos

## Stack Usado
* TypeORM - MySQL
* Nest - GraphQL