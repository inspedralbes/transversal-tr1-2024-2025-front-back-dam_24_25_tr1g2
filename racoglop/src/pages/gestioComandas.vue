<template>
    <div>
        <Header />

        <v-container>
            <v-card class="my-4" elevation="3">
                <v-card-title class="d-flex justify-space-between align-center">
                    <h1>Gestió de Comandes</h1>
                    
                    <!-- Botón de filtro alineado a la derecha -->
                    <v-select
                        v-model="filtroEstado"
                        :items="['Tots', 'Rebut', 'En proces', 'Enviat', 'En repartiment', 'Entregat']"
                        label="Filtrar per Estat"
                        @change="aplicarFiltro"
                        class="ml-4"
                        style="max-width: 200px;"
                    ></v-select>
                </v-card-title>

                <v-divider></v-divider>

                <!-- Encabezados de columnas -->
                <v-row class="text-center font-weight-bold py-2" align="center" no-gutters>
                    <v-col class="text-center">ID Comanda</v-col>
                    <v-col class="text-center">Usuari</v-col>
                    <v-col class="text-center">Estat</v-col>
                    <v-col class="text-center">Detalls</v-col>
                    <v-col class="text-center">Total (€)</v-col>
                    <v-col class="text-center">Data comanda</v-col>
                    <v-col class="text-center">Accions</v-col>
                </v-row>

                <v-divider></v-divider>

                <!-- Mostrar todas las comandas o aplicar filtro -->
                <v-row v-for="comanda in comandasFiltradas" :key="comanda.id" class="comanda-row" no-gutters>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.id }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ users[comanda.usuario_id]?.nombre || 'Usuari desconegut' }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.estado }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.detalles }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.total }}</v-col>
                    <v-col class="text-center py-2" @click="selectComanda(comanda)">{{ comanda.fecha_pedido }}</v-col>
                    <v-col class="text-center">
                        <v-btn v-if="comanda.estado !== 'Entregat'" color="primary" @click.stop="changeStatus(comanda)">
                            <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                        <v-btn color="error" @click.stop="handleDelete(comanda.id)">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <!-- Mostrar el estado del pedido y la fecha debajo de la comanda seleccionada -->
                <v-row v-if="selectedComanda" class="status-message mt-3" no-gutters>
                    <v-col>
                        <h3>Estado del Pedido (ID: {{ selectedComanda.id }}):</h3>
                        <p>{{ selectedComanda.estado }}</p>
                        <p>Fecha de Pedido: {{ selectedComanda.fecha_pedido }}</p>
                        <p>Dirección del Usuario: {{ users[selectedComanda.usuario_id]?.direccion || 'Dirección desconocida' }}</p>
                    </v-col>
                </v-row>
            </v-card>
        </v-container>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getComandas, deleteComanda, getUsuarios } from "../service/communicationManager";
import Header from '../components/header.vue';
import { io } from 'socket.io-client';

const comandas = ref([]);
const errorMessage = ref('');
const selectedComanda = ref(null);
const filtroEstado = ref('Tots'); // Estado para el filtro de estado
let socket = null;

const connectSocket = () => {
    socket = io("http://localhost:3001");

    socket.on('nuevaCompra', (nuevoPedido) => {
        console.log("Nueva compra recibida:", nuevoPedido);
        comandas.value.push(nuevoPedido);
    });
};

const users = ref({});

onMounted(async () => {
    await fetchComandas();
    await fetchUsuarios();
    connectSocket();
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

onBeforeUnmount(() => {
    if (socket) {
        socket.disconnect();
    }
});

const fetchComandas = async () => {
    try {
        comandas.value = await getComandas();
    } catch (error) {
        errorMessage.value = "Error al cargar las comandas";
        console.error("Error en el fetch", error);
    }
};

const selectComanda = (comanda) => {
    selectedComanda.value = selectedComanda.value?.id === comanda.id ? null : comanda;
};

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
    let comanda = comandas.value.find(c => c.id === comandaId);
    if (comanda) {
        comanda.estado = nuevoEstado;
    }
    return comanda;
};

const changeStatus = async (comanda) => {
    try {
        const estados = ['Rebut', 'En proces', 'Enviat', 'En repartiment', 'Entregat'];
        
        const currentIndex = estados.indexOf(comanda.estado);
        const nextIndex = (currentIndex + 1) % estados.length;
        const nuevoEstado = estados[nextIndex];

        const comandaActualizada = await updateComandaStatus(comanda.id, nuevoEstado);

        if (socket) {
            socket.emit('actualizarEstado', comandaActualizada);
        }
    } catch (error) {
        errorMessage.value = 'Error al cambiar el estado de la comanda';
        console.error("Error en changeStatus", error);
    }
};

// Computed para aplicar el filtro
const comandasFiltradas = computed(() => {
    return filtroEstado.value === 'Tots'
        ? comandas.value
        : comandas.value.filter(comanda => comanda.estado === filtroEstado.value);
});
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

.comanda-row {
    background-color: #555;
    color: white;
    margin: 5px 0;
    cursor: pointer;
}

.status-message {
    margin-top: 20px;
    color: white;
    text-align: center;
    background-color: #444;
    padding: 10px;
    border-radius: 5px;
}
</style>