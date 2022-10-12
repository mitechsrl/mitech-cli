Directoy delle configurazioni. Inserire qui i vari script in base alle versioni.

#### Struttura 

-linux
  '--> config1
  |     '--> commands.ts
  |     '--> config.ts
  '--> config2
        '--> commands.ts
        '--> config.ts    


- windows
  '--> config1
  |     '--> commands.ts
  |     '--> config.ts
  '--> config2
        '--> commands.ts
        '--> config.ts


#### command.js
file che esporta **come default** una funzione da eseguire alla scelta di questa config

#### config.js 
Esporta oggetto **come default**

{
    name:string, // nome della modalità
    value: {
        questions:[array di questions inquirer], // array di voci inquirer da mostrare
        validateAnswers: (answers) => boolean // funzone validazione risposte. Throw in caso di errore
    }
}