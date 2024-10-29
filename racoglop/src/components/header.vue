<template>
  <header>
    <!-- Logo que lleva al inicio -->
    <v-img
      src="@/assets/Logo-tr1-g2.png"
      alt="Logo Inici"
      @click="rutaIndex"
      max-width="50"
      class="logo"
    ></v-img>
    
    <!-- Botones de navegación -->
    <v-btn class="nav-button ml-auto" @click="rutaProductos">Gestió de Productes</v-btn>
    <v-btn class="nav-button" @click="rutaComandas">Gestió de Comandas</v-btn>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const rutaIndex = () => {
    router.push('/'); 
};

const rutaProductos = () => {
    router.push('/gestioProductes');
};

const rutaComandas = () => { 
  router.push('/gestioComandas');
};
</script>

<style scoped>
header {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
  background-color:#333333; /* Light Blue background */
  border-bottom: 1px solid #00ff0d;
}

.logo {
  cursor: pointer;
  border-radius: 70%; /* Circular logo */
  overflow: hidden; /* Ensures no overflow */
  width: 50px; /* Fixed width for circular shape */
  height: 50px; /* Fixed height for circular shape */
}

.nav-button {
  color: rgb(244, 239, 239); /* Text color */
  background-color:#800020; /* Blue button color */
  transition: background-color 0.3s, transform 0.2s; /* Smooth transition */
} 

.nav-button:hover {
  background-color: #fe0c0c; /* Darker blue on hover */
  transform: scale(1.05); /* Slightly grow on hover */
}
</style>
