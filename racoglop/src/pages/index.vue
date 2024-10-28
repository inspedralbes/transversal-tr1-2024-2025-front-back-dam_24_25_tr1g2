<template>
  <div>
    <h1>a</h1>
    
    <v-btn @click="rutaProductos">Gestió de productes</v-btn>
    <v-btn @click="rutaComandas">Gestió de Comandas</v-btn>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';


const router = useRouter();

const rutaProductos = () => {
    router.push('/gestioProductes');
};  

const rutaComandas = () => { 
  router.push('/gestioComandas');
}

</script>
