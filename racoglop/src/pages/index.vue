<template>
  <div>
    <Header />    
       
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import Header from '../components/header.vue'; 

const router = useRouter();

const rutaProductos = () => {
    router.push('/gestioProductes');
};  

const rutaComandas = () => { 
  router.push('/gestioComandas');
};
</script>
<style>

</style>

