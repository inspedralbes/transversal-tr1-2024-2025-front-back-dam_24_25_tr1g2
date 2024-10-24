<template>
  <v-container>
    <v-row>
      <v-col
        v-for="producto in productos"
        :key="producto.id"
        cols="12"
        md="4"
      >
        <v-card>
          <v-img
            :src="producto.imagen"
            alt="Imagen de producto"
            height="200px"
          ></v-img>
          <v-card-title>{{ producto.nombre }}</v-card-title>
          <v-card-subtitle>{{ producto.volumen }} - {{ producto.tipo }}</v-card-subtitle>
          <v-card-text>
            {{ producto.descripcion }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import { getProducto } from '../src/Service/ComunicationManager'


onMounted(async () => {
  productos.value = await getProducto();
});

export default {


}
</script>


