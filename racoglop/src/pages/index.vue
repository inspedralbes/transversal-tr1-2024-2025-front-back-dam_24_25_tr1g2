<template>
  <div class="inicio-tienda">
    <!-- Encabezado con logo y botones -->
    <Header />

    <!-- Fondo de bienvenida con imagen de alta calidad -->
    <div class="bienvenida">
      <h1 class="titulo">Benvinguts a RacoGlop</h1>
      <p class="descripcion">
        Explora la nostra exclusiva selecció de vins, cerveses artesanals i licors fins
      </p>
    </div>

    <!-- Imagen de Google en lugar del carrusel -->
    <div class="imagen-principal">
      <!-- Usando una imagen de Google -->
      <img src="https://img.freepik.com/fotos-premium/foto-interior-largo-corredor-estantes-madera-llenas-botellas-bodega-alcohol-elite_474532-1326.jpg" alt="Vino Exclusivo" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Header from '../components/header.vue';  // Importa el componente Header si lo tienes

const router = useRouter();

// Funciones de navegación (si las necesitas para los botones)
const rutaProductos = () => {
  router.push('/gestioProductes');
};

const rutaComandas = () => {
  router.push('/gestioComandas');
};
</script>

<style scoped>
/* Estilo global de la página */
html, body {
  margin: 0;
  padding: 0;
  height: 100%; /* Asegura que la página ocupe toda la altura de la ventana */
  overflow: hidden; /* Elimina el scroll */
}

/* Contenedor principal */
.inicio-tienda {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;  /* Centra todo el contenido */
  height: 100%;  /* Asegura que ocupe toda la altura de la ventana */
  background-color: #000; /* Fondo negro */
  color: white;
  font-family: 'Poppins', sans-serif;
}

/* Estilo del encabezado */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px;
  background-color: #333; /* Fondo oscuro para el encabezado */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra para darle un efecto de elevación */
}

header img {
  height: 50px; /* Logo */
}

header .nav-buttons {
  display: flex;
  gap: 20px;
}

header .nav-buttons button {
  padding: 10px 20px;
  background-color: #ff9900;
  border: none;
  border-radius: 30px;
  color: white;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
  font-weight: 500;  /* Peso de fuente más fuerte */
}

header .nav-buttons button:hover {
  background-color: #e68900;
  transition: background-color 0.3s ease-out;
}

/* Fondo de bienvenida */
.bienvenida {
  text-align: center;
  padding: 50px;
  background: rgba(0, 0, 0, 0.7); /* Fondo oscuro */
  border-radius: 10px;
  margin-top: 100px; /* Para que no se superponga con el header fijo */
  width: 80%;
  max-width: 1000px;
}

.titulo {
  font-size: 4.5em;
  font-weight: 700;
  letter-spacing: 3px;
}

.descripcion {
  font-size: 1.5em;
  margin-top: 15px;
  font-style: italic;
}

/* Estilos para la imagen */
.imagen-principal {
  width: 100%;
  max-width: 600px; /* Reducir el tamaño de la imagen */
}

.imagen-principal img {
  width: 100%;
  height: auto;
  object-fit: cover; /* Ajusta la imagen para que cubra el contenedor */
  border-radius: 10px;
}
</style>