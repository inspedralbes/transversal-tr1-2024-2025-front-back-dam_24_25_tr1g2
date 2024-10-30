<template>
    <div>
        <Header />

        <v-container>
            <v-card>
                <v-card-title>
                    <h1 class="text-center">Gestión de Comandas</h1>
                </v-card-title>

                <div class="comanda-container">
                    <div class="comanda-header">
                        <div class="comanda-item">Pedido ID</div>
                        <div class="comanda-item">Usuario ID</div>
                        <div class="comanda-item">Detalles</div>
                        <div class="comanda-item">Total (€)</div>
                        <div class="comanda-item">Fecha Pedido</div>
                        <div class="comanda-item">Acciones</div>
                    </div>

                    <!-- Mostrar todas las comandas si no hay ninguna seleccionada -->
                    <div v-for="comanda in comandas" :key="comanda.id" v-show="!selectedComanda || selectedComanda.id === comanda.id" class="comanda-row" @click="selectComanda(comanda)">
                        <div class="comanda-item">{{ comanda.id }}</div>
                        <div class="comanda-item">{{ comanda.usuario_id }}</div>
                        <div class="comanda-item">{{ comanda.estado }}</div>
                        <div class="comanda-item">{{ comanda.detalles }}</div>
                        <div class="comanda-item">{{ comanda.total }}</div>
                        <div class="comanda-item">{{ comanda.fecha_pedido }}</div>
                        <div class="comanda-item">
                            <button @click.stop="handleDelete(comanda.id)">Eliminar</button>
                        </div>
                    </div>  

                    <!-- Mostrar el estado del pedido y la fecha debajo de la comanda seleccionada -->
                    <div v-if="selectedComanda" class="status-message">
                        <h3>Estado del Pedido (ID: {{ selectedComanda.id }}):</h3>
                        <p>{{ orderStatus }}</p>
                        <p>Fecha de Pedido: {{ selectedComanda.fecha_pedido }}</p>
                    </div>
                </div>

                <!-- Mensaje en caso de error -->
                <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            </v-card>
        </v-container>
    </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { getComandas, deleteComanda } from "../service/communicationManager";  
import Header from '../components/header.vue'; 

const comandas = ref([]);
const errorMessage = ref('');
const selectedComanda = ref(null); // Estado para la comanda seleccionada
const orderStatus = ref(''); // Estado para el mensaje del pedido

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

// Método para manejar la selección de una comanda
const selectComanda = (comanda) => {
    selectedComanda.value = selectedComanda.value?.id === comanda.id ? null : comanda;
    orderStatus.value = "Enviado"; // Cambiar según la lógica deseada
};

// Método para eliminar una comanda
const handleDelete = async (id) => {
    try {
        const response = await deleteComanda(id);
        if (response.error) {
            errorMessage.value = response.error;
        } else {
            comandas.value = comandas.value.filter((comanda) => comanda.id !== id);
        }
    } catch (error) {
        errorMessage.value = 'Error al eliminar la comanda';
        console.error("Error en el delete", error);
    }
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

/* Estilos para contenedores y filas */
.comanda-container {
    display: flex;
    flex-direction: column;
    margin: 20px 0;
}

.comanda-header, .comanda-row {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    cursor: pointer;
}

.comanda-header {
    background-color: #444;
    color: white;
    font-weight: bold;
}

.comanda-row {
    background-color: #555;
    color: white;
    margin: 5px 0;
}

.comanda-item {
    flex: 1;
    text-align: center;
}

/* Estilo para el estado del pedido */
.status-message {
    margin-top: 20px;
    color: white;
    text-align: center;
    background-color: #444; 
    padding: 10px;
    border-radius: 5px;
}


button {
    background-color: #e74c3c; /* Color rojo */
    color: white;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    border-radius: 3px;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #c0392b; /* Rojo más oscuro en hover */
}

button:active {
    background-color: #a93226; /* Rojo aún más oscuro cuando se presiona */
}

</style>
