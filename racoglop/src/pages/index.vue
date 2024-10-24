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
export default {
  data() {
    return {
      productos: [
        {
          id: 1,
          nombre: "Guiness",
          volumen: "500ml",
          tipo: "Alcohol",
          descripcion: "Cerveza artesanal",
          imagen: "https://sgfm.elcorteingles.es/SGFM/dctm/MEDIA03/201910/04/00118607900463____2__325x325.jpg"
        },
        {
          id: 2,
          nombre: "Duquesa de la Victoria Crianza",
          volumen: "750ml",
          tipo: "Alcohol",
          descripcion: "Vino tinto de Rioja",
          imagen: "https://www.bodegasvaldelana.com/wp-content/uploads/2017/11/duquesa-victoria-crianza-1.jpg"
        },
        {
          id: 3,
          nombre: "Blue Label ",
          volumen: "1L",
          tipo: "Alcohol",
          descripcion: "Whisky",
          imagen: "https://www.vinosbaco.com/wp-content/uploads/2024/03/60199_JohnnieWalkerBlueLabelXordinaire1L-1-scaled.jpg"
        },
        {
          id: 4,
          nombre: "Absolut Vodka",
          volumen: "1L",
          tipo: "Alcohol",
          descripcion: "Vodka sueco",
          imagen: "https://www.yopongoelhielo.com/blog/wp-content/uploads/2020/10/xabsolut.jpg.pagespeed.ic.8EUyAqjgHR.jpg"
        },
        {
          id: 5,
          nombre: "Negrita",
          volumen: "700ml",
          tipo: "Alcohol",
          descripcion: "Ron de Martinica",
          imagen: "https://www.lavinateria.net/18715-medium_default/negrita.jpg"
        },
        {
          id: 6,
          nombre: "Tequila Don Julio",
          volumen: "750ml",
          tipo: "Alcohol",
          descripcion: "Tequila mexicano",
          imagen: "https://www.smartbites.net/Files/109575/Img/25/don-julio-reposado.jpg"
        },
        {
          id: 7,
          nombre: "MOET CHANDON ",
          volumen: "750ml",
          tipo: "Alcohol",
          descripcion: "Champán francés",
          imagen: "https://www.supereko.net/media/catalog/product/cache/1/image/1000x1231/9df78eab33525d08d6e5fb8d27136e95/0/3/03185370000335_a1n1.jpg"
        },
        {
          id: 8,
          nombre: "Beefeater",
          volumen: "1L",
          tipo: "Alcohol",
          descripcion: "Ginebra inglesa",
          imagen: "https://www.supermercadoseljamon.com/documents/10180/892067/29003020_G.jpg"
        },
        {
          id: 9,
          nombre: "Veterano",
          volumen: "700ml",
          tipo: "Alcohol",
          descripcion: "Brandy español",
          imagen: "https://vinopremier.com/media/catalog/product/cache/070e1948fa79794c1092c01c58a07334/1/5/1551321071.jpeg"
        },
        {
          id: 10,
          nombre: "Gusano Rojo",
          volumen: "750ml",
          tipo: "Alcohol",
          descripcion: "Mezcal",
          imagen: "https://bodegasreyesmagos.es/8331-large_default/mezcal-gusano-rojo.jpg"
        }
      ]
    }
  }
}
</script>
