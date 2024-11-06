<template>
    <div>
        <Header />

        <v-container>
            <v-card class="my-4" elevation="3">
                <v-card-title class="justify-center">
                    <h1>Gestión de Comandas</h1>
                </v-card-title>

                <v-divider></v-divider>

                <v-row class="text-center font-weight-bold py-2" align="center" no-gutters>
                    <v-col class="text-center">Pedido ID</v-col>
                    <v-col class="text-center">Usuario</v-col>
                    <v-col class="text-center">Estado</v-col>
                    <v-col class="text-center">Detalles</v-col>
                    <v-col class="text-center">Total (€)</v-col>
                    <v-col class="text-center">Fecha Pedido</v-col>
                    <v-col class="text-center">Acciones</v-col>
                </v-row>

                <v-divider></v-divider>

                <!-- Mostrar todas las comandas si no hay ninguna seleccionada -->
                <v-row v-for="comanda in comandas" :key="comanda.id" class="comanda-row" no-gutters>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.id }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ users[comanda.usuario_id]?.nombre || 'Usuario desconocido' }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.estado }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.detalles }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.total }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.fecha_pedido }}</v-col>
                    <v-col class="text-center">
                        <v-btn color="error" @click.stop="handleDelete(comanda.id)"><v-icon>mdi-delete</v-icon></v-btn>
                    </v-col>
                </v-row>

                <!-- Mostrar el estado del pedido y la fecha debajo de la comanda seleccionada -->
                <v-row v-if="selectedComanda" class="status-message mt-3" no-gutters>
                    <v-col>
                        <h3>Estado del Pedido (ID: {{ selectedComanda.id }}):</h3>
                        <p>{{ orderStatus }}</p>
                        <p>Fecha de Pedido: {{ selectedComanda.fecha_pedido }}</p>
                        <p>Dirección del Usuario : {{ users[selectedComanda.usuario_id]?.direccion || 'Dirección desconocida' }}</p>
                    </v-col>
                </v-row>
            </v-card>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getComandas, deleteComanda, getUsuarios } from "../service/communicationManager";  
import Header from '../components/header.vue'; 

const comandas = ref([]);
const errorMessage = ref('');
const selectedComanda = ref(null); // Estado para la comanda seleccionada
const orderStatus = ref(''); // Estado para el mensaje del pedido
const users = ref({});

onMounted(async () => {
    await fetchComandas();
    await fetchUsuarios();
});

const fetchUsuarios = async () => {
    try {
        const userData = await getUsuarios();
        users.value = userData.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    } catch (error) {
        errorMessage.value = "Error al cargar los usuarios";
        console.error("Error en el fetch", error);
    }
};

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

.v-card {
    margin: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    background-color: #333;
}

/* Estilos para contenedores y filas */
.comanda-row {
    background-color: #555;
    color: white;
    margin: 5px 0;
    cursor: pointer;
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
</style>