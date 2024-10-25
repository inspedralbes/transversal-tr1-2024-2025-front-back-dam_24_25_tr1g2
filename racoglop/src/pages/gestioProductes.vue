<template>
    <div>
        <h1>Gestio de Productes</h1>
    </div>
</template>

<script setup>
import { getProductos } from "../service/communicationManager";

const productos = ref([]);

onMounted(async () => {
    productos.value = await getProductos();
    console.log(productos.value);
})

</script>