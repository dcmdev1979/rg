import { chromium, selectors } from "playwright";
import excelJS from "exceljs";
import { traerCotizacion } from "./cotizaciones.js";

//PLAYWRIGHT

async function traerCfeRecibidos(rut, cedula, password, fechini, fechfin) {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Extender el tiempo de espera predeterminado a 1 minuto (60,000 ms)
  //page.setDefaultTimeout(120000);

  //await page.goto("https://www.efactura.dgi.gub.uy/principal,IngresoGeneral");
  await page.goto(
    "https://www.efactura.dgi.gub.uy/Produccion/inicio-produccion?es"
  );
  await page.waitForTimeout(1000);

  // LOGIN
  await page.type("#W0019W000900010004W0003W0003vUSER", rut, { delay: 100 });
  await page.click("#W0019W000900010004W0003W0003vUSER2");
  await page.type("#W0019W000900010004W0003W0003vUSER2", cedula);
  await page.click("[type='password']");
  await page.type("[type='password']", password);

  await page.click("[title='Ingresar']");
  await page.setViewportSize({ width: 1011, height: 562 });
  //await page.type("#W0008W000900010001W0003W0003vUSER2", "Yp8m0JmK");
  await page.click("#A130_172000022003");
  await page.waitForTimeout(3000);

  // Generar fechas de la consulta
  console.log("fechini es: " + fechini);

  const aFecha1 = fechini.split("/");
  const aFecha2 = fechfin.split("/");
  const fFecha1 = Date.UTC(aFecha1[2], aFecha1[1] - 1, aFecha1[0]);
  const fFecha2 = Date.UTC(aFecha2[2], aFecha2[1] - 1, aFecha2[0]);
  const dif = fFecha2 - fFecha1;
  const dias = Math.floor(dif / (1000 * 60 * 60 * 24));

  const desde = new Date(fFecha1);
  const hasta = new Date(fFecha2);
  console.log("desde: " + desde);
  console.log("hasta: " + hasta);

  // INICIAR BUCLE DE CONSULTAS POR DIAS

  const data = [];
  let fechaTexto = null;

  try {


  let h = 1;
  while (h <= dias + 1) {
    const fechaIncrementada = desde.setDate(desde.getDate() + 1);
    const fecha = new Date(fechaIncrementada);
    fechaTexto = fecha.toLocaleDateString("en-GB"); //esta es la fecha del día que se ingresa en el bucle
    console.log(fechaTexto);

    //await page.reload();

    //await page.waitForSelector('#gxpea000118000001', { state: 'detached' });
    const fechadesde = page
      .frameLocator("#gxpea000118000001")
      .locator("#CTLFECHADESDE");
    await fechadesde.fill(fechaTexto, { delay: 1000 });
    const fechahasta = page
      .frameLocator("#gxpea000118000001")
      .locator("#CTLFECHAHASTA");
    await fechahasta.fill(fechaTexto, { delay: 1000 });
    // click en el botón consultar
    const consultar = page
      .frameLocator("#gxpea000118000001")
      .locator('[name="BOTONCONSULTAR"]');
    await consultar.click();
    await page.waitForTimeout(3000);

    // TRABAJAR CON CANTIDAD DE PAGINAS
    const paginas = await page
      .frameLocator("#gxpea000118000001")
      .locator("#W0126PAGINADO")
      .textContent();
    console.log("paginas: " + paginas);
    const cantidadPaginas = paginas.substring(12, 13);
    const q = parseInt(cantidadPaginas);
    console.log("paginas: " + q);

    let j = 1;
    while (j <= q) {
      console.log("Página: " + j);

      // TRABAJAR CON LINEAS

      let i = 1;
      const numindice = i;
      let numsufijo = i;
      let lineas = 0;

      // armar texto del documento

      const numprefijo = '[id="span_CTLEFACCFENUMERO_00';
      while (i <= 20) {
        if (i <= 9) {
          numsufijo = "0" + i;
        } else {
          numsufijo = i;
        }

        await page.waitForTimeout(3000);

        lineas = i;

        // traer info de documentos
        const docprefijo = "#vCOLDISPLAY_00";
        const docsufijo = numsufijo;

        const docline = docprefijo + docsufijo;
        const documentos = page
          .frameLocator("#gxpea000118000001")
          .locator(docline);
        const cantidad = await documentos.count();

        if (cantidad == 0) {
          break;
        }

        console.log("docline: " + docline);
        console.log("cantidad: " + cantidad);

        await documentos.click();

        // array documentos

        const fecha = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFEFECHAHORA")
          .textContent();
        const tipoComprobante = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCMPTIPODESCORTA")
          .textContent();
        const moneda = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETIPOMONEDA")
          .textContent();
        const rutEmisor = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACARCHEMISORDOCNRO")
          .textContent();
        const emisor = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_vDENOMINACION")
          .textContent();
        const serie = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFESERIE1")
          .textContent();
        const numeroDoc = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFENUMERO1")
          .textContent();

        const montoNoGravado = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMONTONOGRV")
          .textContent();
        const montoExportAsim = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMNTEXPASI")
          .textContent();
        const montoImpPercibido = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMNTIMPPER")
          .textContent();
        const montoIvaSuspenso = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMNTIVASUSP")
          .textContent();
        const montoRetenido = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMONTORET")
          .textContent();
        const montoCreditoFiscal = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMONTCREDFISC")
          .textContent();
        const montoNoFacturable = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFEMONTONOFACT")
          .textContent();

        const netoIvaTasaBasica = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMNTNETOIVATTB")
          .textContent();
        const netoIvaTasaMinima = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMNTNETOIVATTM")
          .textContent();
        const netoIvaOtraTasa = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALMNTNETOIVATTO")
          .textContent();
        const IvaTasaBasica = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALIVATASABASICA")
          .textContent();
        const IvaTasaMinima = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALIVATASAMIN")
          .textContent();
        const IvaOtraTasa = await page
          .frameLocator("#gxpea000118000001")
          .locator("#span_CTLEFACCFETOTALIVAOTRATASA")
          .textContent();
        //const tipoCambio = await page
        //.frameLocator("#gxpea000118000001")
        //.locator("#span_CTLEFACCFETIPOCAMBIO")
        //.textContent();

        const tcBCU = await traerCotizacion(fechaTexto, moneda);

        const netoIvaTasaBasicaUYU = Number(
          netoIvaTasaBasica.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const netoIvaTasaMinimaUYU = Number(
          netoIvaTasaMinima.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const netoIvaOtraTasaUYU = Number(
          netoIvaOtraTasa.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const IvaTasaBasicaUYU = Number(
          IvaTasaBasica.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const IvaTasaMinimaUYU = Number(
          IvaTasaMinima.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const IvaOtraTasaUYU = Number(
          IvaOtraTasa.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoRetenidoUYU = Number(
          montoRetenido.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoNoFacturableUYU = Number(
          montoNoFacturable.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoNoGravadoUYU = Number(
          montoNoGravado.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoExportAsimUYU = Number(
          montoExportAsim.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoImpPercibidoUYU = Number(
          montoImpPercibido.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoIvaSuspensoUYU = Number(
          montoIvaSuspenso.replace(".", "").replace(",", ".")
        ) * tcBCU;
        const montoCreditoFiscalUYU = Number(
          montoCreditoFiscal.replace(".", "").replace(",", ".")
        ) * tcBCU;

        // volver a la pantalla de documentos
        const volver = page //await no tiene efecto
          .frameLocator("#gxpea000118000001")
          .locator('[name="BOTONVOLVER"]');
        await volver.click();

        data.push({
          fecha,
          tipoComprobante,
          moneda,
          rutEmisor,
          serie,
          numeroDoc,
          emisor,
          netoIvaTasaBasica,
          netoIvaTasaMinima,
          netoIvaOtraTasa,
          IvaTasaBasica,
          IvaTasaMinima,
          IvaOtraTasa,
          montoRetenido,
          montoNoFacturable,
          montoNoGravado,
          montoExportAsim,
          montoImpPercibido,
          montoIvaSuspenso,
          montoCreditoFiscal,
          tcBCU,
          netoIvaTasaBasicaUYU,
          netoIvaTasaMinimaUYU,
          netoIvaOtraTasaUYU,
          IvaTasaBasicaUYU,
          IvaTasaMinimaUYU,
          IvaOtraTasaUYU,
          montoRetenidoUYU,
          montoNoFacturableUYU,
          montoNoGravadoUYU,
          montoExportAsimUYU,
          montoImpPercibidoUYU,
          montoIvaSuspensoUYU,
          montoCreditoFiscalUYU,
        });

        console.log("lineas es igual a: " + lineas);

        // console.log(data);
        i++;
      }

      j++;
    }

    console.log("j es: " + j, "q es: " + q);

    h++;
  }

}
 catch (error) {
  console.error('No se pudieron obtener todos los datos:', error);
  await traerCfeRecibidos(rut, cedula, password, fechaTexto, fechfin);
  console.log(data);
  return data;


}


  // CONVERTIR STRINGS EN NUMERO Y AGREGAR ID

  data.forEach(function (data) {
    data.Id = data.rutEmisor + data.serie + data.numeroDoc;

    data.rutEmisor = data.rutEmisor.replace(".", "");
    data.rutEmisor = Number(data.rutEmisor.replace(",", "."));

    data.numeroDoc = data.numeroDoc.replace(".", "");
    data.numeroDoc = Number(data.numeroDoc.replace(",", "."));

    data.netoIvaTasaBasica = data.netoIvaTasaBasica.replace(".", "");
    data.netoIvaTasaBasica = Number(data.netoIvaTasaBasica.replace(",", "."));

    data.netoIvaTasaMinima = data.netoIvaTasaMinima.replace(".", "");
    data.netoIvaTasaMinima = Number(data.netoIvaTasaMinima.replace(",", "."));

    data.netoIvaOtraTasa = data.netoIvaOtraTasa.replace(".", "");
    data.netoIvaOtraTasa = Number(data.netoIvaOtraTasa.replace(",", "."));

    data.IvaTasaBasica = data.IvaTasaBasica.replace(".", "");
    data.IvaTasaBasica = Number(data.IvaTasaBasica.replace(",", "."));

    data.IvaTasaMinima = data.IvaTasaMinima.replace(".", "");
    data.IvaTasaMinima = Number(data.IvaTasaMinima.replace(",", "."));

    data.IvaOtraTasa = data.IvaOtraTasa.replace(".", "");
    data.IvaOtraTasa = Number(data.IvaOtraTasa.replace(",", "."));

    data.montoRetenido = data.montoRetenido.replace(".", "");
    data.montoRetenido = Number(data.montoRetenido.replace(",", "."));

    data.montoNoFacturable = data.montoNoFacturable.replace(".", "");
    data.montoNoFacturable = Number(data.montoNoFacturable.replace(",", "."));

    data.montoNoGravado = data.montoNoGravado.replace(".", "");
    data.montoNoGravado = Number(data.montoNoGravado.replace(",", "."));

    data.montoExportAsim = data.montoExportAsim.replace(".", "");
    data.montoExportAsim = Number(data.montoExportAsim.replace(",", "."));

    data.montoImpPercibido = data.montoImpPercibido.replace(".", "");
    data.montoImpPercibido = Number(data.montoImpPercibido.replace(",", "."));

    data.montoIvaSuspenso = data.montoIvaSuspenso.replace(".", "");
    data.montoIvaSuspenso = Number(data.montoIvaSuspenso.replace(",", "."));

    data.montoCreditoFiscal = data.montoCreditoFiscal.replace(".", "");
    data.montoCreditoFiscal = Number(data.montoCreditoFiscal.replace(",", "."));

    //formateo fecha
    const parts = data.fecha.substring(0, 10).split("/");
    data.fecha = new Date(
      Number(parts[2]),
      Number(parts[1]) - 1,
      Number(parts[0])
    );
  });


  //console.log(netoIvaTasaBasicaUYU);

  //console.log(data, typeof data[1].fecha);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////

  //EXCEL JS esto se tiene que ir porque no me sirve de nada guardar el documento aca

  const workbook = new excelJS.Workbook(); // Create a new workbook
  const worksheet = workbook.addWorksheet("My Users"); // New Worksheet
  const path = "./files"; // Path to download excel
  // Column for data in excel. key must match data key
  worksheet.columns = [
    // { header: "S no.", key: "s_no", width: 10 },
    {
      header: "fecha",
      key: "fecha",
      width: 10,
      style: { numFmt: "dd/mm/yyyy" },
    },
    { header: "tipoComprobante", key: "tipoComprobante", width: 10 },
  ];

  //Loping para cambiar caracteres

  // Looping en la data para agregar campo
  let counter = 1;
  data.forEach((data) => {
    // data.s_no = counter;
    worksheet.addRow(data); // Add data in worksheet
    //counter++;
  });
  // Making first line in excel bold
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  workbook.xlsx.writeFile(`${path}/cfe.xlsx`);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  console.log(data);
  await browser.close();
  //return JSON.stringify(data);
  return data;
}

export { traerCfeRecibidos };
