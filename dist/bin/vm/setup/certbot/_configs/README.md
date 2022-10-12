Directoy delle configurazioni. Inserire qui i vari script in base alle versioni.

#### Struttura 

-linux
  '--> config1
  |     '--> commands.js
  |     '--> config.js 
  '--> config2
        '--> commands.js
        '--> config.js      


- windows
  '--> config1
  |     '--> commands.js
  |     '--> config.js 
  '--> config2
        '--> commands.js
        '--> config.js


#### command.js
file che esporta una funzione da eseguire alla scelta di qeusta config

#### config.js 
Esporta oggetto

{
    name:string, // nome della modalità
    value: {
        questions:[array di questions inquirer], // array di voci inquirer da mostrare
        validateAnswers: (answers) => boolean // funzone validazione risposte. Throw in caso di errore
    }
}