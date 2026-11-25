/* Datos ficticios de la demo. Sin API: siempre funcionan. */
const FLIGHTS = {
  TB1234: { airline:'Aerolíneas Buddy', from:'Madrid (MAD)', to:'París (CDG)', dep:'10:30', arr:'12:35', terminal:'T4', gate:'K62', plane:'Airbus A320-200', status:'En hora', stage:0, country:'Francia', dur:'2 h 05 min', km:'≈ 1.050 km',
    pd:[['Matrícula','EC-TBD (ficticia)'],['Antigüedad','7 años'],['Capacidad','180 pasajeros'],['Motores','2 × CFM56-5B'],['Velocidad de crucero','828 km/h'],['Alcance','6.150 km'],['Longitud','37,6 m'],['Envergadura','35,8 m'],['Asientos','3-3 en una cabina'],['Wi-Fi','Sí'],['Enchufes','USB en cada asiento']] },
  TB2026: { airline:'Buddy Air', from:'Barcelona (BCN)', to:'Lisboa (LIS)', dep:'16:10', arr:'17:05', terminal:'T1', gate:'B14', plane:'Boeing 737-800', status:'Retraso de 10 min', stage:1, country:'Portugal', dur:'1 h 55 min', km:'≈ 1.000 km',
    pd:[['Matrícula','CS-TBX (ficticia)'],['Antigüedad','10 años'],['Capacidad','189 pasajeros'],['Motores','2 × CFM56-7B'],['Velocidad de crucero','842 km/h'],['Alcance','5.436 km'],['Longitud','39,5 m'],['Envergadura','35,8 m'],['Asientos','3-3 en una cabina'],['Wi-Fi','No'],['Enchufes','USB en filas seleccionadas']] }
};
/* Itinerario por destino: [momento, nombre, tipo, duración, consejo] */
const ITIN = {
  Francia: [
    ['Mañana','Torre Eiffel','Sitio','2 h','Reserva la entrada con antelación y ve temprano para evitar colas.'],
    ['Mañana','Paseo por el Champ de Mars y el Trocadéro','Actividad','1 h','La mejor foto de la torre se hace desde la plaza del Trocadéro.'],
    ['Tarde','Museo del Louvre','Sitio','3 h','Compra entrada con hora fija en la web oficial y elige 2 o 3 salas.'],
    ['Tarde','Crucero por el Sena','Actividad','1 h','Al atardecer se ven los puentes con luz dorada.'],
    ['Noche','Cena en Le Marais','Comida','2 h','Reserva mesa en fin de semana; hay opciones para todos los presupuestos.'],
    ['Noche','Montmartre y Sacré-Cœur','Sitio','1,5 h','Desde la escalinata se ve la ciudad iluminada.']],
  Portugal: [
    ['Mañana','Torre de Belém y Monasterio de los Jerónimos','Sitio','2 h','Ve pronto: es la zona más visitada de Lisboa.'],
    ['Mañana','Pastéis de Belém','Comida','30 min','Pídelo recién hecho, con canela y azúcar.'],
    ['Tarde','Alfama y Castelo de São Jorge','Sitio','2,5 h','Lleva calzado cómodo: hay muchas cuestas.'],
    ['Tarde','Paseo en el tranvía 28','Actividad','45 min','Evita las horas punta y vigila tus pertenencias.'],
    ['Noche','Atardecer en el Miradouro da Senhora do Monte','Sitio','1 h','Uno de los mejores miradores de la ciudad.'],
    ['Noche','Cena con fado en Alfama','Actividad','2 h','Reserva con antelación.']]
};
