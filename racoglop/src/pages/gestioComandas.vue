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
                    <v-col class="text-center">Usuario ID</v-col>
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
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.usuario_id }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.estado }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.detalles }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.total }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.fecha_pedido }}</v-col>
                    <v-col class="text-center">
                        <v-btn v-if="comanda.estado !== 'Entregado'" color="primary" @click.stop="changeStatus(comanda)">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                        <v-btn color="error" @click.stop="handleDelete(comanda.id)"><v-icon>mdi-delete</v-icon></v-btn>
                    </v-col>
                </v-row>

                <!-- Mostrar el estado del pedido y la fecha debajo de la comanda seleccionada -->
                <v-row v-if="selectedComanda" class="status-message mt-3" no-gutters>
                    <v-col>
                        <h3>Estado del Pedido (ID: {{ selectedComanda.id }}):</h3>
                        <p>{{ selectedComanda.estado }}</p>
                        <p>Fecha de Pedido: {{ selectedComanda.fecha_pedido }}</p>
                    </v-col>
                </v-row>

                <!-- Mensaje en caso de error -->
                <v-alert v-if="errorMessage" type="error" class="my-2">{{ errorMessage }}</v-alert>
            </v-card>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { getComandas, deleteComanda } from "../service/communicationManager";  
import Header from '../components/header.vue';
import { io } from 'socket.io-client'; // Importar socket.io-client

const comandas = ref([]);
const errorMessage = ref('');
const selectedComanda = ref(null); // Estado para la comanda seleccionada
const orderStatus = ref(''); // Estado para el mensaje del pedido
let socket = null; // Variable para manejar la conexión de socket

// Función para conectar al servidor de Socket.io
const connectSocket = () => {
    socket = io("http://localhost:3001"); // Conectar a tu servidor de Socket.io

    // Escuchar el evento 'nuevaCompra' que será emitido por el servidor
    socket.on('nuevaCompra', (nuevoPedido) => {
        console.log("Nueva compra recibida:", nuevoPedido);
        comandas.value.push(nuevoPedido); // Agregar la nueva comanda a la lista de comandas
    });
};

// Cargar las comandas al montar el componente
onMounted(async () => {
    await fetchComandas();
    connectSocket(); // Establecer la conexión con el servidor Socket.io
});

// Limpiar la conexión al desmontar el componente
onBeforeUnmount(() => {
    if (socket) {
        socket.disconnect(); // Desconectar el socket al desmontar el componente
    }
});

// Función para obtener las comandas desde el servidor
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

const updateComandaStatus = async (comandaId, nuevoEstado) => {
    // Aquí se simula la actualización del estado en el servidor
    let comanda = comandas.value.find(c => c.id === comandaId);
    if (comanda) {
        comanda.estado = nuevoEstado;
    }
    return comanda; // Devuelves la comanda actualizada
};

const changeStatus = async (comanda) => {
    try {
        const estados = ['Recibido', 'En proceso', 'Enviado', 'En reparto', 'Entregado'];
        
        const currentIndex = estados.indexOf(comanda.estado);
        const nextIndex = (currentIndex + 1) % estados.length; // Cálculo cíclico
        const nuevoEstado = estados[nextIndex];

        console.log("Nuevo estado:", nuevoEstado);

        const comandaActualizada = await updateComandaStatus(comanda.id, nuevoEstado);
        console.log("Comanda actualizada:", comandaActualizada);

        if (socket) {
            socket.emit('actualizarEstado', comandaActualizada);
            console.log("Evento 'actualizarEstado' emitido");
        }
    } catch (error) {
        errorMessage.value = 'Error al cambiar el estado de la comanda';
        console.error("Error en changeStatus", error);
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