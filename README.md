# QuackHunt


## Usage

Create an account in FireBase and download service account. Name it `firebase_servacc.json` and place it in root of the project.

You can change the name of the file in `.env` file. Have a look at a sample.

For dev, you can use ngrok.

For Prod, setup your own webhook url. Create certs if you have to.

## TODO

- [ ] Settings
- [ ] Add inline buttons
- [x] Stats
- [x] Add cooldown
- [ ] (OPTIONAL) Decrement bang/bef count if no duck present
- [ ] PAKAK GURL! Nakabingwit ka na naman ng patola in 18.534 seconds. You have befriended 6 patolas
- [ ] Template strings
- [ ] Custom Language
- [ ] Group stats
    - Top 10 using queries
- [ ] Don't use remove running stats for active. Use queries on groups instead

## When changing something

Dont' forget to add a new `changelog.html` file. Follow the html guidelines of telegram.
Dont forget to add `.env` version that matches the version.