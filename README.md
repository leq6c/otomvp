# Oto mvp

# Deploy

1. Collect api keys

- Fireworks AI

https://app.fireworks.ai/settings/users/api-keys

`FIREWORKS_API_KEY`

- Privy

https://dashboard.privy.io/

`PRIVY_APP_ID, PRIVY_SECRET`

- Prefect

https://app.prefect.cloud/

`PREFECT_API_URL, PREFECT_API_KEY`

- Google Cloud

https://console.cloud.google.com/

`GOOGLE_CLOUD_CREDENTIAL_PATH,GOOGLE_CLOUD_BUCKET_NAME,GOOGLE_CLOUD_REGION`

Required authorities for the service account:
`Vertex AI User, Storage Object Admin`

2. Put `.env` on render (render)

Don't forget to upload service account json file in `/etc/secrets/...`.

3. Create services with blueprint (render)

4. Get endpoint of otomvp-api and set it on otomvp frontend as `NEXT_PUBLIC_API_URL`.

5. Get endpoint of db and set it on mvp env vars as `DATABASE_URL`.

6. re-deploy all
