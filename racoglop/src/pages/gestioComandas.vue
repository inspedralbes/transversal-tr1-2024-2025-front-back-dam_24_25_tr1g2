<template>
    <div>
        <Header />

    </div>
    <v-container>
        <v-card>
            <v-card-title>
                <h1 class="text-center">Gestión de Comandas</h1>
            </v-card-title>

            <v-simple-table>
                <thead>
                    <tr>
                        <th class="text-center">Pedido ID</th>
                        <th class="text-center">Usuario ID</th>
                        <th class="text-center">Detalles</th>
                        <th class="text-center">Total (€)</th>
                        <th class="text-center">Fecha Pedido</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="comanda in comandas" :key="comanda.id">
                        <td class="text-center">{{ comanda.id }}</td>
                        <td class="text-center">{{ comanda.usuario_id }}</td>
                        <td class="text-center">{{ comanda.detalles }}</td>
                        <td class="text-center">{{ comanda.total }}</td>
                        <td class="text-center">{{ comanda.fecha_pedido }}</td>
                    </tr>
                </tbody>
            </v-simple-table>

            <!-- Mensaje en caso de error -->
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </v-card>

    </v-container>
</template>     

<script setup>
import { ref, onMounted } from 'vue';
import { getComandas } from "../service/communicationManager";  
import Header from '../components/header.vue'; 

const comandas = ref([]);
const errorMessage = ref('');

onMounted(async () => {
    await fetchComandas();
});

const fetchComandas = async () => {
    try {
        comandas.value = await getComandas();
    } catch (error) {
        errorMessage.value = "Error al cargar las comandas";
        console.error("Error en el fetch", error);
    }
};

// Función para regresar a la página anterior
const goBack = () => {
    window.history.back();
};
</script>   

<style scoped>
h1 {
    margin: 0;
    color: white; 
}

.error {
    color: red;
    text-align: center;
    margin-top: 20px;
}

.v-card {
    margin: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    background-color: #333;
}

/* Estilo para centrar el contenido de las celdas */
th, td {
    text-align: center; 
    padding: 8px; 
}

/* Mejorar la visibilidad de las columnas */
th {
    background-color: #444; 
    color: white; 
}

td {
    background-color: #555; 
    color: white; 
}

/* Asegura que el ancho de la tabla ocupe todo el espacio disponible */
.v-simple-table {
    width: 100%;
    table-layout: auto; 
}

.v-btn {
    margin: 20px 0; 
    color: white; 
}
</style>
