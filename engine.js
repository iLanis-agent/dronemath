/* DroneMath engine - honest drone flight math. */
(function (root) {
  "use strict";

  /* Real flight minutes: marketing times assume zero wind, perfect hover
     and a new battery. Take 75%, then wind and age penalties. */
  function flightMinutes(opts) {
    var advertised = opts && typeof opts.advertisedMin === "number" ? opts.advertisedMin : 30;
    var windMph = opts && typeof opts.windMph === "number" ? opts.windMph : 0;
    var batteryCycles = opts && typeof opts.batteryCycles === "number" ? opts.batteryCycles : 0;
    var t = advertised * 0.75;
    if (windMph > 10) t *= Math.max(0.6, 1 - (windMph - 10) * 0.02);
    t *= Math.max(0.7, 1 - batteryCycles * 0.0008); /* ~8% loss per 100 cycles */
    return Math.round(t * 10) / 10;
  }

  /* Honest one-way range (miles): cruise speed times real time, keeping
     40% of the battery for the return and reserve. */
  function rangeMiles(opts) {
    var speedMph = opts && typeof opts.speedMph === "number" ? opts.speedMph : 30;
    var t = flightMinutes(opts);
    return Math.round(speedMph * (t / 60) * 0.4 * 100) / 100;
  }

  /* Max safe wind: fight the wind home at no more than 2/3 top speed. */
  function windLimitMph(topSpeedMph) {
    return Math.round(topSpeedMph * 2 / 3);
  }

  function windVerdict(windMph, topSpeedMph) {
    var lim = windLimitMph(topSpeedMph);
    if (windMph > lim) return "no-fly - the drone cannot fight this home";
    if (windMph > lim * 0.7) return "marginal - land if gusts build";
    return "flyable - within the 2/3 rule";
  }

  /* Watt-hours burned per minute of real flight. */
  function whPerMin(batteryWh, realMin) {
    if (realMin <= 0) return Infinity;
    return Math.round((batteryWh / realMin) * 100) / 100;
  }

  /* Charge time: battery Wh over charger watts, plus 15% losses, and
     the CV taper adds 20% to the last stretch. */
  function chargeHours(batteryWh, chargerW) {
    if (chargerW <= 0) return Infinity;
    return Math.round((batteryWh / chargerW) * 1.15 * 1.2 * 100) / 100;
  }

  /* Cost per flight hour: pack price over rated cycles, spread across
     real (not advertised) minutes. */
  function costPerFlightHour(opts) {
    var price = opts && typeof opts.packPrice === "number" ? opts.packPrice : 159;
    var cycles = opts && typeof opts.ratedCycles === "number" ? opts.ratedCycles : 200;
    var t = flightMinutes(opts);
    if (t <= 0) return Infinity;
    return Math.round((price / cycles) / (t / 60) * 100) / 100;
  }

  /* Ground sample distance (cm/px) for mapping:
     GSD = altitude(m) * sensorWidth(mm) / (focal(mm) * imageWidth(px)) * 100 */
  function gsdCm(opts) {
    var altM = opts && typeof opts.altM === "number" ? opts.altM : 100;
    var sensorMm = opts && typeof opts.sensorMm === "number" ? opts.sensorMm : 13.2;
    var focalMm = opts && typeof opts.focalMm === "number" ? opts.focalMm : 8.8;
    var imgPx = opts && typeof opts.imgPx === "number" ? opts.imgPx : 5280;
    if (focalMm <= 0 || imgPx <= 0) return 0;
    return Math.round((altM * sensorMm / (focalMm * imgPx)) * 100 * 100) / 100;
  }

  /* Footprint width on the ground (m) at a given altitude. */
  function footprintM(altM, sensorMm, focalMm) {
    if (focalMm <= 0) return 0;
    return Math.round((altM * sensorMm / focalMm) * 10) / 10;
  }

  /* Photos to map an area with side/front overlap. Square footprint
     approximation, spacing = footprint * (1 - overlap). */
  function mappingPhotos(opts) {
    var areaAcres = opts && typeof opts.areaAcres === "number" ? opts.areaAcres : 40;
    var altM = opts && typeof opts.altM === "number" ? opts.altM : 100;
    var sensorMm = opts && typeof opts.sensorMm === "number" ? opts.sensorMm : 13.2;
    var focalMm = opts && typeof opts.focalMm === "number" ? opts.focalMm : 8.8;
    var overlap = opts && typeof opts.overlap === "number" ? opts.overlap : 0.75;
    var fp = footprintM(altM, sensorMm, focalMm);
    if (fp <= 0 || overlap >= 1) return Infinity;
    var spacing = fp * (1 - overlap);
    var areaM2 = areaAcres * 4046.86;
    var perRow = Math.ceil(Math.sqrt(areaM2) / spacing) + 1;
    return perRow * perRow;
  }

  /* Legal ceiling reminder (US): 400 ft AGL = 122 m. */
  function legalAltM(requestedM) {
    return Math.min(requestedM, 122);
  }

  var api = {
    flightMinutes: flightMinutes,
    rangeMiles: rangeMiles,
    windLimitMph: windLimitMph,
    windVerdict: windVerdict,
    whPerMin: whPerMin,
    chargeHours: chargeHours,
    costPerFlightHour: costPerFlightHour,
    gsdCm: gsdCm,
    footprintM: footprintM,
    mappingPhotos: mappingPhotos,
    legalAltM: legalAltM
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.DroneMath = api;
})(typeof window !== "undefined" ? window : globalThis);
