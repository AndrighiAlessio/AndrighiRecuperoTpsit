const express = require('express');
const fs = require('fs');
const bodyparser = require('body-parser');
const service = express();
const porta = 3000;
const data = JSON.parse(fs.readFileSync('vehi.json', 'utf-8'));
service.use(express.static('./public'));


service.get('/', (request, response) => {
    response.sendFile('/index.html', {root: __dirname});
})


service.get('/costruttori', (request, response) => {
    const costruttori = [...new Set(data.map(car => car.costruttore))]
    response.json(costruttori);
})


service.get('/modelli/:costruttore', (request, response) => {
    const costruttore = request.params.costruttore.toLowerCase();
    const modelli = data.filter(item => item.costruttore === costruttore).map(item => item.modello);
    response.json(modelli);
})


service.get('/numModelliPerCostruttore', (request, response) => {
    const numModelliPerCostruttore = {};

    data.forEach(auto => {
        const costruttore = auto.costruttore;
        const modello = auto.modello;

        if (!numModelliPerCostruttore[costruttore]) {
            numModelliPerCostruttore[costruttore] = [modello];
        } else if (!numModelliPerCostruttore[costruttore].includes(modello)) {
            numModelliPerCostruttore[costruttore].push(modello);
        }
    });

    const result = Object.keys(numModelliPerCostruttore).map(costruttore => ({
        costruttore: costruttore,
        numeroModelli: numModelliPerCostruttore[costruttore].length
    }));
    response.json(result);
});



service.get('/schedaAuto/:id', (request, response) => {
    const autoId = parseInt(request.params.id);
    const schedaAuto = data.find(auto => auto.id === autoId);

    if (schedaAuto) {
        response.json(schedaAuto);
    } else {
        response.status(404).json({ error: 'Auto non trovata' });
    }
});


service.get('/dieselConMenoDiKm/:maxKm', (request, response) => {
    const maxKm = parseInt(request.params.maxKm);
    const dieselAuto = data.filter(auto => auto.fuel.toLowerCase() === 'diesel' && auto.km < maxKm);
    response.json(dieselAuto);
});


service.get('/suv8CilindriPerCostruttore/:costruttore', (request, response) => {
    const costruttore = request.params.costruttore.toLowerCase();
    const suv8CilindriAuto = data.filter(auto => 
        auto.tipo.toLowerCase() === 'suv' && 
        auto.cilindri === 8 &&
        auto.costruttore.toLowerCase() === costruttore
    );
    response.json(suv8CilindriAuto);
});


service.get('/modelliPerAnnoEKm/:anno/:maxKm', (request, response) => {
    const anno = parseInt(request.params.anno);
    const maxKm = parseInt(request.params.maxKm);
    const modelliPerAnnoEKm = data.filter(auto => 
        auto.anno === anno &&
        auto.km < maxKm &&
        auto.fuel.toLowerCase() === 'gas'
    );
    response.json(modelliPerAnnoEKm);
});


service.put('/applicaSconto/:minKm', (request, response) => {
    const minKm = parseInt(request.params.minKm);
    const autoDaScontare = data.filter(auto => auto.km > minKm);

    autoDaScontare.forEach(auto => {
        auto.prezzo *= 0.9; //moltiplicare per 0.9 fa lo sconto del 10%
    });
    response.json({ message: 'Sconto applicato', autoScontate: autoDaScontare });
});


service.delete('/eliminaAutoVecchie/:maxKm/:anni', (request, response) => {
    const maxKm = parseInt(request.params.maxKm);
    const anni = parseInt(request.params.anni);
    
    const autoDaEliminare = data.filter(auto => auto.km > maxKm && (new Date().getFullYear() - auto.anno) > anni);

    autoDaEliminare.forEach(auto => {
        const index = data.indexOf(auto);
        data.splice(index, 1);
    });
    response.json({ message: 'Auto eliminate con successo', autoEliminate: autoDaEliminare });
});


service.post('/nuovaAuto', (request, response) => {
    const nuovaAuto = request.body;
    data.push(nuovaAuto);
    response.json(data);
});


service.get('/modelliPerPrezzo/:minPrezzo/:maxPrezzo', (request, response) => {
    const minPrezzo = parseInt(request.params.minPrezzo);
    const maxPrezzo = parseInt(request.params.maxPrezzo);
    const modelliPerPrezzo = data.filter(auto => auto.prezzo >= minPrezzo && auto.prezzo <= maxPrezzo);

    response.json(modelliPerPrezzo);
});


service.use((request, response) => {
    response.status(404).send("Risorsa non trovata");
});

service.listen(porta, () => {
    console.log('Server avviato sulla porta: ' + porta);
});