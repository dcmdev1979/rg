//IMPORTAR VARIABLES DE ENTORNO

import dotenv from "dotenv";
dotenv.config();

//CONECTARSE A FIRESTORE

import admin from 'firebase-admin';
import { initializeApp, applicationDefault } from 'firebase-admin/app';



initializeApp({
  credential: applicationDefault(),
  projectId: 'tributapp-rg',
});

if (!admin.firestore) {
    console.log('El cliente de Firebase no se inicializó correctamente.');
  } else {
    console.log('El cliente de Firebase se ha inicializado correctamente.');
  }
  

const db = admin.firestore();

export default db;
