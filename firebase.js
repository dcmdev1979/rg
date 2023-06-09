import dotenv from "dotenv";
import admin from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';

dotenv.config();

const firebaseConfig = {
  projectId: 'tributapp-rg',
};

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  firebaseConfig.credential = admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  firebaseConfig.credential = admin.credential.applicationDefault();
}

initializeApp(firebaseConfig);

const db = admin.firestore();

export default db;




// //IMPORTAR VARIABLES DE ENTORNO

// import dotenv from "dotenv";
// dotenv.config();

// //CONECTARSE A FIRESTORE

// import admin from 'firebase-admin';
// import { initializeApp, applicationDefault } from 'firebase-admin/app';



// initializeApp({
//   credential: applicationDefault(),
//   projectId: 'tributapp-rg',
// });

// if (!admin.firestore) {
//     console.log('El cliente de Firebase no se inicializó correctamente.');
//   } else {
//     console.log('El cliente de Firebase se ha inicializado correctamente.');
//   }
  

// const db = admin.firestore();

// export default db;
