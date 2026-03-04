# Auth + Stripe makse demo

Lihtne veebirakendus, mis kasutab **Node.js + Express** tehnoloogiat ja demonstreerib:

- Kasutaja autentimist **Auth0** kaudu (OpenID Connect)
- Kaitsitud lehekülge Stripe **Buy Button** makse nupuga (ühekordne ost)

Pärast sisselogimist näeb kasutaja isiklikku tervitust ja Stripe makse nuppu. Pärast edukat makset kuvatakse tänulehekülg.

Projekt on mõeldud õppimiseks ja demonstreerimiseks (nt programmeerimise või võrguõppe tundides).

## Funktsionaalsus

- Sisselogimine / registreerimine Auth0 kaudu (Google, e-post/parool jne)
- Kaitsitud avaleht (ainult autentitud kasutajatele)
- Stripe makse nupp (testrežiimis)
- Õnnestunud makse leht (`/payment-success`)
- Tervisekontrolli endpoint `/health`

## Tehnoloogiad

- **Backend**: Node.js + Express
- **Autentimine**: express-openid-connect + Auth0
- **Maksed**: Stripe Buy Button (kliendipoolne integratsioon)
- **Keskkonnamuutujad**: dotenv
- **Deploy**: Render.com   


## Kiire alustamine

### 1. Kloonige repositoorium

```bash
git clone https://github.com/Dr3nulja/NewRepoo
