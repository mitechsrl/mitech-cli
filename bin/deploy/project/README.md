## Utility deploy project.

Deploy di app su piu VM 

### Configurazione (da mettere in .mitechcli)

```js

module.exports = {
    // per sharing config, importare questo json da file committato su git. 
    "projects": [
        {
            "name": "onit-next",
            // dipendenze globali (opzionali). Queste vengono aggiunte ai package.json dei vari deployments.
            // NOTA: si ha abort se il package.json dell'app di turno dichiara versione piu recente di questi pacchetti
            "commonDependencies": {
                "express": "4.18.1"
            },
            // o script chiee quali di questi deploy eseguire. e si seleziona "tutti", vengono eseguiti tutti in sequenza.
            // l'ordine è quello in cui compaiono qui
            "deployments": {
                "dab": {
                    // id del target in .mitechCli.
                    // NOTA: siccome questo file è committato, cambiare l'id nel proprio .mitechcli in modo da
                    // non continuare a cambiare e committare onig volta che qualcuno deve fare deploy
                    "targetId": "b97937f4-c703-47f1-af4d-4eeb27cc46af",
                    "dependencies": {
                        // dipendenze specifiche opzionali. Queste vengono aggiunte al package.json "./dab/onit-next/package.json"
                        "debug": "4.3.4"
                    },
                    // path dell'app da deployare, locale a partire dalla directory del file .mitechcli
                    "path": "./dab/onit-next"
                },
                "zpc": {
                    "targetId": "b97937f4-c703-47f1-af4d-4eeb27cc46af",
                    "path": "./dab/onit-next"
                }
            }
        }
    ]

    // targets come solito
    "targets": [
        {
            "name": "vm local",
            "host": "192.168.0.115",
            "port": 22,
            "username": "ivan",
            "accessType": "password",
            "password": {
                "algo": "aes-256-cbc",
                "iv": "c7018106cbb41ff8fc3de399250d0c9a",
                "encryptedData": "0a00068e83ec0e0deec4f35d42097ef3"
            },
            "nodeUser": "onit",
            "id": "b97937f4-c703-47f1-af4d-4eeb27cc46af"
        }
    ]
}
```