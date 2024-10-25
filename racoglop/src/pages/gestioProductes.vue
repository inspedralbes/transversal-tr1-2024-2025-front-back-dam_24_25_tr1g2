<template>
    <div>
        <h1>Gestio de Productes</h1>


            <ul>
               <div v-for="producto in productos" :key="producto.id">
                    <p>{{ producto.producto }}</p>
                    <p>{{ producto.imagen }}</p>
                    <p>{{ producto.precio }}</p>
                </div>
            </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProductos } from "../service/communicationManager";


const productos = ref([]);

onMounted(async () => {
    productos.value = await getProductos();
    console.log(productos.value);
});

</script>