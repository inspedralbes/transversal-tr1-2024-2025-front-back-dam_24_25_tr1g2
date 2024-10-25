<template>
  <div>
    <h1>Home</h1>
    
    <v-btn @click="rutaProductos">Gestió de productes</v-btn>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';


const router = useRouter();

const rutaProductos = () => {
    router.push('/gestioProductes');
};
</script>
