<template>
    <div>
        <Header />
        <v-container>
            <v-row justify="center">
                <v-col cols="12" sm="8">
                    <h1>Gestió de Productes</h1>
                    <v-btn @click="openAddDialog" color="primary" class="mb-4">
                        Afegir Producte
                    </v-btn>
                    <v-row>
                        <v-col v-for="producto in productos" :key="producto.id" cols="12" sm="4" class="product-column">
                            <v-card class="product-card">
                                <v-card-title>{{ producto.producto }}</v-card-title>
                                <v-card-subtitle>€{{ producto.precio }}</v-card-subtitle>
                                <v-img :src="`http://localhost:3001/imagen/${producto.imagen}`" max-width="200" class="mx-auto"></v-img>
                                <v-card-actions>
                                    <v-btn icon color="blue" @click="openEditDialog(producto)">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    <v-btn icon color="red" @click="removeProducto(producto.id)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>

            <v-dialog v-model="dialog" max-width="500px">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">{{ isEditing ? 'Editar' : 'Afegir' }} Producte</span>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field label="Nom del Producte" v-model="form.producto" required></v-text-field>
                        <v-text-field label="Preu" v-model="form.precio" type="number" required></v-text-field>
                        <input type="file" @change="handleFileUpload" />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="red" text @click="closeDialog">Cancel·lar</v-btn>
                        <v-btn color="green" text @click="submitForm">{{ isEditing ? 'Actualitzar' : 'Afegir' }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getProductos, addProducto, updateProducto, deleteProducto } from "../service/communicationManager";
import Header from '../components/header.vue'; 

const productos = ref([]);
const dialog = ref(false);
const isEditing = ref(false);
const form = ref({ id: null, producto: '', imagen: '', precio: 0 });
const selectedFile = ref(null);

onMounted(async () => {
    await fetchProductos();
});

const fetchProductos = async () => {
    try {
        productos.value = await getProductos();
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

const openAddDialog = () => {
    form.value = { id: null, producto: '', imagen: '', precio: 0 };
    isEditing.value = false;
    dialog.value = true;
};

const openEditDialog = (producto) => {
    form.value.id = producto.id;
    form.value.producto = producto.producto;
    form.value.imagen = producto.imagen;
    form.value.precio = producto.precio;
    isEditing.value = true;
    dialog.value = true;
};

const closeDialog = () => {
    dialog.value = false;
    form.value = { id: null, producto: '', imagen: '', precio: 0 };
    selectedFile.value = null;
};

const handleFileUpload = (event) => {
    selectedFile.value = event.target.files[0];
};

const submitForm = async () => {
    try {
        const formData = new FormData();
        formData.append('producto', form.value.producto);
        formData.append('precio', form.value.precio);
        if (selectedFile.value) {
            formData.append('imagen', selectedFile.value);
        } else {
            formData.append('imagen', form.value.imagen);
        }

        let response;
        if (isEditing.value) {
            response = await updateProducto(form.value.id, formData);
        } else {
            response = await addProducto(formData);
        }

        console.log('Response from server:', response);
        closeDialog();
    } catch (error) {
        console.error("Error submitting the form:", error);
    } finally {
        closeDialog();
        await fetchProductos();
    }
};

const removeProducto = async (id) => {
    try {
        await deleteProducto(id);
    } catch (error) {
        console.error(error);
    }
    await fetchProductos();
};
</script>

