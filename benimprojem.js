const enCokGolAtanTakim = (data) => {
  const depo = {};

  data.forEach((mac) => {
    const EvSahibi = mac ["Home Team Name"];
    const KonukTakım = mac["Away Team Name"]; 

    if(depo[EvSahibi] === undefined) {
        depo[EvSahibi] = mac["Home Team Goals"];
    }else{
         depo[EvSahibi] += mac["Home Team Goals"];
    }
     if(depo[KonukTakım] === undefined){
         depo[KonukTakım] = mac["Away Team Goals"];
     }else{
        depo[KonukTakım] += mac["Away Team Goals"];
     }
  }); 

      let maxGol = 0;
      let lider = ""; 

      for (let takim in depo) {
        if (depo[takim] > maxGol) {
          maxGol = depo[takim];
          lider = takim;
        }
      }
        return `En çok gol atan takım: ${lider} - ${maxGol} gol`;
        
};

// Örnek veri ve çalıştırma
const sampleMatches = [
  {"Home Team Name": "Galatasaray", "Away Team Name": "Fenerbahçe", "Home Team Goals": 2, "Away Team Goals": 1},
  {"Home Team Name": "Beşiktaş", "Away Team Name": "Galatasaray", "Home Team Goals": 0, "Away Team Goals": 3},
  {"Home Team Name": "Fenerbahçe", "Away Team Name": "Beşiktaş", "Home Team Goals": 4, "Away Team Goals": 2},
  {"Home Team Name": "Trabzonspor", "Away Team Name": "Galatasaray", "Home Team Goals": 1, "Away Team Goals": 2}
];

console.log(enCokGolAtanTakim(sampleMatches));