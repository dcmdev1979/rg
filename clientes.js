import db from "./firebase.js";
import { traerCfeRecibidos } from "./cferecibidos.js";

// Referencia a la colección "users"
const usersCollection = db.collection('users');

// Función auxiliar para procesar clientes en secuencia
async function procesarClientes(clientes, fechaini, fechafin) {
  for (const cliente of clientes) {
    const { rut, cedulaIdentidadEfactura, claveEfactura } = cliente;

    // Convertir los valores numéricos en cadenas de texto
    const rutStr = rut.toString();
    const cedulaIdentidadEfacturaStr = cedulaIdentidadEfactura.toString();
    const claveEfacturaStr = claveEfactura.toString();
    const fechainiStr = fechaini.toString();
    const fechafinStr = fechafin.toString();

    try {
      // Ejecutar la función "traerCfeRecibidos" para el cliente actual
      const data = await traerCfeRecibidos(rutStr, cedulaIdentidadEfacturaStr, claveEfacturaStr, fechainiStr, fechafinStr);
      console.log('Data para el cliente:', data);

      // Obtener referencia a la colección "clientes" del usuario actual
      const clientesCollection = db.collection('users').doc(cliente.userId).collection('clientes');

      // Verificar si la colección "cfeRecibidos" existe para el cliente actual
      const cfeRecibidosCollection = clientesCollection.doc(cliente.id).collection('cfeRecibidos');

      // Verificar si los documentos ya existen en la colección "cfeRecibidos"
      for (const documento of data) {
        const documentoId = documento.Id;

        const documentoRef = cfeRecibidosCollection.doc(documentoId);
        const documentoSnapshot = await documentoRef.get();

        if (!documentoSnapshot.exists) {
          // El documento no existe, agregarlo a la colección
          await documentoRef.set(documento);
          console.log(`Documento agregado: ${documentoId}`);
        } else {
          console.log(`Documento existente: ${documentoId}`);
        }
      }
    } catch (error) {
      // Manejar cualquier error ocurrido durante la ejecución
      console.error('Error al procesar el cliente:', error);
    }
  }
}

// Constantes para fechaini y fechafin (reemplaza los valores por los tuyos)
const fechaini = "02/01/2023";
const fechafin = "02/01/2023";

// Consultar los clientes activos de cada usuario y procesarlos en secuencia
usersCollection.get()
  .then(async (snapshot) => {
    for (const userDoc of snapshot.docs) {
      try {
        const clientesCollection = db.collection('users').doc(userDoc.id).collection('clientes');
        const query = clientesCollection.where('status', '==', 'Activo');
        const clientesSnapshot = await query.get();
        const clientes = clientesSnapshot.docs.map((doc) => {
          return {
            id: doc.id,
            userId: userDoc.id,
            ...doc.data()
          };
        });

        await procesarClientes(clientes, fechaini, fechafin);
      } catch (error) {
        console.error('Error al obtener los clientes:', error);
      }
    }
    console.log('Procesamiento de clientes completado');
  })
  .catch((error) => {
    console.error('Error al obtener los usuarios:', error);
  });
