import db from "./firebase.js";

async function traerCotizacion(fecha, moneda) {
  // Convertir fecha para que quede como el Id de la cotizacion en Firestore
  const partesFecha = fecha.split("/");
  const cotizacionId =
    partesFecha[2] + "-" + partesFecha[1] + "-" + partesFecha[0];

 //datos la colección en firestore   

  const cotizacion = db.collection("cotizaciones").doc(cotizacionId);
  const doc = await cotizacion.get();

// conectarse si la moneda es distinta a UYU

  if (moneda === "UYU") {
    return 1;
  } else if (!doc.exists) {
    console.log("No such document!");
  } else if (moneda === "USD") {
    const data = doc.data();
    return data.usd;
  } else {
    return "no hay tip de cambio para esta moneda";
  }
}
export { traerCotizacion };

//const prueba = await traerCotizacion("01/12/2022", "are");

//console.log("el valor es:"+ prueba);
