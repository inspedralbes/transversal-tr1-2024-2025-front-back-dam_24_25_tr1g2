<template>
<div>
    <header>
      <v-btn @click="rutaProductos">Gestió de productes</v-btn>
      <v-btn @click="rutaComandas">Gestió de Comandas</v-btn>
    </header>
    <div>
      <h1>a</h1>
    </div>
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

<style scoped>
header {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5; /* Puedes personalizar el color aquí */
  border-bottom: 1px solid #ddd; /* Añade una línea divisoria si deseas */
}
</style>
