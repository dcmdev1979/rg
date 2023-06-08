import express from "express";
const app = express();

//CORS
import cors from "cors";

app.use(cors());

//EXCEL JS

import excelJS from "exceljs";

//IMPORTAR CFE RECIBIDOS

import { traerCfeRecibidos } from "./cferecibidos.js";



// ASIGNACION DEL PUERTO
const PUERTO = process.env.PORT || 3000;

const startServer = () => {
  app.listen(PUERTO, () => {
    console.log(`El servidor esta escuchando en el puerto ${PUERTO}...`);
  });
};

startServer();

// Manejo de errores no controlados
process.on('uncaughtException', (err) => {
  console.error('Error no controlado:', err);
  console.log('Reiniciando servidor...');
  startServer();
});

//Routing

app.get("/api/recibidos/:rut/:ci/:clave/:fchini/:fchfin", async (req, res) => {
  const rut = String(req.params.rut);

  const cerosFaltantes = 12 - rut.length;
const rutRellenado = '0'.repeat(cerosFaltantes) + rut;
 
  const ci = req.params.ci;
  const clave = req.params.clave;
  const fchini = req.params.fchini;
  const fchfin = req.params.fchfin;
  const hora = new Date();

  console.log("rut es:" + rut);
  console.log("ci es:" + ci);
  console.log("clave es:" + clave);
  console.log("fchini es:" + fchini);
  console.log("fchfin es:" + fchfin);
  console.log("hora es:" + hora);

  //emisorRecibidos.emit("consulta");

  const resultados = await traerCfeRecibidos(rutRellenado, ci, clave, fchini, fchfin);
  //const resultados = JSON.stringify(result);

  //Tranformar strings en números

  //resultados.forEach(function (resultados) {
    //resultados.IvaTasaBasica = resultados.IvaTasaBasica.replace(".", "");
    //resultados.IvaTasaBasica = Number(
      //resultados.IvaTasaBasica.replace(",", ".")
    //);
  //});

  //console.log(resultados, typeof resultados[1].IvaTasaBasica);

  //enviar respuesta
  console.log("los resultados son:"+JSON.stringify(resultados));
  const data = JSON.stringify(resultados);

  if ((resultados.length = null)) {
    return res.status(404).send(`No se encontraron comprobantes de ${rut} `);
  } else {
    res.setHeader("Content-Type", "application/json");
    return res.send(data);
  }
});

/////////////////////////////////  API PARA EXCEL    //////////////////////////////////////

app.get("/file/recibidos/:rut/:ci/:clave/:fchini/:fchfin", async (req, res) => {
  const rut = req.params.rut;
  const ci = req.params.ci;
  const clave = req.params.clave;
  const fchini = req.params.fchini;
  const fchfin = req.params.fchfin;
  const hora = new Date();

  console.log("rut es:" + rut);
  console.log("ci es:" + ci);
  console.log("clave es:" + clave);
  console.log("fchini es:" + fchini);
  console.log("fchfin es:" + fchfin);
  console.log("hora es:" + hora);

  //emisorRecibidos.emit("consulta");

  const resultados = await traerCfeRecibidos(rut, ci, clave, fchini, fchfin);

  //EXCEL JS

  const workbook = new excelJS.Workbook(); // Create a new workbook
  const worksheet = workbook.addWorksheet("CFE RECIBIDOS"); // New Worksheet
  const path = "./files"; // Path to download excel

  //Crear columnas
  const columns = resultados.reduce(
    (acc, obj) => (acc = Object.getOwnPropertyNames(obj)),
    []
  );

  worksheet.columns = columns.map((el) => {
    return { header: el, key: el, width: 20 };
  });

  // Loop de comprobantes

  //let counter = 1;
  resultados.forEach((resultados) => {
   // resultados.s_no = counter;
  worksheet.addRow(resultados); // agregar datos en worksheet
   // counter++;
  });
  // Poner la primara fila en negrita
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  // Poner todos los digitos para el RUT

 // Establecer el formato de número sin decimales para la columna E
 worksheet.getColumn(4).numFmt = '0';

  workbook.xlsx.writeFile(`${path}/cfe.xlsx`);

  //Respuesta express

  if ((resultados.length = null)) {
    return res.status(404).send(`No se encontraron comprobantes de ${rut} `);
  } else {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=" + "data.xlsx");
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }
});

////////////////////////////////////////////////////////////
